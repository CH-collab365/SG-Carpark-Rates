import type { Request, Response } from 'express';

// Simple in-memory geocoding cache
const geocodeCache = new Map<string, { lat: number; lng: number; name: string; displayName: string }>();

export default async function geocodeHandler(req: Request | any, res: Response | any) {
  if (res.setHeader) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    return res.status?.(200).end?.() || res.end?.();
  }

  const rawQuery = (req.query?.q || req.query?.query || req.query?.search || '').toString().trim();

  if (!rawQuery) {
    return res.status(400).json({
      success: false,
      error: 'Query parameter q is required',
    });
  }

  const cacheKey = rawQuery.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    const cached = geocodeCache.get(cacheKey)!;
    return res.status(200).json({
      success: true,
      cached: true,
      ...cached,
    });
  }

  try {
    // Check if query is a 6-digit Singapore postal code
    const isPostal = /^\d{6}$/.test(rawQuery);
    let searchUrl = '';

    if (isPostal) {
      searchUrl = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(
        rawQuery
      )}&country=singapore&format=json&limit=1`;
    } else {
      const qWithCountry = rawQuery.toLowerCase().includes('singapore')
        ? rawQuery
        : `${rawQuery}, Singapore`;
      searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        qWithCountry
      )}&format=json&limit=1&countrycodes=sg`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const osmRes = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SGCarparkRates/1.1 (Singapore Carpark Finder)',
        Accept: 'application/json',
      },
    });
    clearTimeout(timeout);

    if (osmRes.ok) {
      const data = await osmRes.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);

        if (!isNaN(lat) && !isNaN(lng)) {
          const result = {
            success: true,
            name: item.name || rawQuery,
            displayName: item.display_name || rawQuery,
            lat,
            lng,
          };
          geocodeCache.set(cacheKey, {
            lat,
            lng,
            name: result.name,
            displayName: result.displayName,
          });
          return res.status(200).json(result);
        }
      }
    }

    // Fallback: OneMap Elastic search API
    try {
      const oneMapUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
        rawQuery
      )}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
      const omRes = await fetch(oneMapUrl);
      if (omRes.ok) {
        const omData = await omRes.json();
        if (Array.isArray(omData?.results) && omData.results.length > 0) {
          const first = omData.results[0];
          const lat = parseFloat(first.LATITUDE);
          const lng = parseFloat(first.LONGITUDE);
          if (!isNaN(lat) && !isNaN(lng)) {
            const result = {
              success: true,
              name: first.BUILDING || first.SEARCHVAL || rawQuery,
              displayName: first.ADDRESS || first.SEARCHVAL,
              lat,
              lng,
            };
            geocodeCache.set(cacheKey, {
              lat,
              lng,
              name: result.name,
              displayName: result.displayName,
            });
            return res.status(200).json(result);
          }
        }
      }
    } catch {
      // ignore onemap fallback error
    }

    return res.status(404).json({
      success: false,
      error: 'Location not found in Singapore',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Geocoding request failed',
    });
  }
}
