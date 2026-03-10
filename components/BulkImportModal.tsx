import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'upload' | 'preview' | 'importing' | 'summary';

const EXPECTED_FIELDS = [
    { key: 'customerType', label: 'Customer Type' },
    { key: 'customerExternalId', label: 'Customer Id' },
    { key: 'title', label: 'Title' },
    { key: 'surname', label: 'Surname' },
    { key: 'firstName', label: 'First Name' },
    { key: 'otherName', label: 'Other Name' },
    { key: 'fullName', label: 'Full Name' },
    { key: 'dob', label: 'DOB' },
    { key: 'gender', label: 'Gender' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'stateOfOrigin', label: 'State of Origin' },
    { key: 'residentialState', label: 'Residential State' },
    { key: 'residentialTown', label: 'Residential Town' },
    { key: 'address', label: 'Address' },
    { key: 'mobilePhone', label: 'Mobile Phone' },
    { key: 'bvn', label: 'BVN' },
    { key: 'nin', label: 'NIN' },
    { key: 'email', label: 'EMAIL' },
    { key: 'tin', label: 'TIN' },
    { key: 'educationLevel', label: 'Education Level' },
    { key: 'occupation', label: 'Occupation' },
    { key: 'sector', label: 'Sector' },
    { key: 'office', label: 'Office' },
    { key: 'officePhone', label: 'Office Phone' },
    { key: 'officeAddress', label: 'Office Address' },
    { key: 'nextOfKin', label: 'Next of Kin' },
    { key: 'nextOfKinAddress', label: 'Next of Kin Address' },
    { key: 'nextOfKinPhone', label: 'Next Of Kin Phone' },
    { key: 'idCardType', label: 'Id Card Type' },
    { key: 'idCardNo', label: 'Id Card No' },
    { key: 'idIssueDate', label: 'Id Issue Date' },
    { key: 'idExpiryDate', label: 'Id Expiry Date' },
    { key: 'isPep', label: 'Is Pep' },
    { key: 'pepDetails', label: 'Pep Details' },
    { key: 'externalCreatedAt', label: 'Created On' }
];

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [rawData, setRawData] = useState<any[]>([]);
    const [columnMap, setColumnMap] = useState<Record<string, string>>({});

    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [importSummary, setImportSummary] = useState({ added: 0, skipped: 0 });
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        setError(null);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

                if (data.length < 2) {
                    setError('File appears to be empty or missing data rows.');
                    return;
                }

                // Dynamically find the header row by looking for most matching columns
                let headerRowIndex = 0;
                let maxMatches = 0;
                for (let i = 0; i < Math.min(20, data.length); i++) {
                    const rowVals = (data[i] as any[]).filter(Boolean).map(String).map(s => s.toLowerCase().replace(/[^a-z]/g, ''));
                    let matches = 0;
                    EXPECTED_FIELDS.forEach(f => {
                        const cleanLabel = f.label.toLowerCase().replace(/[^a-z]/g, '');
                        if (rowVals.includes(cleanLabel)) {
                            matches++;
                        }
                    });
                    if (matches > maxMatches) {
                        maxMatches = matches;
                        headerRowIndex = i;
                    }
                }

                if (maxMatches === 0) {
                    setError('Could not detect template headers. Please ensure you are using the correct template.');
                    return;
                }

                const headers = data[headerRowIndex] as string[];
                const rows = XLSX.utils.sheet_to_json(ws, { range: headerRowIndex });

                setRawData(rows as any[]);

                // Auto-map if names match approximately (ignoring spaces/case)
                const initialMap: Record<string, string> = {};
                EXPECTED_FIELDS.forEach(field => {
                    const match = headers.find(h =>
                        h && typeof h === 'string' &&
                        h.toLowerCase().replace(/[^a-z]/g, '') === field.label.toLowerCase().replace(/[^a-z]/g, '')
                    );
                    if (match) initialMap[field.key] = match;
                });

                setColumnMap(initialMap);
                setStep('preview');
            } catch (err) {
                setError('Failed to parse Excel file. Ensure it is a valid .xlsx or .csv.');
            }
        };
        reader.readAsBinaryString(uploadedFile);
    };

    const executeImport = async () => {
        setStep('importing');
        setIsImporting(true);
        setImportProgress(0);

        // Build the mapped data payload
        const payload = rawData.map(row => {
            const mappedRecord: any = {};
            EXPECTED_FIELDS.forEach(field => {
                const fileColumn = columnMap[field.key];
                if (fileColumn && row[fileColumn] !== undefined) {
                    // Convert everything to string safely to avoid type issues on backend
                    let val = row[fileColumn];
                    if (val instanceof Date) {
                        val = val.toISOString();
                    }
                    mappedRecord[field.key] = String(val);
                }
            });
            return mappedRecord;
        });

        // Batching (200 at a time)
        const BATCH_SIZE = 200;
        const totalBatches = Math.ceil(payload.length / BATCH_SIZE);
        let totalAdded = 0;
        let totalSkipped = 0;

        for (let i = 0; i < totalBatches; i++) {
            const batch = payload.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

            try {
                const res = await fetch('/api/workspaces/customers/bulk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('msgscale_token')}`
                    },
                    body: JSON.stringify({ customersData: batch })
                });

                if (!res.ok) throw new Error('Batch import failed');

                const data = await res.json();
                totalAdded += (data.added || 0);
                totalSkipped += (data.skipped || 0);

                setImportProgress(Math.round(((i + 1) / totalBatches) * 100));
            } catch (err) {
                console.error('Import batch error:', err);
                // Continue but maybe log error
            }
        }

        setImportSummary({ added: totalAdded, skipped: totalSkipped });
        setIsImporting(false);
        setStep('summary');
    };

    const reset = () => {
        setStep('upload');
        setFile(null);
        setRawData([]);
        setColumnMap({});
        setError(null);
        setImportProgress(0);
    };

    const handleClose = () => {
        if (step === 'summary') {
            onSuccess();
        }
        reset();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleClose}></div>
            <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-2xl animate-[zoomIn_0.2s_ease-out] overflow-hidden flex flex-col max-h-[90vh]">

                <div className="px-6 py-5 border-b border-slate-100 dark:border-border-dark flex items-center justify-between bg-slate-50 dark:bg-[#111722]/50 shrink-0">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white italic uppercase tracking-widest text-sm">Bulk Import Contacts</h3>
                    <button
                        onClick={handleClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-background-dark hover:text-slate-600 dark:hover:text-white transition-all"
                        disabled={isImporting}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {step === 'upload' && (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <div className="size-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-3xl">upload_file</span>
                                </div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Upload Excel/CSV</h4>
                                <p className="text-sm text-slate-500 font-medium">Upload your contact list using the predefined template. Max 10,000 rows.</p>
                            </div>

                            <div
                                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-center group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                />
                                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2 group-hover:text-primary transition-colors">cloud_upload</span>
                                <p className="font-bold text-primary text-sm uppercase tracking-widest">Click to browse</p>
                                <p className="text-xs text-slate-500 mt-1">or drag and drop here</p>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <div className="size-16 rounded-2xl bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-3xl">visibility</span>
                                </div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Ready to Import</h4>
                                <p className="text-sm text-slate-500 font-medium">We found <strong className="text-slate-900 dark:text-white">{rawData.length}</strong> rows in your file.</p>
                            </div>

                            <div className="bg-slate-50 dark:bg-[#111722]/50 p-6 rounded-2xl border border-slate-200 dark:border-border-dark text-center">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    The system will automatically extract all 35 columns that match the template format. Duplicates (by Mobile Phone, Email, or Customer ID) will be automatically skipped.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 'importing' && (
                        <div className="py-12 text-center space-y-6">
                            <div className="size-20 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
                            <div>
                                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest italic mb-2">Importing...</h4>
                                <p className="text-slate-500">{importProgress}% Complete</p>
                            </div>
                            <div className="w-full max-w-md mx-auto h-2 bg-slate-100 dark:bg-border-dark rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${importProgress}%` }}></div>
                            </div>
                        </div>
                    )}

                    {step === 'summary' && (
                        <div className="py-8 text-center space-y-6">
                            <div className="size-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-4xl">task_alt</span>
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest italic mb-2">Import Complete!</h4>
                                <p className="text-slate-500">Your contacts have been successfully processed.</p>
                            </div>

                            <div className="flex justify-center gap-6 max-w-sm mx-auto p-6 bg-slate-50 dark:bg-[#111722]/50 rounded-2xl border border-slate-200 dark:border-border-dark">
                                <div className="text-center">
                                    <p className="text-3xl font-black text-green-500">{importSummary.added}</p>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">Added</p>
                                </div>
                                <div className="w-px bg-slate-200 dark:bg-border-dark"></div>
                                <div className="text-center">
                                    <p className="text-3xl font-black text-yellow-500">{importSummary.skipped}</p>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">Skipped (Duplicates)</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-[#111722]/50 shrink-0 flex justify-between">
                    <div>
                        {step === 'preview' && (
                            <button
                                onClick={() => reset()}
                                className="px-6 py-2.5 rounded-xl text-slate-500 font-black text-xs uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all"
                            >
                                Start Over
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {step !== 'importing' && step !== 'summary' && (
                            <button
                                onClick={handleClose}
                                className="px-6 py-2.5 rounded-xl text-slate-500 font-black text-xs uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                        )}

                        {step === 'preview' && (
                            <button
                                onClick={executeImport}
                                className="px-8 py-2.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:bg-blue-600 transition-all flex items-center gap-2"
                            >
                                Start Import <span className="p-[2px] rounded bg-white/20 text-[10px] leading-none">{rawData.length} rows</span>
                            </button>
                        )}

                        {step === 'summary' && (
                            <button
                                onClick={handleClose}
                                className="px-8 py-2.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:bg-blue-600 transition-all"
                            >
                                Done
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
