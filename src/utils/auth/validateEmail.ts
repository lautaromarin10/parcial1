export const validateEmail = (email: string): boolean => {
  const REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!email) {
    return false;
  }

  return Boolean(REGEX.test(email));
};
