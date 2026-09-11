import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCategories, createPost, getMyPosts, getPublicPosts, getPostDetail, deletePost } from './postService';

describe('postService API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getCategories fetches category list with auth header', async () => {
    const mockCategories = [{ id: 'cat-1', name: 'IELTS Task 2', slug: 'ielts-task-2' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    });

    const getToken = vi.fn().mockResolvedValue('test-token-123');
    const result = await getCategories(getToken);

    expect(result).toEqual(mockCategories);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/categories'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      })
    );
  });

  it('createPost sends post payload with Bearer token', async () => {
    const mockCreated = { id: 'post-1', title: 'Test Essay', content: 'Essay content' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreated,
    });

    const getToken = vi.fn().mockResolvedValue('test-token-123');
    const result = await createPost(getToken, {
      title: 'Test Essay',
      content: 'Essay content',
      category_ids: ['cat-1'],
    });

    expect(result).toEqual(mockCreated);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/posts'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token-123',
        }),
        body: JSON.stringify({
          title: 'Test Essay',
          content: 'Essay content',
          category_ids: ['cat-1'],
          evaluation: null,
        }),
      })
    );
  });

  it('getMyPosts calls /api/posts/me with pagination parameters', async () => {
    const mockResponse = { items: [], total: 0, page: 1, limit: 20 };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const getToken = vi.fn().mockResolvedValue('test-token-123');
    const result = await getMyPosts(getToken, { skip: 0, limit: 20 });

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/posts/me?skip=0&limit=20'),
      expect.any(Object)
    );
  });

  it('getPostDetail calls /api/posts/{id}', async () => {
    const mockPost = { id: 'post-123', title: 'Detail Post', content: 'Detail Content' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPost,
    });

    const getToken = vi.fn().mockResolvedValue('test-token-123');
    const result = await getPostDetail(getToken, 'post-123');

    expect(result).toEqual(mockPost);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/posts/post-123'),
      expect.any(Object)
    );
  });

  it('deletePost handles HTTP 204 No Content successfully without json parse error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const getToken = vi.fn().mockResolvedValue('test-token-123');
    const result = await deletePost(getToken, 'post-delete-999');

    expect(result).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/posts/post-delete-999'),
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      })
    );
  });

  it('deletePost throws error with status when server returns non-ok status', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ detail: 'Not authorized to delete' }),
    });

    const getToken = vi.fn().mockResolvedValue('test-token-123');
    await expect(deletePost(getToken, 'post-forbidden')).rejects.toMatchObject({
      message: 'Not authorized to delete',
      status: 403,
    });
  });
});
