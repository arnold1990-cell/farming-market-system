export function getMapboxAccessToken() {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  console.log('Mapbox token loaded:', !!token);
  if (!token) {
    return { token: '', valid: false, error: 'Mapbox token missing. Check frontend/.env' };
  }
  if (!token.startsWith('pk.')) {
    return { token, valid: false, error: 'Mapbox token must start with pk. (not ppk.)' };
  }
  return { token, valid: true, error: '' };
}
