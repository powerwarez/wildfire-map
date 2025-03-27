# Supabase 설정 가이드

이 프로젝트는 교육기관 데이터를 저장하고 관리하기 위해 Supabase를 사용합니다.

## 1. Supabase 계정 생성 및 프로젝트 설정

1. [Supabase](https://supabase.com)에 접속하여 계정을 생성하거나 로그인합니다.
2. 새 프로젝트를 생성합니다.
3. 프로젝트가 생성되면 대시보드에서 프로젝트 URL과 익명 키를 복사합니다.
4. `.env` 파일에 다음 값을 설정합니다:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 2. 데이터베이스 테이블 생성

### 방법 1: SQL 에디터 사용

1. Supabase 대시보드에서 SQL 에디터로 이동합니다.
2. 새 쿼리를 생성합니다.
3. 이 프로젝트의 `supabase-schema.sql` 파일 내용을 복사하여 SQL 에디터에 붙여넣습니다.
4. 쿼리를 실행합니다.

### 방법 2: Supabase CLI 사용

1. [Supabase CLI](https://supabase.com/docs/reference/cli/introduction)를 설치합니다.
2. CLI를 사용하여 로그인합니다:
   ```
   supabase login
   ```
3. 프로젝트 설정:
   ```
   supabase link --project-ref your-project-id
   ```
4. SQL 파일 실행:
   ```
   supabase db execute --file supabase-schema.sql
   ```

## 3. 테이블 구조

교육기관(educational_institutions) 테이블은 다음 필드를 포함합니다:

- `id`: UUID (기본 키)
- `name`: TEXT (학교/기관 이름)
- `type`: TEXT (학교/기관 유형)
- `latitude`: FLOAT (위도)
- `longitude`: FLOAT (경도)
- `address`: TEXT (주소)
- `contact`: TEXT (연락처)
- `is_closed`: BOOLEAN (휴업 여부)
- `is_online_class`: BOOLEAN (온라인 수업 여부)
- `created_at`: TIMESTAMP (생성 시간)
- `updated_at`: TIMESTAMP (업데이트 시간)

## 4. API 사용 예시

```typescript
// 모든 교육기관 데이터 조회
import { fetchEducationalInstitutions } from './api/educationApi';

try {
  const institutions = await fetchEducationalInstitutions();
  console.log(institutions);
} catch (error) {
  console.error('교육기관 데이터를 불러오는데 실패했습니다:', error);
}

// 새 교육기관 추가
import { addEducationalInstitution } from './api/educationApi';
import { EducationalInstitutionType } from './types';

const newInstitution = {
  name: '새 학교',
  type: EducationalInstitutionType.ELEMENTARY_SCHOOL,
  latitude: 37.5665,
  longitude: 126.9780,
  address: '서울특별시 중구',
  isClosed: false,
  isOnlineClass: false
};

const result = await addEducationalInstitution(newInstitution);
```

## 5. 문제 해결

- 연결 오류가 발생할 경우 `.env` 파일의 URL과 키가 올바른지 확인하세요.
- 권한 문제가 있는 경우 Supabase 대시보드의 인증 설정과 RLS 정책을 확인하세요.
- 데이터베이스 연결 실패 시 애플리케이션은 오류 메시지를 표시합니다. 