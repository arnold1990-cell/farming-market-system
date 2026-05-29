import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getMapboxAccessToken } from '../utils/mapboxEnv';

const BOTSWANA_CENTER = { lng: 24.6849, lat: -22.3285, zoom: 5 };

export default function MapboxLocationPicker({ latitude, longitude, onLocationChange, height = 320 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [mapError, setMapError] = useState('');
  const { token, valid, error: tokenError } = getMapboxAccessToken();

  useEffect(() => {
    if (!valid) {
      setMapError(tokenError || 'Mapbox token missing. Check frontend/.env');
      return;
    }
    mapboxgl.accessToken = token;
    const hasCoords = latitude !== '' && longitude !== '' && latitude != null && longitude != null;
    const startLng = hasCoords ? Number(longitude) : BOTSWANA_CENTER.lng;
    const startLat = hasCoords ? Number(latitude) : BOTSWANA_CENTER.lat;
    const startZoom = hasCoords ? 12 : BOTSWANA_CENTER.zoom;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [startLng, startLat],
      zoom: startZoom
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const setMarker = (lng, lat, center = false) => {
      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({ draggable: true }).setLngLat([lng, lat]).addTo(map);
        markerRef.current.on('dragend', () => {
          const next = markerRef.current.getLngLat();
          onLocationChange(Number(next.lat.toFixed(6)), Number(next.lng.toFixed(6)));
        });
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }
      if (center) map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 11) });
    };

    if (hasCoords) setMarker(startLng, startLat);

    map.on('click', (e) => {
      const nextLat = Number(e.lngLat.lat.toFixed(6));
      const nextLng = Number(e.lngLat.lng.toFixed(6));
      setMarker(nextLng, nextLat);
      onLocationChange(nextLat, nextLng);
    });

    if (!hasCoords && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const geoLat = Number(pos.coords.latitude.toFixed(6));
          const geoLng = Number(pos.coords.longitude.toFixed(6));
          setMarker(geoLng, geoLat, true);
          onLocationChange(geoLat, geoLng);
        },
        () => {}
      );
    }

    return () => {
      markerRef.current = null;
      map.remove();
    };
  }, [token, valid, tokenError]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (latitude === '' || longitude === '' || latitude == null || longitude == null) return;
    markerRef.current.setLngLat([Number(longitude), Number(latitude)]);
  }, [latitude, longitude]);

  if (mapError) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 p-3 text-sm">{mapError} Restart `npm run dev` after changing .env.</div>;
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="w-full min-h-[300px] rounded-2xl overflow-hidden border border-gray-200" style={{ height: Math.max(300, height) }} />
      <p className="text-xs text-gray-600">Click the map or drag marker to set GPS coordinates.</p>
    </div>
  );
}
