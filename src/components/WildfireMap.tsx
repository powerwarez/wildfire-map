import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import { fetchWildfireData } from '../api/wildfireApi';
import { fetchEducationalInstitutions } from '../api/educationApi';
import { WildfireData, EducationalInstitution, EducationalInstitutionType } from '../types';
import SchoolModal from './SchoolModal';

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

// 각 교육기관 타입별 커스텀 아이콘 URL
const SCHOOL_ICONS = {
  [EducationalInstitutionType.ELEMENTARY_SCHOOL]: {
    url: "https://maps.google.com/mapfiles/kml/shapes/schools.png",
    scaledSize: { width: 32, height: 32 },
    color: '#4CAF50' // 초록색
  },
  [EducationalInstitutionType.MIDDLE_SCHOOL]: {
    url: "https://maps.google.com/mapfiles/kml/shapes/homegardenbusiness.png",
    scaledSize: { width: 34, height: 34 },
    color: '#2196F3' // 파란색
  },
  [EducationalInstitutionType.HIGH_SCHOOL]: {
    url: "https://maps.google.com/mapfiles/kml/shapes/library.png",
    scaledSize: { width: 36, height: 36 },
    color: '#9C27B0' // 보라색
  },
  [EducationalInstitutionType.UNIVERSITY]: {
    url: "https://maps.google.com/mapfiles/kml/shapes/universities.png",
    scaledSize: { width: 40, height: 40 },
    color: '#F44336' // 빨간색
  },
  [EducationalInstitutionType.EDUCATION_OFFICE]: {
    url: "https://maps.google.com/mapfiles/kml/shapes/govtbldgs.png",
    scaledSize: { width: 36, height: 36 },
    color: '#FF9800' // 주황색
  }
};

// 학교의 운영 상태에 따라 마커 아이콘 조정
const getEducationMarkerIcon = (institution: EducationalInstitution) => {
  const iconInfo = SCHOOL_ICONS[institution.type] || SCHOOL_ICONS[EducationalInstitutionType.ELEMENTARY_SCHOOL];
  
  // 기본 아이콘
  const icon = {
    url: iconInfo.url,
    scaledSize: new google.maps.Size(
      iconInfo.scaledSize.width, 
      iconInfo.scaledSize.height
    ),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(
      iconInfo.scaledSize.width / 2, 
      iconInfo.scaledSize.height / 2
    )
  };
  
  return icon;
};

// 유형에 따른 라벨 색상
const getEducationLabelColor = (type: EducationalInstitutionType) => {
  return SCHOOL_ICONS[type]?.color || '#607D8B'; // 기본값은 회색
};

// 학교 운영 상태에 따른 마커 스타일
const getStatusMarkerStyle = (institution: EducationalInstitution): google.maps.CircleOptions => {
  if (institution.isClosed) {
    return {
      strokeColor: '#FF0000', // 빨간색 테두리
      strokeWeight: 3,
      fillColor: '#FF0000',
      fillOpacity: 0.2
    };
  } else if (institution.isOnlineClass) {
    return {
      strokeColor: '#0000FF', // 파란색 테두리
      strokeWeight: 3,
      fillColor: '#0000FF',
      fillOpacity: 0.2
    };
  }
  // 기본값 반환
  return {
    strokeColor: '#00FF00', // 초록색 테두리
    strokeWeight: 1,
    fillColor: '#00FF00',
    fillOpacity: 0.1
  };
};

