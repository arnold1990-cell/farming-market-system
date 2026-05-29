import MapboxMarkersMap from './MapboxMarkersMap';

export default function FarmerMapView({ products = [], height = 320 }) {
  const markers = products
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({
      latitude: p.latitude,
      longitude: p.longitude,
      name: p.name,
      locationName: p.locationName || p.pickupAddress || ''
    }));

  return <MapboxMarkersMap markers={markers} height={height} />;
}
