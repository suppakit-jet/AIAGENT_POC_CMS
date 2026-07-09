import { Content, ContentType } from '../../../domain/entities/content.entity';

export interface ContentSearchCriteria {
  type?: ContentType;
  status?: string;
}

export interface IContentRepository {
  save(content: Content): Promise<void>;
  findById(id: string): Promise<Content | null>;
  findBySlug(slug: string, type?: ContentType): Promise<Content | null>;
  findMany(criteria?: ContentSearchCriteria): Promise<Content[]>;
  delete(id: string): Promise<void>;
}
