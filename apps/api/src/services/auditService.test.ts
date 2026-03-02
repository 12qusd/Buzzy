/**
 * Tests for the parameter change auditing service.
 *
 * @module @buzzy/api/services/auditService.test
 */

import { describe, it, expect } from 'vitest';
import {
  formatAuditDescription,
  recordParameterChange,
  auditQuotaChange,
  auditRandomInjectionChange,
  auditSignalWeightChange,
  type AuditLogInput,
} from './auditService.js';

describe('formatAuditDescription', () => {
  it('uses provided description when available', () => {
    const input: AuditLogInput = {
      parameterType: 'publishing_quota',
      entityId: 'tech',
      entityName: 'Tech',
      changedBy: 'admin-1',
      oldValue: 20,
      newValue: 30,
      description: 'Custom description here',
    };
    expect(formatAuditDescription(input)).toBe('Custom description here');
  });

  it('auto-generates description from old/new values', () => {
    const input: AuditLogInput = {
      parameterType: 'publishing_quota',
      entityId: 'tech',
      entityName: 'Tech',
      changedBy: 'admin-1',
      oldValue: 20,
      newValue: 30,
    };
    const desc = formatAuditDescription(input);
    expect(desc).toContain('publishing_quota');
    expect(desc).toContain('Tech');
    expect(desc).toContain('20');
    expect(desc).toContain('30');
  });

  it('handles complex values in description', () => {
    const input: AuditLogInput = {
      parameterType: 'summarization_config',
      entityId: 'tech',
      entityName: 'Tech',
      changedBy: 'admin-1',
      oldValue: { tone: 'neutral' },
      newValue: { tone: 'casual' },
    };
    const desc = formatAuditDescription(input);
    expect(desc).toContain('neutral');
    expect(desc).toContain('casual');
  });
});

describe('recordParameterChange', () => {
  it('creates an audit log entry with all fields', async () => {
    const entry = await recordParameterChange({
      parameterType: 'publishing_quota',
      entityId: 'tech',
      entityName: 'Tech',
      changedBy: 'admin-1',
      oldValue: 20,
      newValue: 30,
    });

    expect(entry.id).toMatch(/^audit-/);
    expect(entry.parameterType).toBe('publishing_quota');
    expect(entry.entityId).toBe('tech');
    expect(entry.entityName).toBe('Tech');
    expect(entry.changedBy).toBe('admin-1');
    expect(entry.oldValue).toBe(20);
    expect(entry.newValue).toBe(30);
    expect(entry.changedAt).toBeDefined();
    expect(entry.description).toContain('publishing_quota');
  });

  it('generates unique IDs for each entry', async () => {
    const input: AuditLogInput = {
      parameterType: 'decay_rate',
      entityId: 'global',
      entityName: 'Interest Decay',
      changedBy: 'admin-2',
      oldValue: 0.05,
      newValue: 0.1,
    };

    const entry1 = await recordParameterChange(input);
    const entry2 = await recordParameterChange(input);

    expect(entry1.id).not.toBe(entry2.id);
  });

  it('records timestamp as ISO string', async () => {
    const entry = await recordParameterChange({
      parameterType: 'signal_weight',
      entityId: 'like',
      entityName: 'like',
      changedBy: 'admin-1',
      oldValue: 5,
      newValue: 8,
    });

    // Verify it's a valid ISO date
    expect(new Date(entry.changedAt).toISOString()).toBe(entry.changedAt);
  });
});

describe('auditQuotaChange', () => {
  it('records quota change with correct type', async () => {
    const entry = await auditQuotaChange('tech', 'Tech', 'admin-1', 20, 30);

    expect(entry.parameterType).toBe('publishing_quota');
    expect(entry.entityId).toBe('tech');
    expect(entry.oldValue).toBe(20);
    expect(entry.newValue).toBe(30);
  });
});

describe('auditRandomInjectionChange', () => {
  it('records random injection change with correct type', async () => {
    const entry = await auditRandomInjectionChange('tech', 'Tech', 'admin-1', 10, 15);

    expect(entry.parameterType).toBe('random_injection_percent');
    expect(entry.oldValue).toBe(10);
    expect(entry.newValue).toBe(15);
  });
});

describe('auditSignalWeightChange', () => {
  it('records signal weight change with correct type', async () => {
    const entry = await auditSignalWeightChange('like', 'admin-1', 5, 8);

    expect(entry.parameterType).toBe('signal_weight');
    expect(entry.entityId).toBe('like');
    expect(entry.oldValue).toBe(5);
    expect(entry.newValue).toBe(8);
  });
});
