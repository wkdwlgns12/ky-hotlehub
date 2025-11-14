import React, { useEffect, useRef } from 'react';
import { initializeMap, addMarker } from '../hooks/useKakaoMap';
import './KakaoMap.scss';

const KakaoMap = ({ lat, lng, title, height = '400px' }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!lat || !lng) return;

    // Wait for Kakao Maps SDK to load
    const initMap = () => {
      if (window.kakao && window.kakao.maps) {
        mapInstance.current = initializeMap(mapContainer.current, lat, lng);
        if (mapInstance.current) {
          addMarker(mapInstance.current, lat, lng, title);
        }
      } else {
        setTimeout(initMap, 100);
      }
    };

    initMap();
  }, [lat, lng, title]);

  return <div ref={mapContainer} className="kakao-map" style={{ height }}></div>;
};

export default KakaoMap;
