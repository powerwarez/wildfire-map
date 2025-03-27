import React, { useEffect, useState } from 'react';
import { fetchEducationalInstitutions } from '../api/educationApi';
import { EducationalInstitution, EducationalInstitutionType } from '../types';
import SchoolModal from './SchoolModal';

// 캐시의 유효 시간 (5분)
const CACHE_EXPIRY_TIME = 5 * 60 * 1000;

const SchoolList: React.FC = () => {
  const [schools, setSchools] = useState<EducationalInstitution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<EducationalInstitution | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAddMode, setIsAddMode] = useState<boolean>(false);
  
  useEffect(() => {
    loadSchools();
  }, []);
  
  const loadSchools = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('학교 데이터 로딩 시작');
      
      // 캐시된 데이터 확인
      const cachedData = getCachedSchools();
      
      if (cachedData) {
        console.log('캐시된 학교 데이터 사용:', cachedData.length, '개의 데이터');
        setSchools(cachedData);
        setLoading(false);
        return;
      }
      
      // 캐시된 데이터가 없으면 API 호출
      const data = await fetchEducationalInstitutions();
      console.log('학교 데이터 로딩 완료:', data.length, '개의 데이터');
      
      // 데이터 저장 및 캐싱
      setSchools(data || []);
      cacheSchools(data);
    } catch (err) {
      console.error('학교 데이터 로딩 오류:', err);
      setError(err instanceof Error ? err.message : '교육기관 데이터를 불러오는데 실패했습니다.');
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };
  
  // 데이터 캐싱 함수
  const cacheSchools = (data: EducationalInstitution[]) => {
    try {
      const cacheData = {
        schools: data,
        timestamp: new Date().getTime()
      };
      localStorage.setItem('cachedSchools', JSON.stringify(cacheData));
      console.log('학교 데이터가 캐시되었습니다.');
    } catch (err) {
      console.error('학교 데이터 캐싱 오류:', err);
    }
  };
  
  // 캐시된 데이터 가져오기
  const getCachedSchools = (): EducationalInstitution[] | null => {
    try {
      const cachedDataStr = localStorage.getItem('cachedSchools');
      if (!cachedDataStr) return null;
      
      const cachedData = JSON.parse(cachedDataStr);
      const timestamp = cachedData.timestamp;
      const currentTime = new Date().getTime();
      
      // 캐시가 만료되었는지 확인
      if (currentTime - timestamp > CACHE_EXPIRY_TIME) {
        console.log('캐시된 데이터가 만료되었습니다.');
        localStorage.removeItem('cachedSchools');
        return null;
      }
      
      return cachedData.schools;
    } catch (err) {
      console.error('캐시된 데이터 불러오기 오류:', err);
      return null;
    }
  };
  
  // 캐시 비우기 및 새로고침
  const refreshData = async () => {
    try {
      localStorage.removeItem('cachedSchools');
      await loadSchools();
    } catch (err) {
      console.error('데이터 새로고침 오류:', err);
    }
  };
  
  const openAddModal = () => {
    setIsAddMode(true);
    setSelectedSchool(null);
    setIsModalOpen(true);
  };
  
  const openEditModal = (school: EducationalInstitution) => {
    setIsAddMode(false);
    setSelectedSchool(school);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSchool(null);
    setIsAddMode(false);
  };
  
  const handleSchoolSaved = () => {
    closeModal();
    refreshData(); // 캐시를 비우고 목록 새로고침
  };
  
  // 학교 유형별 색상
  const getTypeColor = (type: EducationalInstitutionType) => {
    switch (type) {
      case EducationalInstitutionType.ELEMENTARY_SCHOOL:
        return 'bg-green-100 text-green-800';
      case EducationalInstitutionType.MIDDLE_SCHOOL:
        return 'bg-blue-100 text-blue-800';
      case EducationalInstitutionType.HIGH_SCHOOL:
        return 'bg-purple-100 text-purple-800';
      case EducationalInstitutionType.UNIVERSITY:
        return 'bg-red-100 text-red-800';
      case EducationalInstitutionType.EDUCATION_OFFICE:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // 상태 표시 뱃지
  const getStatusBadge = (isClosed: boolean | undefined, isOnlineClass: boolean | undefined) => {
    if (isClosed) {
      return <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-red-100 text-red-800 ml-2">휴업 중</span>;
    } 
    if (isOnlineClass) {
      return <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 ml-2">온라인 수업</span>;
    }
    return <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-green-100 text-green-800 ml-2">정상 운영</span>;
  };
  
  // 날짜 포맷팅 함수
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '정보 없음';
    
    try {
      const date = new Date(dateString);
      
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        return '정보 없음';
      }
      
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}시 ${date.getMinutes()}분`;
    } catch (error) {
      console.error('날짜 형식 변환 오류:', error);
      return '정보 없음';
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">교육기관 현황</h1>
        <div className="flex space-x-2">
          <button
            onClick={refreshData}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            새로고침
          </button>
          <button
            onClick={openAddModal}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            학교/교육청 추가
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">데이터를 불러오는 중...</span>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <strong className="font-bold">오류!</strong>
          <span className="block sm:inline"> {error}</span>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg mt-2"
            onClick={loadSchools}
          >
            다시 시도
          </button>
        </div>
      ) : schools.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mt-4" role="alert">
          <span className="block sm:inline">표시할 교육기관 데이터가 없습니다.</span>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg mt-2"
            onClick={openAddModal}
          >
            교육기관 추가하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <div 
              key={school.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openEditModal(school)}
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(school.type)}`}>
                      {school.type}
                    </span>
                    {getStatusBadge(school.isClosed, school.isOnlineClass)}
                  </div>
                </div>
                <h2 className="text-xl font-semibold mt-3 mb-2">{school.name}</h2>
                <p className="text-gray-600 text-sm mb-4">{school.address}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{`${school.latitude.toFixed(4)}, ${school.longitude.toFixed(4)}`}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 flex justify-between items-center">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>마지막 업데이트: {formatDate(school.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isModalOpen && (
        <SchoolModal
          school={selectedSchool}
          isAddMode={isAddMode}
          onClose={closeModal}
          onSave={handleSchoolSaved}
        />
      )}
    </div>
  );
};

export default SchoolList; 