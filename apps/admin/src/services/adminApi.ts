/**
 * Admin API client for server-side and client-side data fetching.
 * Wraps fetch calls to the Buzzy API admin endpoints.
 *
 * @module @buzzy/admin/services/adminApi
 */

const API_URL = process.env['NEXT_PUBLIC_BUZZY_API_URL'] ?? 'http://localhost:3001';

/**
 * Fetches data from the Buzzy API.
 *
 * @param path - API path (e.g., '/api/admin/dashboard')
 * @param options - Additional fetch options
 * @returns Parsed JSON response
 */
export async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });

  if (!res.ok) {
    throw new Error(`Admin API error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

/** Dashboard metrics response */
export interface DashboardMetrics {
  articlesIngested: number;
  pendingTags: number;
  activeSources: number;
  publishedLast24h: number;
  totalArticles: number;
  totalUsers: number;
}

/** Quota data for a category */
export interface CategoryQuota {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  dailyLimit: number;
  publishedToday: number;
  remaining: number;
  utilization: number;
  randomInjectionPct: number;
  randomSlots: number;
}

/** RSS source entry */
export interface RssSourceEntry {
  id: string;
  channelName: string;
  publisherName: string;
  feedUrl: string;
  assignedCategoryId: string | null;
  isActive: boolean;
  lastPollAt: string | null;
  failureCount: number;
}

/** Suggested tag entry */
export interface SuggestedTagEntry {
  id: string;
  term: string;
  normalizedSlug: string;
  suggestedBucket: string;
  proposedTagType: string;
  proposedCategoryId: string;
  aiConfidenceScore: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

/** Audit log entry */
export interface AuditLogEntry {
  id: string;
  parameterType: string;
  entityId: string;
  entityName: string;
  changedBy: string;
  oldValue: unknown;
  newValue: unknown;
  description: string;
  changedAt: string;
}

/**
 * Fetches dashboard metrics.
 *
 * @returns Dashboard metrics
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    return await adminFetch<DashboardMetrics>('/api/admin/dashboard');
  } catch {
    // Return zeros if API is not available
    return {
      articlesIngested: 0,
      pendingTags: 0,
      activeSources: 0,
      publishedLast24h: 0,
      totalArticles: 0,
      totalUsers: 0,
    };
  }
}

/**
 * Fetches publishing quotas for all categories.
 *
 * @returns Array of category quotas
 */
export async function getQuotas(): Promise<CategoryQuota[]> {
  try {
    const data = await adminFetch<{ quotas: CategoryQuota[] }>('/api/admin/quotas');
    return data.quotas;
  } catch {
    return [];
  }
}

/**
 * Fetches pending suggested tags.
 *
 * @returns Array of suggested tags
 */
export async function getSuggestedTags(): Promise<SuggestedTagEntry[]> {
  try {
    const data = await adminFetch<{ tags: SuggestedTagEntry[] }>('/api/admin/suggested-tags?status=pending');
    return data.tags;
  } catch {
    return [];
  }
}

/**
 * Fetches RSS sources.
 *
 * @returns Array of RSS sources
 */
export async function getRssSources(): Promise<RssSourceEntry[]> {
  try {
    const data = await adminFetch<{ sources: RssSourceEntry[] }>('/api/admin/rss-sources');
    return data.sources;
  } catch {
    return [];
  }
}

/**
 * Fetches audit log entries.
 *
 * @param limit - Maximum entries to fetch
 * @returns Array of audit log entries
 */
export async function getAuditLog(limit: number = 50): Promise<AuditLogEntry[]> {
  try {
    const data = await adminFetch<{ entries: AuditLogEntry[] }>(`/api/admin/audit-log?limit=${limit}`);
    return data.entries;
  } catch {
    return [];
  }
}

export { API_URL };
