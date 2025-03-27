import React, { useState, useEffect } from 'react';
import WildfireMap from '../components/WildfireMap';
// import WeatherInfo from '../components/WeatherInfo';
// import NewsSection from '../components/NewsSection';

const HomePage: React.FC = () => {
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  useEffect(() => {
    updateRefreshTime();
    
    // 5분마다 시간 업데이트
    const interval = setInterval(updateRefreshTime, 300000);
    return () => clearInterval(interval);
  }, []);

  const updateRefreshTime = () => {
    const now = new Date();
    const formattedTime = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours()}시 ${now.getMinutes()}분`;
    setLastRefreshed(formattedTime);
  };

  return (
    <div className="w-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">산불 대응 현황도</h1>
      </header>
      <div className="flex flex-wrap gap-5 items-start">
        <div className="flex-grow min-w-[65%]">
          <WildfireMap onDataRefresh={updateRefreshTime} />
        </div>
        {/* <div className="flex-1 min-w-[280px] max-w-xs flex flex-col sticky top-5 max-h-[calc(100vh-40px)]">
          <WeatherInfo />
          <NewsSection />
        </div> */}
      </div>
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>© 2025 산불 대응 현황도 | 데이터 출처: NASA FIRMS, 기상청 | 마지막 업데이트: {lastRefreshed}</p>
      </footer>
    </div>
  );
};

export default HomePage; 