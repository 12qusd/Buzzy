/**
 * Client-side suggested tags review component.
 * Fetches tags from the API and provides approve/reject actions.
 *
 * @module @buzzy/admin/app/suggested-tags/SuggestedTagsClient
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { fetchSuggestedTags, approveTag, rejectTag, type SuggestedTagDTO } from '@/lib/api';

type StatusFilter = 'pending' | 'approved' | 'rejected';

/**
 * Client component for the suggested tags review workflow.
 * Supports filtering by status and bulk approve/reject actions.
 */
export function SuggestedTagsClient() {
  const [tags, setTags] = useState<SuggestedTagDTO[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchSuggestedTags(statusFilter);
      setTags(response.tags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadTags();
  }, [loadTags]);

  /**
   * Handles approving a single suggested tag.
   *
   * @param tagId - The suggested tag ID to approve
   */
  async function handleApprove(tagId: string) {
    setActionInProgress(tagId);
    try {
      await approveTag(tagId);
      setTags((prev) => prev.filter((t) => t.id !== tagId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve tag');
    } finally {
      setActionInProgress(null);
    }
  }

  /**
   * Handles rejecting a single suggested tag.
   *
   * @param tagId - The suggested tag ID to reject
   */
  async function handleReject(tagId: string) {
    setActionInProgress(tagId);
    try {
      await rejectTag(tagId);
      setTags((prev) => prev.filter((t) => t.id !== tagId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject tag');
    } finally {
      setActionInProgress(null);
    }
  }

  /**
   * Maps confidence score to a badge variant.
   *
   * @param score - AI confidence score (0-1)
   * @returns Badge variant string
   */
  function confidenceBadgeVariant(score: number): 'success' | 'warning' | 'destructive' {
    if (score >= 0.8) return 'success';
    if (score >= 0.5) return 'warning';
    return 'destructive';
  }

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected'] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4">
          {error}
          <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          Loading suggested tags...
        </div>
      )}

      {/* Empty state */}
      {!loading && tags.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-[var(--muted-foreground)]">
            No {statusFilter} tags found.
          </CardContent>
        </Card>
      )}

      {/* Tag cards */}
      {!loading && tags.map((tag) => (
        <Card key={tag.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{tag.term}</CardTitle>
              <div className="flex gap-2 items-center">
                <Badge variant={confidenceBadgeVariant(tag.aiConfidenceScore)}>
                  {Math.round(tag.aiConfidenceScore * 100)}% confidence
                </Badge>
                <Badge variant="secondary">{tag.proposedTagType}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <span className="text-[var(--muted-foreground)]">Slug:</span>{' '}
                <code className="bg-[var(--muted)] px-1 rounded">{tag.normalizedSlug}</code>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">Bucket:</span>{' '}
                {tag.suggestedBucket}
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">Category:</span>{' '}
                {tag.proposedCategoryId}
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">Source:</span>{' '}
                <code className="bg-[var(--muted)] px-1 rounded text-xs">{tag.sourceArticleId}</code>
              </div>
            </div>

            {/* Actions (only for pending) */}
            {statusFilter === 'pending' && (
              <div className="flex gap-2">
                <Button
                  variant="success"
                  size="sm"
                  disabled={actionInProgress === tag.id}
                  onClick={() => void handleApprove(tag.id)}
                >
                  {actionInProgress === tag.id ? 'Processing...' : 'Approve'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={actionInProgress === tag.id}
                  onClick={() => void handleReject(tag.id)}
                >
                  Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
