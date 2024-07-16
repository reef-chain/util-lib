export const INDEXED_ACCOUNT_UPDATE_QUERY = `
  query evmIndexedAccount($accountIds: [String!]!) {
    accounts(where: { id_in: $accountIds }, orderBy: timestamp_DESC) {
      id
      evmAddress
      freeBalance
      lockedBalance
      availableBalance
    }
  }
`;

export const getIndexedAccountsQuery = (accountIds: string[]) => {
  return {
    query: INDEXED_ACCOUNT_UPDATE_QUERY,
    variables: { accountIds },
  };
};
