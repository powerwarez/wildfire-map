import React from 'react';
import './App.css';
import WildfireMap from './components/WildfireMap';
import WeatherInfo from './components/WeatherInfo';
import NewsSection from './components/NewsSection';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>산불 지도</h1>
      </header>
      <div className="content-container">
        <div className="map-container">
          <WildfireMap />
        </div>
        <div className="info-sidebar">
          <WeatherInfo />
          <NewsSection />
        </div>
      </div>
      <footer>
        <p>© 2023 산불 지도 서비스 | 데이터 출처: NASA FIRMS, 기상청</p>
      </footer>
    </div>
  );
}

export default App;
