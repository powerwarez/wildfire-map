const https = require('https');
const iconv = require('iconv-lite');

// 기상관측소 목록
const WEATHER_LOCATIONS = [
  { stn: '115', name: '울릉도' },
  { stn: '130', name: '울진' },
  { stn: '136', name: '안동' },
  { stn: '137', name: '상주' },
  { stn: '138', name: '포항' },
  { stn: '271', name: '봉화' },
  { stn: '272', name: '영주' },
  { stn: '273', name: '문경' },
  { stn: '276', name: '청송' },
  { stn: '277', name: '영덕' },
  { stn: '278', name: '의성' },
  { stn: '279', name: '구미' },
  { stn: '281', name: '영천' },
  { stn: '283', name: '경주' }
];

exports.handler = async function(event) {
  const stn = event.queryStringParameters.stn || '136';
  
  // 환경변수에서 API 키 가져오기
  const apiKey = process.env.VITE_KMA_AUTH_KEY || process.env.KMA_AUTH_KEY;
  console.log('API Key available:', apiKey ? 'Yes' : 'No');
  console.log('Environment variables:', Object.keys(process.env).filter(key => key.includes('KMA') || key.includes('VITE')));
  
  // 로컬 개발 환경이거나 디버그 모드인 경우 테스트 데이터 사용
  const isDebug = event.queryStringParameters.debug === 'true';
  // API 키가 없거나 디버그 모드이면 테스트 데이터 사용
  const useTestData = isDebug || !apiKey;
  
  if (useTestData) {
    console.log('Using test weather data for station:', stn, '(reason:', isDebug ? 'debug mode' : 'no API key', ')');
    const location = WEATHER_LOCATIONS.find(loc => loc.stn === stn) || WEATHER_LOCATIONS[0];
    console.log('Selected location:', location);
    
    // 지역을 찾지 못한 경우 전체 목록에서 확인
    if (!location || location.stn !== stn) {
      console.log('Location not found in WEATHER_LOCATIONS. Available locations:', WEATHER_LOCATIONS);
    }
    
    // 현재 날짜 정보
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // 테스트 데이터 생성
    const testData = {
      tm: formattedDate,
      stn: stn,
      stnName: location.name,
      ws_avg: Math.round(Math.random() * 5 * 10) / 10,
      wd_max: Math.floor(Math.random() * 360),
      ws_max: Math.round(Math.random() * 10 * 10) / 10,
      ws_max_tm: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      ta_avg: Math.round((15 + Math.random() * 10) * 10) / 10,
      ta_max: Math.round((20 + Math.random() * 10) * 10) / 10,
      ta_min: Math.round((10 + Math.random() * 5) * 10) / 10
    };
    
    console.log('Generated test data:', testData);
    
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(testData)
    };
  }
  
  console.log(`Requesting weather data for station: ${stn}`);
  
  // API 키가 없으면 테스트 데이터 사용
  if (!apiKey) {
    // 이 부분은 위에서 이미 처리했으므로 여기에 도달하지 않음
    return;
  }

  try {
    // 기상청 API 요청 URL과 옵션 설정
    const apiUrl = `https://apihub.kma.go.kr/api/typ01/url/kma_sfcdd.php?stn=${stn}&authKey=${apiKey}`;
    console.log('Requesting URL:', apiUrl);
    
    // URL 파싱
    const url = new URL(apiUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*'
      },
      timeout: 10000
    };
    
    // HTTPS 요청 수행
    const weatherData = await fetchWeatherData(options);
    
    // 데이터 파싱
    const parsedData = parseWeatherData(weatherData);
    
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parsedData)
    };
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    console.error('Error details:', error.stack);
    
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        error: 'Error fetching weather data', 
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

// HTTPS 요청을 Promise로 래핑하는 함수
function fetchWeatherData(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      // 응답 상태 코드 확인
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Status Code: ${res.statusCode}`));
      }
      
      // 응답 데이터 수집
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      
      // 응답 완료시 EUC-KR로 디코딩
      res.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks);
          // EUC-KR로 인코딩된 데이터 디코딩
          const decodedData = iconv.decode(buffer, 'euc-kr');
          console.log('Decoded data (sample):', decodedData.substring(0, 200));
          resolve(decodedData);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    // 요청 타임아웃 설정
    req.setTimeout(options.timeout || 10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    // 오류 처리
    req.on('error', reject);
    
    // 요청 종료
    req.end();
  });
}

// 기상청 텍스트 응답 파싱 함수
function parseWeatherData(textData) {
  try {
    // 헤더와 데이터 행을 분리
    const lines = textData.trim().split('\n');
    
    if (lines.length < 2) {
      console.error('Invalid data format: insufficient lines');
      return { error: 'Invalid data format' };
    }
    
    // 첫 번째 행은 헤더
    const headerLine = lines[0];
    // 두 번째 행은 데이터
    const dataLine = lines[1];
    
    console.log('Header line:', headerLine);
    console.log('Data line:', dataLine);
    
    // 헤더와 데이터를 공백으로 분리
    const headers = headerLine.trim().split(/\s+/);
    const values = dataLine.trim().split(/\s+/);
    
    // 헤더와 값을 매핑하여 객체 생성
    const result = {};
    headers.forEach((header, index) => {
      if (index < values.length) {
        result[header] = values[index];
      }
    });
    
    // 일부 값을 숫자로 변환
    if (result.TA_Avg) result.ta_avg = parseFloat(result.TA_Avg);
    if (result.TA_Max) result.ta_max = parseFloat(result.TA_Max);
    if (result.TA_Min) result.ta_min = parseFloat(result.TA_Min);
    if (result.WS_Avg) result.ws_avg = parseFloat(result.WS_Avg);
    if (result.WS_Max) result.ws_max = parseFloat(result.WS_Max);
    if (result.WD_Max) result.wd_max = parseInt(result.WD_Max);
    
    // 관측소 정보 추가
    const location = WEATHER_LOCATIONS.find(loc => loc.stn === result.STN) || { name: '알 수 없음' };
    result.stnName = location.name;
    
    console.log('Parsed weather data:', result);
    return result;
  } catch (err) {
    console.error('Error parsing weather data:', err);
    return { 
      error: 'Failed to parse weather data',
      raw: textData.substring(0, 500) // 오류 분석을 위해 원본 데이터 일부 반환
    };
  }
} 