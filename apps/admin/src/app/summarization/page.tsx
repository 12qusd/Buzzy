/**
 * AI Summarization Config admin page.
 * Edit per-category AI prompts, tone, reading level, and buzzword management.
 *
 * @module @buzzy/admin/app/summarization/page
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata = {
  title: 'AI Config — Buzzy Admin',
};

/** Per-category summarization configs */
const CATEGORY_CONFIGS = [
  { id: 'tech', name: 'Tech', tone: 'Informative, excited', readingLevel: 'General audience', hedgeLevel: 'Low', emojis: true },
  { id: 'science', name: 'Science', tone: 'Authoritative, clear', readingLevel: 'General audience', hedgeLevel: 'Medium', emojis: false },
  { id: 'health', name: 'Health', tone: 'Empathetic, factual', readingLevel: 'General audience', hedgeLevel: 'High', emojis: false },
  { id: 'sports', name: 'Sports', tone: 'Energetic, conversational', readingLevel: 'Casual', hedgeLevel: 'Low', emojis: true },
  { id: 'entertainment', name: 'Entertainment', tone: 'Fun, buzzy', readingLevel: 'Casual', hedgeLevel: 'Low', emojis: true },
  { id: 'politics', name: 'Politics', tone: 'Neutral, balanced', readingLevel: 'General audience', hedgeLevel: 'High', emojis: false },
  { id: 'money', name: 'Money', tone: 'Professional, accessible', readingLevel: 'General audience', hedgeLevel: 'Medium', emojis: false },
  { id: 'crypto', name: 'Crypto', tone: 'Informed, cautious', readingLevel: 'General audience', hedgeLevel: 'Medium', emojis: false },
  { id: 'news', name: 'News', tone: 'Straightforward, urgent', readingLevel: 'General audience', hedgeLevel: 'Medium', emojis: false },
  { id: 'markets', name: 'Markets', tone: 'Analytical, precise', readingLevel: 'Intermediate', hedgeLevel: 'Medium', emojis: false },
  { id: 'lifestyle', name: 'Lifestyle', tone: 'Warm, relatable', readingLevel: 'Casual', hedgeLevel: 'Low', emojis: true },
];

/** Buzzwords list (placeholder) */
const BUZZWORDS = [
  { term: 'AI', isActive: true },
  { term: 'GPT', isActive: true },
  { term: 'blockchain', isActive: true },
  { term: 'quantum', isActive: true },
  { term: 'CRISPR', isActive: true },
  { term: 'fusion', isActive: true },
  { term: 'Mars', isActive: true },
  { term: 'Tesla', isActive: true },
  { term: 'metaverse', isActive: false },
  { term: 'NFT', isActive: false },
];

/**
 * Admin page for AI summarization configuration.
 */
export default function SummarizationPage() {
  const activeBuzzwords = BUZZWORDS.filter((b) => b.isActive).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">AI Summarization Config</h1>

      {/* Per-category configs */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Per-Category Summarization Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            AI prompts are stored in Firestore and editable below. Changes take effect within 60 seconds.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 px-3">Category</th>
                <th className="text-left py-2 px-3">Tone</th>
                <th className="text-left py-2 px-3">Reading Level</th>
                <th className="text-left py-2 px-3">Hedge Level</th>
                <th className="text-center py-2 px-3">Emojis</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORY_CONFIGS.map((config) => (
                <tr key={config.id} className="border-b border-[var(--border)]">
                  <td className="py-2 px-3 font-medium">{config.name}</td>
                  <td className="py-2 px-3 text-[var(--muted-foreground)]">{config.tone}</td>
                  <td className="py-2 px-3">{config.readingLevel}</td>
                  <td className="py-2 px-3">
                    <Badge variant={
                      config.hedgeLevel === 'High' ? 'warning' :
                      config.hedgeLevel === 'Medium' ? 'secondary' : 'success'
                    }>
                      {config.hedgeLevel}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-center">
                    {config.emojis ? 'Yes' : 'No'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Buzzword Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Buzzword Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Active buzzwords boost article scores during ingestion. {activeBuzzwords} active, {BUZZWORDS.length - activeBuzzwords} inactive.
          </p>
          <div className="flex flex-wrap gap-2">
            {BUZZWORDS.map((bw) => (
              <Badge
                key={bw.term}
                variant={bw.isActive ? 'default' : 'outline'}
              >
                {bw.term}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Model Config */}
      <Card>
        <CardHeader>
          <CardTitle>AI Model Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[var(--muted-foreground)]">Default Model</label>
              <p className="text-lg font-bold font-mono">gpt-5-nano</p>
            </div>
            <div>
              <label className="text-sm text-[var(--muted-foreground)]">Max Tokens</label>
              <p className="text-lg font-bold font-mono">1024</p>
            </div>
            <div>
              <label className="text-sm text-[var(--muted-foreground)]">Temperature</label>
              <p className="text-lg font-bold font-mono">0.7</p>
            </div>
            <div>
              <label className="text-sm text-[var(--muted-foreground)]">Summarization Prompt</label>
              <p className="text-sm text-[var(--muted-foreground)]">Stored in Firestore, editable per category</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
