import React from 'react';
import { EducationalInstitutionType } from '../../types';

// 각 교육기관 타입별 커스텀 아이콘 URL
const SCHOOL_ICONS = {
  [EducationalInstitutionType.ELEMENTARY_SCHOOL]: {
    url: "https://maps.google.com/mapfiles/kml/shapes/schools.png",
    color: '#4CAF50' // 초록색
  },
  [EducationalInstitutionType.MIDDLE_SCHOOL]: {
    url: "https://maps.google.com/mapfiles/kml/shapes/homegardenbusiness.png",
    color: '#2196F3' // 파란색
  },
  [EducationalInstitutionType.HIGH_SCHOOL]: {
    url: "https://maps.google.com/mapfiles/kml/shapes/library.png",
    color: '#9C27B0' // 보라색
  },
  [EducationalInstitutionType.UNIVERSITY]: {
    url: "https://maps.google.com/mapfiles/kml/shapes/universities.png",
    color: '#F44336' // 빨간색
  },
  [EducationalInstitutionType.EDUCATION_OFFICE]: {
    url: "https://maps.google.com/mapfiles/kml/shapes/govtbldgs.png",
    color: '#FF9800' // 주황색
  }
};

interface LegendIconProps {
  type: EducationalInstitutionType;
}

const LegendIcon: React.FC<LegendIconProps> = ({ type }) => {
  const iconInfo = SCHOOL_ICONS[type];
  
  return (
    <div 
      className="w-5 h-5 inline-block bg-contain bg-center bg-no-repeat" 
      style={{ 
        backgroundImage: `url(${iconInfo.url})`,
      }}
    />
  );
};

export default LegendIcon; 