/**
 * Admin dashboard home page.
 * Fetches live metrics from the Buzzy API.
 *
 * @module @buzzy/admin/app/page
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { getDashboardMetrics } from '@/services/adminApi';

/**
 * Admin dashboard with live summary metrics.
 */
export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Articles Ingested</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.articlesIngested}</p>
            <p className="text-sm text-[var(--muted-foreground)]">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.pendingTags}</p>
            <p className="text-sm text-[var(--muted-foreground)]">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.activeSources}</p>
            <p className="text-sm text-[var(--muted-foreground)]">RSS feeds</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Published</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.publishedLast24h}</p>
            <p className="text-sm text-[var(--muted-foreground)]">Last 24h</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <a href="/suggested-tags" className="block text-[var(--primary)] hover:underline">
                Review pending tags ({metrics.pendingTags})
              </a>
              <a href="/rss-sources" className="block text-[var(--primary)] hover:underline">
                Manage RSS sources
              </a>
              <a href="/quotas" className="block text-[var(--primary)] hover:underline">
                View publishing quotas
              </a>
              <a href="/reports" className="block text-[var(--primary)] hover:underline">
                Analytics reports
              </a>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Total Articles</span>
                <span className="font-mono">{metrics.totalArticles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Total Users</span>
                <span className="font-mono">{metrics.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">API Status</span>
                <span className="text-[var(--success)] font-medium">Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
