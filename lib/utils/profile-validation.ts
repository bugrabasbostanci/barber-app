// Profile validation and formatting utilities

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateName = (name: string): boolean => {
  const trimmedName = name.trim();
  const nameRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]{2,50}$/;
  return trimmedName.length >= 2 && nameRegex.test(trimmedName);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatNameInput = (value: string): string => {
  return value.replace(/[^a-zA-ZçğıöşüÇĞIİÖŞÜ\s]/g, '').slice(0, 50);
};

export const formatPhoneInput = (value: string): string => {
  const cleaned = value.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+90')) {
    const digits = cleaned.slice(3);
    if (digits.length <= 10) {
      return '+90 ' + digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4').trim();
    }
    return '+90 ' + digits.slice(0, 10).replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4').trim();
  }
  
  if (cleaned.startsWith('0')) {
    const digits = cleaned.slice(1);
    if (digits.length <= 10) {
      return '0' + digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4').trim();
    }
    return '0' + digits.slice(0, 10).replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4').trim();
  }
  
  const digits = cleaned.slice(0, 10);
  return digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4').trim();
};