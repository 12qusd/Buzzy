/**
 * RSS Sources management admin page.
 * Fetches RSS source data from the Buzzy API.
 *
 * @module @buzzy/admin/app/rss-sources/page
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getRssSources } from '@/services/adminApi';

export const metadata = {
  title: 'RSS Sources — Buzzy Admin',
};

/**
 * Admin page for managing RSS sources.
 * Fetches live data from the API with fallback to empty state.
 */
export default async function RssSourcesPage() {
  const sources = await getRssSources();
  const activeCount = sources.filter((s) => s.isActive).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">RSS Sources</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sources.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-400">{sources.length - activeCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Source table */}
      <Card>
        <CardHeader>
          <CardTitle>Feed Sources</CardTitle>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] py-4 text-center">
              No RSS sources configured. Add sources via the API or connect Firestore.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2 px-3">Channel</th>
                  <th className="text-left py-2 px-3">Publisher</th>
                  <th className="text-left py-2 px-3">Feed URL</th>
                  <th className="text-center py-2 px-3">Failures</th>
                  <th className="text-center py-2 px-3">Last Poll</th>
                  <th className="text-center py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.id} className="border-b border-[var(--border)]">
                    <td className="py-2 px-3 font-medium">{source.channelName}</td>
                    <td className="py-2 px-3">{source.publisherName}</td>
                    <td className="py-2 px-3 text-xs font-mono text-[var(--muted-foreground)] truncate max-w-[200px]">
                      {source.feedUrl}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Badge variant={source.failureCount > 0 ? 'warning' : 'secondary'}>
                        {source.failureCount}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-center text-xs text-[var(--muted-foreground)]">
                      {source.lastPollAt ? new Date(source.lastPollAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Badge variant={source.isActive ? 'success' : 'secondary'}>
                        {source.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
