import Pusher from "pusher-js";
import { from, Observable, shareReplay, switchMap, tap } from "rxjs";

const PUSHER_KEY = "fc5ad78eb31981de6c67";
const APP_CLUSTER = "eu";
let pusherClient;
let block$: Observable<LatestBlock>;

const getPusher = async () => {
  if (!pusherClient) {
    pusherClient = new Pusher(PUSHER_KEY, {
      cluster: APP_CLUSTER,
    });

    pusherClient.connection.bind("error", function (err) {
      if (err.error.data.code === 4004) {
        console.log("Pusher Service Over limit!");
      }
    });
    const connectedPromise = new Promise(resolve => {
      pusherClient.connection.bind("connected", v => {
        resolve(true);
      });
    });
    await connectedPromise;
  }
  return pusherClient;
};

interface LatestBlock {
  blockHash: string;
  blockHeight: number;
  blockId: string;
  updatedEvmAddresses: string[];
  updatedNativeAddresses: string[];
}

export const getLatestBlock$ = (): Observable<LatestBlock> => {
  if (!block$) {
    block$ = from(getPusher()).pipe(
      switchMap((pusher: Pusher) => {
        return new Observable<LatestBlock>(obs => {
          const channel = pusher.subscribe("reef-chain");
          channel.bind("block-finalised", data => {
            obs.next(data);
          });

          return () => {
            channel.unsubscribe();
          };
        });
      }),
      shareReplay(1)
    );
  }
  return block$;
};
