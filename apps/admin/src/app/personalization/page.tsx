/**
 * Personalization Weights admin page.
 * Allows admins to configure signal weights, decay rates,
 * and freshness parameters.
 *
 * @module @buzzy/admin/app/personalization/page
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export const metadata = {
  title: 'Personalization Config — Buzzy Admin',
};

/** Default signal weight configuration */
const SIGNAL_WEIGHTS = [
  { signal: 'impression', weight: 0, description: 'Article appeared in feed' },
  { signal: 'click', weight: 1, description: 'Article opened from feed' },
  { signal: 'tap', weight: 2, description: 'Tapped on article element' },
  { signal: 'scroll', weight: 3, description: 'Scrolled through article content' },
  { signal: 'like', weight: 5, description: 'Liked the article' },
  { signal: 'comment', weight: 8, description: 'Commented on the article' },
  { signal: 'share', weight: 10, description: 'Shared the article' },
  { signal: 'bookmark', weight: 3, description: 'Bookmarked the article' },
  { signal: 'source_click', weight: 2, description: 'Clicked to original source' },
  { signal: 'follow_tag', weight: 20, description: 'Followed a topic tag' },
  { signal: 'follow_category', weight: 15, description: 'Followed a category' },
];

/**
 * Admin page for configuring personalization weights.
 */
export default function PersonalizationPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Personalization Configuration</h1>

      <div className="grid gap-6">
        {/* Signal Weights */}
        <Card>
          <CardHeader>
            <CardTitle>Signal Weights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Configure how much each user action contributes to their interest graph.
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2 px-3">Signal</th>
                  <th className="text-left py-2 px-3">Weight</th>
                  <th className="text-left py-2 px-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {SIGNAL_WEIGHTS.map((sw) => (
                  <tr key={sw.signal} className="border-b border-[var(--border)]">
                    <td className="py-2 px-3 font-mono">{sw.signal}</td>
                    <td className="py-2 px-3 font-bold">{sw.weight}</td>
                    <td className="py-2 px-3 text-[var(--muted-foreground)]">{sw.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Decay Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Interest Decay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[var(--muted-foreground)]">Weekly Decay Rate</label>
                <p className="text-lg font-bold">5%</p>
                <p className="text-xs text-[var(--muted-foreground)]">Applied every Sunday at midnight UTC</p>
              </div>
              <div>
                <label className="text-sm text-[var(--muted-foreground)]">Minimum Score Threshold</label>
                <p className="text-lg font-bold">0.01</p>
                <p className="text-xs text-[var(--muted-foreground)]">Entries below this are deleted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Freshness Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Freshness Window</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[var(--muted-foreground)]">Half-Life</label>
                <p className="text-lg font-bold">24 hours</p>
                <p className="text-xs text-[var(--muted-foreground)]">Articles lose 50% freshness score after this time</p>
              </div>
              <div>
                <label className="text-sm text-[var(--muted-foreground)]">Session Dedup Window</label>
                <p className="text-lg font-bold">50 articles</p>
                <p className="text-xs text-[var(--muted-foreground)]">No repeat stories within this many swipes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ranking Formula */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking Formula</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-[var(--muted)] p-4 rounded-md font-mono text-sm">
              Final Score = Article Score × User Topic Match × Freshness
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-bold">Article Score</p>
                <p className="text-[var(--muted-foreground)]">Base ranking from F&E algorithm</p>
              </div>
              <div>
                <p className="font-bold">Topic Match</p>
                <p className="text-[var(--muted-foreground)]">Sum of interest graph scores for matching tags</p>
              </div>
              <div>
                <p className="font-bold">Freshness</p>
                <p className="text-[var(--muted-foreground)]">Exponential decay from publish time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
