import React from 'react';

interface ColumnMapperProps {
  headers: string[];
  selectedNameIdx: number;
  selectedPhoneIdx: number;
  onNameIdxChange: (idx: number) => void;
  onPhoneIdxChange: (idx: number) => void;
}

const ColumnMapper: React.FC<ColumnMapperProps> = ({
  headers,
  selectedNameIdx,
  selectedPhoneIdx,
  onNameIdxChange,
  onPhoneIdxChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">عمود الاسم</label>
        <select 
          value={selectedNameIdx} 
          onChange={(e) => onNameIdxChange(Number(e.target.value))}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
        >
          <option value={-1}>اختر العمود...</option>
          {headers.map((header, idx) => (
            <option key={`name-${idx}`} value={idx}>{header || `Column ${idx + 1}`}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">عمود الهاتف</label>
        <select 
          value={selectedPhoneIdx} 
          onChange={(e) => onPhoneIdxChange(Number(e.target.value))}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
        >
          <option value={-1}>اختر العمود...</option>
          {headers.map((header, idx) => (
            <option key={`phone-${idx}`} value={idx}>{header || `Column ${idx + 1}`}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ColumnMapper;