// 날짜 포맷팅 함수
const formatDate = (dateString?: string): string => {
  if (!dateString) return '정보 없음';
  
  try {
    const date = new Date(dateString);
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      return '정보 없음';
    }
    
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}시 ${date.getMinutes()}분`;
  } catch (error) {
    console.error('날짜 형식 변환 오류:', error);
    return '정보 없음';
  }
};

interface WildfireMapProps {
  onDataRefresh?: () => void;
}

const WildfireMap: React.FC<WildfireMapProps> = ({ onDataRefresh }) => {
  const [wildfires, setWildfires] = useState<WildfireData[]>([]);
  const [educationalInstitutions, setEducationalInstitutions] = useState<EducationalInstitution[]>([]);
  const [selectedFire, setSelectedFire] = useState<WildfireData | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<EducationalInstitution | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [showInstitutions, setShowInstitutions] = useState<boolean>(false);
  const [institutionFilters, setInstitutionFilters] = useState<EducationalInstitutionType[]>([
    EducationalInstitutionType.ELEMENTARY_SCHOOL,
    EducationalInstitutionType.MIDDLE_SCHOOL,
    EducationalInstitutionType.HIGH_SCHOOL,
    EducationalInstitutionType.UNIVERSITY,
    EducationalInstitutionType.EDUCATION_OFFICE
  ]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

  useEffect(() => {
    const loadEducationalInstitutions = async () => {
      const data = await fetchEducationalInstitutions();
      setEducationalInstitutions(data);
    };

    loadEducationalInstitutions();
  }, []);

  const onLoad = (map: google.maps.Map) => {
    setMapRef(map);
  };

  const onUnmount = () => {
    setMapRef(null);
  };

  const toggleInstitutionFilter = (type: EducationalInstitutionType) => {
    if (institutionFilters.includes(type)) {
      setInstitutionFilters(institutionFilters.filter(t => t !== type));
    } else {
      setInstitutionFilters([...institutionFilters, type]);
    }
  };

  const filteredInstitutions = showInstitutions 
    ? educationalInstitutions.filter(inst => institutionFilters.includes(inst.type))
    : [];

  const handleEditInstitution = () => {
    if (selectedInstitution) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveInstitution = async () => {
    setIsModalOpen(false);
    // 데이터 다시 로드하여 업데이트된 정보 반영
    const data = await fetchEducationalInstitutions();
    setEducationalInstitutions(data);
    // 선택된 학교 정보 업데이트
    if (selectedInstitution) {
      const updated = data.find(item => item.id === selectedInstitution.id);
      if (updated) {
        setSelectedInstitution(updated);
      }
    }
  };

  return isLoaded ? (
    <div className="flex flex-col w-full">
      <h2 className="text-xl font-bold mb-3">산불 지도</h2>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <div className="flex items-center gap-2">
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
        
        <div className="ml-2 flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm">
            <input 
              type="checkbox" 
              checked={showInstitutions} 
              onChange={() => setShowInstitutions(!showInstitutions)}
              className="rounded"
            />
            교육기관 표시
          </label>
          
          {showInstitutions && (
            <div className="flex flex-wrap gap-2 items-center">
              <label className="flex items-center gap-1 text-sm">
                <input 
                  type="checkbox"
                  checked={institutionFilters.includes(EducationalInstitutionType.ELEMENTARY_SCHOOL)}
                  onChange={() => toggleInstitutionFilter(EducationalInstitutionType.ELEMENTARY_SCHOOL)}
                  className="rounded"
                />
                <div 
                  className="w-5 h-5 inline-block bg-contain bg-center bg-no-repeat" 
                  style={{ backgroundImage: `url(${SCHOOL_ICONS[EducationalInstitutionType.ELEMENTARY_SCHOOL].url})` }}
                />
                초등학교
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input 
                  type="checkbox"
                  checked={institutionFilters.includes(EducationalInstitutionType.MIDDLE_SCHOOL)}
                  onChange={() => toggleInstitutionFilter(EducationalInstitutionType.MIDDLE_SCHOOL)}
                  className="rounded"
                />
                <div 
                  className="w-5 h-5 inline-block bg-contain bg-center bg-no-repeat" 
                  style={{ backgroundImage: `url(${SCHOOL_ICONS[EducationalInstitutionType.MIDDLE_SCHOOL].url})` }}
                />
                중학교
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input 
                  type="checkbox"
                  checked={institutionFilters.includes(EducationalInstitutionType.HIGH_SCHOOL)}
                  onChange={() => toggleInstitutionFilter(EducationalInstitutionType.HIGH_SCHOOL)}
                  className="rounded"
                />
                <div 
                  className="w-5 h-5 inline-block bg-contain bg-center bg-no-repeat" 
                  style={{ backgroundImage: `url(${SCHOOL_ICONS[EducationalInstitutionType.HIGH_SCHOOL].url})` }}
                />
                고등학교
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input 
                  type="checkbox"
                  checked={institutionFilters.includes(EducationalInstitutionType.UNIVERSITY)}
                  onChange={() => toggleInstitutionFilter(EducationalInstitutionType.UNIVERSITY)}
                  className="rounded"
                />
                <div 
                  className="w-5 h-5 inline-block bg-contain bg-center bg-no-repeat" 
                  style={{ backgroundImage: `url(${SCHOOL_ICONS[EducationalInstitutionType.UNIVERSITY].url})` }}
                />
                대학교
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input 
                  type="checkbox"
                  checked={institutionFilters.includes(EducationalInstitutionType.EDUCATION_OFFICE)}
                  onChange={() => toggleInstitutionFilter(EducationalInstitutionType.EDUCATION_OFFICE)}
                  className="rounded"
                />
                <div 
                  className="w-5 h-5 inline-block bg-contain bg-center bg-no-repeat" 
                  style={{ backgroundImage: `url(${SCHOOL_ICONS[EducationalInstitutionType.EDUCATION_OFFICE].url})` }}
                />
                교육청
              </label>
            </div>
          )}
        </div>
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
                onClick={() => {
                  setSelectedFire(fire);
                  setSelectedInstitution(null);
                }}
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

          {filteredInstitutions.map((institution) => (
            <React.Fragment key={institution.id}>
              <Marker
                position={{ lat: institution.latitude, lng: institution.longitude }}
                icon={getEducationMarkerIcon(institution)}
                onClick={() => {
                  setSelectedInstitution(institution);
                  setSelectedFire(null);
                }}
              />
              {/* 모든 학교에 운영 상태에 따른 스타일 적용 */}
              <Circle
                center={{ lat: institution.latitude, lng: institution.longitude }}
                radius={institution.isClosed ? 150 : institution.isOnlineClass ? 120 : 80} // 상태에 따라 다른 반경
                options={getStatusMarkerStyle(institution)}
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

          {selectedInstitution && (
            <InfoWindow
              position={{ lat: selectedInstitution.latitude, lng: selectedInstitution.longitude }}
              onCloseClick={() => setSelectedInstitution(null)}
            >
              <div className="p-2 max-w-xs">
                <h3 className="text-lg font-semibold mt-0" style={{ color: getEducationLabelColor(selectedInstitution.type) }}>{selectedInstitution.name}</h3>
                <p className="my-1 text-sm">유형: {selectedInstitution.type}</p>
                <p className="my-1 text-sm">주소: {selectedInstitution.address || '정보 없음'}</p>
                {selectedInstitution.contact && (
                  <p className="my-1 text-sm">연락처: {selectedInstitution.contact}</p>
                )}
                <div className="mt-2 border-t border-gray-200 pt-2">
                  <p className="my-1 text-sm">
                    <span className="font-semibold">운영 상태: </span>
                    {selectedInstitution.isClosed ? (
                      <span className="text-red-600 font-medium">휴업 중</span>
                    ) : selectedInstitution.isOnlineClass ? (
                      <span className="text-blue-600 font-medium">온라인 수업</span>
                    ) : (
                      <span className="text-green-600 font-medium">정상 운영</span>
                    )}
                  </p>
                  
                  {selectedInstitution.note && (
                    <div className="my-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <p className="font-semibold text-yellow-800 mb-1">특이사항:</p>
                      <p className="text-gray-700">{selectedInstitution.note}</p>
                    </div>
                  )}
                  
                  <p className="my-1 text-sm">
                    <span className="font-semibold">위치 정보: </span>
                    <span className="text-gray-700">
                      {selectedInstitution.latitude.toFixed(6)}, {selectedInstitution.longitude.toFixed(6)}
                    </span>
                  </p>
                  <p className="my-1 text-sm">
                    <span className="font-semibold">마지막 업데이트: </span>
                    <span className="text-gray-700">
                      {formatDate(selectedInstitution.updatedAt)}
                    </span>
                  </p>
                  <p className="my-1 text-sm">
                    <span className="font-semibold">ID: </span>
                    <span className="text-xs text-gray-500">{selectedInstitution.id}</span>
                  </p>
                  <div className="mt-3 text-center">
                    <button
                      onClick={handleEditInstitution}
                      className="inline-block px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-colors"
                    >
                      정보 수정
                    </button>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {isModalOpen && selectedInstitution && (
        <SchoolModal
          school={selectedInstitution}
          isAddMode={false}
          onClose={handleCloseModal}
          onSave={handleSaveInstitution}
        />
      )}
    </div>
  ) : <div className="text-center py-4">지도 로딩 중...</div>;
};

export default WildfireMap;