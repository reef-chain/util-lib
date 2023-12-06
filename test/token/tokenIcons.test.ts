import { beforeAll, describe, expect, it } from "vitest";
import { initReefState, selectedTokenPrices$ } from "../../src/reefState";
import { AVAILABLE_NETWORKS } from "../../src/network";
import { fetchTokensData } from "../../src/reefState/token/selectedAccountTokenBalances";
import { firstValueFrom, skip, switchMap } from "rxjs";
import { httpClientInstance$ } from "../../src/graphql/httpClient";
import { AxiosInstance } from "axios";

describe("tx history inbound resolver test", () => {
  const accountId = "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP";
  beforeAll(async () => {
    initReefState({
      network: AVAILABLE_NETWORKS.testnet,
      jsonAccounts: {
        accounts: [
          {
            address: accountId,
            isSelected: true,
            meta: { source: "reef" },
          },
        ],
        injectedSigner: {},
      },
    });
  });

  it("should log tokens data ", async () => {
    const x = httpClientInstance$.pipe(
      switchMap((httpClient: AxiosInstance) => {
        return fetchTokensData(httpClient, [
          "0x8E7Ef6bD28cD9bDb6DBf105140958ac03EeC371A",
          "0x9d71474335dB7A2C17cFD4EDC0784Af0eBeE003D",
          "0x9FdEb478A27E216f80DaEE0967dc426338eD02f2",
          "0xF74f40a7227f519eAD4563E28E481a4d2a5B4FB4",
          "0xf401b3Ec2298B80547B53dEEB8906677102A7F4B",
          "0x44CC16DDe135c9271CAA626995442c284490c97d",
          "0x270c5D5887e2062e8D38B90eA8C34106E59528f5",
          "0x39fe4699535153e6345769EF85B0912D320B8243",
          "0x6762777b9f6c12Bb0e994C728d17d724C6F81D1E",
          "0x51b959853f6F5220AcB41082BF9cb90672a22296",
          "0xCB058Dec4984D09c7D5f98B687796f7957F61Fae",
          "0x2B28725Be49edd430BBAE307Ac8eFdaee29222D6",
          "0xBd17D5b00d6f441A30a571Bcd9A3F88CF7f63716",
          "0x4dfFc24D2c5a8343220D375f0b5B5EFa80a74814",
          "0x7C77DC921BEeE62e4926719e34b704D3cB586639",
          "0xDfCD6F78C8E7F2fC8D9d7c41629262fCcDdCa48a",
          "0x1567c94cAf0A661eA78626cc0243126da00e9456",
          "0x89524B7ce2a8B6BF1887C50Fd05103714F0026E5",
          "0x1cD8Fa5Ef1740Eb992Bb5E385273a9B063196CA6",
          "0xf06D5734dB03B830c34BCcAa6Ac20fCFd5D37a53",
          "0x26D035dBe3c32935Df8B259cFA14D24006929790",
          "0x9662c4df29aba517ac3c3fE6fA89DcF16D7AbC49",
          "0xcfAEbe9c179F383BDa2F8fC00942b8FBfF433010",
          "0xc6BE6d52b5a04B3B3946da15080D7C7f43853295",
          "0x44D04bF3b3d085DFB62E23B701340b45D4221B22",
          "0xcD6A6D6783c6b87370574829e7CDf29F4A55a608",
          "0x0164367eD93C3bEBd6c09d88012547Df4EE32D32",
          "0x3fC8f3f71B2BE3A2A7979d76dC17766D02501942",
          "0x05a979C47Cf1958683048F0980a42EEBEd1ef6cd",
          "0x637cD642A94aa5AeC7F93d84C6eFCa79d605Fab2",
          "0xD3750B712958916D34f01Ba50ccf80b097bFc994",
          "0xeeF445fE1e1C960084234FFeFfE7007D297fC170",
          "0x775C28221d554C3b48eFc66aC9291c2af51D1Cd1",
          "0xdEBbB50D8D1D3d6e018a89537e915A2DFDD320B9",
          "0x92f53B1Bb8CcaA3A570d4A61DBdADb9128285D53",
          "0x2e4335CE155932703079dF6ed078C7c494b2c475",
          "0x0087F037aDC08b6313559D13941eb556d1dF4590",
          "0xF30a99A13e8a942531568c0a611644466eb599d1",
          "0x1B42790a3e41CeEEBa735A59EB7B3203C0e0b211",
          "0xF881F66FFAE3C017D4d59244857f7AB6B5B5CF35",
          "0x7F12d5d92F9b4E250fe3f0302A29F6F93cBBBD8D",
          "0x412d843D5FC9abA5CDEb40b56c06b2e728c7D57C",
          "0x5130AC902A2128F890b714bE269a44FA37f5d78D",
          "0xE190554CF2CCF1D18201711aD39a7517595c0A34",
          "0x5039Bf569428B4bA2B521902f563Fe088cCF5062",
          "0x7F46307B989F1eE14f140c5525A143639B38b5fA",
          "0x5f4A3bAEB65324ff0Afd765379517Fc982D67aa4",
          "0xD86B0E03A8D873275D5d9cc7b443FA6dAA56b545",
          "0xae6a688a2a72ba9614cD3Cb7F320a3108d6a4a9D",
          "0x810678BdD2Cf7c5D492Cb8B930975c172cE964AC",
          "0xC8D55c9706fa2E72699a72936474F4c393B302aC",
        ]);
      })
    );
    x.subscribe(val => console.log(val));
  });
});
