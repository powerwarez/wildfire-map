import axios from 'axios';
import { WildfireData } from '../types';

// 선택한 일수만큼 이전 날짜 계산
const getDateXDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 기간 타입 정의
export type DateRange = 1 | 3 | 7 | 30;

// NASA FIRMS API URL 생성 함수
const getNasaFirmsApiUrl = (days: DateRange): string => {
  const startDate = getDateXDaysAgo(days);
  // days 파라미터를 10 대신 사용 (API가 요청한 일수보다 더 많은 데이터를 반환할 수 있도록)
  const requestDays = days === 30 ? 35 : days + 3;
  return `https://firms.modaps.eosdis.nasa.gov/api/country/csv/8120ee6035cfa3d6eeaf6e8d84e8b9ab/VIIRS_SNPP_NRT/KOR/${requestDays}/${startDate}`;
};

export const fetchWildfireData = async (days: DateRange = 3): Promise<WildfireData[]> => {
  try {
    const NASA_FIRMS_API_URL = getNasaFirmsApiUrl(days);
    console.log('데이터 요청 시작:', NASA_FIRMS_API_URL);
    const response = await axios.get(NASA_FIRMS_API_URL);
    console.log('데이터 받음, 길이:', response.data.length);
    
    // CSV 데이터 파싱
    const lines = response.data.split('\n');
    console.log('총 라인 수:', lines.length);
    
    // 첫 번째 줄은 헤더 (참고용)
    if (lines.length > 0) {
      console.log('헤더:', lines[0]);
    }
    
    // CSV 데이터를 WildfireData 형식으로 변환
    const wildfires: WildfireData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      // 빈 줄 건너뛰기
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',');
      
      // 필수 필드가 있는지 확인 (country_id,latitude,longitude,bright_ti4,scan,track,acq_date,acq_time...)
      if (values.length >= 8) {
        // country_id 필드는 무시하고 인덱스 1부터 시작
        const latitude = parseFloat(values[1]);
        const longitude = parseFloat(values[2]);
        
        // 경상북도 지역만 필터링 (선택 사항)
        // 경북 대략적 위도 경도: 35.5~37.0, 128.5~130.0
        const isGyeongbuk = latitude >= 35.5 && latitude <= 37.0 && 
                           longitude >= 128.5 && longitude <= 130.0;
        
        const locationName = isGyeongbuk ? '경북' : '한국';
        
        // 화재 강도 계산 - 더 작은 값으로 조정
        let intensity = 1; // 기본값
        if (values[10] && values[10].length > 0) {
          // confidence 값이 있으면 사용
          const confidenceValue = values[10];
          // 강도를 1~5 사이로 조정
          if (confidenceValue === 'h' || (!isNaN(parseFloat(confidenceValue)) && parseFloat(confidenceValue) > 80)) {
            intensity = 3;
          } else if (confidenceValue === 'n' || (!isNaN(parseFloat(confidenceValue)) && parseFloat(confidenceValue) > 50)) {
            intensity = 2;
          } else {
            intensity = 1;
          }
        } else if (values[3] && !isNaN(parseFloat(values[3]))) {
          // bright_ti4 값으로 계산
          const brightness = parseFloat(values[3]);
          // 300K 이상은 3, 290K 이상은 2, 나머지는 1
          if (brightness > 315) intensity = 3;
          else if (brightness > 300) intensity = 2;
          else intensity = 1;
        }
        
        const wildfire: WildfireData = {
          id: `fire-${i}`,
          latitude,
          longitude,
          intensity,
          dateReported: values[6], // acq_date
          // 다른 필드는 API에서 제공하지 않으므로 기본값 또는 계산값 사용
          name: `${locationName} 화재 지점 ${i}`,
          acresBurned: parseFloat(values[13]) * 10 || undefined, // frp 값 기반 추정 (더 작게 조정)
          containment: 0 // 기본값
        };
        
        wildfires.push(wildfire);
      }
    }
    
    console.log('최종 데이터 수:', wildfires.length);
    
    // 데이터가 없을 경우 예시 데이터 추가
    if (wildfires.length === 0) {
      console.log('데이터가 없음');
    }
    
    return wildfires;
  } catch (error) {
    console.error('Error fetching wildfire data:', error);
    // 오류 발생 시 예시 데이터 반환
    return [{
      id: 'error-1',
      latitude: 36.57, 
      longitude: 128.7,
      intensity: 2, // 강도 더 작게 조정
      dateReported: new Date().toISOString().split('T')[0],
      name: '경북 테스트 데이터 (API 오류)',
      acresBurned: 30, // 더 작게 조정
      containment: 0
    }];
  }
};