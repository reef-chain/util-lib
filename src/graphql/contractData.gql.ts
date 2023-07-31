const CONTRACT_DATA_QUERY = `
  query contract_data_query($addresses: [String!]!) {
    verifiedContracts(where: { id_in: $addresses }, limit: 300) {
      id
      contractData
    }
  }
`;

export const getContractDataQuery = (addresses: string[]) => {
  return {
    query: CONTRACT_DATA_QUERY,
    variables: { addresses },
  };
};

const CONTRACT_ABI_QUERY = `
  query contract_data_query($address: String!) {
    verifiedContracts(where: { id_containsInsensitive: $address }, limit: 1) {
      id
      compiledData
    }
  }
`;

export const getContractAbiQuery = (address: string) => {
  return {
    query: CONTRACT_ABI_QUERY,
    variables: { address },
  };
};
