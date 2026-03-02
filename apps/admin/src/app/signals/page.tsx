/**
 * Signals reporting dashboard.
 * Shows engagement signal metrics and trends.
 *
 * @module @buzzy/admin/app/signals/page
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export const metadata = {
  title: 'Signals Dashboard — Buzzy Admin',
};

/**
 * Signals reporting dashboard with aggregate metrics.
 */
export default function SignalsDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Signals Dashboard</h1>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-[var(--muted-foreground)]">Last 24h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unique Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-[var(--muted-foreground)]">Active today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Signals/User</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-[var(--muted-foreground)]">Per session</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Signal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
            <p className="text-sm text-[var(--muted-foreground)]">Most common type</p>
          </CardContent>
        </Card>
      </div>

      {/* Signal type breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Signal Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 px-3">Signal Type</th>
                <th className="text-right py-2 px-3">Count (24h)</th>
                <th className="text-right py-2 px-3">Count (7d)</th>
                <th className="text-right py-2 px-3">% of Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="py-8 text-center text-[var(--muted-foreground)]">
                  No signal data yet. Signals will appear here once users start engaging with content.
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Top engaged articles */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Top Engaged Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)] py-4">
            No engagement data yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
