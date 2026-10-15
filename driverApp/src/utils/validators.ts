export function isValidEthiopianPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s-]/g, '');
  const ethiopianRegex = /^(?:\+251|251|0)?([79]\d{8})$/;
  return ethiopianRegex.test(cleaned);
}

export function normalizeEthiopianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  const match = cleaned.match(/^(?:\+251|251|0)?([79]\d{8})$/);
  if (!match) return phone;
  return `+251${match[1]}`;
}

export function isValidOtp(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}

export function isValidFaydaFan(fan: string): boolean {
  const clean = fan.replace(/[\s-]/g, '');
  return /^\d{16}$/.test(clean);
}

export function isValidFaydaFin(fin: string): boolean {
  const clean = fin.replace(/[\s-]/g, '');
  return /^[A-Za-z0-9]{10,16}$/.test(clean);
}
