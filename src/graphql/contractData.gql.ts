import { gql } from "@apollo/client";
import { SIGNER_TOKENS_QUERY } from "./signerTokens.gql";

/*export const CONTRACT_DATA_GQL = gql`
  subscription contract_data_query($addresses: [String!]!) {
    verifiedContracts(where: { id_in: $addresses }, limit: 300) {
      id
      contractData
    }
  }
`;*/
export const CONTRACT_DATA_QUERY = `
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

export const CONTRACT_ABI_GQL = gql`
  query contract_data_query($address: String!) {
    verifiedContracts(where: { id_containsInsensitive: $address }, limit: 1) {
      id
      compiledData
    }
  }
`;
