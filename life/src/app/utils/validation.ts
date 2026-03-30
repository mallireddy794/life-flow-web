export const validateEmail = (email: string): boolean => {
  // Enhanced pattern to match the user's requirements (blocking user@gmail, etc.)
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one number, one special character
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]).{8,}$/;
  return passwordPattern.test(password);
};

export const validatePhone = (phone: string): boolean => {
  // Exactly 10 digits
  const phonePattern = /^\d{10}$/;
  return phonePattern.test(phone);
};
