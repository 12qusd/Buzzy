/**
 * Analytics & Reports admin page.
 * Displays DAU, MAU, session metrics, top tags, push open rate.
 * Supports CSV export for all report types.
 *
 * @module @buzzy/admin/app/reports/page
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata = {
  title: 'Reports & Analytics — Buzzy Admin',
};

/** Placeholder analytics data (until Firestore wired) */
const ANALYTICS = {
  dau: 0,
  mau: 0,
  avgSessionTime: '0:00',
  storiesPerSession: 0,
  pushOpenRate: 0,
  pushSentToday: 0,
  emailsSentToday: 0,
  newUsersToday: 0,
};

/** Top topic tags by engagement */
const TOP_TAGS = [
  { name: 'Artificial Intelligence', engagementScore: 0, followCount: 0 },
  { name: 'Climate Change', engagementScore: 0, followCount: 0 },
  { name: 'Cryptocurrency', engagementScore: 0, followCount: 0 },
  { name: 'NBA', engagementScore: 0, followCount: 0 },
  { name: 'Elections', engagementScore: 0, followCount: 0 },
];

/** Report types available for CSV export */
const REPORT_TYPES = [
  { type: 'publisher', label: 'Publisher Report', description: 'Article counts and performance by publisher/RSS source' },
  { type: 'user', label: 'User Report', description: 'User engagement metrics, session data, followed tags' },
  { type: 'comment', label: 'Comment Report', description: 'Comment volume, moderation, top commented articles' },
  { type: 'article', label: 'Article Report', description: 'Article lifecycle, scores, promotion status' },
  { type: 'engagement', label: 'Engagement Report', description: 'Signal breakdowns, likes, shares, bookmarks by period' },
];

/**
 * Admin analytics and reports page.
 */
export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>DAU</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ANALYTICS.dau}</p>
            <p className="text-sm text-[var(--muted-foreground)]">Daily Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>MAU</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ANALYTICS.mau}</p>
            <p className="text-sm text-[var(--muted-foreground)]">Monthly Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg Session</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ANALYTICS.avgSessionTime}</p>
            <p className="text-sm text-[var(--muted-foreground)]">minutes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stories/Session</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ANALYTICS.storiesPerSession}</p>
            <p className="text-sm text-[var(--muted-foreground)]">average</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Push Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ANALYTICS.pushOpenRate}%</p>
            <p className="text-sm text-[var(--muted-foreground)]">{ANALYTICS.pushSentToday} sent today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Emails Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ANALYTICS.emailsSentToday}</p>
            <p className="text-sm text-[var(--muted-foreground)]">today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ANALYTICS.newUsersToday}</p>
            <p className="text-sm text-[var(--muted-foreground)]">today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Data Freshness</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="success">Live</Badge>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Firestore real-time</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Topic Tags */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top Topic Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 px-3">#</th>
                <th className="text-left py-2 px-3">Tag</th>
                <th className="text-right py-2 px-3">Engagement</th>
                <th className="text-right py-2 px-3">Followers</th>
              </tr>
            </thead>
            <tbody>
              {TOP_TAGS.map((tag, i) => (
                <tr key={tag.name} className="border-b border-[var(--border)]">
                  <td className="py-2 px-3 text-[var(--muted-foreground)]">{i + 1}</td>
                  <td className="py-2 px-3 font-medium">{tag.name}</td>
                  <td className="py-2 px-3 text-right font-mono">{tag.engagementScore}</td>
                  <td className="py-2 px-3 text-right font-mono">{tag.followCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* CSV Export */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Export</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Download detailed reports as CSV files for analysis.
          </p>
          <div className="grid gap-3">
            {REPORT_TYPES.map((report) => (
              <div
                key={report.type}
                className="flex items-center justify-between p-3 rounded-md border border-[var(--border)]"
              >
                <div>
                  <p className="font-medium text-sm">{report.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{report.description}</p>
                </div>
                <a
                  href={`/api/admin/reports/${report.type}/export`}
                  className="text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  Download CSV
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
