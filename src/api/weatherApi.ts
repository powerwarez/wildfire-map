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
    const apiKey = import.meta.env.VITE_KMA_AUTH_KEY;
    const url = `https://apihub.kma.go.kr/api/typ01/url/kma_sfcdd.php?stn=${stn}&authKey=${apiKey}`;

    const response = await axios.get(url);
    const data = response.data;

    // API 응답이 문자열로 반환되므로 파싱 필요
    const lines = data.split('\n');
    
    // 데이터 행 찾기
    const dataLine = lines.find((line: string) => line.includes(new Date().getFullYear().toString().substring(2)));
    
    if (!dataLine) {
      console.error('날씨 데이터를 찾을 수 없습니다.');
      return null;
    }
    
    // 공백을 기준으로 데이터 분리
    const columns = dataLine.trim().split(/\s+/);
    
    // 지점명 찾기
    const location = WEATHER_LOCATIONS.find(loc => loc.stn === stn);
    
    // 날짜 데이터 추출 (YYYYMMDD 형식에서 YYYY-MM-DD로 변환)
    const date = columns[0];
    const formattedDate = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
    
    // 필요한 데이터 추출하여 반환
    return {
      tm: formattedDate,
      stn: columns[1],
      stnName: location?.name || '알 수 없음',
      ws_avg: parseFloat(columns[2]) === -9.0 ? 0 : parseFloat(columns[2]),
      wd_max: parseInt(columns[4]) === -9 ? 0 : parseInt(columns[4]),
      ws_max: parseFloat(columns[5]) === -9.0 ? 0 : parseFloat(columns[5]),
      ws_max_tm: columns[6] === '-9' ? '--:--' : `${columns[6].substring(0, 2)}:${columns[6].substring(2, 4)}`,
      ta_avg: parseFloat(columns[10]) === -99.0 ? 0 : parseFloat(columns[10]),
      ta_max: parseFloat(columns[11]) === -99.0 ? 0 : parseFloat(columns[11]),
      ta_min: parseFloat(columns[13]) === -99.0 ? 0 : parseFloat(columns[13])
    };
  } catch (error) {
    console.error('날씨 데이터를 가져오는 중 오류 발생:', error);
    return null;
  }
}; 