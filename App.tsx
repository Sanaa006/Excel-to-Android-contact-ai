import React, { useState, useCallback, useMemo } from 'react';
import { FileSpreadsheet, Download, ArrowRight, Smartphone, Sparkles, UserCheck } from 'lucide-react';
import FileUploader from './components/FileUploader';
import ColumnMapper from './components/ColumnMapper';
import DataPreview from './components/DataPreview';
import { Contact, RawExcelData, AppStep } from './types';
import { parseExcelFile, generateVCardContent, downloadFile } from './services/utils';
import { analyzeExcelColumns } from './services/gemini';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [rawData, setRawData] = useState<RawExcelData | null>(null);
  const [nameColIdx, setNameColIdx] = useState<number>(-1);
  const [phoneColIdx, setPhoneColIdx] = useState<number>(-1);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analyze and map columns initially
  const handleFileSelect = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const data = await parseExcelFile(file);
      setRawData(data);

      // Use Gemini to guess the columns
      const mapping = await analyzeExcelColumns(data.headers, data.rows);
      
      // Set the indices based on AI guess or fallback
      if (mapping.nameIndex >= 0) setNameColIdx(mapping.nameIndex);
      if (mapping.phoneIndex >= 0) setPhoneColIdx(mapping.phoneIndex);
      
      setStep(AppStep.REVIEW);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("حدث خطأ أثناء قراءة الملف. تأكد من أن الملف سليم.");
      setStep(AppStep.UPLOAD);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate contact list based on selected columns
  const processedContacts = useMemo(() => {
    if (!rawData || nameColIdx === -1 || phoneColIdx === -1) return [];
    
    return rawData.rows.map((row, index) => {
      const name = row[nameColIdx] ? String(row[nameColIdx]).trim() : '';
      const phone = row[phoneColIdx] ? String(row[phoneColIdx]).trim() : '';
      
      // Filter out empty rows
      if (!name && !phone) return null;

      return {
        id: index,
        name,
        phone,
        originalRow: row
      } as Contact;
    }).filter(Boolean) as Contact[];
  }, [rawData, nameColIdx, phoneColIdx]);

  // Sync processed contacts to local state for editing
  React.useEffect(() => {
    setContacts(processedContacts);
  }, [processedContacts]);

  const handleUpdateContact = (id: number, field: 'name' | 'phone', value: string) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleRemoveContact = (id: number) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleExport = () => {
    if (contacts.length === 0) return;
    const vcardContent = generateVCardContent(contacts);
    downloadFile(vcardContent, 'contacts_android.vcf', 'text/vcard');
    setStep(AppStep.EXPORT);
  };

  const resetApp = () => {
    setStep(AppStep.UPLOAD);
    setRawData(null);
    setContacts([]);
    setNameColIdx(-1);
    setPhoneColIdx(-1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-right">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-lg">
              <Smartphone size={20} />
            </div>
            <h1 className="font-bold text-xl text-gray-800">محول جهات الاتصال</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className={step === AppStep.UPLOAD ? 'text-primary font-bold' : ''}>رفع الملف</span>
            <ArrowRight size={14} className="text-gray-300" />
            <span className={step === AppStep.REVIEW ? 'text-primary font-bold' : ''}>مراجعة</span>
            <ArrowRight size={14} className="text-gray-300" />
            <span className={step === AppStep.EXPORT ? 'text-primary font-bold' : ''}>تصدير</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8">
        
        {/* Welcome / Upload Section */}
        {step === AppStep.UPLOAD && (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <div className="text-center max-w-2xl mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                حول جداول Excel إلى جهات اتصال
                <br />
                <span className="text-primary">جاهزة لهاتفك الأندرويد</span>
              </h2>
              <p className="text-gray-600 text-lg">
                نستخدم الذكاء الاصطناعي لتحليل ملفاتك واستخراج الأسماء والأرقام بشكل تلقائي، لتوفير وقتك وجهدك.
              </p>
            </div>

            <FileUploader 
              onFileSelect={handleFileSelect} 
              isLoading={isAnalyzing} 
            />
            
            {isAnalyzing && (
              <div className="mt-8 text-center animate-pulse flex flex-col items-center gap-2">
                <Sparkles className="text-primary w-6 h-6 animate-spin" />
                <p className="text-primary font-medium">جاري تحليل البيانات باستخدام الذكاء الاصطناعي...</p>
              </div>
            )}
          </div>
        )}

        {/* Review Section */}
        {step === AppStep.REVIEW && rawData && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <UserCheck className="text-secondary" />
                  مراجعة البيانات المستخرجة
                </h2>
                <p className="text-gray-500 mt-1">
                  قام الذكاء الاصطناعي بتحديد الأعمدة التالية. يمكنك تغييرها إذا لزم الأمر.
                </p>
              </div>
              <button 
                onClick={resetApp}
                className="text-sm text-gray-500 hover:text-red-600 underline"
              >
                إلغاء والبدء من جديد
              </button>
            </div>

            <ColumnMapper 
              headers={rawData.headers}
              selectedNameIdx={nameColIdx}
              selectedPhoneIdx={phoneColIdx}
              onNameIdxChange={setNameColIdx}
              onPhoneIdxChange={setPhoneColIdx}
            />

            <div className="mb-8">
              <DataPreview 
                contacts={contacts}
                onUpdateContact={handleUpdateContact}
                onRemoveContact={handleRemoveContact}
              />
            </div>

            <div className="flex justify-center pt-4">
               <button
                onClick={handleExport}
                disabled={contacts.length === 0 || nameColIdx === -1 || phoneColIdx === -1}
                className="flex items-center gap-3 bg-primary hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transform transition hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                <span>تصدير ملف جهات الاتصال (VCF)</span>
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {step === AppStep.EXPORT && (
           <div className="flex flex-col items-center justify-center py-16 animate-fade-in text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckBig size={40} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">تم التحميل بنجاح!</h2>
              <p className="text-gray-600 mb-8 max-w-md">
                تم إنشاء ملف <b>contacts_android.vcf</b>. قم بنقله إلى هاتفك وافتحه ليتم استيراد الأسماء تلقائياً.
              </p>
              <button 
                onClick={resetApp}
                className="text-primary hover:underline font-medium"
              >
                تحويل ملف آخر
              </button>
           </div>
        )}

      </main>

      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
        <p>تم التطوير باستخدام React و Google Gemini AI</p>
      </footer>
    </div>
  );
};

const CheckBig = ({ size }: { size: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default App;
