/**
 * Admin routes for the Buzzy Today API.
 * Provides endpoints for RSS source management, tag review, dashboard, quotas,
 * AI config, and report generation/export.
 *
 * All admin endpoints require admin authentication.
 *
 * @module @buzzy/api/routes/admin
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { parseBody, parseQuery } from '../validators/index.js';
import {
  addRssSourceSchema,
  approveTagSchema,
  rejectTagSchema,
  updateQuotaSchema,
  updateSummarizationConfigSchema,
} from '../validators/admin.validators.js';
import { logger } from '../logger.js';
import { auditQuotaChange, getAuditLog } from '../services/auditService.js';

/** Schema for audit log query */
const auditLogQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  parameterType: z.string().optional(),
});

/** Schema for suggested-tags list query */
const suggestedTagsQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

/** Schema for report type path parameter */
const reportTypeEnum = z.enum([
  'publisher',
  'user',
  'comment',
  'article',
  'engagement',
]);

/**
 * Registers admin routes.
 *
 * @param server - Fastify instance
 */
export async function adminRoutes(server: FastifyInstance): Promise<void> {
  // TODO: Add admin auth preHandler hook when Firebase Auth is wired up

  /** GET /api/admin/rss-sources — List all RSS sources */
  server.get('/rss-sources', async () => {
    // TODO: Query Firestore rss_sources collection
    logger.info('Admin: listing RSS sources');
    return { sources: [] };
  });

  /** POST /api/admin/rss-sources — Add a new RSS source */
  server.post('/rss-sources', async (request) => {
    const body = parseBody(request, addRssSourceSchema);
    logger.info('Admin: adding RSS source', { feedUrl: body.feedUrl, channelName: body.channelName });
    // TODO: Insert into Firestore rss_sources collection
    return {
      success: true,
      source: {
        id: 'placeholder-id',
        ...body,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    };
  });

  /** GET /api/admin/suggested-tags — List pending tag suggestions */
  server.get('/suggested-tags', async (request) => {
    const query = parseQuery(request, suggestedTagsQuerySchema);
    logger.info('Admin: listing suggested tags', { status: query.status, limit: query.limit });
    // TODO: Query Firestore suggested_tags collection filtered by status
    return {
      tags: [],
      pagination: {
        limit: query.limit,
        cursor: query.cursor ?? null,
        hasMore: false,
      },
    };
  });

  /**
   * POST /api/admin/suggested-tags/:id/approve — Approve a suggested tag.
   * Promotes the suggested tag to a canonical TopicTag in the topic_tags collection.
   * Optionally overrides displayName, bucketId, tagType, or categoryId.
   */
  server.post<{ Params: { id: string } }>('/suggested-tags/:id/approve', async (request) => {
    const { id } = request.params;
    const overrides = parseBody(request, approveTagSchema);
    logger.info('Admin: approving suggested tag', { tagId: id, overrides });

    // TODO: Firestore transaction:
    // 1. Read suggested_tags/{id} — verify status === 'pending'
    // 2. Create topic_tags/{newId} from suggested tag data + overrides
    // 3. Update suggested_tags/{id} → status: 'approved', reviewedAt, reviewedBy
    // 4. If the suggested tag has a sourceArticleId, update the article's topicTagIds

    return {
      success: true,
      suggestedTagId: id,
      action: 'approved',
      overrides: {
        displayName: overrides.displayName ?? null,
        bucketId: overrides.bucketId ?? null,
        tagType: overrides.tagType ?? null,
        categoryId: overrides.categoryId ?? null,
      },
    };
  });

  /**
   * POST /api/admin/suggested-tags/:id/reject — Reject a suggested tag.
   * Marks the tag as rejected with an optional reason.
   */
  server.post<{ Params: { id: string } }>('/suggested-tags/:id/reject', async (request) => {
    const { id } = request.params;
    const body = parseBody(request, rejectTagSchema);
    logger.info('Admin: rejecting suggested tag', { tagId: id, reason: body.reason });

    // TODO: Firestore:
    // 1. Read suggested_tags/{id} — verify status === 'pending'
    // 2. Update suggested_tags/{id} → status: 'rejected', rejectionReason, reviewedAt, reviewedBy

    return {
      success: true,
      suggestedTagId: id,
      action: 'rejected',
      reason: body.reason ?? null,
    };
  });

  /** GET /api/admin/dashboard — Dashboard metrics */
  server.get('/dashboard', async () => {
    logger.info('Admin: fetching dashboard metrics');
    // TODO: Aggregate Firestore counts for articles by status, daily ingestion stats
    return {
      metrics: {
        articlesIngested: 0,
        articlesFiltered: 0,
        articlesPublished: 0,
        pendingSuggestedTags: 0,
        activeRssSources: 0,
        quotaUtilization: {},
      },
    };
  });

  /** GET /api/admin/quotas — List quota utilization for all categories */
  server.get('/quotas', async () => {
    logger.info('Admin: fetching quota utilization');
    // TODO: Query Firestore for real data
    return { quotas: [] };
  });

  /** PUT /api/admin/quotas/:categoryId — Update publishing quota for a category */
  server.put<{ Params: { categoryId: string } }>('/quotas/:categoryId', async (request) => {
    const { categoryId } = request.params;
    const body = parseBody(request, updateQuotaSchema);
    logger.info('Admin: updating quota', { categoryId, dailyLimit: body.dailyLimit });

    // TODO: Read current quota from Firestore for audit comparison
    const oldDailyLimit = 0; // Placeholder — read from Firestore

    // TODO: Update Firestore category_tags/{categoryId}.publishingQuota

    // Audit the parameter change
    // TODO: Get actual admin userId from Firebase Auth
    const adminUserId = 'system';
    await auditQuotaChange(categoryId, categoryId, adminUserId, oldDailyLimit, body.dailyLimit);

    return {
      success: true,
      categoryId,
      quota: {
        dailyLimit: body.dailyLimit,
        randomInjectionPercent: body.randomInjectionPercent ?? null,
      },
    };
  });

  /** PUT /api/admin/summarization-config/:categoryId — Update AI summarization config */
  server.put<{ Params: { categoryId: string } }>('/summarization-config/:categoryId', async (request) => {
    const { categoryId } = request.params;
    const body = parseBody(request, updateSummarizationConfigSchema);
    logger.info('Admin: updating summarization config', { categoryId });

    // TODO: Update Firestore category_tags/{categoryId}.summarizationConfig

    return {
      success: true,
      categoryId,
      config: body,
    };
  });

  /** GET /api/admin/reports/:type — Generate a report */
  server.get<{ Params: { type: string } }>('/reports/:type', async (request) => {
    const { type } = request.params;
    const parsed = reportTypeEnum.safeParse(type);
    if (!parsed.success) {
      const error = new Error(`Invalid report type: ${type}. Valid: ${reportTypeEnum.options.join(', ')}`) as Error & { statusCode: number };
      error.statusCode = 400;
      throw error;
    }
    logger.info('Admin: generating report', { type: parsed.data });

    // TODO: Query Firestore and aggregate report data based on type

    return {
      report: [],
      type: parsed.data,
      generatedAt: new Date().toISOString(),
    };
  });

  /** GET /api/admin/reports/:type/export — CSV export of a report */
  server.get<{ Params: { type: string } }>('/reports/:type/export', async (request, reply) => {
    const { type } = request.params;
    const parsed = reportTypeEnum.safeParse(type);
    if (!parsed.success) {
      const error = new Error(`Invalid report type: ${type}`) as Error & { statusCode: number };
      error.statusCode = 400;
      throw error;
    }
    logger.info('Admin: exporting report CSV', { type: parsed.data });

    // TODO: Generate CSV from Firestore data
    const csvHeader = 'id,date,metric\n';

    void reply.header('Content-Type', 'text/csv');
    void reply.header('Content-Disposition', `attachment; filename="${parsed.data}-report.csv"`);
    return csvHeader;
  });

  /** GET /api/admin/audit-log — Fetch parameter change audit trail */
  server.get('/audit-log', async (request) => {
    const query = parseQuery(request, auditLogQuerySchema);
    logger.info('Admin: fetching audit log', { limit: query.limit, parameterType: query.parameterType });

    const entries = await getAuditLog(
      query.limit,
      query.parameterType as Parameters<typeof getAuditLog>[1],
    );

    return { entries, count: entries.length };
  });
}
