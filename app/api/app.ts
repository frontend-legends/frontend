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
  GLOBAL_LEADERBOARD: gql`
    query GlobalLeaderboard($limit: Int) {
      global_leaderboard(limit: $limit) {
        rank
        user {
          id
          name
        }
        stories_finished
      }
    }
  `,
  // everyone who finished the whole book, in the order they got there (permanent title)
  HALL_OF_LEGENDS: gql`
    query HallOfLegends {
      hall_of_legends {
        total_stories
        legends {
          rank
          user {
            id
            name
          }
          legend_at
          legend_total
        }
      }
    }
  `,
  // the #1 of each finished month, newest first
  MONTHLY_CHAMPIONS: gql`
    query MonthlyChampions($limit: Int) {
      monthly_champions(limit: $limit) {
        year
        month
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
