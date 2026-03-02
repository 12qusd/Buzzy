/**
 * API client for the Buzzy admin panel.
 * Wraps fetch calls to the Buzzy API with error handling.
 *
 * @module @buzzy/admin/lib/api
 */

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api';

/** Structured API error */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Makes a typed request to the Buzzy API.
 *
 * @param path - API path (e.g., '/admin/suggested-tags')
 * @param options - Fetch options
 * @returns Parsed JSON response
 * @throws ApiError on non-OK responses
 */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: { message?: string; details?: Record<string, string> } };
    throw new ApiError(
      body.error?.message ?? `API error: ${response.status}`,
      response.status,
      body.error?.details
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Fetches suggested tags from the admin API.
 *
 * @param status - Filter by status (default: 'pending')
 * @param limit - Number of tags to fetch
 * @returns Suggested tags response
 */
export async function fetchSuggestedTags(
  status: 'pending' | 'approved' | 'rejected' = 'pending',
  limit = 50
): Promise<SuggestedTagsResponse> {
  return apiFetch<SuggestedTagsResponse>(`/admin/suggested-tags?status=${status}&limit=${limit}`);
}

/**
 * Approves a suggested tag with optional overrides.
 *
 * @param tagId - Suggested tag ID
 * @param overrides - Optional field overrides
 * @returns Approval result
 */
export async function approveTag(
  tagId: string,
  overrides?: {
    displayName?: string;
    bucketId?: string;
    tagType?: string;
    categoryId?: string;
  }
): Promise<TagActionResponse> {
  return apiFetch<TagActionResponse>(`/admin/suggested-tags/${tagId}/approve`, {
    method: 'POST',
    body: JSON.stringify(overrides ?? {}),
  });
}

/**
 * Rejects a suggested tag with an optional reason.
 *
 * @param tagId - Suggested tag ID
 * @param reason - Optional rejection reason
 * @returns Rejection result
 */
export async function rejectTag(
  tagId: string,
  reason?: string
): Promise<TagActionResponse> {
  return apiFetch<TagActionResponse>(`/admin/suggested-tags/${tagId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

/** Response from suggested tags list endpoint */
interface SuggestedTagsResponse {
  tags: SuggestedTagDTO[];
  pagination: {
    limit: number;
    cursor: string | null;
    hasMore: boolean;
  };
}

/** Suggested tag data transfer object */
export interface SuggestedTagDTO {
  id: string;
  term: string;
  normalizedSlug: string;
  suggestedBucket: string;
  proposedTagType: string;
  proposedCategoryId: string;
  aiConfidenceScore: number;
  sourceArticleId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

/** Response from tag approve/reject endpoints */
interface TagActionResponse {
  success: boolean;
  suggestedTagId: string;
  action: 'approved' | 'rejected';
}
