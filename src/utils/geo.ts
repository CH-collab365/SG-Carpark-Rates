// Haversine distance calculator, Singapore location directory, and geocoding integration

export interface LocationTarget {
  name: string;
  category: 'landmark' | 'mrt' | 'mall' | 'area' | 'commercial';
  lat: number;
  lng: number;
  postalCode?: string;
  keywords: string[];
}

/**
 * Calculates great-circle distance between two GPS coordinates using the Haversine formula.
 * @returns distance in kilometers rounded to 2 decimal places
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 100) / 100;
}

export const POPULAR_LOCATIONS: LocationTarget[] = [
  // --- MARINA BAY & CBD ---
  {
    name: 'Marina Bay Financial Centre (MBFC)',
    category: 'commercial',
    lat: 1.2801,
    lng: 103.8536,
    postalCode: '018983',
    keywords: ['mbfc', 'marina bay financial', 'marina blvd', 'tower 1', 'tower 2', 'tower 3', '018983'],
  },
  {
    name: 'Raffles Place / Financial District',
    category: 'mrt',
    lat: 1.284,
    lng: 103.8515,
    postalCode: '048624',
    keywords: ['raffles place', 'uob plaza', 'republic plaza', 'one raffles place', 'ocbc centre', '048624'],
  },
  {
    name: 'Marina One (East & West)',
    category: 'commercial',
    lat: 1.2775,
    lng: 103.853,
    postalCode: '018936',
    keywords: ['marina one', 'straits view', 'marina way', '018936'],
  },
  {
    name: 'Marina Bay Sands (MBS)',
    category: 'mall',
    lat: 1.2834,
    lng: 103.8607,
    postalCode: '018956',
    keywords: ['mbs', 'marina bay sands', 'bayfront', 'the shoppes', 'casino', 'sands expo', '018956'],
  },
  {
    name: 'Suntec City & Convention Centre',
    category: 'mall',
    lat: 1.2935,
    lng: 103.8572,
    postalCode: '038983',
    keywords: ['suntec', 'suntec city', 'fountain of wealth', 'temasek blvd', '038983'],
  },
  {
    name: 'Marina Square & Millenia Walk',
    category: 'mall',
    lat: 1.2912,
    lng: 103.8578,
    postalCode: '039594',
    keywords: ['marina square', 'millenia walk', 'raffles blvd', '039594'],
  },
  {
    name: 'Tanjong Pagar / Guoco Tower',
    category: 'commercial',
    lat: 1.2764,
    lng: 103.8458,
    postalCode: '078881',
    keywords: ['tanjong pagar', 'guoco tower', 'wallich st', 'maxwell', '078881'],
  },
  {
    name: 'Lau Pa Sat (Telok Ayer Market)',
    category: 'landmark',
    lat: 1.2807,
    lng: 103.8505,
    postalCode: '048548',
    keywords: ['lau pa sat', 'satay street', 'telok ayer', 'boon tat st', '048548'],
  },
  {
    name: 'One Raffles Quay (ORQ)',
    category: 'commercial',
    lat: 1.2818,
    lng: 103.8524,
    postalCode: '048583',
    keywords: ['orq', 'one raffles quay', 'raffles quay', '048583'],
  },
  {
    name: 'Asia Square (Tower 1 & 2)',
    category: 'commercial',
    lat: 1.2789,
    lng: 103.8512,
    postalCode: '018960',
    keywords: ['asia square', 'marina view', 'westin', '018960'],
  },

  // --- ORCHARD ROAD & CITY CENTRE ---
  {
    name: 'ION Orchard & MRT',
    category: 'mall',
    lat: 1.304,
    lng: 103.8319,
    postalCode: '238801',
    keywords: ['ion', 'ion orchard', 'orchard road', 'orchard mrt', '238801'],
  },
  {
    name: 'Ngee Ann City / Takashimaya',
    category: 'mall',
    lat: 1.3025,
    lng: 103.8345,
    postalCode: '238873',
    keywords: ['ngee ann city', 'takashimaya', 'taka', 'orchard road', '238873'],
  },
  {
    name: '313@somerset & Orchard Gateway',
    category: 'mall',
    lat: 1.301,
    lng: 103.8385,
    postalCode: '238895',
    keywords: ['somerset', '313', '313 somerset', 'orchard gateway', 'somerset mrt', '238895'],
  },
  {
    name: 'Plaza Singapura & Dhoby Ghaut',
    category: 'mall',
    lat: 1.3007,
    lng: 103.8452,
    postalCode: '238839',
    keywords: ['plaza singapura', 'dhoby ghaut', 'dhoby ghaut mrt', 'istana', '238839'],
  },

  // --- BUGIS & CIVIC DISTRICT ---
  {
    name: 'Bugis Junction & Bugis+',
    category: 'mall',
    lat: 1.3002,
    lng: 103.8555,
    postalCode: '188021',
    keywords: ['bugis', 'bugis junction', 'bugis plus', 'bugis street', 'victoria st', '188021'],
  },
  {
    name: 'Raffles City Shopping Centre',
    category: 'mall',
    lat: 1.2939,
    lng: 103.8532,
    postalCode: '179103',
    keywords: ['raffles city', 'city hall', 'city hall mrt', 'bras basah', '179103'],
  },
  {
    name: 'Funan & Peninsula Plaza',
    category: 'mall',
    lat: 1.2914,
    lng: 103.8502,
    postalCode: '179105',
    keywords: ['funan', 'funan mall', 'peninsula', 'north bridge road', 'coleman st', '179105'],
  },
  {
    name: 'Chinatown Point & People\'s Park',
    category: 'mall',
    lat: 1.2852,
    lng: 103.8443,
    postalCode: '059413',
    keywords: ['chinatown', 'chinatown point', 'new bridge rd', 'people park', 'chinatown mrt', '059413'],
  },
  {
    name: 'Clarke Quay / The Central',
    category: 'mall',
    lat: 1.2887,
    lng: 103.8465,
    postalCode: '059817',
    keywords: ['clarke quay', 'the central', 'eu tong sen', 'singapore river', '059817'],
  },

  // --- HARBOURFRONT & SENTOSA ---
  {
    name: 'VivoCity & HarbourFront',
    category: 'mall',
    lat: 1.2644,
    lng: 103.8222,
    postalCode: '098585',
    keywords: ['vivocity', 'vivo', 'harbourfront', 'harbourfront mrt', 'sentosa express', '098585'],
  },
  {
    name: 'Resorts World Sentosa (RWS)',
    category: 'landmark',
    lat: 1.2562,
    lng: 103.8215,
    postalCode: '098269',
    keywords: ['sentosa', 'rws', 'resorts world', 'universal studios', 'uss', '098269'],
  },

  // --- JURONG & WEST ---
  {
    name: 'Jurong East / JEM & Westgate',
    category: 'mall',
    lat: 1.3331,
    lng: 103.7436,
    postalCode: '608549',
    keywords: ['jurong', 'jurong east', 'jem', 'westgate', 'imm', 'jurong east mrt', '608549'],
  },
  {
    name: 'IMM Building (Jurong East)',
    category: 'mall',
    lat: 1.3353,
    lng: 103.7468,
    postalCode: '609601',
    keywords: ['imm', 'imm building', 'jurong outlet', '609601'],
  },
  {
    name: 'Clementi Mall & Central',
    category: 'mall',
    lat: 1.3152,
    lng: 103.7651,
    postalCode: '129588',
    keywords: ['clementi', 'clementi mall', 'clementi mrt', '129588'],
  },

  // --- CHANGI & EAST ---
  {
    name: 'Jewel & Changi Airport (T1-T4)',
    category: 'landmark',
    lat: 1.3602,
    lng: 103.9897,
    postalCode: '819666',
    keywords: ['changi', 'changi airport', 'jewel', 'terminal 1', 'terminal 2', 'terminal 3', 'terminal 4', '819666'],
  },
  {
    name: 'Tampines Mall & Our Tampines Hub',
    category: 'mall',
    lat: 1.3526,
    lng: 103.9452,
    postalCode: '529510',
    keywords: ['tampines', 'tampines mall', 'tampines hub', 'tampines 1', 'century square', 'tampines mrt', '529510'],
  },
  {
    name: 'Paya Lebar Quarter (PLQ)',
    category: 'mall',
    lat: 1.3175,
    lng: 103.8925,
    postalCode: '409057',
    keywords: ['paya lebar', 'plq', 'paya lebar quarter', 'paya lebar square', 'paya lebar mrt', '409057'],
  },
  {
    name: 'Parkway Parade (Marine Parade / Katong)',
    category: 'mall',
    lat: 1.3015,
    lng: 103.9052,
    postalCode: '449269',
    keywords: ['parkway parade', 'marine parade', 'katong', 'east coast', '449269'],
  },
  {
    name: 'Bedok Mall & Interchange',
    category: 'mall',
    lat: 1.3243,
    lng: 103.9298,
    postalCode: '467360',
    keywords: ['bedok', 'bedok mall', 'bedok central', 'bedok mrt', '467360'],
  },

  // --- NORTH & NORTH-EAST ---
  {
    name: 'Bishan / Junction 8',
    category: 'mall',
    lat: 1.3503,
    lng: 103.8488,
    postalCode: '579837',
    keywords: ['bishan', 'junction 8', 'j8', 'bishan mrt', '579837'],
  },
  {
    name: 'Ang Mo Kio (AMK Hub)',
    category: 'mall',
    lat: 1.3695,
    lng: 103.8485,
    postalCode: '569933',
    keywords: ['ang mo kio', 'amk', 'amk hub', 'amk mrt', '569933'],
  },
  {
    name: 'Serangoon / NEX Mall',
    category: 'mall',
    lat: 1.3506,
    lng: 103.8726,
    postalCode: '556083',
    keywords: ['serangoon', 'nex', 'nex mall', 'serangoon mrt', '556083'],
  },
  {
    name: 'Velocity @ Novena Square',
    category: 'mall',
    lat: 1.3204,
    lng: 103.8438,
    postalCode: '307683',
    keywords: ['novena', 'velocity', 'novena square', 'square 2', 'novena mrt', 'tan tock seng', 'ttsh', '307683'],
  },
  {
    name: 'Woodlands / Causeway Point',
    category: 'mall',
    lat: 1.4361,
    lng: 103.7863,
    postalCode: '738099',
    keywords: ['woodlands', 'causeway point', 'woodlands checkpoint', 'woodlands mrt', '738099'],
  },
  {
    name: 'Toa Payoh / HDB Hub',
    category: 'mall',
    lat: 1.3326,
    lng: 103.8492,
    postalCode: '310480',
    keywords: ['toa payoh', 'hdb hub', 'toa payoh central', 'toa payoh mrt', '310480'],
  },
  {
    name: 'Waterway Point (Punggol)',
    category: 'mall',
    lat: 1.4067,
    lng: 103.9022,
    postalCode: '828761',
    keywords: ['punggol', 'waterway point', 'punggol mrt', '828761'],
  },
];

/**
 * Searches known Singapore landmarks, MRTs, malls, and postal codes instantly.
 */
