export interface GithubProfile {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id?: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company?: string | null;
  blog: string;
  location: string;
  email?: string | null;
  hireable?: string | null;
  bio?: string | null;
  twitter_username?: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  private_gists: number;
  total_private_repos: number;
  owned_private_repos: number;
  disk_usage: number;
  collaborators: number;
  two_factor_authentication: boolean;
  plan: {
    name: string;
    space: number;
    collaborators: number;
    private_repos: number;
  };
}

export interface WakaStats {
  id: string;
  user_id: string;
  username: string;
  status: string;
  range: string;
  start: string;
  end: string;
  timeout: number;
  timezone: string;
  writes_only: string;
  percent_calculated: number;

  created_at: string;
  modified_at: string;

  is_including_today: boolean;
  is_stuck: boolean;
  is_already_updating: boolean;
  is_up_to_date: boolean;
  is_up_to_date_pending_future: boolean;
  is_coding_activity_visible: boolean;
  is_other_usage_visible: boolean;

  holidays: string;
  days_including_holidays: number;
  days_minus_holidays: number;

  daily_average: number;
  daily_average_including_other_language: number;

  total_seconds: number;
  total_seconds_including_other_language: number;

  human_readable_range: string;
  human_readable_total: string;
  human_readable_total_including_other_language: string;
  human_readable_daily_average: string;
  human_readable_daily_average_including_other_language: string;

  best_day: {
    id: string;
    date: string;
    text: string;
    total_seconds: number;

    created_at: string;
    modified_at: string;
  };

  all_time: {
    is_up_to_date: boolean;
    percent_calculated: number;
    timeout: number;

    range: {
      start: string;
      start_date: string;
      start_text: string;

      end: string;
      end_date: string;
      end_text: string;

      timezone: string;
    };

    text: string;
    decimal: string;
    digital: string;
    total_seconds: number;
  };

  categories: WakaTime[];
  projects: WakaTime[];
  languages: WakaTime[];
  dependencies: WakaTime[];
  editors: WakaTime[];
  operating_systems: WakaTime[];
}
interface WakaTime {
  name: string;
  total_seconds: number;
  percent: number;
  hours: number;
  minutes: number;
  text: string;
  digital: string;
  decimal: string;
}
