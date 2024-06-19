export const SIGNER_TOKENS_QUERY = `
  query tokens_query($accountId: String!) {
    tokenHolders(
      where: {
        AND: {
          nftId_isNull: true
          token: { id_isNull: false }
          signer: { id_eq: $accountId }
          balance_gt: "0"
        }
      }
      orderBy: balance_DESC
      limit: 320
    ) {
      token {
        id
      }
      balance
    }
  }
`;

export const getSignerTokensQuery = (address: string) => {
  return {
    query: SIGNER_TOKENS_QUERY,
    variables: {
      accountId: address,
    },
  };
};

export const ALL_TOKENS_QUERY = `
  query tokens_query($offset: Int!) {
    tokenHolders(
      offset: $offset
      where: {
        AND: {
          nftId_isNull: true
          token: { id_isNull: false }
        }
      }
      orderBy: balance_DESC
      limit: 320
    ) {
      token {
        id
      }
      balance
    }
  }
`;

export const getAllTokensQuery = (offset: number) => {
  return {
    query: ALL_TOKENS_QUERY,
    variables: { offset },
  };
};

/*export const SIGNER_TOKENS_GQL = gql`
  subscription tokens_query($accountId: String!) {
    token_holder(
      order_by: { balance: desc }
      where: {
        _and: [
          { nft_id: { _is_null: true } }
          { token_address: { _is_null: false } }
          { signer: { _eq: $accountId } }
        ]
      }
    ) {
      token_address
      balance
    }
  }
`;*/

/*
export const CONTRACT_DATA_GQL = gql`
  query contract_data_query($addresses: [String!]!) {
    verified_contract(where: { address: { _in: $addresses } }) {
      address
      contract_data
    }
  }
`;
*/
