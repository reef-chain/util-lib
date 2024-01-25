import {
  catchError,
  from,
  map,
  merge,
  Observable,
  of,
  ReplaySubject,
  switchMap,
  timer,
} from "rxjs";
import { filter, shareReplay } from "rxjs/operators";
import { NetworkName } from "../network/network";
import * as emitter from "@wunderwerk/emitter-io-worker";
import { LatestBlockData } from "../reefState/latestBlockModel";
import type { Emitter } from "emitter-io";

const emitterConfig = {
  host: "http://events.reefscan.info",
  port: 8080,
};
const EMITTER_READ_KEY = "Bqx4Kdv5gJFX4omLzZFWsK5QcCYurwX8";

function getEmitterConnection(config: { port: number; host: string }) {
  return new Promise<Emitter>((resolve, reject) => {
    const emitterClient = (emitter as any).connect(config);
    emitterClient.on("connect", function () {
      resolve(emitterClient);
    });
    emitterClient.on("error", function (e) {
      console.log("emitter events error", e.message);
      reject(null);
    });
  });
}

export const indexerEmitterConn$: Observable<Emitter | null> = of(
  emitterConfig
).pipe(
  switchMap(config => {
    console.log("connecting to reefscan events");

    return from(getEmitterConnection(config)).pipe(
      switchMap(emitterConn => {
        const subj: ReplaySubject<Emitter | null> = new ReplaySubject(1);
        emitterConn.on("disconnect", function () {
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

export const getIndexerEventsNetworkChannel = (network: NetworkName) => {
  const INDEXER_EVENTS_CHANNEL_ROOT = "reef-indexer/";
  const channel = INDEXER_EVENTS_CHANNEL_ROOT + network + "/";
  return channel;
};

export const connectedIndexerEmitter$: Observable<Emitter> =
  indexerEmitterConn$.pipe(
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

export const getBlockDataEmitter = (selNetwork$: Observable<NetworkName>) => {
  return selNetwork$.pipe(
    switchMap((networkName: NetworkName) => {
      const channel = getIndexerEventsNetworkChannel(networkName);
      return connectedIndexerEmitter$.pipe(
        switchMap(emitterConn => {
          return new Observable<LatestBlockData>(obs => {
            emitterConn.subscribe({
              key: EMITTER_READ_KEY,
              channel,
            });
            emitterConn.on("message", function (event) {
              if (event.channel === channel) {
                console.log("indexer evt=", event.asString());
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
        })
      );
    }),

    shareReplay(1)
  );
};

/* const FIREBASE_CONFIG: FirebaseOptions = {
    apiKey: "AIzaSyDBt2QgRSCo70wV_752sA0i6fOrDQfO5J4",
    authDomain: "reef-block-index.firebaseapp.com",
    databaseURL: "https://reef-block-index-default-rtdb.firebaseio.com",
    projectId: "reef-block-index",
    storageBucket: "reef-block-index.appspot.com",
    messagingSenderId: "265934184271",
    appId: "1:265934184271:web:8f55865e0438452a17af3a",
};

const app = initializeApp(FIREBASE_CONFIG);
const db = getDatabase(app);

const connectedRef = ref(db, ".info/connected");
onValue(connectedRef, snap => {
    if (snap.val() === true) {
        console.log("FIREBASE connected");
    } else {
        console.log("FIREBASE not connected");
    }
});
function getBlockDataFirebase(selNetwork$: Observable<NetworkName>) {
    return selNetwork$.pipe(
        switchMap((networkName: NetworkName) => {
            console.log("LATEST BLOCK net=", networkName);
            return new Observable<LatestBlockData>(obs => {
                const dbRef = ref(db, networkName);

                const unsubscribe = onValue(dbRef, snapshot => {
                    const data = snapshot.val();
                    console.log("latestBLOCK latest data=", data);
                    if (!data) return;
                    const keys = Object.keys(data);
                    if (!keys.length) return;
                    const latestBlock = data[keys[0]];
                    latestBlock.blockHeight = Number(keys[0]);
                    obs.next(latestBlock);
                });

                return () => {
                    unsubscribe();
                };
            });
        }),

        shareReplay(1)
    );
}*/
