import { gql } from "@apollo/client";

export const EVM_ADDRESS_UPDATE_QUERY = `
  query evmAddresses($accountIds: [String!]!) {
    accounts(where: { id_in: $accountIds }, orderBy: timestamp_DESC) {
      id
      evmAddress
    }
  }
`;

export const getEvmAddressQuery = (accountIds: string[]) => {
  return {
    query: EVM_ADDRESS_UPDATE_QUERY,
    variables: { accountIds },
  };
};
