import { v4 as uuidv4 } from 'uuid';
import { query } from '../common/config/db.js';
import { BudgetService } from '../budget/budget.service.js';
import { AppError } from '../common/errors/AppError.js';

export class ItineraryService {
  static async getStops(tripId: string) {
    const stopsRes = await query(`
      SELECT 
        s.id, s.trip_id, s.city_id, s.title, s.notes, s.arrival_date, s.departure_date, s.section_budget, s.order_index,
        c.name AS city_name, c.country AS city_country, c.region AS city_region, c.image_url AS city_image_url, c.cost_index AS city_cost_index
      FROM stops s
      JOIN cities c ON s.city_id = c.id
      WHERE s.trip_id = $1
      ORDER BY s.order_index ASC, s.arrival_date ASC
    `, [tripId]);

    const stopIds = stopsRes.rows.map(s => s.id);
    let activitiesMap: Record<string, any[]> = {};

    if (stopIds.length > 0) {
      const activitiesRes = await query(`
        SELECT 
          sa.id AS stop_activity_id, sa.stop_id, sa.scheduled_date, sa.scheduled_time, sa.actual_cost,
          a.id AS activity_id, a.name AS activity_name, a.category, a.description, a.image_url, a.est_cost, a.est_duration_mins
        FROM stop_activities sa
        JOIN activities a ON sa.activity_id = a.id
        WHERE sa.stop_id = ANY($1::uuid[])
        ORDER BY sa.scheduled_date ASC, sa.scheduled_time ASC
      `, [stopIds]);

      for (const act of activitiesRes.rows) {
        if (!activitiesMap[act.stop_id]) activitiesMap[act.stop_id] = [];
        activitiesMap[act.stop_id].push(act);
      }
    }

    return stopsRes.rows.map(s => ({
      ...s,
      activities: activitiesMap[s.id] || []
    }));
  }

