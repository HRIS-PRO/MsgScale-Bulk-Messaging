import React, { useState, useEffect } from 'react';

interface Contact {
    id: string;
    fullName: string;
    customerType: string;
    title: string;
    surname: string;
    firstName: string;
    otherName?: string;
    mobilePhone: string;
    email: string;
    dob?: string;
    gender?: string;
    residentialState?: string;
}

interface EditCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Contact;
    onSuccess: () => void;
}

const formatForDateInput = (isoString?: string) => {
    if (!isoString) return '';
    
    // Check if it's an Excel serial date (numeric string)
    if (!isNaN(Number(isoString)) && Number(isoString) > 1000) {
        const excelDays = Number(isoString);
        const d = new Date((excelDays - (excelDays > 59 ? 25569 : 25568)) * 86400 * 1000);
        if (!isNaN(d.getTime())) {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
    }

    const d = new Date(isoString);
    if (!isNaN(d.getTime())) {
         return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    
    return isoString.split('T')[0];
};

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ isOpen, onClose, customer, onSuccess }) => {
    const [formData, setFormData] = useState<Partial<Contact>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (customer) {
            // Explicitly exclude BVN and NIN from the initial state
            const { bvn, nin, ...safeData } = customer as any;
            
            if (safeData.dob) {
                safeData.dob = formatForDateInput(safeData.dob);
            }
            
            setFormData(safeData);
        }
    }, [customer]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/customers/${customer.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('msgscale_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                onSuccess();
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to update customer');
            }
        } catch (err) {
            setError('An error occurred while updating the customer');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-2xl animate-[zoomIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-border-dark flex items-center justify-between bg-slate-50 dark:bg-[#111722]/50 rounded-t-2xl">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight uppercase tracking-widest text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-xl">edit_square</span>
                            Edit Customer
                        </h3>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Modify contact details for {customer.firstName} {customer.surname}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-white transition-all focus:outline-none"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined">error</span>
                            {error}
                        </div>
                    )}

                    <form id="edit-customer-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Info Group */}
                        <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-200 dark:border-border-dark pb-2 mb-4 italic">Personal Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title</label>
                                    <input
                                        name="title"
                                        value={formData.title || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                                        placeholder="e.g. Mr, Mrs, Dr"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all appearance-none"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                                    <input
                                        name="firstName"
                                        value={formData.firstName || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Surname</label>
                                    <input
                                        name="surname"
                                        value={formData.surname || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Other Name</label>
                                    <input
                                        name="otherName"
                                        value={formData.otherName || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">DOB</label>
                                    <input
                                        name="dob"
                                        type="date"
                                        value={formData.dob || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Group */}
                        <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-200 dark:border-border-dark pb-2 mb-4 italic">Contact Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email <span className="text-red-500">*</span></label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mobile Phone <span className="text-red-500">*</span></label>
                                    <input
                                        name="mobilePhone"
                                        value={formData.mobilePhone || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Residential State</label>
                                    <input
                                        name="residentialState"
                                        value={formData.residentialState || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Note: Purposefully omitting BVN and NIN fields for security/privacy */}
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 p-3 rounded-xl flex items-start gap-3 mt-4">
                            <span className="material-symbols-outlined text-amber-500 text-lg">shield_lock</span>
                            <p className="text-[11px] text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                                <strong className="block uppercase tracking-widest text-[#92400e] dark:text-amber-500 text-[10px] mb-0.5 relative">Security Notice</strong>
                                Sensitive financial indicators like BVN and NIN are intentionally excluded from this interface to protect customer privacy and prevent unauthorized tampering. Please rely on origin systems of record for these specifics.
                            </p>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-border-dark bg-slate-50 dark:bg-[#111722]/50 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 rounded-xl text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="edit-customer-form"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="material-symbols-outlined text-[16px] animate-spin">autorenew</span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[16px]">save</span>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditCustomerModal;
