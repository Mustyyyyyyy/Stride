// ⚠️ Replace with your real Mapbox access token from https://account.mapbox.com/access-tokens/
export const MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN_HERE';

export const MAPBOX_CONFIG = {
  accessToken: MAPBOX_ACCESS_TOKEN,
  style: 'mapbox://styles/mapbox/streets-v12',
  darkStyle: 'mapbox://styles/mapbox/dark-v11',
  showUserLocation: true,
  defaultCenter: [-122.4194, 37.7749] as [number, number],
  defaultZoom: 15,
};
