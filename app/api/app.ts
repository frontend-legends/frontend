import { gql } from "@apollo/client/core";

export const storyGql = {
  FINISH: gql`
    mutation ($user_id: uuid!, $metadata: jsonb!) {
      updateUser(pk_columns: { id: $user_id }, _set: { metadata: $metadata }) {
        id
      }
    }
  `,
};
