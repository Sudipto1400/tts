// Bengali Number and Text utilities

const BENGALI_DIGITS: { [key: string]: string } = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

export function toBengaliNumber(num: number | string): string {
  const str = String(num);
  return str.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[digit] || digit);
}

export function formatTimeBengali(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '০:০০';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  return `${toBengaliNumber(mins)}:${toBengaliNumber(formattedSecs)}`;
}

export function formatDateBengali(timestamp: number): string {
  const date = new Date(timestamp);
  const day = toBengaliNumber(date.getDate());
  const months = [
    'জানুয়ারি',
    'ফেব্রুয়ারি',
    'মার্চ',
    'এপ্রিল',
    'মে',
    'জুন',
    'জুলাই',
    'আগস্ট',
    'সেপ্টেম্বর',
    'অক্টোবর',
    'নভেম্বর',
    'ডিসেম্বর',
  ];
  const month = months[date.getMonth()];
  const year = toBengaliNumber(date.getFullYear());
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedMins = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const ampm = hours >= 12 ? 'বিকাল' : 'সকাল';
  const formattedHours = hours % 12 || 12;

  return `${day} ${month} ${year}, ${ampm} ${toBengaliNumber(formattedHours)}:${toBengaliNumber(formattedMins)}`;
}
