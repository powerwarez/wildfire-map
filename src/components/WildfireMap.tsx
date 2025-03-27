import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import { fetchWildfireData } from '../api/wildfireApi';
import { WildfireData } from '../types';

// 한국 중심으로 변경
const center = {
  lat: 36.5760,
  lng: 128.5060  // 경상북도 중심 좌표
};

const getFireMarkerColor = (intensity: number) => {
  if (intensity >= 5) return '#FF0000';  // 높은 강도
  if (intensity >= 3) return '#FFA500';  // 중간 강도
  return '#FFFF00';  // 낮은 강도
};

interface WildfireMapProps {
  onDataRefresh?: () => void;
}

const WildfireMap: React.FC<WildfireMapProps> = ({ onDataRefresh }) => {
  const [wildfires, setWildfires] = useState<WildfireData[]>([]);
  const [selectedFire, setSelectedFire] = useState<WildfireData | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  useEffect(() => {
    const loadWildfireData = async () => {
      const data = await fetchWildfireData();
      setWildfires(data);
      
      // 데이터 로드 후 onDataRefresh 콜백 호출
      if (onDataRefresh) {
        onDataRefresh();
      }
    };

    loadWildfireData();
    
    // 실시간 업데이트를 위한 인터벌 설정 (옵션)
    const interval = setInterval(loadWildfireData, 300000); // 5분 간격
    
    return () => clearInterval(interval);
  }, [onDataRefresh]);

  const onLoad = (map: google.maps.Map) => {
    setMapRef(map);
  };

  const onUnmount = () => {
    setMapRef(null);
  };

  return isLoaded ? (
    <div className="flex flex-col w-full">
      <h2 className="text-xl font-bold mb-3">산불 지도</h2>
      <div className="flex items-center gap-2 mb-0">
        <button 
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm"
          onClick={() => mapRef?.setZoom((mapRef.getZoom() || 0) + 1)}
        >
          확대 +
        </button>
        <button 
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm"
          onClick={() => mapRef?.setZoom((mapRef.getZoom() || 0) - 1)}
        >
          축소 -
        </button>
        <select 
          className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm"
          onChange={(e) => {
            const intensity = parseInt(e.target.value);
            setWildfires(prev => 
              intensity === 0 
                ? prev 
                : prev.filter(fire => (fire.intensity || 0) >= intensity)
            );
          }}
        >
          <option value="0">모든 산불</option>
          <option value="3">중간 강도 이상</option>
          <option value="5">높은 강도</option>
        </select>
      </div>
      <div className="w-full h-[600px] mt-0">
        <GoogleMap
          mapContainerClassName="w-full h-full"
          center={center}
          zoom={9} // 경상북도에 맞게 확대
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {wildfires.map((fire) => (
            <React.Fragment key={fire.id}>
              <Marker
                position={{ lat: fire.latitude, lng: fire.longitude }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: getFireMarkerColor(fire.intensity || 0),
                  fillOpacity: 0.7,
                  strokeWeight: 1,
                  strokeColor: '#000',
                  scale: 5, // 크기 감소
                }}
                onClick={() => setSelectedFire(fire)}
              />
              <Circle
                center={{ lat: fire.latitude, lng: fire.longitude }}
                radius={(fire.intensity || 0) * 200} // 강도에 따른 영향 범위 감소 (미터 단위)
                options={{
                  fillColor: getFireMarkerColor(fire.intensity || 0),
                  fillOpacity: 0.2,
                  strokeWeight: 1,
                  strokeColor: getFireMarkerColor(fire.intensity || 0),
                }}
              />
            </React.Fragment>
          ))}

          {selectedFire && (
            <InfoWindow
              position={{ lat: selectedFire.latitude, lng: selectedFire.longitude }}
              onCloseClick={() => setSelectedFire(null)}
            >
              <div className="p-2 max-w-xs">
                <h3 className="text-lg font-semibold text-red-700 mt-0">{selectedFire.name || '이름 없는 산불'}</h3>
                <p className="my-1 text-sm">강도: {selectedFire.intensity}/5</p>
                <p className="my-1 text-sm">발생일: {selectedFire.dateReported}</p>
                <p className="my-1 text-sm">소실 면적: {(selectedFire.acresBurned || 0) * 4046.86} 제곱미터</p>
                <p className="my-1 text-sm">진화율: {selectedFire.containment}%</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  ) : <div className="text-center py-4">지도 로딩 중...</div>;
};

export default WildfireMap;