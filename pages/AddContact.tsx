
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BulkImportModal } from '../components/BulkImportModal';

interface CustomAttribute {
  id: string;
  name: string;
  value: string;
}

const AddContact = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'manual' | 'bulk'>('manual');
  const [isAddingAttribute, setIsAddingAttribute] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Manual Entry Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [countryCode, setCountryCode] = useState('+234'); // Default to Nigeria
  const [isSaving, setIsSaving] = useState(false);

  // Attribute State
  const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>([]);

  const addCustomAttributeRow = () => {
    setCustomAttributes([...customAttributes, {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      value: ''
    }]);
  };

  const updateAttribute = (id: string, field: 'name' | 'value', text: string) => {
    setCustomAttributes(customAttributes.map(attr =>
      attr.id === id ? { ...attr, [field]: text } : attr
    ));
  };

  const removeAttribute = (id: string) => {
    setCustomAttributes(customAttributes.filter(a => a.id !== id));
  };

  const handleSaveContact = async () => {
    if (!firstName || !lastName || !mobilePhone || !email) {
      alert("Please enter First Name, Last Name, Email, and Phone Number at a minimum.");
      return;
    }

    // Process custom attributes into a single JSON object
    const customFields: Record<string, string> = {};
    customAttributes.forEach(attr => {
      if (attr.name.trim() && attr.value.trim()) {
        customFields[attr.name.trim()] = attr.value.trim();
      }
    });

    // Remove leading zero from mobile phone if present
    const formattedMobile = mobilePhone.startsWith('0') ? mobilePhone.substring(1) : mobilePhone;

    const payload = [{
      "First Name": firstName,
      "Surname": lastName,
      "Email": email,
      "Mobile Phone": `${countryCode}${formattedMobile}`,
      "customFields": customFields
    }];

    setIsSaving(true);
    try {
      const response = await fetch('/api/workspaces/customers/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('msgscale_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customersData: payload })
      });

      if (response.ok) {
        navigate('/contacts');
      } else {
        const errorData = await response.json();
        alert(`Failed to save contact: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      alert("An error occurred while creating the contact.");
    } finally {
      setIsSaving(false);
    }
  };

  const clearForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setMobilePhone('');
    setCustomAttributes([]);
  };

  const downloadTemplate = () => {
    const headers = [
      'Customer Type', 'Customer External ID', 'Title', 'Surname', 'First Name',
      'Other Name', 'Full Name', 'Date of Birth', 'Gender', 'Nationality',
      'State of Origin', 'Residential State', 'Residential Town', 'Address', 'Mobile Phone',
      'BVN', 'NIN', 'Email', 'TIN', 'Education Level',
      'Occupation', 'Sector', 'Office', 'Office Phone', 'Office Address',
      'Next of Kin', 'Next of Kin Address', 'Next of Kin Phone', 'ID Card Type', 'ID Card No',
      'ID Issue Date', 'ID Expiry Date', 'Is PEP', 'PEP Details', 'External Created At'
    ];

    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "MsgScale_Contacts_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-background-dark overflow-hidden theme-transition font-display">
      {/* Page Header Area */}
      <div className="px-8 py-6 border-b border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark flex flex-col gap-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
          <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer" onClick={() => navigate('/')}>Workspace</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer" onClick={() => navigate('/contacts')}>Contacts</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-slate-900 dark:text-white">Add or Import</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Add or Import Contacts</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Manually add a single contact or upload a CSV file for bulk import.</p>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-700 dark:text-white text-sm font-bold hover:bg-slate-50 dark:hover:bg-opacity-80 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Download Template
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-border-dark flex gap-8">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-2 pb-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'manual' ? 'border-primary text-primary' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`flex items-center gap-2 pb-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'bulk' ? 'border-primary text-primary' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              Bulk Import
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {/* Left Content: Form */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'manual' ? (
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-8 shadow-sm dark:shadow-2xl transition-all">
                  <h3 className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-widest mb-8">Contact Details</h3>
                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSaveContact(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">First Name</label>
                        <input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-primary outline-none transition-all"
                          placeholder="e.g. Jane"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Last Name</label>
                        <input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-primary outline-none transition-all"
                          placeholder="e.g. Doe"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="jane.doe@company.com"
                        type="email"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
                      <div className="flex gap-3">
                        <div className="relative w-32 shrink-0">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="w-full appearance-none bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl pl-4 pr-10 py-3 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none transition-all font-medium"
                          >
                            <option value="+234">🇳🇬 +234</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                        </div>
                        <input
                          value={mobilePhone}
                          onChange={(e) => setMobilePhone(e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-primary outline-none transition-all"
                          placeholder="800 000 0000"
                          required
                        />
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-text-secondary uppercase tracking-widest opacity-60">Please ensure format follows E.164 standards for SMS delivery.</p>
                    </div>

                    {/* Option A: Inline Key-Value Custom Attributes */}
                    {customAttributes.length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-border-dark">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Custom Attributes</label>
                        {customAttributes.map(attr => (
                          <div key={attr.id} className="flex gap-4 items-center animate-[fadeIn_0.2s_ease-out]">
                            <input
                              value={attr.name}
                              onChange={(e) => updateAttribute(attr.id, 'name', e.target.value)}
                              className="flex-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-primary outline-none transition-all"
                              placeholder="Attribute Name (e.g. Birthday)"
                            />
                            <span className="text-slate-300 dark:text-slate-600 font-bold">:</span>
                            <input
                              value={attr.value}
                              onChange={(e) => updateAttribute(attr.id, 'value', e.target.value)}
                              className="flex-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-primary outline-none transition-all"
                              placeholder="Value (e.g. 10/10/1990)"
                            />
                            <button
                              onClick={() => removeAttribute(attr.id)}
                              className="text-slate-400 hover:text-red-500 p-2 transition-colors shrink-0"
                              title="Remove Attribute"
                            >
                              <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={addCustomAttributeRow}
                        className="text-primary text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        {customAttributes.length === 0 ? "Add Custom Attribute" : "Add Another"}
                      </button>
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-border-dark flex justify-end gap-4 mt-6">
                      <button
                        type="button"
                        onClick={clearForm}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-border-dark text-slate-500 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                      >
                        Clear Form
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-8 py-2.5 rounded-xl bg-primary text-white font-black text-sm hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <>
                            <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                            Saving...
                          </>
                        ) : (
                          "Save Contact"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark/20 p-16 flex flex-col items-center justify-center text-center animate-[fadeIn_0.3s_ease-out] transition-all">
                  <div className="p-5 rounded-full bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark mb-6 shadow-sm">
                    <span className="material-symbols-outlined text-[48px] text-slate-400">cloud_upload</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 italic">Click to upload or drag and drop</h4>
                  <p className="text-slate-500 text-sm max-w-sm font-medium">CSV, XLS, or XLSX. Ensure your file follows our template format.</p>
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="mt-8 px-8 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-700 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-[#232830] transition-all"
                  >
                    Select File
                  </button>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Bulk Import Tip */}
              <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6 space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-4xl text-primary">lightbulb</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">lightbulb</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Bulk Import Tip</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-text-secondary leading-relaxed font-medium">
                  Ensure your CSV has a header row. Columns like <span className="text-slate-900 dark:text-white font-bold">"Phone"</span> and <span className="text-slate-900 dark:text-white font-bold">"Email"</span> map automatically if named correctly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BULK IMPORT MODAL */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          navigate('/contacts');
        }}
      />
    </div>
  );
};

export default AddContact;
