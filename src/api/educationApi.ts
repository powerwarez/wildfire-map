import { EducationalInstitution, EducationalInstitutionType } from '../types';
import { supabase } from '../lib/supabase';

// 데이터 항목 타입 정의
interface EducationalInstitutionData {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address: string;
  contact?: string;
  is_closed: boolean;
  is_online_class: boolean;
  created_at?: string;
  updated_at?: string;
  note?: string;
}

export const fetchEducationalInstitutions = async (): Promise<EducationalInstitution[]> => {
  try {
    console.log('Supabase 교육기관 데이터 요청 시작');
    
    // Supabase 클라이언트가 제대로 초기화되었는지 확인
    if (!supabase) {
      console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
      return [];
    }
    
    const { data, error } = await supabase
      .from('educational_institutions')
      .select('id, name, type, latitude, longitude, address, contact, is_closed, is_online_class, created_at, updated_at, note');
    
    if (error) {
      console.error('교육기관 데이터를 가져오는 중 오류 발생:', error);
      return []; // 오류 발생 시 빈 배열 반환
    }
    
    if (!data || data.length === 0) {
      console.warn('교육기관 데이터가 없습니다.');
      return [];
    }
    
    console.log(`Supabase에서 ${data.length}개의 교육기관 데이터 로드 완료`);
    
    // Supabase의 데이터를 EducationalInstitution 타입으로 변환
    return (data as EducationalInstitutionData[]).map(item => ({
      id: item.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
      name: item.name,
      type: mapToEducationalInstitutionType(item.type),
      latitude: item.latitude,
      longitude: item.longitude,
      address: item.address,
      contact: item.contact,
      isClosed: item.is_closed,
      isOnlineClass: item.is_online_class,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      note: item.note
    }));
  } catch (error) {
    console.error('교육기관 데이터를 가져오는 중 예외 발생:', error);
    return []; // 예외 발생 시 빈 배열 반환
  }
};

// 새로운 교육기관을 Supabase에 추가하는 함수
export const addEducationalInstitution = async (institution: Omit<EducationalInstitution, 'id'>): Promise<EducationalInstitution | null> => {
  try {
    // Supabase 클라이언트가 제대로 초기화되었는지 확인
    if (!supabase) {
      console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
      throw new Error('데이터베이스 연결에 실패했습니다.');
    }
    
    // Supabase에 맞게 데이터 변환
    const supabaseData = {
      name: institution.name,
      type: institution.type.toString(),
      latitude: institution.latitude,
      longitude: institution.longitude,
      address: institution.address,
      contact: institution.contact,
      is_closed: institution.isClosed || false,
      is_online_class: institution.isOnlineClass || false,
      note: institution.note
    };

    const { data, error } = await supabase
      .from('educational_institutions')
      .insert(supabaseData)
      .select()
      .single();
    
    if (error) {
      console.error('교육기관 추가 중 오류 발생:', error);
      throw new Error(error.message);
    }
    
    if (!data) {
      throw new Error('교육기관 추가 후 데이터를 받아오지 못했습니다.');
    }
    
    return {
      id: data.id,
      name: data.name,
      type: mapToEducationalInstitutionType(data.type),
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      contact: data.contact,
      isClosed: data.is_closed,
      isOnlineClass: data.is_online_class,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      note: data.note
    };
  } catch (error) {
    console.error('교육기관 추가 중 예외 발생:', error);
    throw error; // 상위 컴포넌트에서 처리할 수 있도록 오류 전파
  }
};

// 교육기관 정보를 업데이트하는 함수
export const updateEducationalInstitution = async (
  id: string, 
  updates: Partial<Omit<EducationalInstitution, 'id'>>
): Promise<boolean> => {
  try {
    // Supabase 클라이언트가 제대로 초기화되었는지 확인
    if (!supabase) {
      console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
      throw new Error('데이터베이스 연결에 실패했습니다.');
    }
    
    // Supabase에 맞게 데이터 변환
    const supabaseData: Record<string, string | number | boolean> = {};
    
    if (updates.name) supabaseData.name = updates.name;
    if (updates.type) supabaseData.type = updates.type.toString();
    if (updates.latitude) supabaseData.latitude = updates.latitude;
    if (updates.longitude) supabaseData.longitude = updates.longitude;
    if (updates.address) supabaseData.address = updates.address;
    if (updates.contact) supabaseData.contact = updates.contact;
    if (updates.isClosed !== undefined) supabaseData.is_closed = updates.isClosed;
    if (updates.isOnlineClass !== undefined) supabaseData.is_online_class = updates.isOnlineClass;
    if (updates.note !== undefined) supabaseData.note = updates.note;

    const { error } = await supabase
      .from('educational_institutions')
      .update(supabaseData)
      .eq('id', id);
    
    if (error) {
      console.error('교육기관 업데이트 중 오류 발생:', error);
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error('교육기관 업데이트 중 예외 발생:', error);
    throw error; // 상위 컴포넌트에서 처리할 수 있도록 오류 전파
  }
};

// 학교 유형을 enum으로 변환하는 함수
const mapToEducationalInstitutionType = (type: string): EducationalInstitutionType => {
  switch (type) {
    case '초등학교':
      return EducationalInstitutionType.ELEMENTARY_SCHOOL;
    case '중학교':
      return EducationalInstitutionType.MIDDLE_SCHOOL;
    case '고등학교':
      return EducationalInstitutionType.HIGH_SCHOOL;
    case '대학교':
      return EducationalInstitutionType.UNIVERSITY;
    case '교육청':
      return EducationalInstitutionType.EDUCATION_OFFICE;
    default:
      return EducationalInstitutionType.ELEMENTARY_SCHOOL;
  }
}; 