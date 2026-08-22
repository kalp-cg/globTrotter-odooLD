import { query } from '../common/config/db.js';
import { AppError } from '../common/errors/AppError.js';

export class UsersService {
  static async getMe(userId: string) {
    const res = await query(`
      SELECT id, name, email, photo_url, language_pref, is_admin, phone, city, country, bio, created_at
      FROM users WHERE id = $1 LIMIT 1
    `, [userId]);

    if (res.rows.length === 0) throw new AppError('User not found', 404);

    const statsRes = await query(`
      SELECT 
        COUNT(*) AS total_trips,
        COUNT(CASE WHEN end_date < CURRENT_DATE THEN 1 END) AS completed_trips,
        COUNT(CASE WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN 1 END) AS ongoing_trips,
        COUNT(CASE WHEN start_date > CURRENT_DATE THEN 1 END) AS upcoming_trips
      FROM trips WHERE user_id = $1
    `, [userId]);

    return {
      user: res.rows[0],
      stats: statsRes.rows[0]
    };
  }

  static async updateMe(userId: string, body: any) {
    const { name, photo_url, language_pref, phone, city, country, bio } = body;

    const res = await query(`
      UPDATE users 
      SET 
        name = COALESCE($1, name),
        photo_url = COALESCE($2, photo_url),
        language_pref = COALESCE($3, language_pref),
        phone = COALESCE($4, phone),
        city = COALESCE($5, city),
        country = COALESCE($6, country),
        bio = COALESCE($7, bio)
      WHERE id = $8
      RETURNING id, name, email, photo_url, language_pref, is_admin, phone, city, country, bio, created_at
    `, [name, photo_url, language_pref, phone, city, country, bio, userId]);

    if (res.rows.length === 0) throw new AppError('User not found', 404);
    return res.rows[0];
  }

  static async deleteMe(userId: string) {
    await query(`DELETE FROM users WHERE id = $1`, [userId]);
    return true;
  }
}
