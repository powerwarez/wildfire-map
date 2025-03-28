import React, { useState, useEffect } from 'react';
import { fetchWeatherData, WEATHER_LOCATIONS, WeatherData } from '../api/weatherApi';

const WeatherPanel: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('136'); // 기본값 안동
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeatherData(selectedLocation);
  }, [selectedLocation]);

  const loadWeatherData = async (stn: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchWeatherData(stn);
      setWeatherData(data);
    } catch (err) {
      console.error('날씨 데이터 로딩 오류:', err);
      setError('날씨 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 풍향을 문자열로 변환하는 함수
  const getWindDirectionString = (direction: number): string => {
    const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
    const index = Math.round(direction / 45) % 8;
    return directions[index];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 my-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">기상 정보</h2>
        <select 
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded text-sm"
        >
          {WEATHER_LOCATIONS.map((location) => (
            <option key={location.stn} value={location.stn}>
              {location.name}
            </option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          <p>{error}</p>
        </div>
      ) : !weatherData ? (
        <div className="text-center py-4 text-gray-500">
          <p>날씨 정보를 불러올 수 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-center bg-blue-50 rounded-lg p-3 mb-4">
            <h3 className="text-lg font-semibold text-blue-800">{weatherData.stnName}</h3>
            <p className="text-sm text-gray-600">관측일: {weatherData.tm}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">평균 기온</p>
              <p className="text-xl font-bold text-gray-700">{weatherData.ta_avg}°C</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">최고/최저 기온</p>
              <p className="text-lg font-bold">
                <span className="text-red-500">{weatherData.ta_max}°C</span> / 
                <span className="text-blue-500">{weatherData.ta_min}°C</span>
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between mb-2">
              <div>
                <p className="text-xs text-gray-500">평균 풍속</p>
                <p className="font-semibold">{weatherData.ws_avg} m/s</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">최대 풍속</p>
                <p className="font-semibold">{weatherData.ws_max} m/s ({weatherData.ws_max_tm})</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">최대 풍향</p>
              <p className="font-semibold">{getWindDirectionString(weatherData.wd_max)} ({weatherData.wd_max}°)</p>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button 
              onClick={() => loadWeatherData(selectedLocation)}
              className="px-4 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              새로고침
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherPanel; 