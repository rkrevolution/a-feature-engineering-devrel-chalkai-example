// California national park coordinates extracted from NPS API
// Used for map pin placement and route animation

export interface ParkData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  hasFishing: boolean;
}

export const CA_PARKS: ParkData[] = [
  { id: "alca", name: "Alcatraz Island", lat: 37.8267, lon: -122.4233, hasFishing: false },
  { id: "cabrillo", name: "Cabrillo", lat: 32.6722, lon: -117.2437, hasFishing: true },
  { id: "chis", name: "Channel Islands", lat: 34.0069, lon: -119.7785, hasFishing: true },
  { id: "cech", name: "Cesar E. Chavez", lat: 35.2276, lon: -118.5614, hasFishing: false },
  { id: "depo", name: "Devils Postpile", lat: 37.6152, lon: -119.0848, hasFishing: true },
  { id: "euon", name: "Eugene O'Neill", lat: 37.8241, lon: -122.0268, hasFishing: false },
  { id: "fopo", name: "Fort Point", lat: 37.8106, lon: -122.477, hasFishing: true },
  { id: "goga", name: "Golden Gate", lat: 37.8199, lon: -122.4783, hasFishing: false },
  { id: "jomu", name: "John Muir", lat: 37.9572, lon: -122.1306, hasFishing: false },
  { id: "jotr", name: "Joshua Tree", lat: 33.8734, lon: -115.901, hasFishing: false },
  { id: "lavo", name: "Lassen Volcanic", lat: 40.4977, lon: -121.5081, hasFishing: true },
  { id: "manz", name: "Manzanar", lat: 36.7282, lon: -118.1545, hasFishing: false },
  { id: "muwo", name: "Muir Woods", lat: 37.8912, lon: -122.5715, hasFishing: false },
  { id: "pinn", name: "Pinnacles", lat: 36.4906, lon: -121.1825, hasFishing: false },
  { id: "pore", name: "Point Reyes", lat: 38.0682, lon: -122.8808, hasFishing: true },
  { id: "redw", name: "Redwood", lat: 41.2132, lon: -124.0046, hasFishing: true },
  { id: "rori", name: "Rosie the Riveter", lat: 37.9085, lon: -122.3601, hasFishing: false },
  { id: "samo", name: "Santa Monica Mountains", lat: 34.0975, lon: -118.9045, hasFishing: false },
  { id: "seki", name: "Sequoia & Kings Canyon", lat: 36.4864, lon: -118.5658, hasFishing: true },
  { id: "sfba", name: "San Francisco Bay", lat: 37.8541, lon: -122.4325, hasFishing: false },
  { id: "tuin", name: "Tule Lake", lat: 41.8891, lon: -121.5549, hasFishing: false },
  { id: "whis", name: "Whiskeytown", lat: 40.6397, lon: -122.6023, hasFishing: true },
  { id: "yose", name: "Yosemite", lat: 37.8651, lon: -119.5383, hasFishing: true },
  { id: "deva", name: "Death Valley", lat: 36.5054, lon: -117.0794, hasFishing: false },
  { id: "labe", name: "Lava Beds", lat: 41.7142, lon: -121.5107, hasFishing: false },
  { id: "paci", name: "Port Chicago", lat: 38.0568, lon: -122.0299, hasFishing: false },
  { id: "cabr", name: "Juan Bautista de Anza", lat: 33.7701, lon: -116.0476, hasFishing: false },
  { id: "cali", name: "California Trail", lat: 40.8209, lon: -117.7317, hasFishing: false },
];

// Lat/lon bounding box for California
export const CA_BOUNDS = {
  minLat: 32.5,
  maxLat: 42.0,
  minLon: -124.5,
  maxLon: -114.0,
};

// Convert lat/lon to SVG coordinates (1920x1080 viewport with padding)
export function latLonToXY(
  lat: number,
  lon: number,
  width = 1920,
  height = 1080,
  padding = 100
): { x: number; y: number } {
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const x = padding + ((lon - CA_BOUNDS.minLon) / (CA_BOUNDS.maxLon - CA_BOUNDS.minLon)) * innerW;
  const y = padding + ((CA_BOUNDS.maxLat - lat) / (CA_BOUNDS.maxLat - CA_BOUNDS.minLat)) * innerH;
  return { x, y };
}
