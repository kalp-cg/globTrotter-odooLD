import { query } from '../common/config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../common/errors/AppError.js';

export class BudgetService {
  static async recalculateTripBudget(tripId: string) {
    const actRes = await query(`
      SELECT COALESCE(SUM(COALESCE(sa.actual_cost, a.est_cost, 0)), 0) AS total_activities
      FROM stops s
      JOIN stop_activities sa ON s.id = sa.stop_id
      JOIN activities a ON sa.activity_id = a.id
      WHERE s.trip_id = $1
    `, [tripId]);

    const activitiesCost = parseFloat(actRes.rows[0]?.total_activities || '0');

    const bRes = await query(`SELECT * FROM budgets WHERE trip_id = $1 LIMIT 1`, [tripId]);

    let transportCost = 0;
    let stayCost = 0;
    let mealsCost = 0;

    if (bRes.rows.length > 0) {
      const b = bRes.rows[0];
      transportCost = parseFloat(b.transport_cost || '0');
      stayCost = parseFloat(b.stay_cost || '0');
      mealsCost = parseFloat(b.meals_cost || '0');

      const stopsRes = await query(`SELECT COALESCE(SUM(section_budget), 0) AS stops_budget FROM stops WHERE trip_id = $1`, [tripId]);
      const stopsBudgetSum = parseFloat(stopsRes.rows[0]?.stops_budget || '0');

      if (stayCost === 0 && stopsBudgetSum > 0) {
        stayCost = stopsBudgetSum;
      }

      const totalCost = transportCost + stayCost + activitiesCost + mealsCost;

      await query(`
        UPDATE budgets 
        SET activities_cost = $1, stay_cost = $2, transport_cost = $3, meals_cost = $4, total_cost = $5, updated_at = CURRENT_TIMESTAMP
        WHERE trip_id = $6
      `, [activitiesCost, stayCost, transportCost, mealsCost, totalCost, tripId]);

      return {
        trip_id: tripId,
        transport_cost: transportCost,
        stay_cost: stayCost,
        activities_cost: activitiesCost,
        meals_cost: mealsCost,
        total_cost: totalCost
      };
    } else {
      const stopsRes = await query(`SELECT COALESCE(SUM(section_budget), 0) AS stops_budget FROM stops WHERE trip_id = $1`, [tripId]);
      const stopsBudgetSum = parseFloat(stopsRes.rows[0]?.stops_budget || '0');
      stayCost = stopsBudgetSum > 0 ? stopsBudgetSum : 500;
      transportCost = 250;
      mealsCost = 300;

      const totalCost = transportCost + stayCost + activitiesCost + mealsCost;
      const newBudgetId = uuidv4();

      await query(`
        INSERT INTO budgets (id, trip_id, transport_cost, stay_cost, activities_cost, meals_cost, total_cost, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        ON CONFLICT (trip_id) DO UPDATE 
        SET activities_cost = EXCLUDED.activities_cost, total_cost = EXCLUDED.total_cost, updated_at = CURRENT_TIMESTAMP
      `, [newBudgetId, tripId, transportCost, stayCost, activitiesCost, mealsCost, totalCost]);

      return {
        trip_id: tripId,
        transport_cost: transportCost,
        stay_cost: stayCost,
        activities_cost: activitiesCost,
        meals_cost: mealsCost,
        total_cost: totalCost
      };
    }
  }

  static async getBudget(tripId: string) {
    const budget = await this.recalculateTripBudget(tripId);

    const sectionsRes = await query(`
      SELECT 
        s.id, s.title, s.section_budget, s.arrival_date, s.departure_date,
        c.name AS city_name,
        COALESCE(SUM(COALESCE(sa.actual_cost, a.est_cost, 0)), 0) AS section_activities_cost
      FROM stops s
      JOIN cities c ON s.city_id = c.id
      LEFT JOIN stop_activities sa ON s.id = sa.stop_id
      LEFT JOIN activities a ON sa.activity_id = a.id
      WHERE s.trip_id = $1
      GROUP BY s.id, c.name
      ORDER BY s.order_index ASC
    `, [tripId]);

    const tripRes = await query(`SELECT start_date, end_date FROM trips WHERE id = $1`, [tripId]);
    let daysCount = 1;
    if (tripRes.rows.length > 0) {
      const s = new Date(tripRes.rows[0].start_date);
      const e = new Date(tripRes.rows[0].end_date);
      const diffTime = Math.abs(e.getTime() - s.getTime());
      daysCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    }

    const avgCostPerDay = budget.total_cost > 0 ? (budget.total_cost / daysCount).toFixed(2) : '0.00';

    return {
      budget,
      days_count: daysCount,
      avg_cost_per_day: parseFloat(avgCostPerDay),
      sections: sectionsRes.rows
    };
  }

  static async updateBudget(tripId: string, userId: string, isAdmin: boolean, body: any) {
    const tripCheck = await query(`SELECT user_id FROM trips WHERE id = $1`, [tripId]);
    if (tripCheck.rows.length === 0) throw new AppError('Trip not found', 404);
    if (tripCheck.rows[0].user_id !== userId && !isAdmin) throw new AppError('Forbidden: Not trip owner', 403);

    const { transport_cost, stay_cost, meals_cost } = body;

    const actRes = await query(`
      SELECT COALESCE(SUM(COALESCE(sa.actual_cost, a.est_cost, 0)), 0) AS total_activities
      FROM stops s
      JOIN stop_activities sa ON s.id = sa.stop_id
      JOIN activities a ON sa.activity_id = a.id
      WHERE s.trip_id = $1
    `, [tripId]);
    const activitiesCost = parseFloat(actRes.rows[0]?.total_activities || '0');

    const bRes = await query(`SELECT * FROM budgets WHERE trip_id = $1`, [tripId]);
    const curr = bRes.rows[0] || {};

    const finalTransport = transport_cost !== undefined ? parseFloat(transport_cost) : parseFloat(curr.transport_cost || '0');
    const finalStay = stay_cost !== undefined ? parseFloat(stay_cost) : parseFloat(curr.stay_cost || '0');
    const finalMeals = meals_cost !== undefined ? parseFloat(meals_cost) : parseFloat(curr.meals_cost || '0');
    const totalCost = finalTransport + finalStay + activitiesCost + finalMeals;

    await query(`
      UPDATE budgets 
      SET 
        transport_cost = $1,
        stay_cost = $2,
        meals_cost = $3,
        activities_cost = $4,
        total_cost = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE trip_id = $6
    `, [finalTransport, finalStay, finalMeals, activitiesCost, totalCost, tripId]);

    return {
      trip_id: tripId,
      transport_cost: finalTransport,
      stay_cost: finalStay,
      meals_cost: finalMeals,
      activities_cost: activitiesCost,
      total_cost: totalCost
    };
  }
}
