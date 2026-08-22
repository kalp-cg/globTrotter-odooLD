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
    const tripCheck = await query(`SELECT user_id, start_date, end_date FROM trips WHERE id = $1`, [tripId]);
    if (tripCheck.rows.length === 0) throw new AppError('Trip not found', 404);
    if (tripCheck.rows[0].user_id !== userId && !isAdmin) throw new AppError('Forbidden: Not trip owner', 403);
    const trip = tripCheck.rows[0];

    const city_id = body.city_id || body.cityId || body.city?.id;
    if (!city_id) {
      throw new AppError('City is required to add a stop', 400);
    }

    let resolvedCityId = city_id;
    if (typeof city_id === 'string' && city_id.startsWith('external_')) {
      const ensured = await query(`SELECT id FROM cities WHERE external_id = $1 OR id::text = $1 LIMIT 1`, [city_id]);
      if (ensured.rows.length > 0) {
        resolvedCityId = ensured.rows[0].id;
      } else {
        const newCityId = uuidv4();
        await query(`
          INSERT INTO cities (id, external_id, name, country, region, cost_index, popularity_score, image_url, description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          newCityId,
          city_id,
          body.title || body.cityName || body.city_name || 'Destination City',
          body.cityCountry || body.city_country || 'Global',
          body.cityRegion || body.city_region || 'Global',
          2.0,
          5.0,
          body.cityImageUrl || body.city_image_url || null,
          body.cityDescription || null
        ]);
        resolvedCityId = newCityId;
      }
    }

    let arrival_date = body.arrival_date || body.arrivalDate;
    let departure_date = body.departure_date || body.departureDate;

    if (!arrival_date) {
      arrival_date = trip.start_date ? new Date(trip.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    }
    if (!departure_date) {
      departure_date = trip.end_date ? new Date(trip.end_date).toISOString().split('T')[0] : arrival_date;
    }

    let finalOrder = body.order_index ?? body.orderIndex;
    if (finalOrder === undefined || finalOrder === null) {
      const maxRes = await query(`SELECT COALESCE(MAX(order_index), 0) + 1 AS next_order FROM stops WHERE trip_id = $1`, [tripId]);
      finalOrder = maxRes.rows[0]?.next_order || 1;
    }

    const stopId = uuidv4();
    const finalTitle = body.title || body.cityName || body.city_name || `Section ${finalOrder}`;
    const finalBudget = body.section_budget ?? body.sectionBudget ?? 0.00;

    await query(`
      INSERT INTO stops (id, trip_id, city_id, title, notes, arrival_date, departure_date, section_budget, order_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [stopId, tripId, resolvedCityId, finalTitle, body.notes || null, arrival_date, departure_date, finalBudget, finalOrder]);

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

    const city_id = body.city_id || body.cityId;
    const title = body.title;
    const notes = body.notes;
    const arrival_date = body.arrival_date || body.arrivalDate;
    const departure_date = body.departure_date || body.departureDate;
    const section_budget = body.section_budget !== undefined ? body.section_budget : body.sectionBudget;
    const order_index = body.order_index !== undefined ? body.order_index : body.orderIndex;

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
    let activity_id = body.activity_id || body.activityId;
    const scheduled_date = body.scheduled_date || body.scheduledDate;
    const scheduled_time = body.scheduled_time || body.scheduledTime;
    const actual_cost = body.actual_cost !== undefined ? body.actual_cost : body.actualCost;

    if (!activity_id) throw new AppError('Activity ID is required', 400);

    const stopCheck = await query(`
      SELECT s.id, s.city_id, s.arrival_date, s.departure_date, t.user_id 
      FROM stops s 
      JOIN trips t ON s.trip_id = t.id 
      WHERE s.id = $1 AND t.id = $2
    `, [stopId, tripId]);

    if (stopCheck.rows.length === 0) throw new AppError('Stop not found in this trip', 404);
    if (stopCheck.rows[0].user_id !== userId && !isAdmin) throw new AppError('Forbidden: Not trip owner', 403);

    const stop = stopCheck.rows[0];

    // If external activity, automatically ensure it exists in DB
    if (typeof activity_id === 'string' && activity_id.startsWith('external_')) {
      const actName = body.activity_name || body.name || 'Activity';
      const existing = await query(`SELECT id FROM activities WHERE id::text = $1 OR (city_id = $2 AND name = $3) LIMIT 1`, [activity_id, stop.city_id, actName]);
      if (existing.rows.length > 0) {
        activity_id = existing.rows[0].id;
      } else {
        const newActId = uuidv4();
        await query(`
          INSERT INTO activities (id, city_id, name, category, description, image_url, est_cost, est_duration_mins)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          newActId,
          stop.city_id,
          actName,
          body.category || 'Sightseeing',
          body.description || null,
          body.image_url || body.imageUrl || null,
          actual_cost || 0,
          body.est_duration_mins || body.estDurationMins || 60
        ]);
        activity_id = newActId;
      }
    }

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

  static async reorderStops(tripId: string, userId: string, isAdmin: boolean, stops: { id: string; order_index?: number; orderIndex?: number }[]) {
    const tripCheck = await query(`SELECT user_id FROM trips WHERE id = $1`, [tripId]);
    if (tripCheck.rows.length === 0) throw new AppError('Trip not found', 404);
    if (tripCheck.rows[0].user_id !== userId && !isAdmin) throw new AppError('Forbidden: Not trip owner', 403);

    for (const stop of stops) {
      const order = stop.order_index !== undefined ? stop.order_index : stop.orderIndex;
      if (!stop.id || order === undefined) continue;
      await query(`
        UPDATE stops 
        SET order_index = $1 
        WHERE id = $2 AND trip_id = $3
      `, [order, stop.id, tripId]);
    }

    return true;
  }
}
