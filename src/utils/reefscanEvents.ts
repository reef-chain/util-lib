import {
  catchError,
  from,
  map,
  merge,
  Observable,
  of,
  ReplaySubject,
  share,
  switchMap,
  take,
  timer,
} from "rxjs";
import { filter, shareReplay } from "rxjs/operators";
import { NetworkName } from "../network/network";
import { LatestBlockData } from "../reefState/latestBlockModel";
import {
  Emitter,
  connect as emitterConn,
  EmitterEvents,
} from "../utils/emitter-io";

export let emitterConfig: ReefscanEventsConnConfig = {
  host: "events.reefscan.info",
  port: 443,
  secure: true,
};

const EMITTER_READ_KEY = "UMuO3iJMyZIM5H9v1PW7uOZEYLoUeCpc";

const emitterChannelObsCache = new Map<string, Observable<LatestBlockData>>();
const emitterConnObsCache = new Map<string, Observable<Emitter | null>>();

export const setReefscanEventsConnConfig = (
  config: ReefscanEventsConnConfig
) => {
  emitterConfig = { ...config };
};

function getEmitterConnection(config: ReefscanEventsConnConfig) {
  return new Promise<Emitter>((resolve, reject) => {
    const emitterClient = emitterConn(config);
    emitterClient.on(EmitterEvents.connect, function () {
      resolve(emitterClient);
    });
    emitterClient.on(EmitterEvents.error, function (e: unknown) {
      console.log("emitter events error", e);
      reject(null);
    });
  });
}

function getReefscanEventConnIdent(config: ReefscanEventsConnConfig) {
  return config.host + config.port?.toString() + config.secure?.toString();
}

export const getIndexerEmitterConn$ = (
  config: ReefscanEventsConnConfig
): Observable<Emitter | null> => {
  const connConfig = { ...config };
  const connIdent = getReefscanEventConnIdent(connConfig);
  if (!emitterConnObsCache.has(connIdent)) {
    const emitterConn = of(connConfig).pipe(
      switchMap(config => {
        return from(getEmitterConnection(config)).pipe(
          switchMap(emitterConn => {
            const subj: ReplaySubject<Emitter | null> = new ReplaySubject(1);
            emitterConn.on(EmitterEvents.disconnect, function () {
              console.log("reefscan events disconnected");
              subj.next(null);
            });
            subj.next(emitterConn);
            return subj.pipe(
              map(eConn => {
                if (!eConn) {
                  throw new Error("emitter disconnected");
                }
                return eConn;
              })
            );
          }),
          catchError((err, caught) => {
            console.log("reefscanEventsConn$ ERR=", err);
            return merge(of(null), timer(8000).pipe(switchMap(() => caught)));
          })
        );
      }),
      shareReplay(1)
    );
    emitterConnObsCache.set(connIdent, emitterConn);
  }
  return emitterConnObsCache.get(connIdent);
};

export const getIndexerEventsNetworkChannel = (network: NetworkName) => {
  const INDEXER_EVENTS_CHANNEL_ROOT = "reef-indexer/";
  const channel = INDEXER_EVENTS_CHANNEL_ROOT + network + "/";
  return channel;
};

export const getConnectedIndexerEmitter$ = (
  config: ReefscanEventsConnConfig
): Observable<Emitter> =>
  getIndexerEmitterConn$(config).pipe(
    filter((v): v is Emitter => {
      if (!v) {
        console.log("indexer events waiting for connection");
      } else {
        console.log("indexer events connection ok");
      }
      return !!v;
    }),
    shareReplay(1)
  );

export interface ReefscanEventsConnConfig {
  host: string;
  port: number;
  secure: boolean;
}

const getEmitterChannel$ = (
  channel: string,
  config?: ReefscanEventsConnConfig
) => {
  const eventsConf = config ? { ...config } : { ...emitterConfig };
  const channelIdent = getReefscanEventConnIdent(eventsConf) + channel;
  if (!emitterChannelObsCache.has(channelIdent)) {
    const ch$ = getConnectedIndexerEmitter$(eventsConf).pipe(
      switchMap(emitterConn => {
        return new Observable<LatestBlockData>(obs => {
          emitterConn.subscribe({
            key: EMITTER_READ_KEY,
            channel,
          });
          emitterConn.on(EmitterEvents.message, function (event: any) {
            if (event.channel === channel) {
              const latestBlock = JSON.parse(event.asString());
              if (latestBlock.blockHeight >= -1) {
                obs.next(latestBlock);
              }
            }
          });

          return () => {
            console.log("unsubs from emitter channel=", channel);
            emitterConn.unsubscribe({ key: EMITTER_READ_KEY, channel });
          };
        });
      }),
      share()
    );

    emitterChannelObsCache.set(channelIdent, ch$);
  }
  return emitterChannelObsCache.get(channelIdent);
};

export const getBlockDataEmitter = (
  selNetwork$: Observable<NetworkName>,
  emitterConfig?: ReefscanEventsConnConfig
) => {
  return selNetwork$.pipe(
    switchMap((networkName: NetworkName) =>
      getEmitterChannel$(
        getIndexerEventsNetworkChannel(networkName),
        emitterConfig
      )
    ),
    shareReplay(1)
  );
};

export const indexerConnectionState$ = (config?: ReefscanEventsConnConfig) => {
  const emitter$ = getIndexerEmitterConn$(config || emitterConfig);
  return emitter$.pipe(map(emitter => ({ isConnected: !!emitter })));
};

export const disconnectEmitter = (config?: ReefscanEventsConnConfig) => {
  const emitter$ = getIndexerEmitterConn$(config || emitterConfig);
  return emitter$.pipe(take(1)).subscribe(emitter => {
    if (emitter) {
      emitter.disconnect();
    }
  });
};
