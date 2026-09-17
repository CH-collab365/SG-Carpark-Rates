// Haversine distance calculator and Singapore location directory

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
    name: 'The Promontory @ Marina Bay',
    category: 'landmark',
    lat: 1.2825,
    lng: 103.855,
    postalCode: '018940',
    keywords: ['promontory', 'waterfront promenade', 'marina boulevard', '018940'],
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
  {
    name: 'OUE Bayfront / Downtown Gallery',
    category: 'commercial',
    lat: 1.2842,
    lng: 103.853,
    postalCode: '049321',
    keywords: ['oue bayfront', 'downtown gallery', 'collyer quay', 'shenton way', '049321'],
  },
  {
    name: 'CapitaGreen / Market Street',
    category: 'commercial',
    lat: 1.2835,
    lng: 103.8498,
    postalCode: '048942',
    keywords: ['capitagreen', 'market street', 'chulia street', '048942'],
  },
  {
    name: 'Funan Mall & Peninsula Plaza',
    category: 'mall',
    lat: 1.2914,
    lng: 103.8502,
    postalCode: '179097',
    keywords: ['funan', 'peninsula', 'north bridge road', 'coleman st', '179097'],
  },
  {
    name: 'Raffles City Shopping Centre',
    category: 'mall',
    lat: 1.2939,
    lng: 103.8532,
    postalCode: '179103',
    keywords: ['raffles city', 'city hall', 'bras basah', '179103'],
  },
  {
    name: 'Bugis Junction & Bugis+',
    category: 'mall',
    lat: 1.3002,
    lng: 103.8555,
    postalCode: '188021',
    keywords: ['bugis', 'bugis junction', 'bugis plus', 'victoria st', '188021'],
  },
  {
    name: 'Chinatown Point & People\'s Park',
    category: 'mall',
    lat: 1.2852,
    lng: 103.8443,
    postalCode: '059413',
    keywords: ['chinatown', 'chinatown point', 'new bridge rd', 'people\'s park', '059413'],
  },
  {
    name: 'Clarke Quay / Central',
    category: 'mall',
    lat: 1.2887,
    lng: 103.8465,
    postalCode: '059817',
    keywords: ['clarke quay', 'the central', 'eu tong sen', 'singapore river', '059817'],
  },
  {
    name: 'ION Orchard & Ngee Ann City',
    category: 'mall',
    lat: 1.304,
    lng: 103.8319,
    postalCode: '238801',
    keywords: ['ion orchard', 'orchard road', 'takashimaya', 'ngee ann city', 'wisma', '238801'],
  },
];

/**
 * Searches known Singapore landmarks, MRTs, malls, and postal codes.
 */
export function resolveLocationQuery(query: string): LocationTarget | null {
  const clean = query.trim().toLowerCase();
  if (!clean) return null;

  // 1. Exact or partial match on postal code (e.g. 018983)
  const postalMatch = POPULAR_LOCATIONS.find((loc) => loc.postalCode && loc.postalCode.includes(clean));
  if (postalMatch) return postalMatch;

  // 2. Keyword match
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

  if (minDistance < 0.3) {
    return { name: closest.name, distanceKm: minDistance };
  } else if (minDistance < 1.5) {
    return { name: `Near ${closest.name} (${minDistance}km away)`, distanceKm: minDistance };
  } else {
    return { name: `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`, distanceKm: minDistance };
  }
}
