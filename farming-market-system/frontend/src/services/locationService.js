export const toDistanceKm = (origin, target) => {
  if (!origin || !target) return null;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(target.latitude - origin.latitude);
  const dLon = toRad(target.longitude - origin.longitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(origin.latitude)) * Math.cos(toRad(target.latitude)) * Math.sin(dLon / 2) ** 2;
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

export const getCurrentLocation = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error('Geolocation not supported'));
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
    reject,
    { enableHighAccuracy: true, timeout: 10000 }
  );
});
