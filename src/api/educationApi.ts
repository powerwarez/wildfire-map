import { EducationalInstitution, EducationalInstitutionType } from '../types';
import { supabase } from '../lib/supabase';

export const fetchEducationalInstitutions = async (): Promise<EducationalInstitution[]> => {
  try {
    const { data, error } = await supabase
      .from('educational_institutions')
      .select('*');
    
    if (error) {
      console.error('교육기관 데이터를 가져오는 중 오류 발생:', error);
      throw new Error('데이터베이스 로드에 오류가 있습니다.');
    }
    
    if (!data || data.length === 0) {
      console.warn('교육기관 데이터가 없습니다.');
      return [];
    }
    
    // Supabase의 데이터를 EducationalInstitution 타입으로 변환
    return data.map(item => ({
      id: item.id,
      name: item.name,
      type: mapToEducationalInstitutionType(item.type),
      latitude: item.latitude,
      longitude: item.longitude,
      address: item.address,
      contact: item.contact,
      isClosed: item.is_closed,
      isOnlineClass: item.is_online_class
    }));
  } catch (error) {
    console.error('교육기관 데이터를 가져오는 중 예외 발생:', error);
    throw new Error('데이터베이스 로드에 오류가 있습니다.');
  }
};

// 새로운 교육기관을 Supabase에 추가하는 함수
export const addEducationalInstitution = async (institution: Omit<EducationalInstitution, 'id'>): Promise<EducationalInstitution | null> => {
  try {
    // Supabase에 맞게 데이터 변환
    const supabaseData = {
      name: institution.name,
      type: institution.type.toString(),
      latitude: institution.latitude,
      longitude: institution.longitude,
      address: institution.address,
      contact: institution.contact,
      is_closed: institution.isClosed || false,
      is_online_class: institution.isOnlineClass || false
    };

    const { data, error } = await supabase
      .from('educational_institutions')
      .insert(supabaseData)
      .select()
      .single();
    
    if (error) {
      console.error('교육기관 추가 중 오류 발생:', error);
      return null;
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
      isOnlineClass: data.is_online_class
    };
  } catch (error) {
    console.error('교육기관 추가 중 예외 발생:', error);
    return null;
  }
};

// 교육기관 정보를 업데이트하는 함수
export const updateEducationalInstitution = async (
  id: string, 
  updates: Partial<Omit<EducationalInstitution, 'id'>>
): Promise<boolean> => {
  try {
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

    const { error } = await supabase
      .from('educational_institutions')
      .update(supabaseData)
      .eq('id', id);
    
    if (error) {
      console.error('교육기관 업데이트 중 오류 발생:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('교육기관 업데이트 중 예외 발생:', error);
    return false;
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