  static async addStop(tripId: string, userId: string, isAdmin: boolean, body: any) {
    const { city_id, title, notes, arrival_date, departure_date, section_budget, order_index } = body;

    if (!city_id || !arrival_date || !departure_date) {
      throw new AppError('City, arrival date, and departure date are required', 400);
    }

    const tripCheck = await query(`SELECT user_id FROM trips WHERE id = $1`, [tripId]);
    if (tripCheck.rows.length === 0) throw new AppError('Trip not found', 404);
    if (tripCheck.rows[0].user_id !== userId && !isAdmin) throw new AppError('Forbidden: Not trip owner', 403);

    let finalOrder = order_index;
    if (finalOrder === undefined || finalOrder === null) {
      const maxRes = await query(`SELECT COALESCE(MAX(order_index), 0) + 1 AS next_order FROM stops WHERE trip_id = $1`, [tripId]);
      finalOrder = maxRes.rows[0]?.next_order || 1;
    }

    const stopId = uuidv4();
    const finalTitle = title || `Section ${finalOrder}`;

    await query(`
      INSERT INTO stops (id, trip_id, city_id, title, notes, arrival_date, departure_date, section_budget, order_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [stopId, tripId, city_id, finalTitle, notes || null, arrival_date, departure_date, section_budget || 0.00, finalOrder]);

    await BudgetService.recalculateTripBudget(tripId);

    const createdRes = await query(`
      SELECT 
        s.id, s.trip_id, s.city_id, s.title, s.notes, s.arrival_date, s.departure_date, s.section_budget, s.order_index,
        c.name AS city_name, c.country AS city_country, c.region AS city_region, c.image_url AS city_image_url
      FROM stops s
      JOIN cities c ON s.city_id = c.id
      WHERE s.id = $1
    `, [stopId]);

    return {
      ...createdRes.rows[0],
      activities: []
    };
  }

  static async updateStop(tripId: string, stopId: string, userId: string, isAdmin: boolean, body: any) {
    const tripCheck = await query(`SELECT user_id FROM trips WHERE id = $1`, [tripId]);
    if (tripCheck.rows.length === 0) throw new AppError('Trip not found', 404);
    if (tripCheck.rows[0].user_id !== userId && !isAdmin) throw new AppError('Forbidden: Not trip owner', 403);

    const { city_id, title, notes, arrival_date, departure_date, section_budget, order_index } = body;

    const res = await query(`
      UPDATE stops
      SET
        city_id = COALESCE($1, city_id),
        title = COALESCE($2, title),
        notes = COALESCE($3, notes),
        arrival_date = COALESCE($4, arrival_date),
        departure_date = COALESCE($5, departure_date),
        section_budget = COALESCE($6, section_budget),
        order_index = COALESCE($7, order_index)
      WHERE id = $8 AND trip_id = $9
      RETURNING *
    `, [city_id, title, notes, arrival_date, departure_date, section_budget, order_index, stopId, tripId]);

    if (res.rows.length === 0) throw new AppError('Stop not found in this trip', 404);

    await BudgetService.recalculateTripBudget(tripId);
    return res.rows[0];
  }

  static async deleteStop(tripId: string, stopId: string, userId: string, isAdmin: boolean) {
    const tripCheck = await query(`SELECT user_id FROM trips WHERE id = $1`, [tripId]);
    if (tripCheck.rows.length === 0) throw new AppError('Trip not found', 404);
    if (tripCheck.rows[0].user_id !== userId && !isAdmin) throw new AppError('Forbidden: Not trip owner', 403);

    await query(`DELETE FROM stops WHERE id = $1 AND trip_id = $2`, [stopId, tripId]);
    await BudgetService.recalculateTripBudget(tripId);
    return true;
  }

  static async attachActivity(tripId: string, stopId: string, userId: string, isAdmin: boolean, body: any) {
    const { activity_id, scheduled_date, scheduled_time, actual_cost } = body;

    if (!activity_id) throw new AppError('Activity ID is required', 400);

    const stopCheck = await query(`
      SELECT s.id, s.arrival_date, s.departure_date, t.user_id 
      FROM stops s 
      JOIN trips t ON s.trip_id = t.id 
      WHERE s.id = $1 AND t.id = $2
    `, [stopId, tripId]);

    if (stopCheck.rows.length === 0) throw new AppError('Stop not found in this trip', 404);
    if (stopCheck.rows[0].user_id !== userId && !isAdmin) throw new AppError('Forbidden: Not trip owner', 403);

    const stop = stopCheck.rows[0];
    const targetDate = scheduled_date || stop.arrival_date;

    const actRes = await query(`SELECT * FROM activities WHERE id = $1`, [activity_id]);
    if (actRes.rows.length === 0) throw new AppError('Activity not found', 404);
    const act = actRes.rows[0];
    const finalCost = actual_cost !== undefined && actual_cost !== null ? actual_cost : act.est_cost;

    const stopActivityId = uuidv4();

    await query(`
      INSERT INTO stop_activities (id, stop_id, activity_id, scheduled_date, scheduled_time, actual_cost)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [stopActivityId, stopId, activity_id, targetDate, scheduled_time || '10:00 AM', finalCost]);

    await BudgetService.recalculateTripBudget(tripId);

    return {
      stop_activity_id: stopActivityId,
      stop_id: stopId,
      activity_id,
      activity_name: act.name,
      category: act.category,
      image_url: act.image_url,
      scheduled_date: targetDate,
      scheduled_time: scheduled_time || '10:00 AM',
      actual_cost: finalCost
    };
  }

  static async removeActivity(tripId: string, stopId: string, activityId: string, userId: string, isAdmin: boolean) {
    const checkRes = await query(`
      SELECT t.user_id 
      FROM stops s
      JOIN trips t ON s.trip_id = t.id
      WHERE s.id = $1 AND t.id = $2
    `, [stopId, tripId]);

    if (checkRes.rows.length === 0) throw new AppError('Stop not found in this trip', 404);
    if (checkRes.rows[0].user_id !== userId && !isAdmin) throw new AppError('Forbidden: Not trip owner', 403);

    await query(`
      DELETE FROM stop_activities 
      WHERE stop_id = $1 AND (id = $2 OR activity_id = $2)
    `, [stopId, activityId]);

    await BudgetService.recalculateTripBudget(tripId);
    return true;
  }

  static async reorderStops(tripId: string, userId: string, isAdmin: boolean, stops: { id: string; order_index: number }[]) {
    const tripCheck = await query(`SELECT user_id FROM trips WHERE id = $1`, [tripId]);
    if (tripCheck.rows.length === 0) throw new AppError('Trip not found', 404);
    if (tripCheck.rows[0].user_id !== userId && !isAdmin) throw new AppError('Forbidden: Not trip owner', 403);

    // Run within a transaction-like loop for simplicity in this demo, though an actual transaction is better
    // Neon PG pool query auto-commits, so we'll just update sequentially.
    for (const stop of stops) {
      if (!stop.id || stop.order_index === undefined) continue;
      await query(`
        UPDATE stops 
        SET order_index = $1 
        WHERE id = $2 AND trip_id = $3
      `, [stop.order_index, stop.id, tripId]);
    }

    return true;
  }
}
