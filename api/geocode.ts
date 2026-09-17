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
  const rawLat = parseFloat((req.query?.lat || req.query?.latitude || '').toString());
  const rawLng = parseFloat((req.query?.lng || req.query?.lon || req.query?.longitude || '').toString());

  // Handle reverse geocode if lat & lng are provided
  if (!isNaN(rawLat) && !isNaN(rawLng)) {
    const cacheKey = `rev_${rawLat.toFixed(4)}_${rawLng.toFixed(4)}`;
    if (geocodeCache.has(cacheKey)) {
      const cached = geocodeCache.get(cacheKey)!;
      return res.status(200).json({
        success: true,
        cached: true,
        ...cached,
      });
    }

    try {
      const inSingapore =
        rawLat >= 1.15 && rawLat <= 1.48 && rawLng >= 103.58 && rawLng <= 104.08;

      const reverseUrl = `https://nominatim.openstreetmap.org/reverse?lat=${rawLat}&lon=${rawLng}&format=json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const osmRes = await fetch(reverseUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'SGCarparkRates/1.1 (Singapore Carpark Finder)',
          Accept: 'application/json',
        },
      });
      clearTimeout(timeout);

      if (osmRes.ok) {
        const data = await osmRes.json();
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.street;
        const suburb = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter;
        const postcode = addr.postcode;
        const building = addr.building || addr.amenity || addr.shop || data.name;

        let formattedName = '';
        if (building && road) {
          formattedName = `${building}, ${road}`;
        } else if (road && suburb) {
          formattedName = `${road}, ${suburb}`;
        } else if (suburb) {
          formattedName = suburb;
        } else if (data.name) {
          formattedName = data.name;
        } else {
          formattedName = `${rawLat.toFixed(4)}, ${rawLng.toFixed(4)}`;
        }

        if (postcode && !formattedName.includes(postcode)) {
          formattedName += ` (S${postcode})`;
        }

        const result = {
          success: true,
          name: formattedName,
          displayName: data.display_name || formattedName,
          lat: rawLat,
          lng: rawLng,
          postalCode: postcode,
          inSingapore,
        };

        geocodeCache.set(cacheKey, {
          lat: rawLat,
          lng: rawLng,
          name: result.name,
          displayName: result.displayName,
        });

        return res.status(200).json(result);
      }
    } catch {
      // Fallback
    }

    const fallbackResult = {
      success: true,
      name: `GPS Location (${rawLat.toFixed(4)}, ${rawLng.toFixed(4)})`,
      displayName: `GPS: ${rawLat.toFixed(5)}, ${rawLng.toFixed(5)}`,
      lat: rawLat,
      lng: rawLng,
      inSingapore: rawLat >= 1.15 && rawLat <= 1.48 && rawLng >= 103.58 && rawLng <= 104.08,
    };
    return res.status(200).json(fallbackResult);
  }

  if (!rawQuery) {
    return res.status(400).json({
      success: false,
      error: 'Query parameter q or (lat, lng) is required',
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
