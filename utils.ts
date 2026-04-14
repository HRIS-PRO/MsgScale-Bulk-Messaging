
export const maskPhone = (phone: string, role: string | null) => {
  if (!phone) return '';
  const s = phone.trim();
  
  if (role !== 'User') {
    // For privileged roles, show with '+' if it's an international number
    if (s.startsWith('23') && s.length >= 10) return `+${s}`;
    return s;
  }
  
  if (s.length < 7) return '********';
  // Mask middle part: 0803***1234
  return s.slice(0, 4) + '****' + s.slice(-4);
};

export const maskEmail = (email: string, role: string | null) => {
  if (role !== 'User') return email;
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!domain) return '****';
  // Mask part of the username part of the email
  const maskedUser = user.length > 2 ? user.slice(0, 2) + '***' : '***';
  return maskedUser + '@' + domain;
};

export const maskSensitiveID = (val: string | undefined, role: string | null, label: string) => {
  if (!val) return null;
  if (role !== 'User') return `${label}: ${val}`;
  return `${label}: *******${val.slice(-4)}`;
};

export const formatDOB = (dob: string | null | undefined, role: string | null) => {
  if (!dob) return '';
  
  // Existing date parsing logic from platform
  let d: Date;
  if (!isNaN(Number(dob)) && Number(dob) > 1000) {
    const excelDays = Number(dob);
    d = new Date((excelDays - (excelDays > 59 ? 25569 : 25568)) * 86400 * 1000);
  } else {
    d = new Date(dob);
  }

  if (isNaN(d.getTime())) return dob;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');

  // Both for consistency and by request, show ONLY DD/MM for User role
  if (role === 'User') {
    return `${day}/${month}`;
  }
  
  return `${day}/${month}/${d.getFullYear()}`;
};
