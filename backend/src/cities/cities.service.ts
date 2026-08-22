import { query } from '../common/config/db.js';
import { AppError } from '../common/errors/AppError.js';
import { v4 as uuidv4 } from 'uuid';

export class CitiesService {
  static async getCities(queryParams: any) {
    const { search, country, region, sortBy = 'popularity_score', sortOrder = 'DESC' } = queryParams;

    let queryText = `
      SELECT 
        c.*,
        COUNT(a.id) AS activities_count
      FROM cities c
      LEFT JOIN activities a ON c.id = a.city_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && search.trim().length > 0) {
      params.push(`%${search.trim()}%`);
      queryText += ` AND (c.name ILIKE $${params.length} OR c.country ILIKE $${params.length})`;
    }


    if (country) {
      params.push(country);
      queryText += ` AND c.country = $${params.length}`;
    }

    if (region) {
      params.push(region);
      queryText += ` AND c.region = $${params.length}`;
    }

    queryText += ` GROUP BY c.id`;

    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    if (sortBy === 'cost_index') {
      queryText += ` ORDER BY c.cost_index ${validSortOrder}`;
    } else if (sortBy === 'name') {
      queryText += ` ORDER BY c.name ${validSortOrder}`;
    } else {
      queryText += ` ORDER BY c.popularity_score ${validSortOrder}`;
    }

    const res = await query(queryText, params);
    
    // Fetch real images for local DB cities if they have mock unsplash images
    const rows = await Promise.all(res.rows.map(async (city: any) => {
      if (!city.image_url || city.image_url.includes('unsplash') || city.image_url.includes('source.unsplash')) {
        try {
          const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city.name)}`;
          const wikiRes = await fetch(wikiUrl, {
            headers: { 'User-Agent': 'GlobeTrotterApp/1.0 (http://globetrotter.local; contact@globetrotter.local)' }
          });
          if (wikiRes.ok) {
            const wikiData = await wikiRes.json();
            if (wikiData.thumbnail?.source) {
              city.image_url = wikiData.thumbnail.source;
            } else if (wikiData.originalimage?.source) {
              city.image_url = wikiData.originalimage.source;
            }
          }
        } catch (e) {
          // ignore
        }
      }
      return city;
    }));

    return rows;
  }

  static async getCityById(cityId: string) {
    const cityRes = await query(`SELECT * FROM cities WHERE id = $1 LIMIT 1`, [cityId]);
    if (cityRes.rows.length === 0) throw new AppError('City not found', 404);

    const activitiesRes = await query(`SELECT * FROM activities WHERE city_id = $1 ORDER BY est_cost ASC`, [cityId]);

    return {
      city: cityRes.rows[0],
      activities: activitiesRes.rows
    };
  }

  static async ensureCity(cityData: any) {
    if (!cityData.external_id) {
      throw new AppError('Missing external_id', 400);
    }

    // Check if it already exists by external_id
    const existing = await query(`SELECT id FROM cities WHERE external_id = $1 LIMIT 1`, [cityData.external_id]);
    if (existing.rows.length > 0) {
      return { id: existing.rows[0].id };
    }

    // Insert new city
    const newId = uuidv4();
    
    await query(`
      INSERT INTO cities (id, external_id, name, country, region, cost_index, popularity_score, image_url, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      newId,
      cityData.external_id,
      cityData.name,
      cityData.country || 'Unknown',
      cityData.region || 'Global',
      cityData.cost_index || 2.0,
      cityData.popularity_score || 5.0,
      cityData.image_url,
      cityData.description
    ]);

    return { id: newId };
  }
}
