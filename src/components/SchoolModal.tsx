import React, { useState, useEffect } from 'react';
import { EducationalInstitution, EducationalInstitutionType } from '../types';
import { addEducationalInstitution, updateEducationalInstitution } from '../api/educationApi';

interface SchoolModalProps {
  school: EducationalInstitution | null;
  isAddMode: boolean;
  onClose: () => void;
  onSave: () => void;
}

const SchoolModal: React.FC<SchoolModalProps> = ({ school, isAddMode, onClose, onSave }) => {
  const defaultFormState: Omit<EducationalInstitution, 'id'> = {
    name: '',
    type: EducationalInstitutionType.ELEMENTARY_SCHOOL,
    latitude: 36.0,
    longitude: 128.0,
    address: '',
    contact: '',
    isClosed: false,
    isOnlineClass: false
  };

  const [formData, setFormData] = useState<Omit<EducationalInstitution, 'id'>>(defaultFormState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAddMode && school) {
      setFormData({
        name: school.name,
        type: school.type,
        latitude: school.latitude,
        longitude: school.longitude,
        address: school.address || '',
        contact: school.contact || '',
        isClosed: school.isClosed || false,
        isOnlineClass: school.isOnlineClass || false
      });
    } else {
      setFormData(defaultFormState);
    }
  }, [school, isAddMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'type') {
      setFormData({ ...formData, type: value as EducationalInstitutionType });
    } else if (name === 'latitude' || name === 'longitude') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (isAddMode) {
        await addEducationalInstitution(formData);
      } else if (school) {
        await updateEducationalInstitution(school.id, formData);
      }
      onSave();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isAddMode ? '교육기관 추가' : '교육기관 정보 수정'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                이름
              </label>
              <input 
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                유형
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value={EducationalInstitutionType.ELEMENTARY_SCHOOL}>초등학교</option>
                <option value={EducationalInstitutionType.MIDDLE_SCHOOL}>중학교</option>
                <option value={EducationalInstitutionType.HIGH_SCHOOL}>고등학교</option>
                <option value={EducationalInstitutionType.UNIVERSITY}>대학교</option>
                <option value={EducationalInstitutionType.EDUCATION_OFFICE}>교육청</option>
              </select>
            </div>
            
            <div className="flex mb-4">
              <div className="w-1/2 mr-2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="latitude">
                  위도
                </label>
                <input 
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="0.0001"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="w-1/2 ml-2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="longitude">
                  경도
                </label>
                <input 
                  type="number"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="0.0001"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                주소
              </label>
              <input 
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact">
                연락처
              </label>
              <input 
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <input 
                  type="checkbox"
                  id="isClosed"
                  name="isClosed"
                  checked={formData.isClosed}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700" htmlFor="isClosed">
                  휴업 여부
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox"
                  id="isOnlineClass"
                  name="isOnlineClass"
                  checked={formData.isOnlineClass}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700" htmlFor="isOnlineClass">
                  온라인 수업 여부
                </label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                disabled={isLoading}
              >
                취소
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    <span>저장 중...</span>
                  </div>
                ) : (
                  '저장'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchoolModal; 