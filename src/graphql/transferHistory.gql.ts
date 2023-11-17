export const TRANSFER_HISTORY_QUERY = `
  query transferHistory($accountId: String!) {
    transfers(
      where: {
        OR: [{ from: { id_eq: $accountId } }, { to: { id_eq: $accountId } }]
      }
      limit: 15
      orderBy: timestamp_DESC
    ) {
      timestamp
      amount
      feeAmount
      fromEvmAddress
      id
      nftId
      success
      type
      toEvmAddress
      token {
        id
        name
        type
        contractData
      }
      event {
        index
      }
      extrinsic {
        id
        index
        block {
          id
          height
          hash
        }
      }
      from {
        id
        evmAddress
      }
      to {
        id
        evmAddress
      }
    }
  }
`;

export const getSignerHistoryQuery = (accountId: string) => {
  return {
    query: TRANSFER_HISTORY_QUERY,
    variables: { accountId },
  };
};
