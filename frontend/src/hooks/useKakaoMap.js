import { useEffect } from 'react';

const useKakaoMap = () => {
  useEffect(() => {
    const kakaoMapKey = import.meta.env.VITE_KAKAO_MAP_KEY;
    console.log('Kakao Map Key:', kakaoMapKey);
    
    if (!kakaoMapKey) {
      console.error('카카오맵 API 키가 없습니다. .env 파일을 확인하세요.');
      return;
    }

    // 이미 로드되어 있으면 스킵
    if (window.kakao && window.kakao.maps) {
      console.log('카카오맵 SDK가 이미 로드되어 있습니다.');
      return;
    }

    // 스크립트가 이미 추가되어 있는지 확인
    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
    if (existingScript) {
      console.log('카카오맵 스크립트가 이미 추가되어 있습니다. 로딩 대기 중...');
      
      // 기존 스크립트가 로드 완료될 때까지 대기
      const checkInterval = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkInterval);
          window.kakao.maps.load(() => {
            console.log('카카오맵 SDK 로드 완료!');
          });
        }
      }, 100);

      setTimeout(() => clearInterval(checkInterval), 10000);
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&libraries=services&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      console.log('스크립트 로드 완료, 카카오맵 초기화 중...');
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          console.log('카카오맵 SDK 로드 완료!');
        });
      } else {
        console.error('window.kakao가 정의되지 않았습니다.');
      }
    };

    script.onerror = (error) => {
      console.error('카카오맵 SDK 로드 실패:', error);
      console.error('API 키를 확인하세요:', kakaoMapKey);
      console.error('카카오 개발자 콘솔에서 다음을 확인하세요:');
      console.error('1. JavaScript 키가 맞는지');
      console.error('2. 플랫폼에 http://localhost:5173이 등록되어 있는지');
    };

    return () => {
      // cleanup은 하지 않음 - 다른 페이지에서도 사용할 수 있도록
    };
  }, []);
};

export const initializeMap = (container, lat, lng, level = 3) => {
  console.log('initializeMap 호출 - lat:', lat, 'lng:', lng, 'level:', level);
  
  if (!window.kakao || !window.kakao.maps) {
    console.error('Kakao Maps SDK가 로드되지 않았습니다.');
    return null;
  }

  if (!container) {
    console.error('지도 컨테이너가 없습니다.');
    return null;
  }

  try {
    const options = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: level
    };

    const map = new window.kakao.maps.Map(container, options);
    console.log('지도 생성 성공:', map);
    return map;
  } catch (error) {
    console.error('지도 생성 중 오류:', error);
    return null;
  }
};

export const addMarker = (map, lat, lng, title) => {
  if (!window.kakao || !window.kakao.maps) {
    return null;
  }

  const markerPosition = new window.kakao.maps.LatLng(lat, lng);
  const marker = new window.kakao.maps.Marker({
    position: markerPosition,
    map: map
  });

  if (title) {
    const infowindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:5px;font-size:12px;">${title}</div>`
    });

    window.kakao.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map, marker);
    });
  }

  return marker;
};

// 주소로 좌표 검색
export const geocodeAddress = async (address) => {
  console.log('주소 검색 시작:', address);
  
  return new Promise((resolve, reject) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      console.error('Kakao Maps services가 로드되지 않았습니다.');
      reject(new Error('Kakao Maps SDK not loaded'));
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    
    geocoder.addressSearch(address, (result, status) => {
      console.log('주소 검색 결과:', result, 'status:', status);
      
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = {
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x)
        };
        console.log('좌표 변환 성공:', coords);
        resolve(coords);
      } else {
        console.error('주소 검색 실패 - status:', status);
        reject(new Error('Geocoding failed: ' + status));
      }
    });
  });
};

// 카카오맵 URL 생성
export const getKakaoMapUrl = (address, name) => {
  return `https://map.kakao.com/link/search/${encodeURIComponent(address)}`;
};

// 카카오내비 URL 생성
export const getKakaoNaviUrl = (lat, lng, name) => {
  return `kakaomap://route?ep=${lng},${lat}&by=CAR`;
};

export default useKakaoMap;
