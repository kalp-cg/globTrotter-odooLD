import { query } from '../common/config/db.js';
import { AppError } from '../common/errors/AppError.js';

export class TimelineService {
  static async getTimeline(tripId: string) {
    const tripRes = await query(`SELECT * FROM trips WHERE id = $1`, [tripId]);
    if (tripRes.rows.length === 0) throw new AppError('Trip not found', 404);
    const trip = tripRes.rows[0];

    const stopsRes = await query(`
      SELECT 
        s.id, s.title, s.arrival_date, s.departure_date, s.section_budget, s.order_index,
        c.id AS city_id, c.name AS city_name, c.country AS city_country, c.image_url AS city_image_url
      FROM stops s
      JOIN cities c ON s.city_id = c.id
      WHERE s.trip_id = $1
      ORDER BY s.order_index ASC, s.arrival_date ASC
    `, [tripId]);

    const stopIds = stopsRes.rows.map(s => s.id);
    let allActivities: any[] = [];
    if (stopIds.length > 0) {
      const actRes = await query(`
        SELECT 
          sa.id AS stop_activity_id, sa.stop_id, sa.scheduled_date, sa.scheduled_time, sa.actual_cost,
          a.id AS activity_id, a.name AS activity_name, a.category, a.description, a.image_url, a.est_cost, a.est_duration_mins,
          c.name AS city_name
        FROM stop_activities sa
        JOIN activities a ON sa.activity_id = a.id
        JOIN cities c ON a.city_id = c.id
        WHERE sa.stop_id = ANY($1::uuid[])
        ORDER BY sa.scheduled_date ASC, sa.scheduled_time ASC
      `, [stopIds]);
      allActivities = actRes.rows;
    }

    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const days: any[] = [];

    let curr = new Date(startDate);
    let dayNumber = 1;

    while (curr <= endDate) {
      const dateStr = curr.toISOString().split('T')[0];

      const activeStops = stopsRes.rows.filter(s => {
        const arr = new Date(s.arrival_date).toISOString().split('T')[0];
        const dep = new Date(s.departure_date).toISOString().split('T')[0];
        return dateStr >= arr && dateStr <= dep;
      });

      const dayActivities = allActivities.filter(a => {
        const sched = new Date(a.scheduled_date).toISOString().split('T')[0];
        return sched === dateStr;
      });

      const dayExpense = dayActivities.reduce((sum, item) => sum + parseFloat(item.actual_cost || item.est_cost || 0), 0);

      days.push({
        day_number: dayNumber,
        date: dateStr,
        stops: activeStops,
        activities: dayActivities,
        day_total_cost: dayExpense
      });

      curr.setDate(curr.getDate() + 1);
      dayNumber++;
    }

    return {
      trip,
      stops: stopsRes.rows,
      days,
      total_days: days.length
    };
  }
}
