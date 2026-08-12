// ⚠️ IMPORTANT: Replace the placeholder below with your real Mapbox access token.
// Get one at https://account.mapbox.com/access-tokens/
// GitHub secret scanning blocks commits containing real tokens, so we use a placeholder here.
export const MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN_HERE';

export const MAPBOX_CONFIG = {
  accessToken: MAPBOX_ACCESS_TOKEN,
  style: 'mapbox://styles/mapbox/streets-v12',
  // Use a dark style for the app's dark theme
  darkStyle: 'mapbox://styles/mapbox/dark-v11',
  // Show user location
  showUserLocation: true,
  // Default camera settings
  camera: {
    zoomLevel: 15,
    followUserMode: 'normal' as const,
  },
};
