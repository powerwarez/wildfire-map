import React, { useState, useEffect } from 'react';

interface WeatherData {
  date: string;
  region: string;
  temperature: string;
  windSpeed: string;
  windDirection: string;
  humidity: string;
  specialNote: string;
}

const WeatherInfo: React.FC = () => {
  const [weatherData] = useState<WeatherData>({
    date: new Date().toLocaleDateString(),
    region: '경상북도 안동시',
    temperature: '15°C',
    windSpeed: '3 m/s',
    windDirection: '북서풍',
    humidity: '45%',
    specialNote: '대체로 맑음, 바람 약간 강함. 건조 주의.'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 실제로는 기상청 API를 호출하여 정보를 가져와야 합니다.
  // 현재는 더미 데이터를 사용하고 있습니다.
  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      try {
        // 실제 API 호출 코드로 대체 필요
        // API 키 관리 주의 필요
        // const response = await axios.get('https://api.weather.example/forecast', {
        //   params: {
        //     region: '경상북도',
        //     format: 'json'
        //   }
        // });
        // setWeatherData(response.data);
        
        // 실제 데이터 로딩을 시뮬레이션
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        setError('날씨 정보를 불러오는데 실패했습니다.');
        setLoading(false);
        console.error('날씨 데이터 로딩 에러:', error);
      }
    };

    fetchWeatherData();
  }, []);

  if (loading) return <div className="p-4 text-center">날씨 정보 로딩 중...</div>;
  if (error) return <div className="p-3 bg-red-50 text-red-700 rounded-md text-center">{error}</div>;

  return (
    <div className="mb-5 overflow-auto max-h-[300px]">
      <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">경북 날씨 정보</h3>
          <button className="bg-transparent border-none cursor-pointer text-lg" onClick={() => window.location.reload()}>
            <span role="img" aria-label="새로고침">🔄</span>
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm"><span className="font-medium">지역:</span> {weatherData.region}</p>
          <p className="text-sm"><span className="font-medium">기온:</span> {weatherData.temperature}</p>
          <p className="text-sm"><span className="font-medium">풍속:</span> {weatherData.windSpeed}</p>
          <p className="text-sm"><span className="font-medium">풍향:</span> {weatherData.windDirection}</p>
          <p className="text-sm"><span className="font-medium">습도:</span> {weatherData.humidity}</p>
        </div>

        <div className="mt-3 p-2.5 bg-yellow-50 rounded-md">
          <p className="text-sm"><span className="font-medium">특이사항:</span> {weatherData.specialNote}</p>
        </div>

        <div className="mt-3 text-center text-xs text-gray-500">
          <p>
            <span role="img" aria-label="주의">⚠️</span> 
            실제 날씨는 기상청 API 등을 연동해야 합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherInfo; 