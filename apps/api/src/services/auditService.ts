/**
 * Parameter change auditing service for the Buzzy Today API.
 * Logs all admin parameter changes with timestamp, user, old/new values.
 * Changes must take effect within 60 seconds (Firestore real-time).
 *
 * Audit trail is stored in Firestore `audit_logs` collection.
 *
 * @module @buzzy/api/services/auditService
 */

import { logger } from '../logger.js';

/** Types of parameters that can be audited */
export type AuditableParameterType =
  | 'publishing_quota'
  | 'random_injection_percent'
  | 'signal_weight'
  | 'decay_rate'
  | 'freshness_half_life'
  | 'promotion_threshold'
  | 'summarization_config'
  | 'rss_source'
  | 'buzzword'
  | 'tag_status';

/** A single audit log entry */
export interface AuditLogEntry {
  id: string;
  parameterType: AuditableParameterType;
  entityId: string;
  entityName: string;
  changedBy: string;
  changedAt: string;
  oldValue: unknown;
  newValue: unknown;
  description: string;
}

/** Input for creating an audit log entry */
export interface AuditLogInput {
  parameterType: AuditableParameterType;
  entityId: string;
  entityName: string;
  changedBy: string;
  oldValue: unknown;
  newValue: unknown;
  description?: string;
}

/**
 * Creates a human-readable description of a parameter change.
 *
 * @param input - The audit log input
 * @returns A human-readable change description
 */
export function formatAuditDescription(input: AuditLogInput): string {
  if (input.description) return input.description;

  const oldStr = JSON.stringify(input.oldValue);
  const newStr = JSON.stringify(input.newValue);

  return `${input.parameterType} for "${input.entityName}" changed from ${oldStr} to ${newStr}`;
}

/**
 * Records a parameter change in the audit log.
 *
 * @param input - The change details to audit
 * @returns The created audit log entry
 */
export async function recordParameterChange(input: AuditLogInput): Promise<AuditLogEntry> {
  const now = new Date().toISOString();
  const id = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  const entry: AuditLogEntry = {
    id,
    parameterType: input.parameterType,
    entityId: input.entityId,
    entityName: input.entityName,
    changedBy: input.changedBy,
    changedAt: now,
    oldValue: input.oldValue,
    newValue: input.newValue,
    description: formatAuditDescription(input),
  };

  logger.info('Parameter change audited', {
    auditId: id,
    parameterType: input.parameterType,
    entityId: input.entityId,
    changedBy: input.changedBy,
    description: entry.description,
  });

  // TODO: Write to Firestore audit_logs collection
  // await db.collection('audit_logs').doc(id).set(entry);

  return entry;
}

/**
 * Records a quota change for auditing.
 *
 * @param categoryId - Category that changed
 * @param categoryName - Human-readable category name
 * @param changedBy - Admin user ID
 * @param oldQuota - Previous daily limit
 * @param newQuota - New daily limit
 * @returns Audit log entry
 */
export async function auditQuotaChange(
  categoryId: string,
  categoryName: string,
  changedBy: string,
  oldQuota: number,
  newQuota: number,
): Promise<AuditLogEntry> {
  return recordParameterChange({
    parameterType: 'publishing_quota',
    entityId: categoryId,
    entityName: categoryName,
    changedBy,
    oldValue: oldQuota,
    newValue: newQuota,
  });
}

/**
 * Records a random injection percentage change for auditing.
 *
 * @param categoryId - Category that changed
 * @param categoryName - Human-readable category name
 * @param changedBy - Admin user ID
 * @param oldPercent - Previous percentage
 * @param newPercent - New percentage
 * @returns Audit log entry
 */
export async function auditRandomInjectionChange(
  categoryId: string,
  categoryName: string,
  changedBy: string,
  oldPercent: number,
  newPercent: number,
): Promise<AuditLogEntry> {
  return recordParameterChange({
    parameterType: 'random_injection_percent',
    entityId: categoryId,
    entityName: categoryName,
    changedBy,
    oldValue: oldPercent,
    newValue: newPercent,
  });
}

/**
 * Records a signal weight change for auditing.
 *
 * @param signalType - The signal type that changed
 * @param changedBy - Admin user ID
 * @param oldWeight - Previous weight
 * @param newWeight - New weight
 * @returns Audit log entry
 */
export async function auditSignalWeightChange(
  signalType: string,
  changedBy: string,
  oldWeight: number,
  newWeight: number,
): Promise<AuditLogEntry> {
  return recordParameterChange({
    parameterType: 'signal_weight',
    entityId: signalType,
    entityName: signalType,
    changedBy,
    oldValue: oldWeight,
    newValue: newWeight,
  });
}

/**
 * Fetches recent audit log entries.
 *
 * @param limit - Maximum entries to return
 * @param parameterType - Optional filter by parameter type
 * @returns Array of audit log entries (newest first)
 */
export async function getAuditLog(
  limit: number = 50,
  parameterType?: AuditableParameterType,
): Promise<AuditLogEntry[]> {
  logger.debug('Fetching audit log', { limit, parameterType });

  // TODO: Query Firestore audit_logs collection
  // ordered by changedAt desc, filtered by parameterType if provided

  return [];
}
