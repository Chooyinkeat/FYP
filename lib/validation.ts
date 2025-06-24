// lib/validation.ts
export default class Validator {
  static isEmailValid(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static isPasswordStrong(password: string): boolean {
    // at least 8 chars, 1 upper, 1 lower, 1 number
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d@$!%*?&^#]{8,}$/;
    return regex.test(password);
  }

  static isContactNumberValid(contactNumber: string): boolean {
    const regex = /^\d{3}-?\d{7}$/; // Matches 3 digits, optional hyphen, followed by 7 digits
    return regex.test(contactNumber);
  }
}
