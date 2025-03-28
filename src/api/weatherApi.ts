import axios from 'axios';

// 지역 정보 타입 정의
export interface WeatherLocation {
  stn: string;
  name: string;
  lat: number;
  lng: number;
}

// 날씨 데이터 타입 정의
export interface WeatherData {
  tm: string;          // 관측일 (KST)
  stn: string;         // 지점번호
  stnName: string;     // 지점명
  ws_avg: number;      // 일 평균 풍속 (m/s)
  wd_max: number;      // 최대풍향
  ws_max: number;      // 최대풍속 (m/s)
  ws_max_tm: string;   // 최대풍속 시각 (시분)
  ta_avg: number;      // 일 평균기온 (C)
  ta_max: number;      // 최고기온 (C)
  ta_min: number;      // 최저기온 (C)
}

// 지역 목록
export const WEATHER_LOCATIONS: WeatherLocation[] = [
  { stn: '115', name: '울릉도', lat: 37.4811, lng: 130.8986 },
  { stn: '130', name: '울진', lat: 36.9925, lng: 129.4139 },
  { stn: '136', name: '안동', lat: 36.5683, lng: 128.7089 },
  { stn: '137', name: '상주', lat: 36.4072, lng: 128.1558 },
  { stn: '138', name: '포항', lat: 36.0322, lng: 129.3694 },
  { stn: '271', name: '봉화', lat: 36.9438, lng: 128.9142 },
  { stn: '272', name: '영주', lat: 36.8719, lng: 128.5164 },
  { stn: '273', name: '문경', lat: 36.6372, lng: 128.1487 },
  { stn: '276', name: '청송', lat: 36.4358, lng: 129.0571 },
  { stn: '277', name: '영덕', lat: 36.5252, lng: 129.4097 },
  { stn: '278', name: '의성', lat: 36.3561, lng: 128.6887 },
  { stn: '279', name: '구미', lat: 36.1214, lng: 128.3197 },
  { stn: '281', name: '영천', lat: 35.9777, lng: 128.9514 },
  { stn: '283', name: '경주', lat: 35.8433, lng: 129.2117 }
];

// 기상청 API에서 날씨 데이터 가져오기
export const fetchWeatherData = async (stn: string): Promise<WeatherData | null> => {
  try {
    // 항상 테스트 데이터 사용 (디버깅 목적)
    const alwaysUseTestData = true;
    
    // Netlify 프록시 함수를 통해 데이터 가져오기
    const proxyUrl = `/.netlify/functions/weather-proxy?stn=${stn}`;
    
    // 개발 환경이나 테스트 데이터 사용 설정이면 debug 파라미터 추가
    const url = alwaysUseTestData ? `${proxyUrl}&debug=true` : proxyUrl;
    
    console.log(`항상 테스트 데이터 사용: ${alwaysUseTestData ? 'Yes' : 'No'}`);
    console.log(`API 키 설정됨: ${import.meta.env.VITE_KMA_AUTH_KEY ? 'Yes' : 'No'}`);
    console.log(`Fetching weather data from: ${url}`);
    
    const response = await axios.get(url);
    
    // 이미 JSON 형식으로 파싱된 데이터가 반환됨
    const data = response.data;
    console.log('Weather data received:', data);
    
    // 오류 응답 체크
    if (data.error) {
      console.error('날씨 데이터 오류:', data.error);
      return null;
    }
    
    // 지점명이 없는 경우 지역 목록에서 가져오기
    if (!data.stnName) {
      const location = WEATHER_LOCATIONS.find(loc => loc.stn === stn);
      if (location) {
        data.stnName = location.name;
      }
    }
    
    return data as WeatherData;
  } catch (error) {
    console.error('날씨 데이터를 가져오는 중 오류 발생:', error);
    return null;
  }
}; 