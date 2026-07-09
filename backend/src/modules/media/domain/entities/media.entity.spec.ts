import { describe, it, expect } from 'vitest';
import { Media } from './media.entity';

describe('Media Entity', () => {
  it('should create a valid Media entity', () => {
    const media = Media.create({
      filename: 'image-123.jpg',
      originalName: 'photo.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
      url: '/uploads/image-123.jpg',
      uploadedBy: 'user-1',
    });

    expect(media.id).toBeDefined();
    expect(media.filename).toBe('image-123.jpg');
    expect(media.originalName).toBe('photo.jpg');
    expect(media.mimeType).toBe('image/jpeg');
    expect(media.sizeBytes).toBe(1024);
    expect(media.url).toBe('/uploads/image-123.jpg');
    expect(media.uploadedBy).toBe('user-1');
    expect(media.createdAt).toBeInstanceOf(Date);
  });

  it('should throw error if required fields are missing or empty', () => {
    expect(() =>
      Media.create({
        filename: '',
        originalName: 'photo.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
        url: '/uploads/img.jpg',
      }),
    ).toThrow('Filename, originalName, mimeType, and url are required');
  });

  it('should throw error if sizeBytes is not positive', () => {
    expect(() =>
      Media.create({
        filename: 'img.jpg',
        originalName: 'photo.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 0,
        url: '/uploads/img.jpg',
      }),
    ).toThrow('sizeBytes must be greater than 0');

    expect(() =>
      Media.create({
        filename: 'img.jpg',
        originalName: 'photo.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: -10,
        url: '/uploads/img.jpg',
      }),
    ).toThrow('sizeBytes must be greater than 0');
  });

  it('should restore a Media entity from persistence', () => {
    const now = new Date();
    const media = Media.restore({
      id: 'm-1',
      filename: 'file.png',
      originalName: 'orig.png',
      mimeType: 'image/png',
      sizeBytes: 2048,
      url: '/uploads/file.png',
      uploadedBy: undefined,
      createdAt: now,
    });

    expect(media.id).toBe('m-1');
    expect(media.createdAt).toBe(now);
  });
});
