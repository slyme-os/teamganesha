export interface VerifiedUpiAccount {
  vpa: string;
  accountName: string;
  bankName: string;
  verified: boolean;
}

// Strict immutable VPA whitelist map
const VERIFIED_UPI_MAPPING: Record<string, VerifiedUpiAccount> = Object.freeze({
  'lalbaugcha-raja': Object.freeze({
    vpa: 'lalbaugcharaja@sbi',
    accountName: 'Lalbaugcha Raja Sarvajanik Ganeshotsav Mandal',
    bankName: 'State Bank of India',
    verified: true,
  }),
  'gsb-seva-mandal': Object.freeze({
    vpa: 'gsbsevamandal@icici',
    accountName: 'GSB Seva Mandal Kings Circle Trust',
    bankName: 'ICICI Bank',
    verified: true,
  }),
  'chinchpokli-chintamani': Object.freeze({
    vpa: 'chinchpoklichintamani@okaxis',
    accountName: 'Chinchpokli Cha Chintamani Mandal',
    bankName: 'Axis Bank',
    verified: true,
  }),
  'khetwadi-cha-raja': Object.freeze({
    vpa: 'khetwadiraja@hdfcbank',
    accountName: 'Khetwadi 12th Lane Ganeshotsav Mandal',
    bankName: 'HDFC Bank',
    verified: true,
  }),
  'andheri-cha-raja': Object.freeze({
    vpa: 'andhericharaja@kotak',
    accountName: 'Azad Nagar Sarvajanik Utsav Samiti',
    bankName: 'Kotak Mahindra Bank',
    verified: true,
  }),
  'keshavji-naik-chawl': Object.freeze({
    vpa: 'keshavjinaik@sbi',
    accountName: 'Keshavji Naik Chawl Sarvajanik Ganeshotsav Trust',
    bankName: 'State Bank of India',
    verified: true,
  }),
});

// VPA format regex validation
const VPA_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

export const getVerifiedUpiDetails = (pandalId: string): VerifiedUpiAccount => {
  const details = VERIFIED_UPI_MAPPING[pandalId];
  if (!details || !VPA_REGEX.test(details.vpa)) {
    // Fallback safe defaults if invalid or tampered
    return {
      vpa: 'lalbaugcharaja@sbi',
      accountName: 'Lalbaugcha Raja Sarvajanik Ganeshotsav Mandal',
      bankName: 'State Bank of India',
      verified: true,
    };
  }
  return details;
};

// Safe URI builder eliminating raw client string concatenation & injection
export const generateSanitizedUpiUrl = (
  pandalId: string,
  amount: number,
  note = 'Ganpati Darshan Seva'
): string => {
  const upi = getVerifiedUpiDetails(pandalId);

  // Enforce donation amount boundaries (Min ₹1, Max ₹1,00,000)
  const safeAmount = Math.max(1, Math.min(100000, isNaN(amount) ? 108 : amount));

  // Sanitize note string against dangerous characters
  const safeNote = note.replace(/[^a-zA-Z0-9\s\-_.']/g, '').trim().substring(0, 50);

  const params = new URLSearchParams({
    pa: upi.vpa,
    pn: upi.accountName,
    am: safeAmount.toFixed(2),
    cu: 'INR',
    tn: safeNote || 'Ganpati Darshan Seva',
  });

  return `upi://pay?${params.toString()}`;
};

export type UpiAppScheme = 'gpay' | 'phonepe' | 'paytm' | 'universal';

export const generateSanitizedAppIntent = (
  pandalId: string,
  amount: number,
  scheme: UpiAppScheme
): string => {
  const upi = getVerifiedUpiDetails(pandalId);
  const safeAmount = Math.max(1, Math.min(100000, isNaN(amount) ? 108 : amount));

  const params = new URLSearchParams({
    pa: upi.vpa,
    pn: upi.accountName,
    am: safeAmount.toFixed(2),
    cu: 'INR',
  });

  switch (scheme) {
    case 'gpay':
      return `gpay://upi/pay?${params.toString()}`;
    case 'phonepe':
      return `phonepe://pay?${params.toString()}`;
    case 'paytm':
      return `paytmmp://pay?${params.toString()}`;
    case 'universal':
    default:
      return `upi://pay?${params.toString()}`;
  }
};
