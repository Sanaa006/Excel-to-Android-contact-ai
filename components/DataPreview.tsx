import React from 'react';
import { Contact } from '../types';
import { Edit2, Check, Trash2 } from 'lucide-react';

interface DataPreviewProps {
  contacts: Contact[];
  onUpdateContact: (id: number, field: 'name' | 'phone', value: string) => void;
  onRemoveContact: (id: number) => void;
}

const DataPreview: React.FC<DataPreviewProps> = ({ contacts, onUpdateContact, onRemoveContact }) => {
  return (
    <div className="w-full bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">معاينة البيانات ({contacts.length})</h3>
        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">يمكنك تعديل البيانات أدناه قبل التصدير</span>
      </div>
      
      <div className="overflow-x-auto max-h-[500px] scrollbar-thin">
        <table className="w-full text-sm text-right">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 text-right">الاسم</th>
              <th scope="col" className="px-6 py-3 text-right">رقم الهاتف</th>
              <th scope="col" className="px-6 py-3 text-center w-20">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="bg-white border-b hover:bg-gray-50 group">
                <td className="px-6 py-3">
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => onUpdateContact(contact.id, 'name', e.target.value)}
                    className="w-full bg-transparent border-b border-transparent focus:border-primary focus:outline-none focus:bg-white transition-colors py-1"
                  />
                </td>
                <td className="px-6 py-3" dir="ltr">
                   <input
                    type="text"
                    value={contact.phone}
                    onChange={(e) => onUpdateContact(contact.id, 'phone', e.target.value)}
                    className="w-full bg-transparent border-b border-transparent focus:border-primary focus:outline-none focus:bg-white transition-colors py-1 text-right"
                  />
                </td>
                <td className="px-6 py-3 text-center">
                  <button 
                    onClick={() => onRemoveContact(contact.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            
            {contacts.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  لا توجد بيانات صالحة للعرض. حاول اختيار أعمدة مختلفة.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataPreview;
