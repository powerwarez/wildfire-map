import React, { useEffect, useState } from 'react';
import { fetchEducationalInstitutions } from '../api/educationApi';
import { EducationalInstitution, EducationalInstitutionType } from '../types';
import SchoolModal from './SchoolModal';

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
      const data = await fetchEducationalInstitutions();
      setSchools(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '교육기관 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
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
    loadSchools(); // 목록 새로고침
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
        <strong className="font-bold">오류!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">교육기관 현황</h1>
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
            </div>
          </div>
        ))}
      </div>
      
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