export function resolveLocationQuery(query: string): LocationTarget | null {
  const clean = query.trim().toLowerCase();
  if (!clean) return null;

  // 1. Exact or partial match on postal code (e.g. 018983, 238801)
  const postalMatch = POPULAR_LOCATIONS.find((loc) => loc.postalCode && loc.postalCode.includes(clean));
  if (postalMatch) return postalMatch;

  // 2. Keyword exact or substring match
  const keywordMatch = POPULAR_LOCATIONS.find((loc) =>
    loc.keywords.some((kw) => clean.includes(kw) || kw.includes(clean))
  );
  if (keywordMatch) return keywordMatch;

  // 3. Name match
  const nameMatch = POPULAR_LOCATIONS.find((loc) =>
    loc.name.toLowerCase().includes(clean) || clean.includes(loc.name.toLowerCase())
  );
  if (nameMatch) return nameMatch;

  return null;
}

/**
 * Asynchronously searches a location:
 * 1. Checks instant local database
 * 2. If not found, calls backend /api/geocode endpoint for live Singapore geocoding
 */
export async function searchLocationAsync(query: string): Promise<LocationTarget | null> {
  const clean = query.trim();
  if (!clean) return null;

  // 1. Instant local match
  const localMatch = resolveLocationQuery(clean);
  if (localMatch) return localMatch;

  // 2. Call /api/geocode endpoint
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(clean)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.lat === 'number' && typeof data.lng === 'number') {
        return {
          name: data.name || clean,
          category: 'landmark',
          lat: data.lat,
          lng: data.lng,
          keywords: [clean.toLowerCase()],
        };
      }
    }
  } catch (err) {
    console.warn('Live geocode request failed:', err);
  }

  return null;
}

/**
 * Finds the closest named landmark/district for given GPS coordinates.
 */
export function reverseGeocodeApprox(lat: number, lng: number): { name: string; distanceKm: number } {
  let closest = POPULAR_LOCATIONS[0];
  let minDistance = calculateDistanceKm(lat, lng, closest.lat, closest.lng);

  for (let i = 1; i < POPULAR_LOCATIONS.length; i++) {
    const loc = POPULAR_LOCATIONS[i];
    const d = calculateDistanceKm(lat, lng, loc.lat, loc.lng);
    if (d < minDistance) {
      minDistance = d;
      closest = loc;
    }
  }

  if (minDistance < 0.4) {
    return { name: closest.name, distanceKm: minDistance };
  } else if (minDistance < 2.0) {
    return { name: `Near ${closest.name.split('(')[0].trim()} (${minDistance}km)`, distanceKm: minDistance };
  } else {
    return { name: `Singapore Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`, distanceKm: minDistance };
  }
}
