import { describe, it, expect } from 'vitest';
import { AuditLog } from './audit-log.entity';

describe('AuditLog Entity', () => {
  it('should create an audit log with automatic id and timestamp', () => {
    const log = AuditLog.create({
      action: 'CONTENT_CREATED',
      entityType: 'Content',
      entityId: 'content-123',
      actorId: 'user-abc',
      details: { title: 'New Article' },
    });

    expect(log.id).toBeDefined();
    expect(log.action).toBe('CONTENT_CREATED');
    expect(log.entityType).toBe('Content');
    expect(log.entityId).toBe('content-123');
    expect(log.actorId).toBe('user-abc');
    expect(log.details).toEqual({ title: 'New Article' });
    expect(log.createdAt).toBeInstanceOf(Date);
  });

  it('should throw error if action, entityType, or entityId is empty', () => {
    expect(() =>
      AuditLog.create({
        action: '',
        entityType: 'Content',
        entityId: 'content-123',
      }),
    ).toThrow('Action, entityType, and entityId are required');

    expect(() =>
      AuditLog.create({
        action: 'CONTENT_CREATED',
        entityType: '   ',
        entityId: 'content-123',
      }),
    ).toThrow('Action, entityType, and entityId are required');

    expect(() =>
      AuditLog.create({
        action: 'CONTENT_CREATED',
        entityType: 'Content',
        entityId: '',
      }),
    ).toThrow('Action, entityType, and entityId are required');
  });

  it('should restore an audit log from persistence', () => {
    const now = new Date();
    const log = AuditLog.restore({
      id: 'log-1',
      action: 'CONTENT_DELETED',
      entityType: 'Content',
      entityId: 'content-456',
      actorId: 'admin-1',
      details: {},
      createdAt: now,
    });

    expect(log.id).toBe('log-1');
    expect(log.action).toBe('CONTENT_DELETED');
    expect(log.createdAt).toBe(now);
  });
});
