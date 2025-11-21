import { read, utils } from 'xlsx';
import { Contact } from '../types';

export const parseExcelFile = async (file: File): Promise<{ headers: string[], rows: any[][] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          reject(new Error("The file appears to be empty."));
          return;
        }

        const headers = (jsonData[0] as string[]) || [];
        const rows = jsonData.slice(1) as any[][];

        resolve({ headers, rows });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const generateVCardContent = (contacts: Contact[]): string => {
  let vcardString = '';

  contacts.forEach((contact) => {
    // Basic clean up for phone number
    const cleanPhone = contact.phone.replace(/[^0-9+]/g, '');

    if (contact.name && cleanPhone) {
      vcardString += 'BEGIN:VCARD\n';
      vcardString += 'VERSION:3.0\n';
      vcardString += `FN:${contact.name}\n`;
      vcardString += `N:;${contact.name};;;\n`;
      vcardString += `TEL;TYPE=CELL:${cleanPhone}\n`;
      vcardString += 'END:VCARD\n';
    }
  });

  return vcardString;
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
