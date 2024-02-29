export const TRANSFER_HISTORY_QUERY = `
  query transferHistory($accountId: String!) {
    transfers(
      where: {
        OR: [{ from: { id_eq: $accountId } }, { to: { id_eq: $accountId } }]
      }
      limit: 35
      orderBy: timestamp_DESC
    ) {
      timestamp
      amount
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
      signedData
      extrinsicHash
      extrinsicId
      eventIndex
      extrinsicIndex
      blockHeight
      blockHash
      finalized
      reefswapAction
      from {
        id
        evmAddress
      }
      to {
        id
        evmAddress
      }
      reefswapAction
    }
  }
`;

export const getSignerHistoryQuery = (accountId: string) => {
  return {
    query: TRANSFER_HISTORY_QUERY,
    variables: { accountId },
  };
};
