import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getMapboxAccessToken } from '../utils/mapboxEnv';

const BOTSWANA_CENTER = { lng: 24.6849, lat: -22.3285, zoom: 5 };

export default function MapboxMarkersMap({ markers = [], height = 320 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const pinRefs = useRef([]);
  const [mapError, setMapError] = useState('');
  const { token, valid, error: tokenError } = getMapboxAccessToken();

  useEffect(() => {
    if (!valid) {
      setMapError(tokenError || 'Mapbox token missing. Check frontend/.env');
      return;
    }
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [BOTSWANA_CENTER.lng, BOTSWANA_CENTER.lat],
      zoom: BOTSWANA_CENTER.zoom
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    return () => {
      pinRefs.current.forEach((p) => p.remove());
      pinRefs.current = [];
      map.remove();
    };
  }, [token, valid, tokenError]);

  useEffect(() => {
    if (!mapRef.current) return;
    pinRefs.current.forEach((p) => p.remove());
    pinRefs.current = [];
    const valid = markers.filter((m) => m.latitude != null && m.longitude != null);
    valid.forEach((m) => {
      const marker = new mapboxgl.Marker().setLngLat([Number(m.longitude), Number(m.latitude)]).addTo(mapRef.current);
      if (m.name || m.locationName) {
        marker.setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(`<strong>${m.name || 'Product'}</strong><br/>${m.locationName || ''}`));
      }
      pinRefs.current.push(marker);
    });
    if (valid.length) {
      mapRef.current.flyTo({ center: [Number(valid[0].longitude), Number(valid[0].latitude)], zoom: valid.length === 1 ? 13 : 8 });
    }
  }, [markers]);

  if (mapError) return <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 p-3 text-sm">{mapError} Restart `npm run dev` after changing .env.</div>;
  return <div ref={containerRef} className="w-full min-h-[300px] rounded-2xl overflow-hidden border border-gray-200" style={{ height: Math.max(300, height) }} />;
}
