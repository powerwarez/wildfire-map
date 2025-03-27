import axios from 'axios';

// 네이버 검색 API 응답 타입 정의
export interface NaverNewsItem {
  title: string;       // 뉴스 제목
  originallink: string; // 원본 뉴스 URL
  link: string;        // 네이버 뉴스 URL
  description: string; // 뉴스 설명
  pubDate: string;     // 발행 날짜
}

export interface NaverNewsResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverNewsItem[];
}

// 기본 API 설정
const api = axios.create({
  baseURL: 'https://openapi.naver.com/v1/search',
  headers: {
    'X-Naver-Client-Id': import.meta.env.VITE_NAVER_CLIENT_ID || '',
    'X-Naver-Client-Secret': import.meta.env.VITE_NAVER_CLIENT_SECRET || ''
  }
});

// 개발용 프록시 설정 (CORS 문제 해결)
// 실제 서비스에서는 백엔드 서버를 통해 API를 호출해야 합니다
const useProxy = true;

// 뉴스 검색 API
export const fetchNews = async (query: string, display: number = 5): Promise<NaverNewsResponse> => {
  try {
    if (useProxy) {
      // 개발 환경에서는 더미 데이터 반환
      console.log(`네이버 API 검색 요청 (프록시): ${query}, 표시 개수: ${display}`);
      return {
        lastBuildDate: new Date().toString(),
        total: 5,
        start: 1,
        display: 5,
        items: [
          {
            title: '[속보] 경북 안동시 산불 발생... 진화 작업 중',
            originallink: 'https://example.com/news/1',
            link: 'https://news.naver.com/1',
            description: '경북 안동시에서 발생한 산불이 현재 진화 중입니다.',
            pubDate: new Date().toString()
          },
          {
            title: '경북 산불 진화율 60%... "건조한 날씨로 인해 어려움 겪어"',
            originallink: 'https://example.com/news/2',
            link: 'https://news.naver.com/2',
            description: '경북 지역의 산불 진화율이 60%에 도달했습니다.',
            pubDate: new Date(Date.now() - 86400000).toString() // 1일 전
          },
          {
            title: '경북 산림청, 산불 예방을 위한 대책 발표',
            originallink: 'https://example.com/news/3',
            link: 'https://news.naver.com/3',
            description: '경북 산림청이 산불 예방 대책을 발표했습니다.',
            pubDate: new Date(Date.now() - 172800000).toString() // 2일 전
          },
          {
            title: '경북도지사 "산불 피해 복구에 모든 행정력 집중할 것"',
            originallink: 'https://example.com/news/4',
            link: 'https://news.naver.com/4',
            description: '경북도지사가 산불 피해 복구에 행정력을 집중하겠다고 밝혔습니다.',
            pubDate: new Date(Date.now() - 172800000).toString() // 2일 전
          },
          {
            title: '산불로 인한 대기질 악화... 인근 지역 주민 건강 유의',
            originallink: 'https://example.com/news/5',
            link: 'https://news.naver.com/5',
            description: '산불로 인한 대기질 악화로 주민들의 건강이 우려됩니다.',
            pubDate: new Date(Date.now() - 259200000).toString() // 3일 전
          }
        ]
      };
    } else {
      // 실제 API 호출
      const response = await api.get('/news', {
        params: {
          query,
          display,
          sort: 'date' // 최신순 정렬
        }
      });
      return response.data;
    }
  } catch (error) {
    console.error('네이버 뉴스 API 호출 오류:', error);
    throw error;
  }
};

// 경북 산불 관련 뉴스 가져오기
export const fetchWildfireNews = async (region: string = '경북'): Promise<NaverNewsResponse> => {
  return fetchNews(`${region} 산불`, 5);
}; 