/**
 * Publishing Quotas admin page.
 * Shows per-category daily limits, utilization, and random injection config.
 *
 * @module @buzzy/admin/app/quotas/page
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getQuotas, type CategoryQuota } from '@/services/adminApi';

export const metadata = {
  title: 'Publishing Quotas — Buzzy Admin',
};

/** Fallback quota data when API is not available */
const FALLBACK_QUOTAS: CategoryQuota[] = [
  { categoryId: 'tech', categoryName: 'Tech', categoryColor: '#3C82F6', dailyLimit: 20, publishedToday: 0, remaining: 20, utilization: 0, randomInjectionPct: 10, randomSlots: 2 },
  { categoryId: 'science', categoryName: 'Science', categoryColor: '#10B981', dailyLimit: 15, publishedToday: 0, remaining: 15, utilization: 0, randomInjectionPct: 10, randomSlots: 1 },
  { categoryId: 'health', categoryName: 'Health', categoryColor: '#8554F6', dailyLimit: 15, publishedToday: 0, remaining: 15, utilization: 0, randomInjectionPct: 10, randomSlots: 1 },
  { categoryId: 'sports', categoryName: 'Sports', categoryColor: '#F59E09', dailyLimit: 20, publishedToday: 0, remaining: 20, utilization: 0, randomInjectionPct: 10, randomSlots: 2 },
  { categoryId: 'entertainment', categoryName: 'Entertainment', categoryColor: '#EC4999', dailyLimit: 20, publishedToday: 0, remaining: 20, utilization: 0, randomInjectionPct: 15, randomSlots: 3 },
  { categoryId: 'politics', categoryName: 'Politics', categoryColor: '#6467F1', dailyLimit: 15, publishedToday: 0, remaining: 15, utilization: 0, randomInjectionPct: 5, randomSlots: 0 },
  { categoryId: 'money', categoryName: 'Money', categoryColor: '#059669', dailyLimit: 15, publishedToday: 0, remaining: 15, utilization: 0, randomInjectionPct: 10, randomSlots: 1 },
  { categoryId: 'crypto', categoryName: 'Crypto', categoryColor: '#F9751A', dailyLimit: 10, publishedToday: 0, remaining: 10, utilization: 0, randomInjectionPct: 10, randomSlots: 1 },
  { categoryId: 'news', categoryName: 'News', categoryColor: '#EF4040', dailyLimit: 25, publishedToday: 0, remaining: 25, utilization: 0, randomInjectionPct: 5, randomSlots: 1 },
  { categoryId: 'markets', categoryName: 'Markets', categoryColor: '#2B4C95', dailyLimit: 15, publishedToday: 0, remaining: 15, utilization: 0, randomInjectionPct: 10, randomSlots: 1 },
  { categoryId: 'lifestyle', categoryName: 'Lifestyle', categoryColor: '#DA4BF0', dailyLimit: 15, publishedToday: 0, remaining: 15, utilization: 0, randomInjectionPct: 15, randomSlots: 2 },
];

/**
 * Returns the variant for a utilization percentage badge.
 *
 * @param percent - Utilization percentage
 * @returns Badge variant name
 */
function utilizationVariant(percent: number): 'success' | 'warning' | 'destructive' | 'secondary' {
  if (percent >= 90) return 'destructive';
  if (percent >= 70) return 'warning';
  if (percent > 0) return 'success';
  return 'secondary';
}

/**
 * Admin page for managing publishing quotas.
 */
export default async function QuotasPage() {
  const apiQuotas = await getQuotas();
  const quotas = apiQuotas.length > 0 ? apiQuotas : FALLBACK_QUOTAS;
  const totalDailyLimit = quotas.reduce((sum, q) => sum + q.dailyLimit, 0);
  const totalPublished = quotas.reduce((sum, q) => sum + q.publishedToday, 0);
  const totalUtilization = totalDailyLimit > 0 ? Math.round((totalPublished / totalDailyLimit) * 100) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Publishing Quotas</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Daily Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalDailyLimit}</p>
            <p className="text-sm text-[var(--muted-foreground)]">articles/day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Published Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalPublished}</p>
            <p className="text-sm text-[var(--muted-foreground)]">across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overall Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalUtilization}%</p>
            <p className="text-sm text-[var(--muted-foreground)]">of total capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Remaining Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalDailyLimit - totalPublished}</p>
            <p className="text-sm text-[var(--muted-foreground)]">available today</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-category quota table */}
      <Card>
        <CardHeader>
          <CardTitle>Per-Category Quotas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Daily publishing limits and random injection percentages per category.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 px-3">Category</th>
                <th className="text-right py-2 px-3">Daily Limit</th>
                <th className="text-right py-2 px-3">Published</th>
                <th className="text-right py-2 px-3">Remaining</th>
                <th className="text-right py-2 px-3">Utilization</th>
                <th className="text-right py-2 px-3">Random %</th>
                <th className="text-right py-2 px-3">Random Slots</th>
              </tr>
            </thead>
            <tbody>
              {quotas.map((q) => (
                  <tr key={q.categoryId} className="border-b border-[var(--border)]">
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: q.categoryColor }}
                        />
                        <span className="font-medium">{q.categoryName}</span>
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono">{q.dailyLimit}</td>
                    <td className="py-2 px-3 text-right font-mono">{q.publishedToday}</td>
                    <td className="py-2 px-3 text-right font-mono">{q.remaining}</td>
                    <td className="py-2 px-3 text-right">
                      <Badge variant={utilizationVariant(q.utilization)}>{q.utilization}%</Badge>
                    </td>
                    <td className="py-2 px-3 text-right font-mono">{q.randomInjectionPct}%</td>
                    <td className="py-2 px-3 text-right font-mono">{q.randomSlots}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Demand Filter tiers explanation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Demand Filter Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-md bg-[var(--muted)]">
              <p className="font-bold mb-1">Tier 1: Followed Tags</p>
              <p className="text-[var(--muted-foreground)]">
                Articles matching tags followed by users. Highest priority — always published first.
              </p>
            </div>
            <div className="p-4 rounded-md bg-[var(--muted)]">
              <p className="font-bold mb-1">Tier 2: Buzzwords</p>
              <p className="text-[var(--muted-foreground)]">
                Articles matching trending buzzwords. Second priority for remaining slots.
              </p>
            </div>
            <div className="p-4 rounded-md bg-[var(--muted)]">
              <p className="font-bold mb-1">Tier 3: Quota Fill</p>
              <p className="text-[var(--muted-foreground)]">
                Articles with at least 1 approved tag, ranked by score. Fills remaining quota.
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-md border border-[var(--border)]">
            <p className="font-bold mb-1">Random Injection</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              A configurable percentage of daily slots are reserved for serendipity content —
              articles that may not match user preferences but add diversity to the feed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
