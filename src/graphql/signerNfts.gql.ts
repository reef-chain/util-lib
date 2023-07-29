import { gql } from "@apollo/client";

const SIGNER_NFTS_QUERY = `
  query signer_nfts($accountId: String) {
    tokenHolders(
      orderBy: balance_DESC
      limit: 199
      where: {
        AND: {
          nftId_isNull: false
          token: { id_isNull: false }
          signer: { id_eq: $accountId }
          balance_gt: "0"
        }
        type_eq: Account
      }
    ) {
      token {
        id
        type
      }
      balance
      nftId
    }
  }
`;

export const getSignerNftsQuery = (accountId: string) => {
  return {
    query: SIGNER_NFTS_QUERY,
    variables: { accountId },
  };
};

/*
export const SIGNER_NFTS_GQL = gql`
  subscription query($accountId: String) {
    token_holder(
    order_by: { balance: desc }
    where: {
      _and: [{ nft_id: { _is_null: false } }, { signer: { _eq: $accountId } }, {balance: {_gt: 0}}]
      type: { _eq: "Account" }
    }
  ) {
    token_address
    balance
    nft_id
    info
    contract {
      verified_contract {
        type
        contract_data
      }
    }
  }
 }`;
*/
