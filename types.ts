export interface Contact {
  id: number;
  name: string;
  phone: string;
  originalRow: any[];
}

export interface ColumnMapping {
  nameIndex: number;
  phoneIndex: number;
  confidence: number;
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  REVIEW = 'REVIEW',
  EXPORT = 'EXPORT',
}

export interface RawExcelData {
  headers: string[];
  rows: any[][];
}
