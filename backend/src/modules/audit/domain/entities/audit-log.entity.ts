import { randomUUID } from 'crypto';

export interface CreateAuditLogProps {
  id?: string | undefined;
  action: string;
  entityType: string;
  entityId: string;
  actorId?: string | undefined;
  details?: Record<string, any> | undefined;
  createdAt?: Date | undefined;
}

export class AuditLog {
  public readonly id: string;
  public readonly action: string;
  public readonly entityType: string;
  public readonly entityId: string;
  public readonly actorId?: string | undefined;
  public readonly details?: Record<string, any> | undefined;
  public readonly createdAt: Date;

  private constructor(props: CreateAuditLogProps) {
    if (
      !props.action ||
      !props.action.trim() ||
      !props.entityType ||
      !props.entityType.trim() ||
      !props.entityId ||
      !props.entityId.trim()
    ) {
      throw new Error('Action, entityType, and entityId are required');
    }

    this.id = props.id ?? randomUUID();
    this.action = props.action;
    this.entityType = props.entityType;
    this.entityId = props.entityId;
    this.actorId = props.actorId;
    this.details = props.details;
    this.createdAt = props.createdAt ?? new Date();
  }

  static create(props: CreateAuditLogProps): AuditLog {
    return new AuditLog(props);
  }

  static restore(props: Required<CreateAuditLogProps>): AuditLog {
    return new AuditLog(props);
  }
}
