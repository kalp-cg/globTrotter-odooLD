import { v4 as uuidv4 } from 'uuid';
import { query } from '../common/config/db.js';
import { AppError } from '../common/errors/AppError.js';

export class CommunityService {
  static async getPosts(queryParams: any) {
    const { search, sort = 'newest' } = queryParams;

    let queryText = `
      SELECT 
        cp.id, cp.caption, cp.image_url, cp.created_at,
        u.id AS user_id, u.name AS user_name, u.photo_url AS user_photo, u.city AS user_city, u.country AS user_country,
        t.id AS trip_id, t.name AS trip_name, t.public_slug AS trip_slug, t.cover_photo_url AS trip_cover
      FROM community_posts cp
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN trips t ON cp.trip_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (cp.caption ILIKE $${params.length} OR u.name ILIKE $${params.length} OR t.name ILIKE $${params.length})`;
    }

    const sortDir = sort === 'oldest' ? 'ASC' : 'DESC';
    queryText += ` ORDER BY cp.created_at ${sortDir}`;

    const res = await query(queryText, params);
    return res.rows;
  }

  static async createPost(userId: string, body: any) {
    const { caption, image_url, trip_id } = body;

    if (!caption || caption.trim().length === 0) {
      throw new AppError('Caption is required', 400);
    }

    const postId = uuidv4();

    await query(`
      INSERT INTO community_posts (id, user_id, trip_id, caption, image_url, created_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    `, [postId, userId, trip_id || null, caption.trim(), image_url || null]);

    const createdRes = await query(`
      SELECT 
        cp.id, cp.caption, cp.image_url, cp.created_at,
        u.id AS user_id, u.name AS user_name, u.photo_url AS user_photo,
        t.id AS trip_id, t.name AS trip_name, t.public_slug AS trip_slug
      FROM community_posts cp
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN trips t ON cp.trip_id = t.id
      WHERE cp.id = $1
    `, [postId]);

    return createdRes.rows[0];
  }

  static async deletePost(postId: string, userId: string, isAdmin: boolean) {
    const checkRes = await query(`SELECT user_id FROM community_posts WHERE id = $1`, [postId]);
    if (checkRes.rows.length === 0) throw new AppError('Post not found', 404);

    if (checkRes.rows[0].user_id !== userId && !isAdmin) {
      throw new AppError('Forbidden: Not post author', 403);
    }

    await query(`DELETE FROM community_posts WHERE id = $1`, [postId]);
    return true;
  }
}
