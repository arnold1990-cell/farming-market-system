import MapboxMarkersMap from './MapboxMarkersMap';

export default function FarmerMapView({ products = [], height = 320 }) {
  const markers = products
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({
      latitude: p.latitude,
      longitude: p.longitude,
      name: p.name || p.productName,
      farmerName: p.farmerName,
      price: p.price,
      quantity: p.quantity,
      unit: p.unit,
      harvestStatus: p.harvestStatus,
      locationName: p.locationName || p.pickupAddress || p.location || ''
    }));

  return <MapboxMarkersMap markers={markers} height={height} />;
}
