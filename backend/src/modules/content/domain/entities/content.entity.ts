import { randomUUID } from 'crypto';

export enum ContentType {
  Article = 'article',
  Page = 'page',
}

export enum ContentStatus {
  Draft = 'draft',
  InReview = 'in_review',
  Published = 'published',
  Unpublished = 'unpublished',
  Archived = 'archived',
}

export interface CreateContentProps {
  id?: string;
  title: string;
  slug: string;
  body: string;
  type: ContentType;
  status?: ContentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RestoreContentProps {
  id: string;
  title: string;
  slug: string;
  body: string;
  type: ContentType;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Content {
  public readonly id: string;
  public title: string;
  public slug: string;
  public body: string;
  public readonly type: ContentType;
  public status: ContentStatus;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: CreateContentProps) {
    if (!props.title || !props.title.trim() || !props.slug || !props.slug.trim()) {
      throw new Error('Title and slug cannot be empty');
    }

    this.id = props.id ?? randomUUID();
    this.title = props.title;
    this.slug = props.slug;
    this.body = props.body;
    this.type = props.type;
    this.status = props.status ?? ContentStatus.Draft;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: CreateContentProps): Content {
    return new Content(props);
  }

  static restore(props: RestoreContentProps): Content {
    return new Content(props);
  }

  public submitForReview(): void {
    if (this.status === ContentStatus.Published) {
      throw new Error('Cannot submit published content for review');
    }
    this.status = ContentStatus.InReview;
    this.updatedAt = new Date();
  }

  public publish(): void {
    this.status = ContentStatus.Published;
    this.updatedAt = new Date();
  }

  public update(props: {
    title?: string | undefined;
    slug?: string | undefined;
    body?: string | undefined;
  }): void {
    if (props.title !== undefined) {
      if (!props.title.trim()) {
        throw new Error('Title and slug cannot be empty');
      }
      this.title = props.title;
    }
    if (props.slug !== undefined) {
      if (!props.slug.trim()) {
        throw new Error('Title and slug cannot be empty');
      }
      this.slug = props.slug;
    }
    if (props.body !== undefined) {
      this.body = props.body;
    }
    this.updatedAt = new Date();
  }
}
