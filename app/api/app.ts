import { gql } from "@apollo/client/core";

export const usersGql = {
  MONTHLY_LEADERBOARD: gql`
    query MonthlyLeaderboard($year: Int!, $month: Int!, $limit: Int) {
      monthly_leaderboard(year: $year, month: $month, limit: $limit) {
        rank
        user {
          id
          name
        }
        stories_finished
      }
    }
  `,
};

export const storyGql = {
  FINISH: gql`
    mutation FinishStory($story_id: ID!) {
      finish_story(story_id: $story_id)
    }
  `,
  UNFINISH: gql`
    mutation UnfinishStory($story_id: ID!) {
      unfinish_story(story_id: $story_id)
    }
  `,
};
