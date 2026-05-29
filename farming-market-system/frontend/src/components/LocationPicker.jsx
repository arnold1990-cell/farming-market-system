import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { SearchBox } from '@mapbox/search-js-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getMapboxAccessToken } from '../utils/mapboxEnv';

const BOTSWANA_CENTER = { lng: 24.6849, lat: -22.3285, zoom: 5 };

function parseFeature(feature) {
  if (!feature) return {};
  const context = feature.context || [];
  const city = context.find((c) => c.id?.startsWith('place'))?.text;
  const country = context.find((c) => c.id?.startsWith('country'))?.text;
  return {
    address: feature.place_name || feature.properties?.full_address || '',
    city: city || feature.properties?.place || '',
    country: country || feature.properties?.country || ''
  };
}

async function reverseGeocode(token, latitude, longitude) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&types=address,place,locality,country&limit=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to reverse geocode');
  const data = await res.json();
  return parseFeature(data.features?.[0]);
}

export default function LocationPicker({ value, onChange, error, height = 320 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [mapError, setMapError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const { token, valid, error: tokenError } = getMapboxAccessToken();

  const latitude = value?.latitude ?? '';
  const longitude = value?.longitude ?? '';
  const hasCoords = latitude !== '' && longitude !== '' && latitude != null && longitude != null;

  const mapStart = useMemo(() => ({
    lng: hasCoords ? Number(longitude) : BOTSWANA_CENTER.lng,
    lat: hasCoords ? Number(latitude) : BOTSWANA_CENTER.lat,
    zoom: hasCoords ? 12 : BOTSWANA_CENTER.zoom
  }), [hasCoords, longitude, latitude]);

  useEffect(() => {
    if (!valid) {
      setMapError(tokenError || 'Mapbox token missing. Check frontend/.env');
      return;
    }
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [mapStart.lng, mapStart.lat],
      zoom: mapStart.zoom
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const setMarker = (lng, lat) => {
      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({ draggable: true }).setLngLat([lng, lat]).addTo(map);
        markerRef.current.on('dragend', async () => {
          const point = markerRef.current.getLngLat();
          const nextLat = Number(point.lat.toFixed(6));
          const nextLng = Number(point.lng.toFixed(6));
          let geo = {};
          try { geo = await reverseGeocode(token, nextLat, nextLng); } catch (_) {}
          onChange({ ...value, ...geo, latitude: nextLat, longitude: nextLng });
        });
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }
    };

    if (hasCoords) setMarker(mapStart.lng, mapStart.lat);
    map.on('click', async (e) => {
      const nextLat = Number(e.lngLat.lat.toFixed(6));
      const nextLng = Number(e.lngLat.lng.toFixed(6));
      setMarker(nextLng, nextLat);
      let geo = {};
      try { geo = await reverseGeocode(token, nextLat, nextLng); } catch (_) {}
      onChange({ ...value, ...geo, latitude: nextLat, longitude: nextLng });
    });

    return () => {
      markerRef.current = null;
      map.remove();
    };
  }, [token, valid, tokenError]);

  useEffect(() => {
    if (!mapRef.current || latitude === '' || longitude === '' || latitude == null || longitude == null) return;
    const lng = Number(longitude);
    const lat = Number(latitude);
    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ draggable: true }).setLngLat([lng, lat]).addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat([lng, lat]);
    }
    mapRef.current.flyTo({ center: [lng, lat], zoom: Math.max(mapRef.current.getZoom(), 11) });
  }, [latitude, longitude]);

  const onUseCurrent = () => {
    if (!navigator.geolocation) {
      setMapError('Geolocation not supported in this browser.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const nextLat = Number(pos.coords.latitude.toFixed(6));
        const nextLng = Number(pos.coords.longitude.toFixed(6));
        let geo = {};
        try { geo = await reverseGeocode(token, nextLat, nextLng); } catch (_) {}
        onChange({ ...value, ...geo, latitude: nextLat, longitude: nextLng });
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
        setMapError('Could not read your current location. Check browser permission.');
      }
    );
  };

  if (mapError && !valid) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 p-3 text-sm">{mapError} Restart `npm run dev` after changing .env.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        {valid ? (
          <SearchBox
            accessToken={token}
            map={mapRef.current}
            mapboxgl={mapboxgl}
            marker={false}
            placeholder="Search address"
            onRetrieve={(result) => {
              const feature = result?.features?.[0];
              const center = feature?.center;
              if (!center) return;
              const nextLng = Number(center[0].toFixed(6));
              const nextLat = Number(center[1].toFixed(6));
              const geo = parseFeature(feature);
              onChange({ ...value, ...geo, latitude: nextLat, longitude: nextLng });
            }}
          />
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">Mapbox token missing. Check frontend/.env</div>
        )}
        <button
          type="button"
          className="rounded-xl border border-farm-green/40 bg-farm-green/5 px-3 py-2 text-sm font-medium text-farm-green hover:bg-farm-green/10 disabled:opacity-70"
          onClick={onUseCurrent}
          disabled={geoLoading}
        >
          {geoLoading ? 'Locating...' : 'Use my current location'}
        </button>
      </div>
      <textarea
        rows={2}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-farm-green focus:outline-none focus:ring-2 focus:ring-farm-green/20"
        placeholder="Physical address (optional if map coordinates are set)"
        value={value?.address || ''}
        onChange={(e) => onChange({ ...value, address: e.target.value })}
      />
      <div ref={containerRef} className="w-full min-h-[300px] overflow-hidden rounded-2xl border border-green-200 shadow-sm" style={{ height: Math.max(300, height) }} />
      <p className="text-xs text-gray-600">Search, click map, drag marker, or use current location.</p>
      <p className="text-sm text-gray-700">
        Selected address: <span className="font-medium">{value?.address?.trim() || 'No address selected yet'}</span>
      </p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
