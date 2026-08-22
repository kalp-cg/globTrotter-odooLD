import { query } from '../common/config/db.js';

export class AdminService {
  static async getStats() {
    const userCount = await query(`SELECT COUNT(*) AS count FROM users;`);
    const tripCount = await query(`SELECT COUNT(*) AS count FROM trips;`);
    const stopCount = await query(`SELECT COUNT(*) AS count FROM stops;`);
    const activityCount = await query(`SELECT COUNT(*) AS count FROM activities;`);
    const postCount = await query(`SELECT COUNT(*) AS count FROM community_posts;`);
    const totalBudget = await query(`SELECT COALESCE(SUM(total_cost), 0) AS total_planned_budget FROM budgets;`);

    return {
      total_users: parseInt(userCount.rows[0]?.count || '0', 10),
      total_trips: parseInt(tripCount.rows[0]?.count || '0', 10),
      total_stops: parseInt(stopCount.rows[0]?.count || '0', 10),
      total_activities: parseInt(activityCount.rows[0]?.count || '0', 10),
      total_posts: parseInt(postCount.rows[0]?.count || '0', 10),
      total_planned_budget: parseFloat(totalBudget.rows[0]?.total_planned_budget || '0')
    };
  }

  static async getTopCities() {
    const res = await query(`
      SELECT 
        c.id, c.name, c.country, c.region, c.cost_index, c.popularity_score, c.image_url,
        COUNT(s.id) AS stops_added_count
      FROM cities c
      LEFT JOIN stops s ON c.id = s.city_id
      GROUP BY c.id
      ORDER BY stops_added_count DESC, c.popularity_score DESC
      LIMIT 10;
    `);
    return res.rows;
  }

  static async getTopActivities() {
    const res = await query(`
      SELECT 
        a.id, a.name, a.category, a.est_cost, a.image_url,
        c.name AS city_name, c.country AS city_country,
        COUNT(sa.id) AS booking_count
      FROM activities a
      JOIN cities c ON a.city_id = c.id
      LEFT JOIN stop_activities sa ON a.id = sa.activity_id
      GROUP BY a.id, c.name, c.country
      ORDER BY booking_count DESC, a.est_cost DESC
      LIMIT 10;
    `);
    return res.rows;
  }

  static async getTrends() {
    const catRes = await query(`SELECT category, COUNT(*) AS count FROM activities GROUP BY category;`);

    const regionRes = await query(`
      SELECT 
        c.region,
        COUNT(DISTINCT s.trip_id) AS trips_count,
        COALESCE(SUM(s.section_budget), 0) AS total_budget_allocated
      FROM cities c
      JOIN stops s ON c.id = s.city_id
      GROUP BY c.region;
    `);

    const statusRes = await query(`
      SELECT 
        CASE 
          WHEN end_date < CURRENT_DATE THEN 'Completed'
          WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN 'Ongoing'
          ELSE 'Upcoming'
        END AS trip_status,
        COUNT(*) AS count
      FROM trips
      GROUP BY trip_status;
    `);

    return {
      categories_breakdown: catRes.rows,
      regional_analytics: regionRes.rows,
      trip_status_distribution: statusRes.rows
    };
  }

  static async getUsers() {
    const res = await query(`
      SELECT 
        u.id, u.name, u.email, u.photo_url, u.is_admin, u.phone, u.city, u.country, u.language_pref, u.created_at,
        COUNT(DISTINCT t.id) AS trips_count,
        COUNT(DISTINCT cp.id) AS posts_count
      FROM users u
      LEFT JOIN trips t ON u.id = t.user_id
      LEFT JOIN community_posts cp ON u.id = cp.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC;
    `);
    return res.rows;
  }
}
