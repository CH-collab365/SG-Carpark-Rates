import type { Request, Response } from 'express';

// LTA DataMall CarParkAvailabilityv2 data types
export interface LTACarparkItem {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // "latitude longitude" e.g. "1.29375 103.85718"
  AvailableLots: number;
  LotType: 'C' | 'H' | 'Y'; // C = Cars, H = Heavy Vehicles, Y = Motorcycles
  Agency: 'HDB' | 'LTA' | 'URA';
}

export interface LTAResponse {
  'odata.metadata'?: string;
  value: LTACarparkItem[];
}

// In-memory 30-second cache to respect LTA rate limits and speed up responses
let cachedData: LTACarparkItem[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

/**
 * Serverless handler for Singapore LTA DataMall Live Carpark Availability.
 * Endpoint: https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
 * Required Header: AccountKey: <LTA_ACCOUNT_KEY>
 */
export default async function handler(req: Request | any, res: Response | any) {
  // Enable CORS for flexibility
  if (res.setHeader) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.status?.(200).end?.() || res.end?.();
  }

  const accountKey = process.env.LTA_ACCOUNT_KEY || (req.headers && (req.headers['accountkey'] || req.headers['account-key']));

  // If no account key is configured yet, return a structured status with guidance
  if (!accountKey) {
    return res.status(200).json({
      status: 'unconfigured',
      configured: false,
      message: 'LTA_ACCOUNT_KEY environment variable is not set. Please add LTA_ACCOUNT_KEY to your environment variables or provide an AccountKey header.',
      endpoint: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
      help: 'Register for a free key at https://datamall.lta.gov.sg/content/datamall/en/request-api.html',
      totalLotsReported: 0,
      value: [],
    });
  }

  const now = Date.now();
  const query = req.query || {};
  const skip = query.skip ? String(query.skip) : undefined;
  const areaFilter = query.area ? String(query.area).toLowerCase() : undefined;
  const searchFilter = query.search || query.q ? String(query.search || query.q).toLowerCase() : undefined;

  try {
    // Check if we have valid cache (only when no specific pagination skip is requested)
    if (!skip && cachedData && (now - lastFetchTime < CACHE_TTL_MS)) {
      let filtered = cachedData;
      if (areaFilter) {
        filtered = filtered.filter((cp) => cp.Area?.toLowerCase().includes(areaFilter));
      }
      if (searchFilter) {
        filtered = filtered.filter((cp) => cp.Development?.toLowerCase().includes(searchFilter) || cp.CarParkID?.toLowerCase().includes(searchFilter));
      }

      return res.status(200).json({
        status: 'ok',
        configured: true,
        source: 'LTA DataMall (Cached)',
        cached: true,
        cacheAgeSeconds: Math.round((now - lastFetchTime) / 1000),
        total: filtered.length,
        value: filtered,
      });
    }

    // Call live LTA DataMall OData endpoint
    const url = new URL('https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2');
    if (skip) {
      url.searchParams.set('$skip', skip);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        AccountKey: String(accountKey).trim(),
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        status: 'error',
        configured: true,
        statusCode: response.status,
        message: `LTA DataMall responded with HTTP ${response.status}: ${errorText || response.statusText}`,
      });
    }

    const json = (await response.json()) as LTAResponse;
    const items = json.value || [];

    // Cache when fetching base page
    if (!skip) {
      cachedData = items;
      lastFetchTime = now;
    }

    let result = items;
    if (areaFilter) {
      result = result.filter((cp) => cp.Area?.toLowerCase().includes(areaFilter));
    }
    if (searchFilter) {
      result = result.filter((cp) => cp.Development?.toLowerCase().includes(searchFilter) || cp.CarParkID?.toLowerCase().includes(searchFilter));
    }

    return res.status(200).json({
      status: 'ok',
      configured: true,
      source: 'LTA DataMall (Live)',
      cached: false,
      timestamp: new Date().toISOString(),
      total: result.length,
      value: result,
    });
  } catch (error: any) {
    console.error('Error fetching LTA carpark availability:', error);
    return res.status(500).json({
      status: 'error',
      configured: true,
      message: error?.message || 'Failed to connect to LTA DataMall service',
    });
  }
}
