export type LanguageCode = 'en' | 'am' | 'or' | 'ti';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'am', label: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
  { code: 'or', label: 'Afaan Oromoo', nativeName: 'Afaan Oromoo', flag: '🇪🇹' },
  { code: 'ti', label: 'Tigrinya', nativeName: 'ትግርኛ', flag: '🇪🇹' },
];

export type TranslationKeys = {
  // Common
  common: {
    appName: string;
    cancel: string;
    confirm: string;
    save: string;
    close: string;
    continue: string;
    back: string;
    loading: string;
    error: string;
    success: string;
    retry: string;
    all: string;
    search: string;
    accept: string;
  };
  // Auth
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    loginSubDescription: string;
    phoneLabel: string;
    phonePlaceholder: string;
    quickNetwork: string;
    termsNotice: string;
    getOtpBtn: string;
    verifyOtpTitle: string;
    verifyOtpSubtitle: string;
    otpSentTo: string;
    enterCode: string;
    resendIn: string;
    resendSms: string;
    resendTelegram: string;
    didntReceive: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    fullNameHelper: string;
    verifyAndContinue: string;
    supportLine: string;
    support: string;
    shieldProtected: string;
    networkLabel: string;
    carrierEthio: string;
    carrierSafari: string;
    motApproved: string;
    customerRoleBadge: string;
    driverRoleBadge: string;
    featureParcelTitle: string;
    featureParcelDesc: string;
    featureFaydaCustomerTitle: string;
    featureFaydaCustomerDesc: string;
    featurePaymentTitle: string;
    featurePaymentDesc: string;
    featureFleetTitle: string;
    featureFleetDesc: string;
    featureFaydaDriverTitle: string;
    featureFaydaDriverDesc: string;
    featureTelebirrPayoutTitle: string;
    featureTelebirrPayoutDesc: string;
    smsGatewayActive: string;
    courierLineActive: string;
    securityShieldLabel: string;
    licensedTransport: string;
    driverSafetyProtocol: string;
    editPhone: string;
    readyToResend: string;
    agreePrefix: string;
    termsOfService: string;
    andText: string;
    privacyPolicy: string;
    termsRequiredError: string;
    sampleTermsLink: string;
  };
  // Home & Delivery (Customer)
  delivery: {
    homeBadge: string;
    whereSending: string;
    instantCourier: string;
    pickupLocation: string;
    pickupPlaceholder: string;
    dropoffLocation: string;
    dropoffPlaceholder: string;
    senderDetails: string;
    receiverDetails: string;
    recipientName: string;
    recipientPhone: string;
    packageType: string;
    documents: string;
    parcel: string;
    food: string;
    fragile: string;
    fleetSelect: string;
    standardMoto: string;
    standardMotoDesc: string;
    electricMoto: string;
    electricMotoDesc: string;
    paymentMethod: string;
    telebirr: string;
    cash: string;
    cbeBirr: string;
    estimatedFare: string;
    distance: string;
    eta: string;
    requestCourier: string;
    liveTracking: string;
    securityOtp: string;
    securityOtpNote: string;
    routeAndPackage: string;
    changeBtn: string;
    readyForDispatch: string;
    gpsMonitored: string;
    willReceiveOtp: string;
    zeroEmission: string;
    heavyParcel: string;
    cashOnDelivery: string;
    freeCancellation: string;
    courierBoxSecured: string;
  };
  // Driver Duty (Driver App)
  driver: {
    pilotTitle: string;
    dutyStatus: string;
    online: string;
    offline: string;
    goOnlinePrompt: string;
    stayOnlinePrompt: string;
    todayEarnings: string;
    shiftTrips: string;
    acceptanceRate: string;
    priorityScore: string;
    targetProgress: string;
    serviceWallet: string;
    recharge: string;
    surgeNotice: string;
    emergencySos: string;
    emergencyAlert: string;
    activeDeliveries: string;
    acceptOrder: string;
    declineOrder: string;
    findingRequests: string;
    shiftPaused: string;
    onDutyHours: string;
    activeShift: string;
    goldPilot: string;
    activeStatus: string;
    emergencyLine: string;
  };
  // Fayda Digital ID
  fayda: {
    cardTitle: string;
    cardSub: string;
    verifiedBadge: string;
    unverifiedBadge: string;
    fanLabel: string;
    finLabel: string;
    verifyNow: string;
    verificationDesc: string;
    sandboxOtpHelper: string;
    verifyButton: string;
  };
  // Tabs & Navigation
  navigation: {
    home: string;
    deliveries: string;
    notifications: string;
    profile: string;
  };
  // Notifications
  notifications: {
    title: string;
    emptyTitle: string;
    emptySubtitle: string;
    markAllRead: string;
    deliveryUpdate: string;
    systemAlert: string;
    securityAlert: string;
    allCaughtUp: string;
    unreadCountSuffix: string;
    filterUnread: string;
    filterOrders: string;
    filterSecurity: string;
    filterPayments: string;
  };
  // Profile & Settings
  profile: {
    title: string;
    editProfile: string;
    phone: string;
    role: string;
    faydaTitle: string;
    faydaVerified: string;
    faydaUnverified: string;
    faydaVerifyNow: string;
    faydaDesc: string;
    activeDevices: string;
    preferences: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    language: string;
    selectLanguage: string;
    notificationsToggle: string;
    termsAndPrivacy: string;
    helpSupport: string;
    logout: string;
    logoutConfirmTitle: string;
    logoutConfirmMessage: string;
  };
};
