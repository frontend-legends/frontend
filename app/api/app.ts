import { gql } from "@apollo/client/core";

export const usersGql = {
  RANKING: gql`
    query {
      users_monthly_activity(
        where: { story_finished: { _gt: 0 } }
        order_by: { story_finished: desc }
        limit: 10
      ) {
        id
        avatar_url
        display_name
        last_seen
        story_finished
      }
    }
  `,
};

export const storyGql = {
  FINISH: gql`
    mutation ($user_id: uuid!, $metadata: jsonb!) {
      updateUser(pk_columns: { id: $user_id }, _set: { metadata: $metadata }) {
        id
      }
    }
  `,
};
