export const toBengaliDigits = (num: number | string): string => {
  const bnDigits: { [key: string]: string } = {
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
  return num
    .toString()
    .split('')
    .map((char) => bnDigits[char] || char)
    .join('');
};

export const formatTimerTime = (totalSeconds: number, isBn: boolean = false): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const hh = h < 10 ? '0' + h : '' + h;
  const mm = m < 10 ? '0' + m : '' + m;
  const ss = s < 10 ? '0' + s : '' + s;

  const result = `${hh}:${mm}:${ss}`;
  return isBn ? toBengaliDigits(result) : result;
};

export const formatHumanDuration = (totalSeconds: number, isBn: boolean = false): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (isBn) {
    if (h > 0) {
      return `${toBengaliDigits(h)} ঘণ্টা ${toBengaliDigits(m)} মিনিট`;
    }
    if (m > 0) {
      return `${toBengaliDigits(m)} মিনিট ${toBengaliDigits(s)} সেকেন্ড`;
    }
    return `${toBengaliDigits(s)} সেকেন্ড`;
  }

  if (h > 0) {
    return `${h}h ${m}m`;
  }
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
};
