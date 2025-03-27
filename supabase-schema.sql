-- educational_institutions 테이블 생성
CREATE TABLE public.educational_institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  address TEXT,
  contact TEXT,
  is_closed BOOLEAN DEFAULT FALSE,
  is_online_class BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS(Row Level Security) 정책 설정
ALTER TABLE public.educational_institutions ENABLE ROW LEVEL SECURITY;

-- 익명 사용자에게 읽기 권한 부여
CREATE POLICY "Allow anonymous read access" 
ON public.educational_institutions 
FOR SELECT USING (true);

-- 초기 데이터 삽입
INSERT INTO public.educational_institutions (name, type, latitude, longitude, address, is_closed, is_online_class)
VALUES 
  ('포항초등학교', '초등학교', 36.0190, 129.3435, '경상북도 포항시 남구 충현로 65', false, false),
  ('경주초등학교', '초등학교', 35.8562, 129.2129, '경상북도 경주시 태종로 665', true, true),
  ('안동초등학교', '초등학교', 36.5686, 128.7300, '경상북도 안동시 음식의길 170', false, false),
  ('포항중학교', '중학교', 36.0230, 129.3651, '경상북도 포항시 남구 희망대로 551', false, false),
  ('경주중학교', '중학교', 35.8427, 129.2164, '경상북도 경주시 계림로 90', true, true),
  ('안동중학교', '중학교', 36.5635, 128.7283, '경상북도 안동시 경동로 678', false, false),
  ('포항고등학교', '고등학교', 36.0167, 129.3595, '경상북도 포항시 남구 포스코대로 120', false, false),
  ('경주고등학교', '고등학교', 35.8390, 129.2110, '경상북도 경주시 태종로 757', true, true),
  ('안동고등학교', '고등학교', 36.5692, 128.7255, '경상북도 안동시 경동로 653', false, false),
  ('포항공과대학교', '대학교', 36.0114, 129.3222, '경상북도 포항시 남구 청암로 77', false, false),
  ('경주대학교', '대학교', 35.8024, 129.1977, '경상북도 경주시 태종로 188', true, true),
  ('안동대학교', '대학교', 36.5430, 128.7968, '경상북도 안동시 경동로 1375', false, false),
  ('경상북도교육청', '교육청', 36.5736, 128.5051, '경상북도 안동시 풍천면 도청대로 511', false, false),
  ('포항교육지원청', '교육청', 36.0431, 129.3588, '경상북도 포항시 북구 삼흥로 416', false, false),
  ('경주교육지원청', '교육청', 35.8563, 129.2244, '경상북도 경주시 동천동 307-10', false, false); 