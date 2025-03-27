export interface WildfireData {
    id: string;
    latitude: number;
    longitude: number;
    name?: string;
    intensity?: number;
    dateReported?: string;
    acresBurned?: number;
    containment?: number;
  }

export enum EducationalInstitutionType {
  ELEMENTARY_SCHOOL = '초등학교',
  MIDDLE_SCHOOL = '중학교',
  HIGH_SCHOOL = '고등학교',
  UNIVERSITY = '대학교',
  EDUCATION_OFFICE = '교육청'
}

export interface EducationalInstitution {
  id: string;
  name: string;
  type: EducationalInstitutionType;
  latitude: number;
  longitude: number;
  address?: string;
  contact?: string;
  isClosed?: boolean;
  isOnlineClass?: boolean;
  createdAt?: string;
  updatedAt?: string;
  note?: string;
}