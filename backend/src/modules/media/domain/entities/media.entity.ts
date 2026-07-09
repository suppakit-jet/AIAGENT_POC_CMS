import { randomUUID } from 'crypto';

export interface CreateMediaProps {
  id?: string | undefined;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  uploadedBy?: string | undefined;
  createdAt?: Date | undefined;
}

export class Media {
  public readonly id: string;
  public readonly filename: string;
  public readonly originalName: string;
  public readonly mimeType: string;
  public readonly sizeBytes: number;
  public readonly url: string;
  public readonly uploadedBy?: string | undefined;
  public readonly createdAt: Date;

  private constructor(props: CreateMediaProps) {
    if (
      !props.filename ||
      !props.filename.trim() ||
      !props.originalName ||
      !props.originalName.trim() ||
      !props.mimeType ||
      !props.mimeType.trim() ||
      !props.url ||
      !props.url.trim()
    ) {
      throw new Error('Filename, originalName, mimeType, and url are required');
    }

    if (props.sizeBytes <= 0) {
      throw new Error('sizeBytes must be greater than 0');
    }

    this.id = props.id ?? randomUUID();
    this.filename = props.filename;
    this.originalName = props.originalName;
    this.mimeType = props.mimeType;
    this.sizeBytes = props.sizeBytes;
    this.url = props.url;
    this.uploadedBy = props.uploadedBy;
    this.createdAt = props.createdAt ?? new Date();
  }

  static create(props: CreateMediaProps): Media {
    return new Media(props);
  }

  static restore(props: CreateMediaProps): Media {
    return new Media(props);
  }
}
