export const validatePassword = (password: string): boolean => {
  if (!password) {
    return false;
  }

  return password.length >= 6;
};
