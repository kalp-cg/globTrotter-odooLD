import { query } from '../common/config/db.js';
import { AppError } from '../common/errors/AppError.js';

export class ActivitiesService {
  static async getActivities(queryParams: any) {
    const { city, type, category, cost, duration, search } = queryParams;
    const cat = type || category;

    let queryText = `
      SELECT 
        a.*,
        c.name AS city_name, c.country AS city_country, c.region AS city_region
      FROM activities a
      JOIN cities c ON a.city_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (city) {
      params.push(`%${city}%`);
      queryText += ` AND (c.name ILIKE $${params.length} OR a.city_id::text = $${params.length})`;
    }

    if (cat && cat !== 'all') {
      params.push(`%${cat}%`);
      queryText += ` AND a.category ILIKE $${params.length}`;
    }

    if (cost) {
      params.push(parseFloat(cost));
      queryText += ` AND a.est_cost <= $${params.length}`;
    }

    if (duration) {
      params.push(parseInt(duration, 10));
      queryText += ` AND a.est_duration_mins <= $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (a.name ILIKE $${params.length} OR a.description ILIKE $${params.length} OR c.name ILIKE $${params.length})`;
    }

    queryText += ` ORDER BY a.est_cost ASC`;

    const res = await query(queryText, params);
    
    // If we have enough local activities, return them
    if (res.rows.length >= 5) {
      return res.rows;
    }

    // Otherwise, fetch dynamically from Overpass API!
    if (city) {
      try {
        const cityRes = await query(`SELECT name, country FROM cities WHERE id::text = $1 OR name ILIKE $1 LIMIT 1`, [city]);
        if (cityRes.rows.length > 0) {
          const cityName = cityRes.rows[0].name;
          
          // Geocode city to get lat/lon
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&format=json`);
          const geoData: any = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            const lat = geoData.results[0].latitude;
            const lon = geoData.results[0].longitude;

            // Query Overpass for tourist attractions
            const overpassQuery = `
              [out:json];
              (
                node["tourism"="museum"](around:5000, ${lat}, ${lon});
                node["tourism"="attraction"](around:5000, ${lat}, ${lon});
                node["historic"="monument"](around:5000, ${lat}, ${lon});
                node["historic"="ruins"](around:5000, ${lat}, ${lon});
              );
              out 15;
            `;
            const overpassRes = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: overpassQuery });
            const overpassData: any = await overpassRes.json();

            if (overpassData.elements) {
              const externalActivities = await Promise.all(overpassData.elements
                .filter((e: any) => e.tags && e.tags.name && e.tags.name.length > 2)
                .slice(0, 10)
                .map(async (el: any) => {
                  const actName = el.tags.name;
                  let imageUrl = 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&auto=format&fit=crop&q=80';
                  
                  try {
                    const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(actName)}`, {
                      headers: { 'User-Agent': 'GlobeTrotterApp/1.0 (http://globetrotter.local; contact@globetrotter.local)' }
                    });
                    if (wikiRes.ok) {
                      const wikiData: any = await wikiRes.json();
                      if (wikiData.thumbnail?.source) imageUrl = wikiData.thumbnail.source;
                      else if (wikiData.originalimage?.source) imageUrl = wikiData.originalimage.source;
                    }
                  } catch (e) {}

                  return {
                    id: `external_${el.id}`,
                    city_id: city,
                    name: actName,
                    category: el.tags.tourism === 'museum' ? 'Culture & Art' : 'Sightseeing',
                    description: el.tags.description || `A notable ${el.tags.tourism || 'historic site'} in ${cityName}.`,
                    image_url: imageUrl,
                    est_cost: Math.floor(Math.random() * 20) + 10,
                    est_duration_mins: 120,
                    popularity_score: 5,
                    city_name: cityName,
                    city_country: cityRes.rows[0].country
                  };
                })
              );
              
              // Merge local and external
              const localIds = new Set(res.rows.map(r => r.name.toLowerCase()));
              for (const ext of externalActivities) {
                if (!localIds.has(ext.name.toLowerCase())) {
                  res.rows.push(ext);
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('Error fetching Overpass activities:', e);
      }
    }

    return res.rows;
  }

  static async getActivityById(activityId: string) {
    const res = await query(`
      SELECT 
        a.*,
        c.name AS city_name, c.country AS city_country, c.region AS city_region
      FROM activities a
      JOIN cities c ON a.city_id = c.id
      WHERE a.id = $1 LIMIT 1
    `, [activityId]);

    if (res.rows.length === 0) throw new AppError('Activity not found', 404);
    return res.rows[0];
  }

  static async ensureActivity(body: any) {
    const { id, city_id, name, category, description, image_url, est_cost, est_duration_mins } = body;
    
    if (!id || !id.startsWith('external_')) {
      throw new AppError('Invalid external activity ID', 400);
    }

    // Check if we already ensured this activity (by name and city_id)
    const check = await query(`SELECT * FROM activities WHERE city_id = $1 AND name = $2 LIMIT 1`, [city_id, name]);
    if (check.rows.length > 0) return check.rows[0];

    const newId = crypto.randomUUID();
    
    const res = await query(`
      INSERT INTO activities (id, city_id, name, category, description, image_url, est_cost, est_duration_mins)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [newId, city_id, name, category, description, image_url, est_cost || 0, est_duration_mins || 60]);

    return res.rows[0];
  }
}
