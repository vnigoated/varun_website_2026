export const githubConfig = {
  username: 'vnigoated',
  apiUrl: 'https://github-contributions-api.deno.dev/',
  title: 'GitHub Activity',
  subtitle: 'coding journey going in 2026',
  blockSize: 11,
  blockMargin: 3,
  fontSize: 12,
  maxLevel: 4,
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  weekdays: ['', 'M', '', 'W', '', 'F', ''],
  totalCountLabel: '{{count}} contributions in {{year}}',
  labels: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    weekdays: ['', 'M', '', 'W', '', 'F', ''],
    totalCount: '{{count}} contributions in {{year}}',
    legend: {
      less: 'Less',
      more: 'More',
    },
  },
  theme: {
    dark: [
      'rgb(58, 58, 58)',
      'rgb(62, 46, 38)',
      'rgb(93, 65, 48)',
      'rgb(126, 86, 60)',
      'rgb(164, 111, 76)',
    ],
    light: [
      'rgb(229, 231, 235)',
      'rgb(202, 168, 140)',
      'rgb(174, 134, 101)',
      'rgb(145, 104, 74)',
      'rgb(112, 78, 55)',
    ],
  },
  errorState: {
    title: 'Unable to load GitHub contributions',
    description: 'Check out my profile directly for the latest activity',
    buttonText: 'View on GitHub',
  },
  loadingState: {
    title: 'Loading contributions...',
    description: 'Fetching your GitHub activity data',
  },
} as const