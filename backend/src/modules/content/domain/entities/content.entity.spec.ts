import { describe, it, expect } from 'vitest';
import { Content, ContentType, ContentStatus } from './content.entity';

describe('Content Entity', () => {
  describe('create', () => {
    it('should create an article content with default draft status and uuid', () => {
      const content = Content.create({
        title: 'Getting Started with CMS',
        slug: 'getting-started-with-cms',
        body: 'Welcome to our headless CMS platform.',
        type: ContentType.Article,
      });

      expect(content.id).toBeDefined();
      expect(content.title).toBe('Getting Started with CMS');
      expect(content.slug).toBe('getting-started-with-cms');
      expect(content.body).toBe('Welcome to our headless CMS platform.');
      expect(content.type).toBe(ContentType.Article);
      expect(content.status).toBe(ContentStatus.Draft);
      expect(content.createdAt).toBeInstanceOf(Date);
      expect(content.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a page content correctly', () => {
      const page = Content.create({
        title: 'About Us',
        slug: 'about-us',
        body: 'This is the about us page.',
        type: ContentType.Page,
      });

      expect(page.type).toBe(ContentType.Page);
      expect(page.status).toBe(ContentStatus.Draft);
    });

    it('should throw error if title or slug is empty', () => {
      expect(() =>
        Content.create({
          title: '',
          slug: 'valid-slug',
          body: 'Content body',
          type: ContentType.Article,
        }),
      ).toThrow('Title and slug cannot be empty');

      expect(() =>
        Content.create({
          title: 'Valid Title',
          slug: '',
          body: 'Content body',
          type: ContentType.Article,
        }),
      ).toThrow('Title and slug cannot be empty');
    });
  });

  describe('workflow transitions', () => {
    it('should transition from draft to in_review when submitForReview is called', () => {
      const content = Content.create({
        title: 'Draft Post',
        slug: 'draft-post',
        body: 'Content',
        type: ContentType.Article,
      });

      content.submitForReview();
      expect(content.status).toBe(ContentStatus.InReview);
    });

    it('should transition to published when publish is called from draft or in_review', () => {
      const content = Content.create({
        title: 'Draft Post',
        slug: 'draft-post',
        body: 'Content',
        type: ContentType.Article,
      });

      content.publish();
      expect(content.status).toBe(ContentStatus.Published);
    });

    it('should throw error when submitting already published content for review', () => {
      const content = Content.create({
        title: 'Published Post',
        slug: 'published-post',
        body: 'Content',
        type: ContentType.Article,
      });

      content.publish();

      expect(() => content.submitForReview()).toThrow(
        'Cannot submit published content for review',
      );
    });
  });

  describe('update', () => {
    it('should update title, slug, and body and refresh updatedAt', () => {
      const content = Content.create({
        title: 'Old Title',
        slug: 'old-slug',
        body: 'Old Body',
        type: ContentType.Article,
      });

      content.update({
        title: 'New Title',
        slug: 'new-slug',
        body: 'New Body',
      });

      expect(content.title).toBe('New Title');
      expect(content.slug).toBe('new-slug');
      expect(content.body).toBe('New Body');
    });

    it('should throw error when updating with empty title or slug', () => {
      const content = Content.create({
        title: 'Title',
        slug: 'slug',
        body: 'Body',
        type: ContentType.Article,
      });

      expect(() => content.update({ title: '   ' })).toThrow(
        'Title and slug cannot be empty',
      );
      expect(() => content.update({ slug: '' })).toThrow(
        'Title and slug cannot be empty',
      );
    });
  });

  describe('restore', () => {
    it('should restore existing content from persistence props', () => {
      const now = new Date();
      const restored = Content.restore({
        id: 'existing-id-123',
        title: 'Restored Title',
        slug: 'restored-slug',
        body: 'Restored Body',
        type: ContentType.Article,
        status: ContentStatus.Published,
        createdAt: now,
        updatedAt: now,
      });

      expect(restored.id).toBe('existing-id-123');
      expect(restored.status).toBe(ContentStatus.Published);
    });
  });
});
