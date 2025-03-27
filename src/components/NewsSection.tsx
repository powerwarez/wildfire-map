import React, { useState, useEffect } from 'react';
import { fetchWildfireNews, NaverNewsItem } from '../api/newsApi';

// 뉴스 아이템 인터페이스
interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

// 뉴스 섹션 컴포넌트
const NewsSection: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getWildfireNews = async () => {
      try {
        setLoading(true);
        const response = await fetchWildfireNews();
        
        // 네이버 API 응답을 NewsItem 형식으로 변환
        const formattedNews = response.items.map((item: NaverNewsItem) => {
          // HTML 태그 제거
          const cleanTitle = item.title.replace(/<\/?b>/g, '');
          
          // 날짜 포맷팅
          const pubDate = new Date(item.pubDate);
          const formattedDate = `${pubDate.getFullYear()}-${String(pubDate.getMonth() + 1).padStart(2, '0')}-${String(pubDate.getDate()).padStart(2, '0')}`;
          
          // 출처 추출 (도메인 이름 추출)
          let source = '출처 없음';
          try {
            const url = new URL(item.originallink || item.link);
            source = url.hostname.replace('www.', '');
          } catch (e) {
            console.log('URL 파싱 오류:', e);
          }
          
          return {
            title: cleanTitle,
            link: item.originallink || item.link,
            pubDate: formattedDate,
            source
          };
        });
        
        setNewsItems(formattedNews);
      } catch (err) {
        console.error('뉴스를 가져오는 중 오류 발생:', err);
        setError('뉴스를 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    };
    
    getWildfireNews();
  }, []);

  // 뉴스 아이템 렌더링
  const renderNewsItems = () => {
    if (loading) {
      return <p>뉴스를 불러오는 중...</p>;
    }
    
    if (newsItems.length === 0) {
      return <p>산불 관련 뉴스가 없습니다</p>;
    }
    
    return (
      <ul className="news-list">
        {newsItems.map((item, index) => (
          <li key={index} className="news-item">
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-title">
              {item.title}
            </a>
            <div className="news-meta">
              <span className="news-source">{item.source}</span>
              <span className="news-date">{item.pubDate}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="news-section">
      <h2>경북 산불 관련 뉴스</h2>
      {renderNewsItems()}
    </div>
  );
};

export default NewsSection; 