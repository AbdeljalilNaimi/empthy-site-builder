export type Language = 'fr' | 'ar' | 'en';

export interface Translations {
  // Common
  common: {
    search: string;
    filters: string;
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    confirm: string;
    back: string;
    next: string;
    submit: string;
    clear: string;
    close: string;
    open: string;
    closed: string;
    new: string;
  };

  // Hero Section
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    illustration: string;
  };

  // Quick Search
  quickSearch: {
    title: string;
    namePlaceholder: string;
    typePlaceholder: string;
    locationPlaceholder: string;
    launchSearch: string;
    doctor: string;
    clinic: string;
    pharmacy: string;
    lab: string;
  };

  // Header
  header: {
    providers: string;
    contact: string;
    profile: string;
    settings: string;
    logout: string;
    signup: string;
    signin: string;
    dashboard: string;
  };

  // Navigation
  nav: {
    home: string;
    search: string;
    providers: string;
    emergency: string;
    profile: string;
    login: string;
    signup: string;
    logout: string;
    contact: string;
  };

  // Search
  search: {
    placeholder: string;
    results: string;
    noResults: string;
    filterByType: string;
    filterByArea: string;
    filterByRating: string;
    viewMap: string;
    viewList: string;
    searchPlaceholder: string;
    recentSearches: string;
    suggestions: string;
    clearHistory: string;
    sortBy: string;
    sortRelevance: string;
    sortDistance: string;
    sortRating: string;
    sortPrice: string;
    sortNewest: string;
    foundProviders: string;
    inYourArea: string;
    viewGrid: string;
    noResultsTitle: string;
    noResultsDescription: string;
    tryDifferentFilters: string;
  };

  // Filters
  filters: {
    advancedFilters: string;
    clearAll: string;
    serviceCategories: string;
    generalDoctors: string;
    specialists: string;
    pharmacies: string;
    laboratories: string;
    clinics: string;
    hospitals: string;
    locationDistance: string;
    enterLocation: string;
    radius: string;
    availability: string;
    anyTime: string;
    today: string;
    thisWeek: string;
    openNow: string;
    minimumRating: string;
    anyRating: string;
    stars: string;
    starsAndUp: string;
    specialOptions: string;
    verifiedOnly: string;
    emergencyServices: string;
    wheelchairAccessible: string;
    insuranceAccepted: string;
    priceRange: string;
    affordable: string;
    moderate: string;
    premium: string;
  };

  // Provider
  provider: {
    verified: string;
    rating: string;
    reviews: string;
    bookAppointment: string;
    callNow: string;
    getDirections: string;
    about: string;
    services: string;
    hours: string;
    location: string;
    emergency: string;
    accessible: string;
    openNow: string;
    closed: string;
    viewProfile: string;
    specialty: string;
    distance: string;
    newProvider: string;
    gallery: string;
    contact: string;
    announcements: string;
    viewAvailability: string;
    shareProfile: string;
    reportProfile: string;
    addToFavorites: string;
    removeFromFavorites: string;
    copyLink: string;
    linkCopied: string;
    languages: string;
    specialties: string;
    noAnnouncements: string;
    notFound: string;
    notFoundDesc: string;
    backToSearch: string;
    openInMaps: string;
    callPhone: string;
    newService: string;
    extendedHours: string;
    insuranceAccepted: string;
    is24_7: string;
  };

  // Days
  days: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    mondayShort: string;
    tuesdayShort: string;
    wednesdayShort: string;
    thursdayShort: string;
    fridayShort: string;
    saturdayShort: string;
    sundayShort: string;
  };

  // Providers section (plural)
  providers: {
    featured: string;
    featuredSubtitle: string;
    viewAll: string;
    noProviders: string;
    carouselHint: string;
    prevProvider: string;
    nextProvider: string;
    becomeProvider: string;
    availableNow: string;
    nextAvailability: string;
    now: string;
    soon: string;
    viewProfile: string;
    viewProfileOf: string;
  };

  // Reviews
  reviews: {
    title: string;
    writeReview: string;
    yourRating: string;
    yourReview: string;
    submit: string;
    helpful: string;
    providerResponse: string;
    pending: string;
    approved: string;
    rejected: string;
  };

  // Auth
  auth: {
    login: string;
    signup: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    rememberMe: string;
    or: string;
    continueWithGoogle: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    role: string;
    patient: string;
    provider: string;
  };

  // Chat
  chat: {
    title: string;
    placeholder: string;
    disclaimer: string;
  };

  // Verification
  verification: {
    verified: string;
    verifiedTooltip: string;
    premium: string;
    premiumTooltip: string;
    certified: string;
    certifiedTooltip: string;
    pending: string;
    pendingTooltip: string;
    rejected: string;
    rejectedTooltip: string;
    revoked: string;
    revokedTitle: string;
    revokedDescription: string;
    revokedFieldsLabel: string;
    revokedAtLabel: string;
    submitNewVerification: string;
    partnerAds: string;
    discoverServices: string;
    discoverServicesSubtitle: string;
  };

  // Provider types
  providerTypes: {
    hospital: string;
    birth_hospital: string;
    clinic: string;
    doctor: string;
    pharmacy: string;
    lab: string;
    blood_cabin: string;
    radiology_center: string;
    medical_equipment: string;
  };

  // Homepage sections
  homepage: {
    findYourDoctor: string;
    findYourDoctorWord1: string;
    findYourDoctorWord2: string;
    findYourDoctorWord3: string;
    connectWith: string;
    simpleQuickFree: string;
    searchPlaceholder: string;
    searchPlaceholderDetailed: string;
    heroSubtitleFull: string;
    searchButton: string;
    voiceSearch: string;
    myLocation: string;
    keyboardHint: string;
    popularLabel: string;
    // Quick tags
    generalDoctor: string;
    dentist: string;
    cardiologist: string;
    pediatrician: string;
    ophthalmologist: string;
    emergency247: string;
    // Stats
    practitioners: string;
    consultations: string;
    averageRating: string;
    // Partners
    trustedPartners: string;
    ministryOfHealth: string;
    orderOfDoctors: string;
    chuSBA: string;
    cnas: string;
    pharmacists: string;
    laboratories: string;
    // Location badge
    locationBadge: string;
    // How It Works
    simpleEfficient: string;
    howItWorks: string;
    threeSteps: string;
    step: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    // Services
    ourServices: string;
    accessNetwork: string;
    popular: string;
    viewAll: string;
    available: string;
    viewAllServices: string;
    doctors: string;
    pharmacies: string;
    labs: string;
    clinics: string;
    hospitals: string;
    emergencyServices: string;
    bloodDonation: string;
    radiology: string;
    generalist: string;
    specialist: string;
    ambulanceTransport: string;
    nurse: string;
    homeCare: string;
    // Emergency Banner
    emergencyTitle: string;
    operational: string;
    estimatedWait: string;
    call: string;
    locate: string;
    // Stats Section
    activeDoctors: string;
    activeDoctorsDesc: string;
    coveredMunicipalities: string;
    coveredMunicipalitiesDesc: string;
    appointments: string;
    appointmentsDesc: string;
    averageRatingLabel: string;
    averageRatingDesc: string;
    statistics: string;
    ourResults: string;
    resultsSubtitle: string;
    swipeMore: string;
    // Testimonials
    verifiedReviews: string;
    testimonials: string;
    whatUsersSay: string;
    patient: string;
    patientFemale: string;
    doctorRole: string;
    // Map Section
    interactiveMap: string;
    findNearby: string;
    openMap: string;
    searchPractitioner: string;
    nearbyPractitioners: string;
    results: string;
    practitionersOnline: string;
    availableStatus: string;
    busyStatus: string;
    openButton: string;
  };

  // Sidebar
  sidebar: {
    map: string;
    bloodDonation: string;
    medicalAssistant: string;
    favorites: string;
    emergencies: string;
    callEmergency: string;
  };

  // Admin
  admin: {
    searchPlaceholder: string;
    myProfile: string;
    settings: string;
    logout: string;
    totalProviders: string;
    pendingLabel: string;
    verified: string;
    users: string;
    quickActions: string;
    pendingVerifications: string;
    newRegistrations: string;
    adsToModerate: string;
    viewAnalytics: string;
    verificationRate: string;
    verificationProgress: string;
    outOf: string;
    providers: string;
    rejected: string;
    recentActivity: string;
    lastAdminActions: string;
    viewAll: string;
    noRecentActivity: string;
    platformHealth: string;
    keyMetrics: string;
    totalAppointments: string;
    appointmentsToday: string;
    reviewsLabel: string;
    averageRating: string;
    newToday: string;
    admins: string;
    accessDenied: string;
    accessDeniedDesc: string;
    retry: string;
    providerApproved: string;
    providerRejected: string;
    providerEdited: string;
    providerDeleted: string;
    adApproved: string;
    adRejected: string;
    roleChanged: string;
    settingsChanged: string;
    administration: string;
    dashboard: string;
    favorites: string;
    providerSpace: string;
    confirmLogout: string;
    confirmLogoutDesc: string;
    cancelLabel: string;
    logoutAction: string;
    skipToContent: string;
  };

  // Roles
  roles: {
    administrator: string;
    practitioner: string;
    citizen: string;
  };

  // Footer
  footer: {
    platformDescription: string;
    services: string;
    searchDoctors: string;
    interactiveMap: string;
    emergency247: string;
    aiAssistant: string;
    bloodDonation: string;
    professionals: string;
    becomePartner: string;
    practitionerRegistration: string;
    documentation: string;
    verificationCharter: string;
    login: string;
    citizenSpace: string;
    patientsIndividuals: string;
    practitionerSpace: string;
    doctorsEstablishments: string;
    createCitizenAccount: string;
    legal: string;
    faq: string;
    privacy: string;
    terms: string;
    contact: string;
    language: string;
    downloadApp: string;
    downloadAppDesc: string;
    downloadOn: string;
    emergencyLabel: string;
    allRightsReserved: string;
    madeWith: string;
    inAlgeria: string;
    myFavorites: string;
    dashboard: string;
    myAccount: string;
    providerDashboard: string;
    administration: string;
    findDoctor: string;
    openMenu: string;
    closeMenu: string;
    resources: string;
  };

  // Appointments
  appointments: {
    pending: string;
    confirmed: string;
    cancelled: string;
    completed: string;
    cancel: string;
    noProvider: string;
    searchProvider: string;
    bookAppointment: string;
    upcoming: string;
    history: string;
    myReviews: string;
    noUpcoming: string;
    noHistory: string;
    noReviews: string;
    cancelSuccess: string;
    cancelError: string;
    exportPDF: string;
    myDashboard: string;
    welcome: string;
    upcomingCount: string;
    totalCount: string;
    reviewsGiven: string;
    reviewFor: string;
    published: string;
    providerResponse: string;
    date: string;
    time: string;
    yourInfo: string;
    fullName: string;
    phone: string;
    emailOptional: string;
    notesOptional: string;
    back: string;
    morning: string;
    afternoon: string;
    noSlots: string;
    today: string;
    moreDates: string;
    hideCalendar: string;
    bookingInProgress: string;
    confirmAppointment: string;
    createdSuccess: string;
    creationError: string;
  };

  // Contact page
  contact: {
    title: string;
    subtitle: string;
    sendMessage: string;
    fullName: string;
    email: string;
    requestType: string;
    choosePlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    contactInfo: string;
    phone: string;
    emailLabel: string;
    address: string;
    hours: string;
    faq: string;
    emergencyTitle: string;
    emergencyDesc: string;
    callEmergency: string;
    teamTitle: string;
    teamSubtitle: string;
    requiredFields: string;
    requiredFieldsDesc: string;
    messageSent: string;
    messageSentDesc: string;
    // Contact types
    technicalSupport: string;
    generalQuestion: string;
    partnership: string;
    providerRegistration: string;
    report: string;
    other: string;
    // Contact info details
    phoneNumber: string;
    phoneHours: string;
    emailAddress: string;
    emailResponse: string;
    addressDetails: string;
    addressCity: string;
    workingHours: string;
    saturdayHours: string;
    // FAQ
    faq1Q: string;
    faq1A: string;
    faq2Q: string;
    faq2A: string;
    faq3Q: string;
    faq3A: string;
    faq4Q: string;
    faq4A: string;
    // Team
    coFounderDev: string;
    coFounderCTO: string;
    descNaimi: string;
    descAbdelilah: string;
    support247: string;
    errorTitle: string;
    errorDesc: string;
    emailPlaceholder: string;
  };

  // Not found page
  notFound: {
    title: string;
    message: string;
    returnHome: string;
  };

  // Login pages
  loginPage: {
    citizenSpace: string;
    citizenDesc: string;
    providerSpace: string;
    providerDesc: string;
    loginButton: string;
    forgotPassword: string;
    forgotPasswordTitle: string;
    resetSent: string;
    resetDesc: string;
    sendLink: string;
    backToLogin: string;
    noAccount: string;
    createAccount: string;
    registerEstablishment: string;
    backToHome: string;
    or: string;
    continueGoogle: string;
    notCitizenAccount: string;
    notProviderAccount: string;
    noAccountForEmail: string;
    sendError: string;
    checkInbox: string;
    invalidEmail: string;
    passwordMinLength: string;
  };

  // Booking modal
  booking: {
    information: string;
    dateTime: string;
    confirmation: string;
    selectDate: string;
    quickDates: string;
    moreDates: string;
    slotsFor: string;
    realTimeUpdate: string;
    summary: string;
    practitioner: string;
    patient: string;
    date: string;
    time: string;
    contact: string;
    notes: string;
    confirmationEmail: string;
    reserving: string;
    phoneRequired: string;
    phoneDigits: string;
    phonePrefix: string;
  };

  // Featured providers
  featuredProviders: {
    topPractitioners: string;
    healthProfessionals: string;
    bestRated: string;
    viewAll: string;
    viewAllPractitioners: string;
    available: string;
    soon: string;
    noPractitioners: string;
    becomePractitioner: string;
  };

  // Guards
  guards: {
    accessDenied: string;
    accessDeniedAdminDesc: string;
    accessDeniedProviderDesc: string;
    accessDeniedCitizenDesc: string;
    noPermissions: string;
    returnHome: string;
    back: string;
    verifyingAuth: string;
    loadingProfile: string;
    verifyingAdmin: string;
    citizenOnly: string;
    citizenOnlyDesc: string;
    citizenLogin: string;
    noProviderAccount: string;
    noProviderAccountDesc: string;
    createProviderAccount: string;
    accountPending: string;
    accountPendingDesc: string;
    returnDashboard: string;
    becomeProvider: string;
    loadingProviderSpace: string;
    requireRole: string;
  };

  // Map
  map: {
    loadingMap: string;
    locating: string;
    locationError: string;
    yourPosition: string;
    providersTitle: string;
    providersSubtitle: string;
    emergencyTitle: string;
    emergencySubtitle: string;
    bloodTitle: string;
    bloodSubtitle: string;
  };

  // Navbar
  navbar: {
    home: string;
    findProviders: string;
    map: string;
    emergency: string;
    favorites: string;
    contact: string;
    profile: string;
    search: string;
    login: string;
    logout: string;
    adminBadge: string;
    providerBadge: string;
  };

  // Offer/provide
  offers: {
    proposeHelp: string;
    offerPublished: string;
    publishError: string;
    freeDonations: string;
    freeDonationsDesc: string;
    communityAid: string;
    communityAidDesc: string;
    contact: string;
    edit: string;
    deleteOffer: string;
    contactOwner: string;
    contactMethod: string;
    clickToReveal: string;
    reveal: string;
    closeLbl: string;
    phone: string;
    email: string;
    message: string;
    all: string;
    noOffers: string;
    noOffersHint: string;
    myOffers: string;
    myOffersDesc: string;
    newOffer: string;
    editOffer: string;
    editBack: string;
    offerUpdated: string;
    updateError: string;
    offerDeleted: string;
    deleteError: string;
    deleteConfirm: string;
    deleteConfirmDesc: string;
    cancelLbl: string;
    statusUpdated: string;
    statusError: string;
    offerNotFound: string;
    accessDenied: string;
    accessDeniedDesc: string;
    doctorPharmacyOnly: string;
    // Category labels
    catFood: string;
    catMedicine: string;
    catTools: string;
    catTransport: string;
    catOther: string;
    // Status labels
    statusAvailable: string;
    statusReserved: string;
    statusTaken: string;
    // Time ago
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    // Card UI
    showMore: string;
    showLess: string;
    locate: string;
    // Form labels
    formPhoto: string;
    formTitle: string;
    formTitlePlaceholder: string;
    formDescription: string;
    formDescPlaceholder: string;
    formCategory: string;
    formContactMethod: string;
    formContactPhone: string;
    formContactEmail: string;
    formContactApp: string;
    formLocation: string;
    formLocationPlaceholder: string;
    formLocationError: string;
    formPublish: string;
    formDropImage: string;
    formImageHint: string;
    formPhone: string;
    formEmail: string;
    formInApp: string;
  };

  // Community
  community: {
    title: string;
    subtitle: string;
    badge: string;
    headerLink: string;
    composerPlaceholder: string;
    titlePlaceholder: string;
    contentPlaceholder: string;
    publish: string;
    anonymous: string;
    anonymousUser: string;
    unknownUser: string;
    allCategories: string;
    catSuggestion: string;
    catFeedback: string;
    catExperience: string;
    catQuestion: string;
    catAdmin: string;
    searchPlaceholder: string;
    sortNewest: string;
    sortMostUpvoted: string;
    sortMostDiscussed: string;
    upvote: string;
    comment: string;
    reply: string;
    report: string;
    replyPlaceholder: string;
    commentPlaceholder: string;
    noPosts: string;
    loadMore: string;
    postCreated: string;
    loginRequired: string;
    reportTitle: string;
    reportSpam: string;
    reportAbuse: string;
    reportFalseInfo: string;
    reportOther: string;
    reportDetailsPlaceholder: string;
    reportSubmit: string;
    reportSuccess: string;
    profanityError: string;
    loginToParticipate: string;
    adminAnnouncement: string;
    announcements: string;
    communityFeed: string;
    createAnnouncement: string;
    newAnnouncements: string;
    viewAnnouncements: string;
    dismissAnnouncement: string;
    pinBeforePublish: string;
    officialOnly: string;
  };

  // Citizen Dashboard
  citizenDashboard: {
    greeting: string;
    quickAccess: string;
    searchProvider: string;
    searchProviderDesc: string;
    interactiveMap: string;
    interactiveMapDesc: string;
    emergencies: string;
    emergenciesDesc: string;
    aiAssistant: string;
    aiAssistantDesc: string;
    bloodDonation: string;
    bloodDonationDesc: string;
    communityHub: string;
    communityHubDesc: string;
    medicalAds: string;
    medicalAdsDesc: string;
    medicalResearch: string;
    medicalResearchDesc: string;
    myProfile: string;
    myProfileDesc: string;
    myFavorites: string;
    myFavoritesDesc: string;
    appointments: string;
    appointmentsDesc: string;
    freeGiving: string;
    freeGivingDesc: string;
    // Tab titles
    tabNotifications: string;
    tabUpcoming: string;
    tabHistory: string;
    tabOffers: string;
    tabReviews: string;
    tabFavorites: string;
    // Empty states
    emptyNotifications: string;
    emptyNotificationsHint: string;
    emptyUpcoming: string;
    emptyUpcomingHint: string;
    emptyHistory: string;
    emptyOffers: string;
    emptyOffersHint: string;
    emptyReviews: string;
    emptyReviewsHint: string;
    emptyFavorites: string;
    emptyFavoritesHint: string;
    // Actions
    findDoctor: string;
    createOffer: string;
    browseProviders: string;
    bookAgain: string;
    viewProvider: string;
    // Labels
    allFilter: string;
    completedFilter: string;
    cancelledFilter: string;
    confirmedFilter: string;
    pendingFilter: string;
    markAllRead: string;
    clearNotifs: string;
    noFilterResults: string;
    rdvWith: string;
    statusChange: string;
  };
}

export const translations: Record<Language, Translations> = {
  fr: {
    common: {
      search: 'Rechercher',
      filters: 'Filtres',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      confirm: 'Confirmer',
      back: 'Retour',
      next: 'Suivant',
      submit: 'Soumettre',
      clear: 'Effacer',
      close: 'Fermer',
      open: 'Ouvert',
      closed: 'Fermé',
      new: 'Nouveau',
    },
    hero: {
      title: 'Trouvez les meilleurs soins\nà Sidi Bel Abbès',
      subtitle: 'Découvrez et prenez rendez-vous avec les meilleurs professionnels de santé près de chez vous',
      cta: 'Rechercher un prestataire',
      illustration: 'Illustration médicale moderne',
    },
    quickSearch: {
      title: 'Recherche Rapide',
      namePlaceholder: 'Nom ou spécialité...',
      typePlaceholder: 'Type de prestataire',
      locationPlaceholder: 'Localisation...',
      launchSearch: 'Lancer la recherche',
      doctor: 'Médecin',
      clinic: 'Clinique',
      pharmacy: 'Pharmacie',
      lab: 'Laboratoire',
    },
    header: {
      providers: 'Prestataires',
      contact: 'Contact',
      profile: 'Mon profil',
      settings: 'Paramètres',
      logout: 'Déconnexion',
      signup: 'Inscription',
      signin: 'Connexion',
      dashboard: 'Tableau de bord',
    },
    nav: {
      home: 'Accueil',
      search: 'Recherche',
      providers: 'Professionnels',
      emergency: 'Urgences',
      profile: 'Profil',
      login: 'Connexion',
      signup: 'Inscription',
      logout: 'Déconnexion',
      contact: 'Contact',
    },
    search: {
      placeholder: 'Rechercher un médecin, pharmacie, laboratoire...',
      results: 'résultats',
      noResults: 'Aucun résultat trouvé',
      filterByType: 'Type',
      filterByArea: 'Quartier',
      filterByRating: 'Note',
      viewMap: 'Vue carte',
      viewList: 'Vue liste',
      searchPlaceholder: 'Rechercher médecins, cliniques, pharmacies...',
      recentSearches: 'Recherches récentes',
      suggestions: 'Suggestions',
      clearHistory: 'Effacer',
      sortBy: 'Trier par',
      sortRelevance: 'Pertinence',
      sortDistance: 'Distance',
      sortRating: 'Note',
      sortPrice: 'Prix',
      sortNewest: 'Plus récent',
      foundProviders: 'prestataires trouvés',
      inYourArea: 'dans votre zone',
      viewGrid: 'Vue grille',
      noResultsTitle: 'Aucun résultat trouvé',
      noResultsDescription: 'Essayez de modifier vos critères de recherche ou d\'élargir votre zone de recherche',
      tryDifferentFilters: 'Essayez d\'autres filtres',
    },
    filters: {
      advancedFilters: 'Filtres avancés',
      clearAll: 'Tout effacer',
      serviceCategories: 'Catégories de services',
      generalDoctors: 'Médecins généralistes',
      specialists: 'Spécialistes',
      pharmacies: 'Pharmacies',
      laboratories: 'Laboratoires',
      clinics: 'Cliniques',
      hospitals: 'Hôpitaux',
      locationDistance: 'Localisation et distance',
      enterLocation: 'Ville ou code postal',
      radius: 'Rayon',
      availability: 'Disponibilité',
      anyTime: 'À tout moment',
      today: 'Aujourd\'hui',
      thisWeek: 'Cette semaine',
      openNow: 'Ouvert maintenant',
      minimumRating: 'Note minimum',
      anyRating: 'Toutes les notes',
      stars: 'étoiles',
      starsAndUp: 'étoiles et plus',
      specialOptions: 'Options spéciales',
      verifiedOnly: 'Prestataires vérifiés uniquement',
      emergencyServices: 'Services d\'urgence',
      wheelchairAccessible: 'Accessible PMR',
      insuranceAccepted: 'Assurance acceptée',
      priceRange: 'Fourchette de prix',
      affordable: 'Économique',
      moderate: 'Modéré',
      premium: 'Premium',
    },
    provider: {
      verified: 'Vérifié',
      rating: 'Note',
      reviews: 'avis',
      bookAppointment: 'Prendre rendez-vous',
      callNow: 'Appeler',
      getDirections: 'Itinéraire',
      about: 'À propos',
      services: 'Services',
      hours: 'Horaires',
      location: 'Localisation',
      emergency: 'Urgence 24/7',
      accessible: 'Accessible PMR',
      openNow: 'Ouvert maintenant',
      closed: 'Fermé',
      viewProfile: 'Voir le profil',
      specialty: 'Spécialité',
      distance: 'Distance',
      newProvider: 'Nouveau',
      gallery: 'Galerie',
      contact: 'Contact',
      announcements: 'Annonces',
      viewAvailability: 'Voir disponibilités',
      shareProfile: 'Partager ce profil',
      reportProfile: 'Signaler ce profil',
      addToFavorites: 'Ajouter aux favoris',
      removeFromFavorites: 'Favori',
      copyLink: 'Copier le lien',
      linkCopied: 'Lien copié!',
      languages: 'Langues',
      specialties: 'Spécialités',
      noAnnouncements: 'Aucune annonce pour le moment',
      notFound: 'Prestataire non trouvé',
      notFoundDesc: 'Le profil demandé n\'existe pas ou a été supprimé.',
      backToSearch: 'Retour à la recherche',
      openInMaps: 'Ouvrir dans Maps',
      callPhone: 'Appeler',
      newService: 'Nouveau service disponible',
      extendedHours: 'Horaires étendus',
      insuranceAccepted: 'Assurance acceptée',
      is24_7: '24h/24',
    },
    days: {
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche',
      mondayShort: 'Lun',
      tuesdayShort: 'Mar',
      wednesdayShort: 'Mer',
      thursdayShort: 'Jeu',
      fridayShort: 'Ven',
      saturdayShort: 'Sam',
      sundayShort: 'Dim',
    },
    reviews: {
      title: 'Avis et évaluations',
      writeReview: 'Laisser un avis',
      yourRating: 'Votre note',
      yourReview: 'Votre avis',
      submit: 'Publier',
      helpful: 'Utile',
      providerResponse: 'Réponse du professionnel',
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
    },
    auth: {
      login: 'Connexion',
      signup: 'Inscription',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      forgotPassword: 'Mot de passe oublié?',
      rememberMe: 'Se souvenir de moi',
      or: 'ou',
      continueWithGoogle: 'Continuer avec Google',
      alreadyHaveAccount: 'Déjà un compte?',
      dontHaveAccount: 'Pas encore de compte?',
      role: 'Je suis',
      patient: 'Patient',
      provider: 'Professionnel de santé',
    },
    chat: {
      title: 'Assistant Santé IA',
      placeholder: 'Posez votre question...',
      disclaimer: 'Ceci est un assistant virtuel. Consultez toujours un professionnel de santé.',
    },
    verification: {
      verified: 'Vérifié',
      verifiedTooltip: 'Ce prestataire a été vérifié par CityHealth et a fourni tous les documents nécessaires.',
      premium: 'Premium',
      premiumTooltip: 'Prestataire premium avec des services de haute qualité et une excellente réputation.',
      certified: 'Certifié',
      certifiedTooltip: 'Détient des certifications professionnelles reconnues et à jour.',
      pending: 'En attente',
      pendingTooltip: 'La vérification est en cours de traitement.',
      rejected: 'Rejeté',
      rejectedTooltip: 'La demande de vérification a été refusée.',
      revoked: 'Révoqué',
      revokedTitle: 'Vérification révoquée',
      revokedDescription: 'Votre statut vérifié a été révoqué suite à la modification de données sensibles. Votre profil n\'est plus visible publiquement.',
      revokedFieldsLabel: 'Champs modifiés',
      revokedAtLabel: 'Révoqué le',
      submitNewVerification: 'Soumettre une nouvelle vérification',
      partnerAds: 'Annonces Partenaires',
      discoverServices: 'Services de Santé à Découvrir',
      discoverServicesSubtitle: 'Découvrez les offres de nos partenaires de santé vérifiés à Sidi Bel Abbès',
    },
    providers: {
      featured: 'Professionnels en Vedette',
      featuredSubtitle: 'Professionnels de santé vérifiés et très bien notés',
      viewAll: 'Voir tous les professionnels',
      noProviders: 'Aucun professionnel disponible pour le moment',
      carouselHint: '← Glissez ou utilisez les flèches →',
      prevProvider: 'Praticien précédent',
      nextProvider: 'Praticien suivant',
      becomeProvider: 'Devenir prestataire',
      availableNow: 'Disponible maintenant',
      nextAvailability: 'Prochaine disponibilité',
      now: 'Maintenant',
      soon: 'Prochainement',
      viewProfile: 'Voir le profil',
      viewProfileOf: 'Voir le profil de',
    },
    providerTypes: {
      hospital: 'Hôpital',
      birth_hospital: 'Maternité',
      clinic: 'Clinique',
      doctor: 'Médecin',
      pharmacy: 'Pharmacie',
      lab: 'Laboratoire',
      blood_cabin: 'Centre de don du sang',
      radiology_center: 'Centre de radiologie',
      medical_equipment: 'Équipement médical',
    },
    homepage: {
      findYourDoctor: 'Trouvez votre médecin',
      findYourDoctorWord1: 'Trouvez',
      findYourDoctorWord2: 'votre',
      findYourDoctorWord3: 'médecin',
      connectWith: 'Connectez-vous avec les meilleurs praticiens de santé.',
      simpleQuickFree: 'Simple, rapide et gratuit.',
      searchPlaceholder: 'Rechercher un praticien, une spécialité...',
      searchPlaceholderDetailed: 'Rechercher par nom de médecin, spécialité, clinique…',
      heroSubtitleFull: 'Le répertoire santé n°1 de Sidi Bel Abbès, Algérie — trouvez médecins, cliniques, pharmacies, laboratoires et plus. Gratuit pour les citoyens.',
      searchButton: 'Rechercher',
      voiceSearch: 'Recherche vocale',
      myLocation: 'Ma position',
      keyboardHint: 'pour rechercher',
      popularLabel: 'Populaires :',
      generalDoctor: 'Médecin généraliste',
      dentist: 'Dentiste',
      cardiologist: 'Cardiologue',
      pediatrician: 'Pédiatre',
      ophthalmologist: 'Ophtalmologue',
      emergency247: 'Urgences 24/7',
      practitioners: 'Praticiens',
      consultations: 'Consultations',
      averageRating: 'Note moyenne',
      trustedPartners: 'Nos partenaires de confiance',
      ministryOfHealth: 'Ministère de la Santé',
      orderOfDoctors: 'Ordre des Médecins',
      chuSBA: 'CHU Sidi Bel Abbès',
      cnas: 'CNAS',
      pharmacists: 'Pharmaciens',
      laboratories: 'Laboratoires',
      locationBadge: 'Sidi Bel Abbès, Algérie',
      simpleEfficient: 'Simple & Efficace',
      howItWorks: 'Comment ça marche',
      threeSteps: '3 étapes simples pour trouver et contacter votre praticien idéal',
      step: 'Étape',
      step1Title: 'Recherchez',
      step1Desc: 'Trouvez un professionnel de santé par spécialité, nom ou localisation dans notre base de données vérifiée.',
      step2Title: 'Comparez',
      step2Desc: 'Consultez les profils détaillés, les avis patients et les disponibilités en temps réel.',
      step3Title: 'Contactez',
      step3Desc: 'Prenez rendez-vous en ligne, appelez directement ou obtenez l\'itinéraire vers le cabinet.',
      ourServices: 'Nos Services',
      accessNetwork: 'Accédez à notre réseau complet de professionnels de santé vérifiés',
      popular: 'Populaire',
      viewAll: 'Tout voir',
      available: 'dispo.',
      viewAllServices: 'Voir tous les services',
      doctors: 'Médecins',
      pharmacies: 'Pharmacies',
      labs: 'Laboratoires',
      clinics: 'Cliniques',
      hospitals: 'Hôpitaux',
      emergencyServices: 'Urgences',
      bloodDonation: 'Don de sang',
      radiology: 'Radiologie',
      generalist: 'Médecin Généraliste',
      specialist: 'Médecin Spécialiste',
      ambulanceTransport: 'Transport Sanitaire',
      nurse: 'Infirmier',
      homeCare: 'Soins à domicile',
      emergencyTitle: 'Urgences Médicales',
      operational: 'Opérationnel',
      estimatedWait: 'Temps d\'attente estimé',
      call: 'Appeler',
      locate: 'Localiser',
      activeDoctors: 'Médecins Actifs',
      activeDoctorsDesc: 'Praticiens vérifiés sur la plateforme',
      coveredMunicipalities: 'Communes Couvertes',
      coveredMunicipalitiesDesc: 'Wilaya de Sidi Bel Abbès',
      appointments: 'Rendez-vous',
      appointmentsDesc: 'Pris depuis le lancement',
      averageRatingLabel: 'Note Moyenne',
      averageRatingDesc: 'Basée sur 2,340 avis',
      statistics: 'Statistiques',
      ourResults: 'Résultats',
      resultsSubtitle: 'Des chiffres qui témoignent de notre engagement envers la santé de Sidi Bel Abbès',
      swipeMore: 'Glissez pour voir plus',
      verifiedReviews: 'Avis vérifiés',
      testimonials: 'Témoignages',
      whatUsersSay: 'Ce que disent nos utilisateurs',
      patient: 'Patient',
      patientFemale: 'Patiente',
      doctorRole: 'Médecin',
      interactiveMap: 'Carte Interactive',
      findNearby: 'Trouvez les praticiens près de chez vous',
      openMap: 'Ouvrir la carte',
      searchPractitioner: 'Rechercher un praticien...',
      nearbyPractitioners: 'Praticiens à proximité',
      results: 'résultats',
      practitionersOnline: 'praticiens en ligne',
      availableStatus: 'Disponible',
      busyStatus: 'Occupé',
      openButton: 'Ouvrir',
    },
    sidebar: {
      map: 'Carte',
      bloodDonation: 'Don de Sang',
      medicalAssistant: 'Assistant Médical',
      favorites: 'Favoris',
      emergencies: 'Urgences',
      callEmergency: 'Appelez le 15',
    },
    admin: {
      searchPlaceholder: 'Rechercher...',
      myProfile: 'Mon profil',
      settings: 'Paramètres',
      logout: 'Déconnexion',
      totalProviders: 'Total Prestataires',
      pendingLabel: 'En attente',
      verified: 'Vérifiés',
      users: 'Utilisateurs',
      quickActions: 'Actions Rapides',
      pendingVerifications: 'Vérifications en attente',
      newRegistrations: 'Nouvelles inscriptions',
      adsToModerate: 'Annonces à modérer',
      viewAnalytics: 'Voir les analytiques',
      verificationRate: 'Taux de Vérification',
      verificationProgress: 'Progression de la vérification des prestataires',
      outOf: 'sur',
      providers: 'prestataires',
      rejected: 'Rejetés',
      recentActivity: 'Activité Récente',
      lastAdminActions: 'Dernières actions admin',
      viewAll: 'Voir tout',
      noRecentActivity: 'Aucune activité récente',
      platformHealth: 'Santé de la Plateforme',
      keyMetrics: 'Vue d\'ensemble des métriques clés',
      totalAppointments: 'Total RDV',
      appointmentsToday: 'RDV Aujourd\'hui',
      reviewsLabel: 'Avis',
      averageRating: 'Note Moyenne',
      newToday: 'Nouveaux Aujourd\'hui',
      admins: 'Admins',
      accessDenied: 'Accès refusé',
      accessDeniedDesc: 'Vous n\'avez pas les permissions nécessaires pour accéder aux données administratives. Veuillez vous connecter avec un compte administrateur.',
      retry: 'Réessayer',
      providerApproved: 'Prestataire approuvé',
      providerRejected: 'Prestataire rejeté',
      providerEdited: 'Prestataire modifié',
      providerDeleted: 'Prestataire supprimé',
      adApproved: 'Annonce approuvée',
      adRejected: 'Annonce rejetée',
      roleChanged: 'Rôle modifié',
      settingsChanged: 'Paramètres modifiés',
      administration: 'Administration',
      dashboard: 'Tableau de bord',
      favorites: 'Favoris',
      providerSpace: 'Espace Praticien',
      confirmLogout: 'Confirmer la déconnexion',
      confirmLogoutDesc: 'Êtes-vous sûr de vouloir vous déconnecter?',
      cancelLabel: 'Annuler',
      logoutAction: 'Se déconnecter',
      skipToContent: 'Aller au contenu principal',
    },
    roles: {
      administrator: 'Administrateur',
      practitioner: 'Praticien',
      citizen: 'Citoyen',
    },
    footer: {
      platformDescription: 'La plateforme de référence pour connecter les citoyens avec les prestataires de santé vérifiés.',
      services: 'Services',
      searchDoctors: 'Recherche médecins',
      interactiveMap: 'Carte interactive',
      emergency247: 'Urgences 24/7',
      aiAssistant: 'Assistant IA Santé',
      bloodDonation: 'Don de sang',
      professionals: 'Professionnels',
      becomePartner: 'Devenir partenaire',
      practitionerRegistration: 'Inscription praticien',
      documentation: 'Documentation',
      verificationCharter: 'Charte vérification',
      login: 'Connexion',
      citizenSpace: 'Espace Citoyen',
      patientsIndividuals: 'Patients & particuliers',
      practitionerSpace: 'Espace Praticien',
      doctorsEstablishments: 'Médecins & établissements',
      createCitizenAccount: 'Créer un compte citoyen',
      legal: 'Légal',
      faq: 'FAQ',
      privacy: 'Confidentialité',
      terms: 'Conditions',
      contact: 'Contact',
      language: 'Langue',
      downloadApp: 'Téléchargez notre app',
      downloadAppDesc: 'Accédez à CityHealth sur votre mobile pour un accès rapide aux soins',
      downloadOn: 'Télécharger sur',
      emergencyLabel: 'Urgences:',
      allRightsReserved: 'Tous droits réservés.',
      madeWith: 'Fait avec',
      inAlgeria: 'en Algérie',
      myFavorites: 'Mes favoris',
      dashboard: 'Tableau de bord',
      myAccount: 'Mon Compte',
      providerDashboard: 'Espace Praticien',
      administration: 'Administration',
      findDoctor: 'Trouver un médecin',
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
      resources: 'Ressources',
    },
    appointments: {
      pending: 'En attente',
      confirmed: 'Confirmé',
      cancelled: 'Annulé',
      completed: 'Terminé',
      cancel: 'Annuler',
      noProvider: 'Aucun praticien sélectionné',
      searchProvider: 'Rechercher un praticien',
      bookAppointment: 'Prendre rendez-vous',
      upcoming: 'À venir',
      history: 'Historique',
      myReviews: 'Mes avis',
      noUpcoming: 'Aucun rendez-vous à venir',
      noHistory: 'Aucun historique de rendez-vous',
      noReviews: 'Aucun avis donné',
      cancelSuccess: 'Rendez-vous annulé',
      cancelError: 'Erreur lors de l\'annulation',
      exportPDF: 'Exporter PDF',
      myDashboard: 'Mon Tableau de Bord',
      welcome: 'Bienvenue',
      upcomingCount: 'Rendez-vous à venir',
      totalCount: 'Total rendez-vous',
      reviewsGiven: 'Avis donnés',
      reviewFor: 'Avis pour',
      published: 'Publié',
      providerResponse: 'Réponse du professionnel',
      date: 'Date',
      time: 'Heure',
      yourInfo: 'Vos informations',
      fullName: 'Nom complet',
      phone: 'Téléphone',
      emailOptional: 'Email (optionnel)',
      notesOptional: 'Notes (optionnel)',
      back: 'Retour',
      morning: 'Matin',
      afternoon: 'Après-midi',
      noSlots: 'Aucun créneau disponible ce jour',
      today: 'Auj.',
      moreDates: 'Plus de dates',
      hideCalendar: 'Masquer le calendrier',
      bookingInProgress: 'Réservation en cours...',
      confirmAppointment: 'Confirmer le rendez-vous',
      createdSuccess: 'Rendez-vous créé avec succès !',
      creationError: 'Erreur lors de la création',
    },
    contact: {
      title: 'Contactez-nous',
      subtitle: 'Notre équipe est là pour vous aider. N\'hésitez pas à nous contacter pour toute question ou suggestion.',
      sendMessage: 'Envoyez-nous un message',
      fullName: 'Nom complet',
      email: 'Email',
      requestType: 'Type de demande',
      choosePlaceholder: 'Choisir le type',
      subject: 'Sujet',
      subjectPlaceholder: 'Sujet de votre message',
      message: 'Message',
      messagePlaceholder: 'Décrivez votre demande en détail...',
      send: 'Envoyer le message',
      contactInfo: 'Informations de contact',
      phone: 'Téléphone',
      emailLabel: 'Email',
      address: 'Adresse',
      hours: 'Horaires',
      faq: 'Questions fréquentes',
      emergencyTitle: 'Urgence médicale',
      emergencyDesc: 'En cas d\'urgence médicale, appelez directement les services d\'urgence',
      callEmergency: 'Appeler le 15',
      teamTitle: 'Notre équipe',
      teamSubtitle: 'Les fondateurs et développeurs principaux de la plateforme',
      requiredFields: 'Champs requis',
      requiredFieldsDesc: 'Veuillez remplir tous les champs obligatoires',
      messageSent: 'Message envoyé',
      messageSentDesc: 'Votre message a été envoyé avec succès. Nous vous répondrons bientôt.',
      technicalSupport: 'Support technique',
      generalQuestion: 'Question générale',
      partnership: 'Demande de partenariat',
      providerRegistration: 'Inscription prestataire',
      report: 'Signalement',
      other: 'Autre',
      phoneNumber: '+213 48 XX XX XX',
      phoneHours: 'Lun-Ven 8h-18h',
      emailAddress: 'contact@cityhealth-sba.dz',
      emailResponse: 'Réponse sous 24h',
      addressDetails: 'Centre Ville, Sidi Bel Abbès',
      addressCity: 'Algérie 22000',
      workingHours: 'Lun-Ven: 8h-18h',
      saturdayHours: 'Sam: 9h-13h',
      faq1Q: 'Comment m\'inscrire en tant que prestataire ?',
      faq1A: 'Rendez-vous sur la page "Espace Prestataire" et remplissez le formulaire d\'inscription. Notre équipe vérifiera vos informations sous 48h.',
      faq2Q: 'Les consultations sont-elles gratuites ?',
      faq2A: 'CityHealth est une plateforme de mise en relation. Les tarifs des consultations dépendent de chaque prestataire.',
      faq3Q: 'Comment signaler un problème ?',
      faq3A: 'Utilisez le formulaire de contact en sélectionnant "Signalement" ou contactez-nous directement par téléphone.',
      faq4Q: 'Puis-je modifier mes informations ?',
      faq4A: 'Oui, connectez-vous à votre compte et accédez à la section "Profil" pour modifier vos informations.',
      coFounderDev: 'Co-Fondateur et Développeur Principal',
      coFounderCTO: 'Co-Fondateur et Directeur Technique',
      descNaimi: 'Co-fondateur de CityHealth, dédié à la création de solutions de santé numérique accessibles pour l\'Algérie.',
      descAbdelilah: 'Co-fondateur et architecte technique de CityHealth, spécialisé dans les infrastructures scalables pour le secteur médical.',
      support247: 'Support 24/7',
      errorTitle: 'Erreur',
      errorDesc: 'Une erreur est survenue. Veuillez réessayer.',
      emailPlaceholder: 'votre@email.com',
    },
    notFound: {
      title: '404',
      message: 'Oups ! Page introuvable',
      returnHome: 'Retour à l\'accueil',
    },
    loginPage: {
      citizenSpace: 'Espace Citoyen',
      citizenDesc: 'Connectez-vous pour accéder à vos services de santé',
      providerSpace: 'Espace Prestataire',
      providerDesc: 'Connectez-vous pour gérer votre établissement de santé',
      loginButton: 'Se connecter',
      forgotPassword: 'Mot de passe oublié?',
      forgotPasswordTitle: 'Mot de passe oublié',
      resetSent: 'Un email de réinitialisation a été envoyé',
      resetDesc: 'Entrez votre email pour recevoir un lien de réinitialisation',
      sendLink: 'Envoyer le lien',
      backToLogin: 'Retour à la connexion',
      noAccount: 'Pas encore de compte?',
      createAccount: 'Créer un compte',
      registerEstablishment: 'Inscrire mon établissement',
      backToHome: 'Retour à l\'accueil',
      or: 'Ou',
      continueGoogle: 'Continuer avec Google',
      notCitizenAccount: 'Ce compte n\'est pas un compte citoyen',
      notProviderAccount: 'Ce compte n\'est pas un compte prestataire',
      noAccountForEmail: 'Aucun compte associé à cet email',
      sendError: 'Erreur lors de l\'envoi. Veuillez réessayer.',
      checkInbox: 'Vérifiez votre boîte de réception.',
      invalidEmail: 'Email invalide',
      passwordMinLength: 'Le mot de passe doit contenir au moins 6 caractères',
    },
    booking: {
      information: 'Informations',
      dateTime: 'Date & Heure',
      confirmation: 'Confirmation',
      selectDate: 'Sélectionner une date',
      quickDates: 'Dates rapides',
      moreDates: 'Plus de dates',
      slotsFor: 'Créneaux disponibles pour le',
      realTimeUpdate: 'Disponibilités mises à jour en temps réel',
      summary: 'Récapitulatif de votre rendez-vous',
      practitioner: 'Praticien',
      patient: 'Patient',
      date: 'Date',
      time: 'Heure',
      contact: 'Contact',
      notes: 'Notes',
      confirmationEmail: 'Vous recevrez une confirmation avec un rappel 24h avant le rendez-vous.',
      reserving: 'Réservation...',
      phoneRequired: 'Le numéro de téléphone est requis',
      phoneDigits: 'Le numéro doit contenir 10 chiffres',
      phonePrefix: 'Le numéro doit commencer par 05, 06 ou 07',
    },
    featuredProviders: {
      topPractitioners: 'Top Praticiens',
      healthProfessionals: 'Professionnels de santé',
      bestRated: 'Les praticiens les mieux notés de votre région',
      viewAll: 'Voir tous',
      viewAllPractitioners: 'Voir tous les praticiens',
      available: 'Disponible',
      soon: 'Bientôt',
      noPractitioners: 'Aucun praticien disponible pour le moment',
      becomePractitioner: 'Devenir praticien',
    },
    guards: {
      accessDenied: 'Accès refusé',
      accessDeniedAdminDesc: 'Cette section est réservée aux administrateurs.',
      accessDeniedProviderDesc: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.',
      accessDeniedCitizenDesc: 'Cette section est réservée aux comptes citoyens.',
      noPermissions: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.',
      returnHome: 'Retour à l\'accueil',
      back: 'Retour',
      verifyingAuth: 'Vérification de l\'authentification...',
      loadingProfile: 'Chargement du profil...',
      verifyingAdmin: 'Vérification des permissions administrateur...',
      citizenOnly: 'Accès réservé aux citoyens',
      citizenOnlyDesc: 'Connectez-vous avec un compte citoyen pour accéder à cette page.',
      citizenLogin: 'Connexion Citoyen',
      noProviderAccount: 'Aucun compte professionnel',
      noProviderAccountDesc: 'Pour accéder à l\'espace professionnel, vous devez d\'abord créer un compte prestataire.',
      createProviderAccount: 'Créer mon compte professionnel',
      accountPending: 'Compte en attente',
      accountPendingDesc: 'Cette fonctionnalité est réservée aux comptes vérifiés. Votre demande est en cours de traitement.',
      returnDashboard: 'Retour au tableau de bord',
      becomeProvider: 'Devenir prestataire',
      loadingProviderSpace: 'Chargement de votre espace professionnel...',
      requireRole: 'Cette page nécessite le rôle "{role}" pour y accéder.',
    },
    map: {
      loadingMap: 'Chargement de la carte...',
      locating: 'Localisation en cours...',
      locationError: 'Impossible d\'obtenir votre position',
      yourPosition: 'Votre position',
      providersTitle: 'Carte Interactive des Prestataires',
      providersSubtitle: 'Découvrez tous les établissements de santé vérifiés à Sidi Bel Abbès',
      emergencyTitle: 'Services d\'Urgence',
      emergencySubtitle: 'Localisez rapidement les services d\'urgence les plus proches',
      bloodTitle: 'Don de Sang & Centres de Transfusion',
      bloodSubtitle: 'Trouvez les hôpitaux et centres de don de sang',
    },
    navbar: {
      home: 'Accueil',
      findProviders: 'Trouver des prestataires',
      map: 'Carte',
      emergency: 'Urgences',
      favorites: 'Favoris',
      contact: 'Contact',
      profile: 'Profil',
      search: 'Rechercher',
      login: 'Connexion',
      logout: 'Déconnexion',
      adminBadge: '(Admin)',
      providerBadge: '(Praticien)',
    },
    offers: {
      proposeHelp: 'Proposer de l\'aide',
      offerPublished: 'Offre publiée avec succès !',
      publishError: 'Erreur lors de la publication',
      freeDonations: 'Dons gratuits',
      freeDonationsDesc: 'Proposez ou trouvez des dons gratuits',
      communityAid: 'Entraide communautaire',
      communityAidDesc: 'Proposez ou trouvez de l\'aide gratuite près de chez vous',
      contact: 'Contacter',
      edit: 'Modifier',
      deleteOffer: 'Supprimer',
      contactOwner: 'Contacter',
      contactMethod: 'Méthode de contact',
      clickToReveal: 'Cliquez ci-dessous pour afficher les coordonnées.',
      reveal: 'Afficher',
      closeLbl: 'Fermer',
      phone: 'Téléphone',
      email: 'Email',
      message: 'Message',
      all: 'Tous',
      noOffers: 'Aucune offre pour le moment',
      noOffersHint: 'Soyez le premier à proposer votre aide !',
      myOffers: 'Mes offres',
      myOffersDesc: 'Gérez vos propositions d\'aide',
      newOffer: 'Nouvelle offre',
      editOffer: 'Modifier l\'offre',
      editBack: 'Retour',
      offerUpdated: 'Offre mise à jour',
      updateError: 'Erreur lors de la mise à jour',
      offerDeleted: 'Offre supprimée',
      deleteError: 'Erreur lors de la suppression',
      deleteConfirm: 'Supprimer cette offre ?',
      deleteConfirmDesc: 'Cette action est irréversible.',
      cancelLbl: 'Annuler',
      statusUpdated: 'Statut mis à jour',
      statusError: 'Erreur lors de la mise à jour',
      offerNotFound: 'Offre introuvable ou accès refusé',
      accessDenied: 'Accès refusé',
      accessDeniedDesc: 'Seuls les docteurs et pharmacies peuvent publier des dons.',
      doctorPharmacyOnly: 'Réservé aux docteurs et pharmacies',
      catFood: 'Nourriture',
      catMedicine: 'Médicaments',
      catTools: 'Outils',
      catTransport: 'Transport',
      catOther: 'Autre',
      statusAvailable: 'Disponible',
      statusReserved: 'Réservé',
      statusTaken: 'Pris',
      justNow: 'À l\'instant',
      minutesAgo: 'Il y a {n} min',
      hoursAgo: 'Il y a {n}h',
      daysAgo: 'Il y a {n}j',
      showMore: 'Voir plus',
      showLess: 'Voir moins',
      locate: 'Localiser',
      formPhoto: 'Photo du produit',
      formTitle: 'Titre',
      formTitlePlaceholder: 'Ex : Lot de médicaments anti-douleur',
      formDescription: 'Description',
      formDescPlaceholder: 'Décrivez ce que vous proposez...',
      formCategory: 'Catégorie',
      formContactMethod: 'Méthode de contact',
      formContactPhone: 'Numéro de téléphone',
      formContactEmail: 'Adresse email',
      formContactApp: 'Identifiant / pseudo',
      formLocation: 'Localisation',
      formLocationPlaceholder: 'Adresse (optionnel)',
      formLocationError: 'Veuillez indiquer une localisation valide',
      formPublish: 'Publier',
      formDropImage: 'Cliquez ou glissez une image',
      formImageHint: 'JPG, PNG — max 5 Mo',
      formPhone: 'Téléphone',
      formEmail: 'Email',
      formInApp: 'In-App',
    },
    community: {
      title: 'Avis & Idées',
      subtitle: 'Partagez vos idées, suggestions et retours d\'expérience avec la communauté',
      badge: 'Espace Communautaire',
      headerLink: 'Avis & Idées',
      composerPlaceholder: 'Partagez une idée, un avis ou une question...',
      titlePlaceholder: 'Titre de votre publication',
      contentPlaceholder: 'Décrivez votre idée ou partagez votre expérience...',
      publish: 'Publier',
      anonymous: 'Anonyme',
      anonymousUser: 'Utilisateur anonyme',
      unknownUser: 'Utilisateur',
      allCategories: 'Toutes',
      catSuggestion: 'Suggestion',
      catFeedback: 'Retour',
      catExperience: 'Expérience',
      catQuestion: 'Question',
      catAdmin: 'Admin',
      searchPlaceholder: 'Rechercher dans la communauté...',
      sortNewest: 'Plus récents',
      sortMostUpvoted: 'Plus utiles',
      sortMostDiscussed: 'Plus discutés',
      upvote: 'Utile',
      comment: 'Commenter',
      reply: 'Répondre',
      report: 'Signaler',
      replyPlaceholder: 'Écrire une réponse...',
      commentPlaceholder: 'Écrire un commentaire...',
      noPosts: 'Aucune publication pour le moment. Soyez le premier !',
      loadMore: 'Charger plus',
      postCreated: 'Publication créée avec succès !',
      loginRequired: 'Connectez-vous pour interagir',
      reportTitle: 'Signaler un contenu',
      reportSpam: 'Spam',
      reportAbuse: 'Abus',
      reportFalseInfo: 'Fausse information',
      reportOther: 'Autre',
      reportDetailsPlaceholder: 'Décrivez le problème (optionnel)...',
      reportSubmit: 'Envoyer le signalement',
      reportSuccess: 'Signalement envoyé. Merci !',
      profanityError: 'Votre contenu contient des mots inappropriés.',
      loginToParticipate: 'Connectez-vous pour participer à la communauté',
      adminAnnouncement: 'Annonce Officielle',
      announcements: 'Annonces',
      communityFeed: 'Fil communautaire',
      createAnnouncement: 'Nouvelle annonce',
      newAnnouncements: 'Nouvelles annonces',
      viewAnnouncements: 'Voir les annonces',
      dismissAnnouncement: 'Fermer',
      pinBeforePublish: 'Épingler dans Toutes',
      officialOnly: 'Communication officielle',
    },
    citizenDashboard: {
      greeting: 'Bonjour',
      quickAccess: 'Accès rapide aux services',
      searchProvider: 'Rechercher un praticien',
      searchProviderDesc: 'Trouvez un médecin ou spécialiste',
      interactiveMap: 'Carte interactive',
      interactiveMapDesc: 'Explorez les établissements proches',
      emergencies: 'Urgences',
      emergenciesDesc: 'Services d\'urgence 24h/24',
      aiAssistant: 'Assistant Médical IA',
      aiAssistantDesc: 'Posez vos questions santé',
      bloodDonation: 'Don de sang',
      bloodDonationDesc: 'Répondez aux appels urgents',
      communityHub: 'Communauté',
      communityHubDesc: 'Échangez avec d\'autres patients',
      medicalAds: 'Annonces médicales',
      medicalAdsDesc: 'Offres et actualités santé',
      medicalResearch: 'Recherche médicale',
      medicalResearchDesc: 'Articles et publications',
      myProfile: 'Mon profil',
      myProfileDesc: 'Gérez vos informations',
      myFavorites: 'Mes favoris',
      myFavoritesDesc: 'Praticiens sauvegardés',
      appointments: 'Rendez-vous',
      appointmentsDesc: 'Gérez vos consultations',
      freeGiving: 'Don gratuit',
      freeGivingDesc: 'Offrez ou recevez de l\'aide',
      tabNotifications: 'Notifications',
      tabUpcoming: 'À venir',
      tabHistory: 'Historique',
      tabOffers: 'Mes Annonces',
      tabReviews: 'Mes Avis',
      tabFavorites: 'Favoris',
      emptyNotifications: 'Aucune notification',
      emptyNotificationsHint: 'Vous serez notifié des changements de vos RDV',
      emptyUpcoming: 'Aucun rendez-vous à venir',
      emptyUpcomingHint: 'Vos prochains rendez-vous apparaîtront ici',
      emptyHistory: 'Aucun historique de rendez-vous',
      emptyOffers: 'Aucune annonce publiée',
      emptyOffersHint: 'Proposez de l\'aide à la communauté',
      emptyReviews: 'Aucun avis donné',
      emptyReviewsHint: 'Partagez votre expérience avec les praticiens',
      emptyFavorites: 'Aucun favori enregistré',
      emptyFavoritesHint: 'Sauvegardez vos praticiens préférés',
      findDoctor: 'Rechercher un médecin',
      createOffer: 'Créer une annonce',
      browseProviders: 'Parcourir les praticiens',
      bookAgain: 'Prendre RDV',
      viewProvider: 'Voir le profil',
      allFilter: 'Tous',
      completedFilter: 'Terminé',
      cancelledFilter: 'Annulé',
      confirmedFilter: 'Confirmé',
      pendingFilter: 'En attente',
      markAllRead: 'Tout marquer lu',
      clearNotifs: 'Effacer',
      noFilterResults: 'Aucun rendez-vous avec ce filtre',
      rdvWith: 'RDV avec',
      statusChange: 'Changement de statut',
    },
  },

  ar: {
    common: {
      search: 'بحث',
      filters: 'فلاتر',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجاح',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      confirm: 'تأكيد',
      back: 'رجوع',
      next: 'التالي',
      submit: 'إرسال',
      clear: 'مسح',
      close: 'إغلاق',
      open: 'مفتوح',
      closed: 'مغلق',
      new: 'جديد',
    },
    hero: {
      title: 'اعثر على أفضل الرعاية\nفي سيدي بلعباس',
      subtitle: 'اكتشف واحجز مواعيد مع أفضل المتخصصين في الرعاية الصحية بالقرب منك',
      cta: 'ابحث عن مقدم خدمة',
      illustration: 'رسم توضيحي طبي حديث',
    },
    quickSearch: {
      title: 'بحث سريع',
      namePlaceholder: 'الاسم أو التخصص...',
      typePlaceholder: 'نوع مقدم الخدمة',
      locationPlaceholder: 'الموقع...',
      launchSearch: 'ابدأ البحث',
      doctor: 'طبيب',
      clinic: 'عيادة',
      pharmacy: 'صيدلية',
      lab: 'مختبر',
    },
    header: {
      providers: 'مقدمو الخدمات',
      contact: 'اتصل بنا',
      profile: 'ملفي الشخصي',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
      signup: 'إنشاء حساب',
      signin: 'تسجيل الدخول',
      dashboard: 'لوحة التحكم',
    },
    nav: {
      home: 'الرئيسية',
      search: 'بحث',
      providers: 'المهنيون',
      emergency: 'الطوارئ',
      profile: 'الملف الشخصي',
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
      contact: 'اتصل بنا',
    },
    search: {
      placeholder: 'ابحث عن طبيب، صيدلية، مختبر...',
      results: 'نتائج',
      noResults: 'لم يتم العثور على نتائج',
      filterByType: 'النوع',
      filterByArea: 'الحي',
      filterByRating: 'التقييم',
      viewMap: 'عرض الخريطة',
      viewList: 'عرض القائمة',
      searchPlaceholder: 'ابحث عن أطباء، عيادات، صيدليات...',
      recentSearches: 'عمليات البحث الأخيرة',
      suggestions: 'اقتراحات',
      clearHistory: 'مسح',
      sortBy: 'ترتيب حسب',
      sortRelevance: 'الصلة',
      sortDistance: 'المسافة',
      sortRating: 'التقييم',
      sortPrice: 'السعر',
      sortNewest: 'الأحدث',
      foundProviders: 'مقدم خدمة',
      inYourArea: 'في منطقتك',
      viewGrid: 'عرض شبكي',
      noResultsTitle: 'لم يتم العثور على نتائج',
      noResultsDescription: 'حاول تعديل معايير البحث أو توسيع منطقة البحث',
      tryDifferentFilters: 'جرب فلاتر أخرى',
    },
    filters: {
      advancedFilters: 'فلاتر متقدمة',
      clearAll: 'مسح الكل',
      serviceCategories: 'فئات الخدمات',
      generalDoctors: 'أطباء عامون',
      specialists: 'متخصصون',
      pharmacies: 'صيدليات',
      laboratories: 'مختبرات',
      clinics: 'عيادات',
      hospitals: 'مستشفيات',
      locationDistance: 'الموقع والمسافة',
      enterLocation: 'المدينة أو الرمز البريدي',
      radius: 'النطاق',
      availability: 'التوفر',
      anyTime: 'أي وقت',
      today: 'اليوم',
      thisWeek: 'هذا الأسبوع',
      openNow: 'مفتوح الآن',
      minimumRating: 'الحد الأدنى للتقييم',
      anyRating: 'جميع التقييمات',
      stars: 'نجوم',
      starsAndUp: 'نجوم فأكثر',
      specialOptions: 'خيارات خاصة',
      verifiedOnly: 'مقدمو خدمات موثقون فقط',
      emergencyServices: 'خدمات الطوارئ',
      wheelchairAccessible: 'متاح لذوي الإعاقة',
      insuranceAccepted: 'التأمين مقبول',
      priceRange: 'نطاق السعر',
      affordable: 'اقتصادي',
      moderate: 'معتدل',
      premium: 'مميز',
    },
    provider: {
      verified: 'موثق',
      rating: 'التقييم',
      reviews: 'مراجعات',
      bookAppointment: 'حجز موعد',
      callNow: 'اتصل الآن',
      getDirections: 'الاتجاهات',
      about: 'حول',
      services: 'الخدمات',
      hours: 'ساعات العمل',
      location: 'الموقع',
      emergency: 'طوارئ 24/7',
      accessible: 'متاح لذوي الإعاقة',
      openNow: 'مفتوح الآن',
      closed: 'مغلق',
      viewProfile: 'عرض الملف',
      specialty: 'التخصص',
      distance: 'المسافة',
      newProvider: 'جديد',
      gallery: 'المعرض',
      contact: 'اتصال',
      announcements: 'الإعلانات',
      viewAvailability: 'عرض التوفر',
      shareProfile: 'مشاركة الملف',
      reportProfile: 'الإبلاغ عن الملف',
      addToFavorites: 'إضافة إلى المفضلة',
      removeFromFavorites: 'مفضل',
      copyLink: 'نسخ الرابط',
      linkCopied: 'تم نسخ الرابط!',
      languages: 'اللغات',
      specialties: 'التخصصات',
      noAnnouncements: 'لا توجد إعلانات حاليًا',
      notFound: 'مقدم الخدمة غير موجود',
      notFoundDesc: 'الملف المطلوب غير موجود أو تم حذفه.',
      backToSearch: 'العودة للبحث',
      openInMaps: 'فتح في الخرائط',
      callPhone: 'اتصال',
      newService: 'خدمة جديدة متاحة',
      extendedHours: 'ساعات عمل ممتدة',
      insuranceAccepted: 'التأمين مقبول',
      is24_7: '24/7',
    },
    days: {
      monday: 'الإثنين',
      tuesday: 'الثلاثاء',
      wednesday: 'الأربعاء',
      thursday: 'الخميس',
      friday: 'الجمعة',
      saturday: 'السبت',
      sunday: 'الأحد',
      mondayShort: 'إث',
      tuesdayShort: 'ث',
      wednesdayShort: 'أر',
      thursdayShort: 'خ',
      fridayShort: 'ج',
      saturdayShort: 'س',
      sundayShort: 'أح',
    },
    reviews: {
      title: 'التقييمات والمراجعات',
      writeReview: 'اكتب تقييم',
      yourRating: 'تقييمك',
      yourReview: 'مراجعتك',
      submit: 'نشر',
      helpful: 'مفيد',
      providerResponse: 'رد المهني',
      pending: 'قيد الانتظار',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
    },
    auth: {
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور؟',
      rememberMe: 'تذكرني',
      or: 'أو',
      continueWithGoogle: 'المتابعة مع جوجل',
      alreadyHaveAccount: 'لديك حساب؟',
      dontHaveAccount: 'ليس لديك حساب؟',
      role: 'أنا',
      patient: 'مريض',
      provider: 'مهني صحي',
    },
    chat: {
      title: 'مساعد صحي بالذكاء الاصطناعي',
      placeholder: 'اسأل سؤالك...',
      disclaimer: 'هذا مساعد افتراضي. استشر دائمًا أخصائي الرعاية الصحية.',
    },
    verification: {
      verified: 'موثق',
      verifiedTooltip: 'تم التحقق من هذا المزود من قبل CityHealth وقدم جميع المستندات اللازمة.',
      premium: 'مميز',
      premiumTooltip: 'مزود مميز بخدمات عالية الجودة وسمعة ممتازة.',
      certified: 'معتمد',
      certifiedTooltip: 'يمتلك شهادات مهنية معترف بها ومحدثة.',
      pending: 'قيد الانتظار',
      pendingTooltip: 'التحقق قيد المعالجة.',
      rejected: 'مرفوض',
      rejectedTooltip: 'تم رفض طلب التحقق.',
      revoked: 'ملغى',
      revokedTitle: 'تم إلغاء التحقق',
      revokedDescription: 'تم إلغاء حالة التحقق الخاصة بك بسبب تعديل بيانات حساسة. ملفك الشخصي لم يعد مرئيًا للعامة.',
      revokedFieldsLabel: 'الحقول المعدلة',
      revokedAtLabel: 'تم الإلغاء في',
      submitNewVerification: 'تقديم طلب تحقق جديد',
      partnerAds: 'إعلانات الشركاء',
      discoverServices: 'خدمات صحية للاكتشاف',
      discoverServicesSubtitle: 'اكتشف عروض شركائنا الصحيين الموثوقين في سيدي بلعباس',
    },
    providers: {
      featured: 'المهنيون المميزون',
      featuredSubtitle: 'متخصصون صحيون موثقون وذوو تقييم عالٍ',
      viewAll: 'عرض جميع المهنيين',
      noProviders: 'لا يوجد مهنيون متاحون حاليًا',
      carouselHint: '← اسحب أو استخدم الأسهم →',
      prevProvider: 'المهني السابق',
      nextProvider: 'المهني التالي',
      becomeProvider: 'انضم كمقدم خدمة',
      availableNow: 'متاح الآن',
      nextAvailability: 'الموعد القادم',
      now: 'الآن',
      soon: 'قريباً',
      viewProfile: 'عرض الملف',
      viewProfileOf: 'عرض ملف',
    },
    providerTypes: {
      hospital: 'مستشفى',
      birth_hospital: 'مستشفى ولادة',
      clinic: 'عيادة',
      doctor: 'طبيب',
      pharmacy: 'صيدلية',
      lab: 'مختبر',
      blood_cabin: 'مركز التبرع بالدم',
      radiology_center: 'مركز الأشعة',
      medical_equipment: 'معدات طبية',
    },
    homepage: {
      findYourDoctor: 'ابحث عن طبيبك',
      findYourDoctorWord1: 'ابحث',
      findYourDoctorWord2: 'عن',
      findYourDoctorWord3: 'طبيبك',
      connectWith: 'تواصل مع أفضل الأطباء والمتخصصين.',
      simpleQuickFree: 'بسيط، سريع ومجاني.',
      searchPlaceholder: 'ابحث عن طبيب، تخصص...',
      searchPlaceholderDetailed: 'ابحث باسم الطبيب، التخصص، العيادة…',
      heroSubtitleFull: 'دليل الرعاية الصحية رقم 1 في سيدي بلعباس، الجزائر — اعثر على أطباء، عيادات، صيدليات، مختبرات والمزيد. مجاني للمواطنين.',
      searchButton: 'بحث',
      voiceSearch: 'البحث الصوتي',
      myLocation: 'موقعي',
      keyboardHint: 'للبحث',
      popularLabel: 'الأكثر بحثاً:',
      generalDoctor: 'طبيب عام',
      dentist: 'طبيب أسنان',
      cardiologist: 'طبيب قلب',
      pediatrician: 'طبيب أطفال',
      ophthalmologist: 'طبيب عيون',
      emergency247: 'طوارئ 24/7',
      practitioners: 'أطباء',
      consultations: 'استشارات',
      averageRating: 'متوسط التقييم',
      trustedPartners: 'شركاؤنا الموثوقون',
      ministryOfHealth: 'وزارة الصحة',
      orderOfDoctors: 'نقابة الأطباء',
      chuSBA: 'مستشفى سيدي بلعباس',
      cnas: 'الصندوق الوطني',
      pharmacists: 'الصيادلة',
      laboratories: 'المخابر',
      locationBadge: 'سيدي بلعباس، الجزائر',
      simpleEfficient: 'بسيط وفعال',
      howItWorks: 'كيف يعمل',
      threeSteps: '3 خطوات بسيطة للعثور على طبيبك المثالي والتواصل معه',
      step: 'خطوة',
      step1Title: 'ابحث',
      step1Desc: 'ابحث عن متخصص صحي حسب التخصص أو الاسم أو الموقع في قاعدة بياناتنا الموثقة.',
      step2Title: 'قارن',
      step2Desc: 'اطلع على الملفات التفصيلية وآراء المرضى والتوفر في الوقت الحقيقي.',
      step3Title: 'تواصل',
      step3Desc: 'احجز موعداً عبر الإنترنت أو اتصل مباشرة أو احصل على الاتجاهات.',
      ourServices: 'خدماتنا',
      accessNetwork: 'الوصول إلى شبكتنا الكاملة من المتخصصين الصحيين الموثقين',
      popular: 'شائع',
      viewAll: 'عرض الكل',
      available: 'متاح',
      viewAllServices: 'عرض جميع الخدمات',
      doctors: 'أطباء',
      pharmacies: 'صيدليات',
      labs: 'مخابر',
      clinics: 'عيادات',
      hospitals: 'مستشفيات',
      emergencyServices: 'طوارئ',
      bloodDonation: 'التبرع بالدم',
      radiology: 'الأشعة',
      generalist: 'طبيب عام',
      specialist: 'طبيب مختص',
      ambulanceTransport: 'النقل الصحي',
      nurse: 'ممرض',
      homeCare: 'رعاية منزلية',
      emergencyTitle: 'الطوارئ الطبية',
      operational: 'يعمل',
      estimatedWait: 'وقت الانتظار المقدر',
      call: 'اتصل',
      locate: 'تحديد الموقع',
      activeDoctors: 'أطباء نشطون',
      activeDoctorsDesc: 'أطباء موثقون على المنصة',
      coveredMunicipalities: 'بلديات مغطاة',
      coveredMunicipalitiesDesc: 'ولاية سيدي بلعباس',
      appointments: 'مواعيد',
      appointmentsDesc: 'منذ الإطلاق',
      averageRatingLabel: 'متوسط التقييم',
      averageRatingDesc: 'بناءً على 2,340 تقييم',
      statistics: 'إحصائيات',
      ourResults: 'نتائجنا',
      resultsSubtitle: 'أرقام تشهد على التزامنا بصحة سيدي بلعباس',
      swipeMore: 'اسحب لرؤية المزيد',
      verifiedReviews: 'تقييمات موثقة',
      testimonials: 'شهادات',
      whatUsersSay: 'ماذا يقول مستخدمونا',
      patient: 'مريض',
      patientFemale: 'مريضة',
      doctorRole: 'طبيب',
      interactiveMap: 'الخريطة التفاعلية',
      findNearby: 'ابحث عن الأطباء بالقرب منك',
      openMap: 'فتح الخريطة',
      searchPractitioner: 'ابحث عن طبيب...',
      nearbyPractitioners: 'أطباء بالقرب منك',
      results: 'نتائج',
      practitionersOnline: 'أطباء متصلون',
      availableStatus: 'متاح',
      busyStatus: 'مشغول',
      openButton: 'فتح',
    },
    sidebar: {
      map: 'الخريطة',
      bloodDonation: 'التبرع بالدم',
      medicalAssistant: 'المساعد الطبي',
      favorites: 'المفضلة',
      emergencies: 'الطوارئ',
      callEmergency: 'اتصل بـ 15',
    },
    admin: {
      searchPlaceholder: 'بحث...',
      myProfile: 'ملفي الشخصي',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
      totalProviders: 'إجمالي مقدمي الخدمات',
      pendingLabel: 'قيد الانتظار',
      verified: 'موثقون',
      users: 'المستخدمون',
      quickActions: 'إجراءات سريعة',
      pendingVerifications: 'تحقيقات معلقة',
      newRegistrations: 'تسجيلات جديدة',
      adsToModerate: 'إعلانات للمراجعة',
      viewAnalytics: 'عرض التحليلات',
      verificationRate: 'معدل التحقق',
      verificationProgress: 'تقدم التحقق من مقدمي الخدمات',
      outOf: 'من',
      providers: 'مقدمي خدمات',
      rejected: 'مرفوضون',
      recentActivity: 'النشاط الأخير',
      lastAdminActions: 'آخر إجراءات المسؤول',
      viewAll: 'عرض الكل',
      noRecentActivity: 'لا يوجد نشاط حديث',
      platformHealth: 'صحة المنصة',
      keyMetrics: 'نظرة عامة على المقاييس الرئيسية',
      totalAppointments: 'إجمالي المواعيد',
      appointmentsToday: 'مواعيد اليوم',
      reviewsLabel: 'التقييمات',
      averageRating: 'متوسط التقييم',
      newToday: 'جدد اليوم',
      admins: 'المسؤولون',
      accessDenied: 'تم رفض الوصول',
      accessDeniedDesc: 'ليس لديك الصلاحيات اللازمة للوصول إلى البيانات الإدارية. يرجى تسجيل الدخول بحساب مسؤول.',
      retry: 'إعادة المحاولة',
      providerApproved: 'تمت الموافقة على مقدم الخدمة',
      providerRejected: 'تم رفض مقدم الخدمة',
      providerEdited: 'تم تعديل مقدم الخدمة',
      providerDeleted: 'تم حذف مقدم الخدمة',
      adApproved: 'تمت الموافقة على الإعلان',
      adRejected: 'تم رفض الإعلان',
      roleChanged: 'تم تغيير الدور',
      settingsChanged: 'تم تغيير الإعدادات',
      administration: 'الإدارة',
      dashboard: 'لوحة التحكم',
      favorites: 'المفضلة',
      providerSpace: 'مساحة الممارس',
      confirmLogout: 'تأكيد تسجيل الخروج',
      confirmLogoutDesc: 'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
      cancelLabel: 'إلغاء',
      logoutAction: 'تسجيل الخروج',
      skipToContent: 'تخطي إلى المحتوى الرئيسي',
    },
    roles: {
      administrator: 'مسؤول',
      practitioner: 'ممارس',
      citizen: 'مواطن',
    },
    footer: {
      platformDescription: 'منصة الصحة المرجعية لربط المواطنين بأفضل مقدمي الرعاية الصحية.',
      services: 'الخدمات',
      searchDoctors: 'البحث عن الأطباء',
      interactiveMap: 'الخريطة التفاعلية',
      emergency247: 'طوارئ 24/7',
      aiAssistant: 'مساعد الذكاء الاصطناعي',
      bloodDonation: 'التبرع بالدم',
      professionals: 'للمحترفين',
      becomePartner: 'كن شريكاً',
      practitionerRegistration: 'تسجيل الممارس',
      documentation: 'التوثيق',
      verificationCharter: 'ميثاق التحقق',
      login: 'تسجيل الدخول',
      citizenSpace: 'مساحة المواطن',
      patientsIndividuals: 'المرضى والأفراد',
      practitionerSpace: 'مساحة الممارس',
      doctorsEstablishments: 'الأطباء والمؤسسات',
      createCitizenAccount: 'إنشاء حساب مواطن',
      legal: 'قانوني',
      faq: 'الأسئلة الشائعة',
      privacy: 'الخصوصية',
      terms: 'الشروط',
      contact: 'اتصل بنا',
      language: 'اللغة',
      downloadApp: 'حمّل تطبيقنا',
      downloadAppDesc: 'احصل على CityHealth على هاتفك للوصول السريع للرعاية الصحية',
      downloadOn: 'متوفر على',
      emergencyLabel: 'طوارئ:',
      allRightsReserved: 'جميع الحقوق محفوظة.',
      madeWith: 'صنع بـ',
      inAlgeria: 'في الجزائر',
      myFavorites: 'مفضلاتي',
      dashboard: 'لوحة التحكم',
      myAccount: 'حسابي',
      providerDashboard: 'مساحة الممارس',
      administration: 'الإدارة',
      findDoctor: 'البحث عن طبيب',
      openMenu: 'فتح القائمة',
      closeMenu: 'إغلاق القائمة',
      resources: 'الموارد',
    },
    appointments: {
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      cancelled: 'ملغي',
      completed: 'مكتمل',
      cancel: 'إلغاء',
      noProvider: 'لم يتم اختيار طبيب',
      searchProvider: 'البحث عن طبيب',
      bookAppointment: 'حجز موعد',
      upcoming: 'القادمة',
      history: 'السجل',
      myReviews: 'تقييماتي',
      noUpcoming: 'لا توجد مواعيد قادمة',
      noHistory: 'لا يوجد سجل مواعيد',
      noReviews: 'لا توجد تقييمات',
      cancelSuccess: 'تم إلغاء الموعد',
      cancelError: 'خطأ أثناء الإلغاء',
      exportPDF: 'تصدير PDF',
      myDashboard: 'لوحة التحكم',
      welcome: 'مرحباً',
      upcomingCount: 'مواعيد قادمة',
      totalCount: 'إجمالي المواعيد',
      reviewsGiven: 'تقييمات مقدمة',
      reviewFor: 'تقييم لـ',
      published: 'منشور',
      providerResponse: 'رد المهني',
      date: 'التاريخ',
      time: 'الوقت',
      yourInfo: 'معلوماتك',
      fullName: 'الاسم الكامل',
      phone: 'الهاتف',
      emailOptional: 'البريد الإلكتروني (اختياري)',
      notesOptional: 'ملاحظات (اختياري)',
      back: 'رجوع',
      morning: 'صباحاً',
      afternoon: 'بعد الظهر',
      noSlots: 'لا توجد مواعيد متاحة في هذا اليوم',
      today: 'اليوم',
      moreDates: 'تواريخ أخرى',
      hideCalendar: 'إخفاء التقويم',
      bookingInProgress: 'جاري الحجز...',
      confirmAppointment: 'تأكيد الموعد',
      createdSuccess: 'تم إنشاء الموعد بنجاح!',
      creationError: 'خطأ أثناء الإنشاء',
    },
    contact: {
      title: 'اتصل بنا',
      subtitle: 'فريقنا هنا لمساعدتك. لا تتردد في الاتصال بنا لأي سؤال أو اقتراح.',
      sendMessage: 'أرسل لنا رسالة',
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      requestType: 'نوع الطلب',
      choosePlaceholder: 'اختر النوع',
      subject: 'الموضوع',
      subjectPlaceholder: 'موضوع رسالتك',
      message: 'الرسالة',
      messagePlaceholder: 'صف طلبك بالتفصيل...',
      send: 'إرسال الرسالة',
      contactInfo: 'معلومات الاتصال',
      phone: 'الهاتف',
      emailLabel: 'البريد الإلكتروني',
      address: 'العنوان',
      hours: 'ساعات العمل',
      faq: 'الأسئلة الشائعة',
      emergencyTitle: 'حالة طوارئ طبية',
      emergencyDesc: 'في حالة الطوارئ الطبية، اتصل مباشرة بخدمات الطوارئ',
      callEmergency: 'اتصل بـ 15',
      teamTitle: 'فريقنا',
      teamSubtitle: 'المؤسسون والمطورون الرئيسيون للمنصة',
      requiredFields: 'حقول مطلوبة',
      requiredFieldsDesc: 'يرجى ملء جميع الحقول الإلزامية',
      messageSent: 'تم إرسال الرسالة',
      messageSentDesc: 'تم إرسال رسالتك بنجاح. سنرد عليك قريباً.',
      technicalSupport: 'الدعم التقني',
      generalQuestion: 'سؤال عام',
      partnership: 'طلب شراكة',
      providerRegistration: 'تسجيل مقدم خدمة',
      report: 'إبلاغ',
      other: 'أخرى',
      phoneNumber: '+213 48 XX XX XX',
      phoneHours: 'الإثنين-الجمعة 8ص-6م',
      emailAddress: 'contact@cityhealth-sba.dz',
      emailResponse: 'رد خلال 24 ساعة',
      addressDetails: 'وسط المدينة، سيدي بلعباس',
      addressCity: 'الجزائر 22000',
      workingHours: 'الإثنين-الجمعة: 8ص-6م',
      saturdayHours: 'السبت: 9ص-1م',
      faq1Q: 'كيف أسجل كمقدم خدمة؟',
      faq1A: 'اذهب إلى صفحة "مساحة المقدم" واملأ نموذج التسجيل. سيتحقق فريقنا من معلوماتك خلال 48 ساعة.',
      faq2Q: 'هل الاستشارات مجانية؟',
      faq2A: 'CityHealth هي منصة ربط. تعتمد رسوم الاستشارات على كل مقدم خدمة.',
      faq3Q: 'كيف أبلغ عن مشكلة؟',
      faq3A: 'استخدم نموذج الاتصال واختر "إبلاغ" أو اتصل بنا مباشرة عبر الهاتف.',
      faq4Q: 'هل يمكنني تعديل معلوماتي؟',
      faq4A: 'نعم، سجل الدخول إلى حسابك واذهب إلى قسم "الملف الشخصي" لتعديل معلوماتك.',
      coFounderDev: 'المؤسس المشارك والمطور الرئيسي',
      coFounderCTO: 'المؤسس المشارك والمدير التقني',
      descNaimi: 'مؤسس مشارك لـ CityHealth، مكرس لبناء حلول صحية رقمية متاحة للجزائر.',
      descAbdelilah: 'مؤسس مشارك ومهندس تقني لـ CityHealth، متخصص في البنى التحتية القابلة للتوسع للقطاع الطبي.',
      support247: 'دعم 24/7',
      errorTitle: 'خطأ',
      errorDesc: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
      emailPlaceholder: 'بريدك@email.com',
    },
    notFound: {
      title: '404',
      message: 'عذراً! الصفحة غير موجودة',
      returnHome: 'العودة إلى الرئيسية',
    },
    loginPage: {
      citizenSpace: 'مساحة المواطن',
      citizenDesc: 'سجل الدخول للوصول إلى خدماتك الصحية',
      providerSpace: 'مساحة المقدم',
      providerDesc: 'سجل الدخول لإدارة مؤسستك الصحية',
      loginButton: 'تسجيل الدخول',
      forgotPassword: 'نسيت كلمة المرور؟',
      forgotPasswordTitle: 'نسيت كلمة المرور',
      resetSent: 'تم إرسال بريد إعادة التعيين',
      resetDesc: 'أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين',
      sendLink: 'إرسال الرابط',
      backToLogin: 'العودة لتسجيل الدخول',
      noAccount: 'ليس لديك حساب؟',
      createAccount: 'إنشاء حساب',
      registerEstablishment: 'تسجيل مؤسستي',
      backToHome: 'العودة للرئيسية',
      or: 'أو',
      continueGoogle: 'المتابعة مع جوجل',
      notCitizenAccount: 'هذا الحساب ليس حساب مواطن',
      notProviderAccount: 'هذا الحساب ليس حساب مقدم خدمة',
      noAccountForEmail: 'لا يوجد حساب مرتبط بهذا البريد',
      sendError: 'خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.',
      checkInbox: 'تحقق من صندوق الوارد.',
      invalidEmail: 'بريد إلكتروني غير صالح',
      passwordMinLength: 'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل',
    },
    booking: {
      information: 'المعلومات',
      dateTime: 'التاريخ والوقت',
      confirmation: 'التأكيد',
      selectDate: 'اختر تاريخاً',
      quickDates: 'تواريخ سريعة',
      moreDates: 'تواريخ أخرى',
      slotsFor: 'المواعيد المتاحة لـ',
      realTimeUpdate: 'يتم تحديث التوفر في الوقت الحقيقي',
      summary: 'ملخص موعدك',
      practitioner: 'الطبيب',
      patient: 'المريض',
      date: 'التاريخ',
      time: 'الوقت',
      contact: 'الاتصال',
      notes: 'ملاحظات',
      confirmationEmail: 'ستتلقى تأكيداً مع تذكير قبل 24 ساعة من الموعد.',
      reserving: 'جاري الحجز...',
      phoneRequired: 'رقم الهاتف مطلوب',
      phoneDigits: 'يجب أن يحتوي الرقم على 10 أرقام',
      phonePrefix: 'يجب أن يبدأ الرقم بـ 05 أو 06 أو 07',
    },
    featuredProviders: {
      topPractitioners: 'أفضل الأطباء',
      healthProfessionals: 'المهنيون الصحيون',
      bestRated: 'الأطباء الأعلى تقييماً في منطقتك',
      viewAll: 'عرض الكل',
      viewAllPractitioners: 'عرض جميع الأطباء',
      available: 'متاح',
      soon: 'قريباً',
      noPractitioners: 'لا يوجد أطباء متاحون حالياً',
      becomePractitioner: 'انضم كطبيب',
    },
    guards: {
      accessDenied: 'تم رفض الوصول',
      accessDeniedAdminDesc: 'هذا القسم مخصص للمسؤولين فقط.',
      accessDeniedProviderDesc: 'ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة.',
      accessDeniedCitizenDesc: 'هذا القسم مخصص لحسابات المواطنين.',
      noPermissions: 'ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة.',
      returnHome: 'العودة للرئيسية',
      back: 'رجوع',
      verifyingAuth: 'التحقق من المصادقة...',
      loadingProfile: 'تحميل الملف الشخصي...',
      verifyingAdmin: 'التحقق من صلاحيات المسؤول...',
      citizenOnly: 'مخصص للمواطنين فقط',
      citizenOnlyDesc: 'سجل الدخول بحساب مواطن للوصول إلى هذه الصفحة.',
      citizenLogin: 'تسجيل دخول المواطن',
      noProviderAccount: 'لا يوجد حساب مهني',
      noProviderAccountDesc: 'للوصول إلى المساحة المهنية، يجب أولاً إنشاء حساب مقدم خدمة.',
      createProviderAccount: 'إنشاء حسابي المهني',
      accountPending: 'حساب قيد الانتظار',
      accountPendingDesc: 'هذه الميزة مخصصة للحسابات الموثقة. طلبك قيد المعالجة.',
      returnDashboard: 'العودة للوحة التحكم',
      becomeProvider: 'كن مقدم خدمة',
      loadingProviderSpace: 'تحميل مساحتك المهنية...',
      requireRole: 'هذه الصفحة تتطلب دور "{role}" للوصول.',
    },
    map: {
      loadingMap: 'تحميل الخريطة...',
      locating: 'تحديد الموقع...',
      locationError: 'تعذر الحصول على موقعك',
      yourPosition: 'موقعك',
      providersTitle: 'خريطة تفاعلية للمقدمين',
      providersSubtitle: 'اكتشف جميع المؤسسات الصحية الموثقة في سيدي بلعباس',
      emergencyTitle: 'خدمات الطوارئ',
      emergencySubtitle: 'حدد بسرعة أقرب خدمات الطوارئ',
      bloodTitle: 'التبرع بالدم ومراكز نقل الدم',
      bloodSubtitle: 'ابحث عن المستشفيات ومراكز التبرع بالدم',
    },
    navbar: {
      home: 'الرئيسية',
      findProviders: 'البحث عن مقدمي الخدمات',
      map: 'الخريطة',
      emergency: 'الطوارئ',
      favorites: 'المفضلة',
      contact: 'اتصل بنا',
      profile: 'الملف الشخصي',
      search: 'بحث',
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      adminBadge: '(مسؤول)',
      providerBadge: '(ممارس)',
    },
    offers: {
      proposeHelp: 'تقديم المساعدة',
      offerPublished: 'تم نشر العرض بنجاح!',
      publishError: 'خطأ أثناء النشر',
      freeDonations: 'تبرعات مجانية',
      freeDonationsDesc: 'اقترح أو ابحث عن تبرعات مجانية',
      communityAid: 'التضامن المجتمعي',
      communityAidDesc: 'اقترح أو ابحث عن مساعدة مجانية بالقرب منك',
      contact: 'اتصال',
      edit: 'تعديل',
      deleteOffer: 'حذف',
      contactOwner: 'اتصل',
      contactMethod: 'طريقة الاتصال',
      clickToReveal: 'انقر أدناه لعرض بيانات الاتصال.',
      reveal: 'عرض',
      closeLbl: 'إغلاق',
      phone: 'هاتف',
      email: 'بريد إلكتروني',
      message: 'رسالة',
      all: 'الكل',
      noOffers: 'لا توجد عروض حالياً',
      noOffersHint: 'كن أول من يقدم المساعدة!',
      myOffers: 'عروضي',
      myOffersDesc: 'إدارة عروض المساعدة الخاصة بك',
      newOffer: 'عرض جديد',
      editOffer: 'تعديل العرض',
      editBack: 'رجوع',
      offerUpdated: 'تم تحديث العرض',
      updateError: 'خطأ أثناء التحديث',
      offerDeleted: 'تم حذف العرض',
      deleteError: 'خطأ أثناء الحذف',
      deleteConfirm: 'حذف هذا العرض؟',
      deleteConfirmDesc: 'هذا الإجراء لا رجعة فيه.',
      cancelLbl: 'إلغاء',
      statusUpdated: 'تم تحديث الحالة',
      statusError: 'خطأ أثناء التحديث',
      offerNotFound: 'العرض غير موجود أو تم رفض الوصول',
      accessDenied: 'تم رفض الوصول',
      accessDeniedDesc: 'يمكن فقط للأطباء والصيدليات نشر التبرعات.',
      doctorPharmacyOnly: 'مخصص للأطباء والصيدليات',
      catFood: 'طعام',
      catMedicine: 'أدوية',
      catTools: 'أدوات',
      catTransport: 'نقل',
      catOther: 'أخرى',
      statusAvailable: 'متاح',
      statusReserved: 'محجوز',
      statusTaken: 'مأخوذ',
      justNow: 'الآن',
      minutesAgo: 'منذ {n} دقيقة',
      hoursAgo: 'منذ {n} ساعة',
      daysAgo: 'منذ {n} يوم',
      showMore: 'عرض المزيد',
      showLess: 'عرض أقل',
      locate: 'تحديد الموقع',
      formPhoto: 'صورة المنتج',
      formTitle: 'العنوان',
      formTitlePlaceholder: 'مثال: مجموعة أدوية مسكنة',
      formDescription: 'الوصف',
      formDescPlaceholder: 'صف ما تقدمه...',
      formCategory: 'الفئة',
      formContactMethod: 'طريقة الاتصال',
      formContactPhone: 'رقم الهاتف',
      formContactEmail: 'البريد الإلكتروني',
      formContactApp: 'المعرف / الاسم المستعار',
      formLocation: 'الموقع',
      formLocationPlaceholder: 'العنوان (اختياري)',
      formLocationError: 'يرجى تحديد موقع صالح',
      formPublish: 'نشر',
      formDropImage: 'انقر أو اسحب صورة',
      formImageHint: 'JPG, PNG — 5 ميغا كحد أقصى',
      formPhone: 'هاتف',
      formEmail: 'بريد إلكتروني',
      formInApp: 'داخل التطبيق',
    },
    community: {
      title: 'آراء وأفكار',
      subtitle: 'شاركوا أفكاركم واقتراحاتكم وتجاربكم مع المجتمع',
      badge: 'فضاء المجتمع',
      headerLink: 'آراء وأفكار',
      composerPlaceholder: 'شارك فكرة أو رأي أو سؤال...',
      titlePlaceholder: 'عنوان منشورك',
      contentPlaceholder: 'اوصف فكرتك أو شارك تجربتك...',
      publish: 'نشر',
      anonymous: 'مجهول',
      anonymousUser: 'مستخدم مجهول',
      unknownUser: 'مستخدم',
      allCategories: 'الكل',
      catSuggestion: 'اقتراح',
      catFeedback: 'ملاحظة',
      catExperience: 'تجربة',
      catQuestion: 'سؤال',
      catAdmin: 'إدارة',
      searchPlaceholder: 'البحث في المجتمع...',
      sortNewest: 'الأحدث',
      sortMostUpvoted: 'الأكثر فائدة',
      sortMostDiscussed: 'الأكثر نقاشاً',
      upvote: 'مفيد',
      comment: 'تعليق',
      reply: 'رد',
      report: 'إبلاغ',
      replyPlaceholder: 'اكتب رداً...',
      commentPlaceholder: 'اكتب تعليقاً...',
      noPosts: 'لا توجد منشورات حتى الآن. كن أول من ينشر!',
      loadMore: 'تحميل المزيد',
      postCreated: 'تم إنشاء المنشور بنجاح!',
      loginRequired: 'سجل الدخول للتفاعل',
      reportTitle: 'الإبلاغ عن محتوى',
      reportSpam: 'رسائل مزعجة',
      reportAbuse: 'إساءة',
      reportFalseInfo: 'معلومات خاطئة',
      reportOther: 'أخرى',
      reportDetailsPlaceholder: 'صف المشكلة (اختياري)...',
      reportSubmit: 'إرسال البلاغ',
      reportSuccess: 'تم إرسال البلاغ. شكراً!',
      profanityError: 'يحتوي المحتوى على كلمات غير لائقة.',
      loginToParticipate: 'سجل الدخول للمشاركة في المجتمع',
      adminAnnouncement: 'إعلان رسمي',
      announcements: 'الإعلانات',
      communityFeed: 'المنشورات',
      createAnnouncement: 'إعلان جديد',
      newAnnouncements: 'إعلانات جديدة',
      viewAnnouncements: 'عرض الإعلانات',
      dismissAnnouncement: 'إغلاق',
      pinBeforePublish: 'تثبيت في الكل',
      officialOnly: 'تواصل رسمي',
    },
    citizenDashboard: {
      greeting: 'مرحباً',
      quickAccess: 'الوصول السريع للخدمات',
      searchProvider: 'البحث عن طبيب',
      searchProviderDesc: 'ابحث عن طبيب أو أخصائي',
      interactiveMap: 'الخريطة التفاعلية',
      interactiveMapDesc: 'استكشف المؤسسات القريبة',
      emergencies: 'الطوارئ',
      emergenciesDesc: 'خدمات الطوارئ 24/7',
      aiAssistant: 'المساعد الطبي الذكي',
      aiAssistantDesc: 'اطرح أسئلتك الصحية',
      bloodDonation: 'التبرع بالدم',
      bloodDonationDesc: 'استجب للنداءات العاجلة',
      communityHub: 'المجتمع',
      communityHubDesc: 'تبادل مع المرضى الآخرين',
      medicalAds: 'الإعلانات الطبية',
      medicalAdsDesc: 'عروض وأخبار صحية',
      medicalResearch: 'البحث الطبي',
      medicalResearchDesc: 'مقالات ومنشورات',
      myProfile: 'ملفي الشخصي',
      myProfileDesc: 'إدارة معلوماتك',
      myFavorites: 'مفضلاتي',
      myFavoritesDesc: 'الأطباء المحفوظون',
      appointments: 'المواعيد',
      appointmentsDesc: 'إدارة استشاراتك',
      freeGiving: 'تبرع مجاني',
      freeGivingDesc: 'قدم أو احصل على مساعدة',
      tabNotifications: 'الإشعارات',
      tabUpcoming: 'القادمة',
      tabHistory: 'السجل',
      tabOffers: 'إعلاناتي',
      tabReviews: 'تقييماتي',
      tabFavorites: 'المفضلة',
      emptyNotifications: 'لا توجد إشعارات',
      emptyNotificationsHint: 'سيتم إعلامك بتغييرات مواعيدك',
      emptyUpcoming: 'لا توجد مواعيد قادمة',
      emptyUpcomingHint: 'ستظهر مواعيدك القادمة هنا',
      emptyHistory: 'لا يوجد سجل مواعيد',
      emptyOffers: 'لا توجد إعلانات منشورة',
      emptyOffersHint: 'اقترح المساعدة على المجتمع',
      emptyReviews: 'لا توجد تقييمات',
      emptyReviewsHint: 'شارك تجربتك مع الأطباء',
      emptyFavorites: 'لا توجد مفضلات',
      emptyFavoritesHint: 'احفظ أطباءك المفضلين',
      findDoctor: 'البحث عن طبيب',
      createOffer: 'إنشاء إعلان',
      browseProviders: 'تصفح الأطباء',
      bookAgain: 'حجز موعد',
      viewProvider: 'عرض الملف',
      allFilter: 'الكل',
      completedFilter: 'مكتمل',
      cancelledFilter: 'ملغي',
      confirmedFilter: 'مؤكد',
      pendingFilter: 'قيد الانتظار',
      markAllRead: 'قراءة الكل',
      clearNotifs: 'مسح',
      noFilterResults: 'لا توجد مواعيد بهذا الفلتر',
      rdvWith: 'موعد مع',
      statusChange: 'تغيير الحالة',
    },
  },

  en: {
    common: {
      search: 'Search',
      filters: 'Filters',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      clear: 'Clear',
      close: 'Close',
      open: 'Open',
      closed: 'Closed',
      new: 'New',
    },
    hero: {
      title: 'Find the Best Care\nin Sidi Bel Abbès',
      subtitle: 'Discover and book appointments with the best healthcare professionals near you',
      cta: 'Search for a Provider',
      illustration: 'Modern medical illustration',
    },
    quickSearch: {
      title: 'Quick Search',
      namePlaceholder: 'Name or specialty...',
      typePlaceholder: 'Provider type',
      locationPlaceholder: 'Location...',
      launchSearch: 'Launch search',
      doctor: 'Doctor',
      clinic: 'Clinic',
      pharmacy: 'Pharmacy',
      lab: 'Laboratory',
    },
    header: {
      providers: 'Providers',
      contact: 'Contact',
      profile: 'My Profile',
      settings: 'Settings',
      logout: 'Logout',
      signup: 'Sign Up',
      signin: 'Sign In',
      dashboard: 'Dashboard',
    },
    nav: {
      home: 'Home',
      search: 'Search',
      providers: 'Providers',
      emergency: 'Emergency',
      profile: 'Profile',
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      contact: 'Contact',
    },
    search: {
      placeholder: 'Search for doctor, pharmacy, lab...',
      results: 'results',
      noResults: 'No results found',
      filterByType: 'Type',
      filterByArea: 'Area',
      filterByRating: 'Rating',
      viewMap: 'Map view',
      viewList: 'List view',
      searchPlaceholder: 'Search for doctors, clinics, pharmacies...',
      recentSearches: 'Recent searches',
      suggestions: 'Suggestions',
      clearHistory: 'Clear',
      sortBy: 'Sort by',
      sortRelevance: 'Relevance',
      sortDistance: 'Distance',
      sortRating: 'Rating',
      sortPrice: 'Price',
      sortNewest: 'Newest',
      foundProviders: 'providers found',
      inYourArea: 'in your area',
      viewGrid: 'Grid view',
      noResultsTitle: 'No results found',
      noResultsDescription: 'Try adjusting your search criteria or expanding your search area',
      tryDifferentFilters: 'Try different filters',
    },
    filters: {
      advancedFilters: 'Advanced filters',
      clearAll: 'Clear all',
      serviceCategories: 'Service categories',
      generalDoctors: 'General doctors',
      specialists: 'Specialists',
      pharmacies: 'Pharmacies',
      laboratories: 'Laboratories',
      clinics: 'Clinics',
      hospitals: 'Hospitals',
      locationDistance: 'Location & distance',
      enterLocation: 'City or postal code',
      radius: 'Radius',
      availability: 'Availability',
      anyTime: 'Any time',
      today: 'Today',
      thisWeek: 'This week',
      openNow: 'Open now',
      minimumRating: 'Minimum rating',
      anyRating: 'Any rating',
      stars: 'stars',
      starsAndUp: 'stars and up',
      specialOptions: 'Special options',
      verifiedOnly: 'Verified providers only',
      emergencyServices: 'Emergency services',
      wheelchairAccessible: 'Wheelchair accessible',
      insuranceAccepted: 'Insurance accepted',
      priceRange: 'Price range',
      affordable: 'Affordable',
      moderate: 'Moderate',
      premium: 'Premium',
    },
    provider: {
      verified: 'Verified',
      rating: 'Rating',
      reviews: 'reviews',
      bookAppointment: 'Book appointment',
      callNow: 'Call now',
      getDirections: 'Get directions',
      about: 'About',
      services: 'Services',
      hours: 'Hours',
      location: 'Location',
      emergency: '24/7 Emergency',
      accessible: 'Wheelchair accessible',
      openNow: 'Open now',
      closed: 'Closed',
      viewProfile: 'View profile',
      specialty: 'Specialty',
      distance: 'Distance',
      newProvider: 'New',
      gallery: 'Gallery',
      contact: 'Contact',
      announcements: 'Announcements',
      viewAvailability: 'View availability',
      shareProfile: 'Share this profile',
      reportProfile: 'Report this profile',
      addToFavorites: 'Add to favorites',
      removeFromFavorites: 'Favorite',
      copyLink: 'Copy link',
      linkCopied: 'Link copied!',
      languages: 'Languages',
      specialties: 'Specialties',
      noAnnouncements: 'No announcements at the moment',
      notFound: 'Provider not found',
      notFoundDesc: 'The requested profile does not exist or has been deleted.',
      backToSearch: 'Back to search',
      openInMaps: 'Open in Maps',
      callPhone: 'Call',
      newService: 'New service available',
      extendedHours: 'Extended hours',
      insuranceAccepted: 'Insurance accepted',
      is24_7: '24/7',
    },
    days: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      mondayShort: 'Mon',
      tuesdayShort: 'Tue',
      wednesdayShort: 'Wed',
      thursdayShort: 'Thu',
      fridayShort: 'Fri',
      saturdayShort: 'Sat',
      sundayShort: 'Sun',
    },
    reviews: {
      title: 'Reviews and ratings',
      writeReview: 'Write a review',
      yourRating: 'Your rating',
      yourReview: 'Your review',
      submit: 'Submit',
      helpful: 'Helpful',
      providerResponse: 'Provider response',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    },
    auth: {
      login: 'Login',
      signup: 'Sign up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      forgotPassword: 'Forgot password?',
      rememberMe: 'Remember me',
      or: 'or',
      continueWithGoogle: 'Continue with Google',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      role: 'I am',
      patient: 'Patient',
      provider: 'Healthcare provider',
    },
    chat: {
      title: 'AI Health Assistant',
      placeholder: 'Ask your question...',
      disclaimer: 'This is a virtual assistant. Always consult a healthcare professional.',
    },
    verification: {
      verified: 'Verified',
      verifiedTooltip: 'This provider has been verified by CityHealth and provided all necessary documents.',
      premium: 'Premium',
      premiumTooltip: 'Premium provider with high-quality services and excellent reputation.',
      certified: 'Certified',
      certifiedTooltip: 'Holds recognized and up-to-date professional certifications.',
      pending: 'Pending',
      pendingTooltip: 'Verification is being processed.',
      rejected: 'Rejected',
      rejectedTooltip: 'The verification request was declined.',
      revoked: 'Revoked',
      revokedTitle: 'Verification Revoked',
      revokedDescription: 'Your verified status has been revoked due to sensitive data modification. Your profile is no longer publicly visible.',
      revokedFieldsLabel: 'Modified fields',
      revokedAtLabel: 'Revoked on',
      submitNewVerification: 'Submit new verification',
      partnerAds: 'Partner Ads',
      discoverServices: 'Health Services to Discover',
      discoverServicesSubtitle: 'Discover offers from our verified health partners in Sidi Bel Abbès',
    },
    providers: {
      featured: 'Featured Providers',
      featuredSubtitle: 'Verified and highly-rated healthcare professionals',
      viewAll: 'View All Providers',
      noProviders: 'No providers available at the moment',
      carouselHint: '← Swipe or use arrows →',
      prevProvider: 'Previous provider',
      nextProvider: 'Next provider',
      becomeProvider: 'Become a provider',
      availableNow: 'Available now',
      nextAvailability: 'Next availability',
      now: 'Now',
      soon: 'Coming soon',
      viewProfile: 'View profile',
      viewProfileOf: 'View profile of',
    },
    providerTypes: {
      hospital: 'Hospital',
      birth_hospital: 'Birth hospital',
      clinic: 'Clinic',
      doctor: 'Doctor',
      pharmacy: 'Pharmacy',
      lab: 'Laboratory',
      blood_cabin: 'Blood donation center',
      radiology_center: 'Radiology center',
      medical_equipment: 'Medical equipment',
    },
    homepage: {
      findYourDoctor: 'Find your doctor',
      findYourDoctorWord1: 'Find',
      findYourDoctorWord2: 'your',
      findYourDoctorWord3: 'doctor',
      connectWith: 'Connect with the best healthcare practitioners.',
      simpleQuickFree: 'Simple, fast and free.',
      searchPlaceholder: 'Search for a practitioner, specialty...',
      searchPlaceholderDetailed: 'Search by doctor name, specialty, clinic…',
      heroSubtitleFull: 'The #1 healthcare directory for Sidi Bel Abbès, Algeria — find doctors, clinics, pharmacies, labs and more. Free for citizens.',
      searchButton: 'Search',
      voiceSearch: 'Voice search',
      myLocation: 'My location',
      keyboardHint: 'to search',
      popularLabel: 'Popular:',
      generalDoctor: 'General practitioner',
      dentist: 'Dentist',
      cardiologist: 'Cardiologist',
      pediatrician: 'Pediatrician',
      ophthalmologist: 'Ophthalmologist',
      emergency247: 'Emergency 24/7',
      practitioners: 'Practitioners',
      consultations: 'Consultations',
      averageRating: 'Average rating',
      trustedPartners: 'Our trusted partners',
      ministryOfHealth: 'Ministry of Health',
      orderOfDoctors: 'Medical Association',
      chuSBA: 'CHU Sidi Bel Abbès',
      cnas: 'CNAS',
      pharmacists: 'Pharmacists',
      laboratories: 'Laboratories',
      locationBadge: 'Sidi Bel Abbès, Algeria',
      simpleEfficient: 'Simple & Efficient',
      howItWorks: 'How it works',
      threeSteps: '3 simple steps to find and contact your ideal practitioner',
      step: 'Step',
      step1Title: 'Search',
      step1Desc: 'Find a healthcare professional by specialty, name or location in our verified database.',
      step2Title: 'Compare',
      step2Desc: 'View detailed profiles, patient reviews and real-time availability.',
      step3Title: 'Contact',
      step3Desc: 'Book an appointment online, call directly or get directions to the office.',
      ourServices: 'Our Services',
      accessNetwork: 'Access our full network of verified healthcare professionals',
      popular: 'Popular',
      viewAll: 'View all',
      available: 'avail.',
      viewAllServices: 'View all services',
      doctors: 'Doctors',
      pharmacies: 'Pharmacies',
      labs: 'Laboratories',
      clinics: 'Clinics',
      hospitals: 'Hospitals',
      emergencyServices: 'Emergency',
      bloodDonation: 'Blood donation',
      radiology: 'Radiology',
      generalist: 'General Practitioner',
      specialist: 'Specialist',
      ambulanceTransport: 'Ambulance Transport',
      nurse: 'Nurse',
      homeCare: 'Home Care',
      emergencyTitle: 'Medical Emergency',
      operational: 'Operational',
      estimatedWait: 'Estimated wait time',
      call: 'Call',
      locate: 'Locate',
      activeDoctors: 'Active Doctors',
      activeDoctorsDesc: 'Verified practitioners on the platform',
      coveredMunicipalities: 'Covered Municipalities',
      coveredMunicipalitiesDesc: 'Wilaya of Sidi Bel Abbès',
      appointments: 'Appointments',
      appointmentsDesc: 'Since launch',
      averageRatingLabel: 'Average Rating',
      averageRatingDesc: 'Based on 2,340 reviews',
      statistics: 'Statistics',
      ourResults: 'Results',
      resultsSubtitle: 'Numbers that show our commitment to healthcare in Sidi Bel Abbès',
      swipeMore: 'Swipe to see more',
      verifiedReviews: 'Verified reviews',
      testimonials: 'Testimonials',
      whatUsersSay: 'What our users say',
      patient: 'Patient',
      patientFemale: 'Patient',
      doctorRole: 'Doctor',
      interactiveMap: 'Interactive Map',
      findNearby: 'Find practitioners near you',
      openMap: 'Open map',
      searchPractitioner: 'Search for a practitioner...',
      nearbyPractitioners: 'Nearby practitioners',
      results: 'results',
      practitionersOnline: 'practitioners online',
      availableStatus: 'Available',
      busyStatus: 'Busy',
      openButton: 'Open',
    },
    sidebar: {
      map: 'Map',
      bloodDonation: 'Blood Donation',
      medicalAssistant: 'Medical Assistant',
      favorites: 'Favorites',
      emergencies: 'Emergencies',
      callEmergency: 'Call 15',
    },
    admin: {
      searchPlaceholder: 'Search...',
      myProfile: 'My Profile',
      settings: 'Settings',
      logout: 'Logout',
      totalProviders: 'Total Providers',
      pendingLabel: 'Pending',
      verified: 'Verified',
      users: 'Users',
      quickActions: 'Quick Actions',
      pendingVerifications: 'Pending verifications',
      newRegistrations: 'New registrations',
      adsToModerate: 'Ads to moderate',
      viewAnalytics: 'View analytics',
      verificationRate: 'Verification Rate',
      verificationProgress: 'Provider verification progress',
      outOf: 'out of',
      providers: 'providers',
      rejected: 'Rejected',
      recentActivity: 'Recent Activity',
      lastAdminActions: 'Latest admin actions',
      viewAll: 'View all',
      noRecentActivity: 'No recent activity',
      platformHealth: 'Platform Health',
      keyMetrics: 'Overview of key metrics',
      totalAppointments: 'Total Appt.',
      appointmentsToday: 'Appt. Today',
      reviewsLabel: 'Reviews',
      averageRating: 'Avg. Rating',
      newToday: 'New Today',
      admins: 'Admins',
      accessDenied: 'Access Denied',
      accessDeniedDesc: 'You do not have the necessary permissions to access administrative data. Please sign in with an admin account.',
      retry: 'Retry',
      providerApproved: 'Provider approved',
      providerRejected: 'Provider rejected',
      providerEdited: 'Provider edited',
      providerDeleted: 'Provider deleted',
      adApproved: 'Ad approved',
      adRejected: 'Ad rejected',
      roleChanged: 'Role changed',
      settingsChanged: 'Settings changed',
      administration: 'Administration',
      dashboard: 'Dashboard',
      favorites: 'Favorites',
      providerSpace: 'Provider Space',
      confirmLogout: 'Confirm logout',
      confirmLogoutDesc: 'Are you sure you want to log out?',
      cancelLabel: 'Cancel',
      logoutAction: 'Log out',
      skipToContent: 'Skip to main content',
    },
    roles: {
      administrator: 'Administrator',
      practitioner: 'Practitioner',
      citizen: 'Citizen',
    },
    footer: {
      platformDescription: 'The reference platform connecting citizens with verified healthcare providers.',
      services: 'Services',
      searchDoctors: 'Search doctors',
      interactiveMap: 'Interactive map',
      emergency247: 'Emergency 24/7',
      aiAssistant: 'AI Health Assistant',
      bloodDonation: 'Blood donation',
      professionals: 'Professionals',
      becomePartner: 'Become a partner',
      practitionerRegistration: 'Practitioner registration',
      documentation: 'Documentation',
      verificationCharter: 'Verification charter',
      login: 'Login',
      citizenSpace: 'Citizen Space',
      patientsIndividuals: 'Patients & individuals',
      practitionerSpace: 'Practitioner Space',
      doctorsEstablishments: 'Doctors & establishments',
      createCitizenAccount: 'Create citizen account',
      legal: 'Legal',
      faq: 'FAQ',
      privacy: 'Privacy',
      terms: 'Terms',
      contact: 'Contact',
      language: 'Language',
      downloadApp: 'Download our app',
      downloadAppDesc: 'Access CityHealth on your phone for quick healthcare access',
      downloadOn: 'Download on',
      emergencyLabel: 'Emergency:',
      allRightsReserved: 'All rights reserved.',
      madeWith: 'Made with',
      inAlgeria: 'in Algeria',
      myFavorites: 'My favorites',
      dashboard: 'Dashboard',
      myAccount: 'My Account',
      providerDashboard: 'Practitioner Space',
      administration: 'Administration',
      findDoctor: 'Find a doctor',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      resources: 'Resources',
    },
    appointments: {
      pending: 'Pending',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      completed: 'Completed',
      cancel: 'Cancel',
      noProvider: 'No provider selected',
      searchProvider: 'Search for a provider',
      bookAppointment: 'Book appointment',
      upcoming: 'Upcoming',
      history: 'History',
      myReviews: 'My reviews',
      noUpcoming: 'No upcoming appointments',
      noHistory: 'No appointment history',
      noReviews: 'No reviews given',
      cancelSuccess: 'Appointment cancelled',
      cancelError: 'Error cancelling appointment',
      exportPDF: 'Export PDF',
      myDashboard: 'My Dashboard',
      welcome: 'Welcome',
      upcomingCount: 'Upcoming appointments',
      totalCount: 'Total appointments',
      reviewsGiven: 'Reviews given',
      reviewFor: 'Review for',
      published: 'Published',
      providerResponse: 'Provider response',
      date: 'Date',
      time: 'Time',
      yourInfo: 'Your information',
      fullName: 'Full name',
      phone: 'Phone',
      emailOptional: 'Email (optional)',
      notesOptional: 'Notes (optional)',
      back: 'Back',
      morning: 'Morning',
      afternoon: 'Afternoon',
      noSlots: 'No slots available on this day',
      today: 'Today',
      moreDates: 'More dates',
      hideCalendar: 'Hide calendar',
      bookingInProgress: 'Booking in progress...',
      confirmAppointment: 'Confirm appointment',
      createdSuccess: 'Appointment created successfully!',
      creationError: 'Error creating appointment',
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'Our team is here to help. Don\'t hesitate to reach out for any questions or suggestions.',
      sendMessage: 'Send us a message',
      fullName: 'Full name',
      email: 'Email',
      requestType: 'Request type',
      choosePlaceholder: 'Choose type',
      subject: 'Subject',
      subjectPlaceholder: 'Subject of your message',
      message: 'Message',
      messagePlaceholder: 'Describe your request in detail...',
      send: 'Send message',
      contactInfo: 'Contact information',
      phone: 'Phone',
      emailLabel: 'Email',
      address: 'Address',
      hours: 'Hours',
      faq: 'FAQ',
      emergencyTitle: 'Medical emergency',
      emergencyDesc: 'In case of medical emergency, call emergency services directly',
      callEmergency: 'Call 15',
      teamTitle: 'Our team',
      teamSubtitle: 'The founders and lead developers of the platform',
      requiredFields: 'Required fields',
      requiredFieldsDesc: 'Please fill in all required fields',
      messageSent: 'Message sent',
      messageSentDesc: 'Your message was sent successfully. We will reply soon.',
      technicalSupport: 'Technical support',
      generalQuestion: 'General question',
      partnership: 'Partnership request',
      providerRegistration: 'Provider registration',
      report: 'Report',
      other: 'Other',
      phoneNumber: '+213 48 XX XX XX',
      phoneHours: 'Mon-Fri 8am-6pm',
      emailAddress: 'contact@cityhealth-sba.dz',
      emailResponse: 'Response within 24h',
      addressDetails: 'City Center, Sidi Bel Abbès',
      addressCity: 'Algeria 22000',
      workingHours: 'Mon-Fri: 8am-6pm',
      saturdayHours: 'Sat: 9am-1pm',
      faq1Q: 'How do I register as a provider?',
      faq1A: 'Go to the "Provider Space" page and fill out the registration form. Our team will verify your information within 48 hours.',
      faq2Q: 'Are consultations free?',
      faq2A: 'CityHealth is a connection platform. Consultation fees depend on each provider.',
      faq3Q: 'How do I report a problem?',
      faq3A: 'Use the contact form and select "Report" or contact us directly by phone.',
      faq4Q: 'Can I edit my information?',
      faq4A: 'Yes, log into your account and go to the "Profile" section to edit your information.',
      coFounderDev: 'Co-Founder and Lead Developer',
      coFounderCTO: 'Co-Founder and Chief Technology Officer',
      descNaimi: 'Co-founder of CityHealth, dedicated to building accessible digital health solutions for Algeria.',
      descAbdelilah: 'Co-founder and technical architect of CityHealth, specialized in scalable infrastructure for the medical sector.',
      support247: 'Support 24/7',
      errorTitle: 'Error',
      errorDesc: 'An error occurred. Please try again.',
      emailPlaceholder: 'your@email.com',
    },
    notFound: {
      title: '404',
      message: 'Oops! Page not found',
      returnHome: 'Return to Home',
    },
    loginPage: {
      citizenSpace: 'Citizen Space',
      citizenDesc: 'Sign in to access your health services',
      providerSpace: 'Provider Space',
      providerDesc: 'Sign in to manage your healthcare establishment',
      loginButton: 'Sign in',
      forgotPassword: 'Forgot password?',
      forgotPasswordTitle: 'Forgot password',
      resetSent: 'A password reset email has been sent',
      resetDesc: 'Enter your email to receive a reset link',
      sendLink: 'Send link',
      backToLogin: 'Back to login',
      noAccount: 'Don\'t have an account?',
      createAccount: 'Create an account',
      registerEstablishment: 'Register my establishment',
      backToHome: 'Back to home',
      or: 'Or',
      continueGoogle: 'Continue with Google',
      notCitizenAccount: 'This account is not a citizen account',
      notProviderAccount: 'This account is not a provider account',
      noAccountForEmail: 'No account associated with this email',
      sendError: 'Error sending. Please try again.',
      checkInbox: 'Check your inbox.',
      invalidEmail: 'Invalid email',
      passwordMinLength: 'Password must be at least 6 characters',
    },
    booking: {
      information: 'Information',
      dateTime: 'Date & Time',
      confirmation: 'Confirmation',
      selectDate: 'Select a date',
      quickDates: 'Quick dates',
      moreDates: 'More dates',
      slotsFor: 'Available slots for',
      realTimeUpdate: 'Availability updated in real time',
      summary: 'Appointment summary',
      practitioner: 'Practitioner',
      patient: 'Patient',
      date: 'Date',
      time: 'Time',
      contact: 'Contact',
      notes: 'Notes',
      confirmationEmail: 'You will receive a confirmation with a 24h reminder before the appointment.',
      reserving: 'Reserving...',
      phoneRequired: 'Phone number is required',
      phoneDigits: 'Number must contain 10 digits',
      phonePrefix: 'Number must start with 05, 06 or 07',
    },
    featuredProviders: {
      topPractitioners: 'Top Practitioners',
      healthProfessionals: 'Health Professionals',
      bestRated: 'Top rated practitioners in your area',
      viewAll: 'View all',
      viewAllPractitioners: 'View all practitioners',
      available: 'Avail.',
      soon: 'Soon',
      noPractitioners: 'No practitioners available at the moment',
      becomePractitioner: 'Become a practitioner',
    },
    guards: {
      accessDenied: 'Access Denied',
      accessDeniedAdminDesc: 'This section is reserved for administrators.',
      accessDeniedProviderDesc: 'You do not have the necessary permissions to access this page.',
      accessDeniedCitizenDesc: 'This section is reserved for citizen accounts.',
      noPermissions: 'You do not have the necessary permissions to access this page.',
      returnHome: 'Return Home',
      back: 'Back',
      verifyingAuth: 'Verifying authentication...',
      loadingProfile: 'Loading profile...',
      verifyingAdmin: 'Verifying admin permissions...',
      citizenOnly: 'Citizens only',
      citizenOnlyDesc: 'Sign in with a citizen account to access this page.',
      citizenLogin: 'Citizen Login',
      noProviderAccount: 'No professional account',
      noProviderAccountDesc: 'To access the professional space, you must first create a provider account.',
      createProviderAccount: 'Create my professional account',
      accountPending: 'Account pending',
      accountPendingDesc: 'This feature is reserved for verified accounts. Your request is being processed.',
      returnDashboard: 'Return to dashboard',
      becomeProvider: 'Become a provider',
      loadingProviderSpace: 'Loading your professional space...',
      requireRole: 'This page requires the "{role}" role to access.',
    },
    map: {
      loadingMap: 'Loading map...',
      locating: 'Locating...',
      locationError: 'Unable to get your position',
      yourPosition: 'Your position',
      providersTitle: 'Interactive Provider Map',
      providersSubtitle: 'Discover all verified healthcare facilities in Sidi Bel Abbès',
      emergencyTitle: 'Emergency Services',
      emergencySubtitle: 'Quickly locate the nearest emergency services',
      bloodTitle: 'Blood Donation & Transfusion Centers',
      bloodSubtitle: 'Find hospitals and blood donation centers',
    },
    navbar: {
      home: 'Home',
      findProviders: 'Find Providers',
      map: 'Map',
      emergency: 'Emergency',
      favorites: 'Favorites',
      contact: 'Contact',
      profile: 'Profile',
      search: 'Search',
      login: 'Login',
      logout: 'Logout',
      adminBadge: '(Admin)',
      providerBadge: '(Practitioner)',
    },
    offers: {
      proposeHelp: 'Offer help',
      offerPublished: 'Offer published successfully!',
      publishError: 'Error publishing',
      freeDonations: 'Free Donations',
      freeDonationsDesc: 'Find or offer free donations',
      communityAid: 'Community Aid',
      communityAidDesc: 'Find or offer free help near you',
      contact: 'Contact',
      edit: 'Edit',
      deleteOffer: 'Delete',
      contactOwner: 'Contact',
      contactMethod: 'Contact method',
      clickToReveal: 'Click below to reveal contact details.',
      reveal: 'Reveal',
      closeLbl: 'Close',
      phone: 'Phone',
      email: 'Email',
      message: 'Message',
      all: 'All',
      noOffers: 'No offers yet',
      noOffersHint: 'Be the first to offer help!',
      myOffers: 'My Offers',
      myOffersDesc: 'Manage your help offers',
      newOffer: 'New Offer',
      editOffer: 'Edit Offer',
      editBack: 'Back',
      offerUpdated: 'Offer updated',
      updateError: 'Error updating',
      offerDeleted: 'Offer deleted',
      deleteError: 'Error deleting',
      deleteConfirm: 'Delete this offer?',
      deleteConfirmDesc: 'This action cannot be undone.',
      cancelLbl: 'Cancel',
      statusUpdated: 'Status updated',
      statusError: 'Error updating status',
      offerNotFound: 'Offer not found or access denied',
      accessDenied: 'Access Denied',
      accessDeniedDesc: 'Only doctors and pharmacies can publish donations.',
      doctorPharmacyOnly: 'Doctors and pharmacies only',
      catFood: 'Food',
      catMedicine: 'Medicine',
      catTools: 'Tools',
      catTransport: 'Transport',
      catOther: 'Other',
      statusAvailable: 'Available',
      statusReserved: 'Reserved',
      statusTaken: 'Taken',
      justNow: 'Just now',
      minutesAgo: '{n} min ago',
      hoursAgo: '{n}h ago',
      daysAgo: '{n}d ago',
      showMore: 'Show more',
      showLess: 'Show less',
      locate: 'Locate',
      formPhoto: 'Product photo',
      formTitle: 'Title',
      formTitlePlaceholder: 'E.g.: Medication lot',
      formDescription: 'Description',
      formDescPlaceholder: 'Describe what you\'re offering...',
      formCategory: 'Category',
      formContactMethod: 'Contact method',
      formContactPhone: 'Phone number',
      formContactEmail: 'Email address',
      formContactApp: 'Username / ID',
      formLocation: 'Location',
      formLocationPlaceholder: 'Address (optional)',
      formLocationError: 'Please provide a valid location',
      formPublish: 'Publish',
      formDropImage: 'Click or drag an image',
      formImageHint: 'JPG, PNG — max 5 MB',
      formPhone: 'Phone',
      formEmail: 'Email',
      formInApp: 'In-App',
    },
    community: {
      title: 'Reviews & Ideas',
      subtitle: 'Share your ideas, suggestions and experiences with the community',
      badge: 'Community Space',
      headerLink: 'Reviews & Ideas',
      composerPlaceholder: 'Share an idea, review or question...',
      titlePlaceholder: 'Title of your post',
      contentPlaceholder: 'Describe your idea or share your experience...',
      publish: 'Publish',
      anonymous: 'Anonymous',
      anonymousUser: 'Anonymous user',
      unknownUser: 'User',
      allCategories: 'All',
      catSuggestion: 'Suggestion',
      catFeedback: 'Feedback',
      catExperience: 'Experience',
      catQuestion: 'Question',
      catAdmin: 'Admin',
      searchPlaceholder: 'Search the community...',
      sortNewest: 'Newest',
      sortMostUpvoted: 'Most Helpful',
      sortMostDiscussed: 'Most Discussed',
      upvote: 'Helpful',
      comment: 'Comment',
      reply: 'Reply',
      report: 'Report',
      replyPlaceholder: 'Write a reply...',
      commentPlaceholder: 'Write a comment...',
      noPosts: 'No posts yet. Be the first!',
      loadMore: 'Load More',
      postCreated: 'Post created successfully!',
      loginRequired: 'Log in to interact',
      reportTitle: 'Report Content',
      reportSpam: 'Spam',
      reportAbuse: 'Abuse',
      reportFalseInfo: 'False Information',
      reportOther: 'Other',
      reportDetailsPlaceholder: 'Describe the issue (optional)...',
      reportSubmit: 'Submit Report',
      reportSuccess: 'Report submitted. Thank you!',
      profanityError: 'Your content contains inappropriate words.',
      loginToParticipate: 'Log in to participate in the community',
      adminAnnouncement: 'Official Announcement',
      announcements: 'Announcements',
      communityFeed: 'Community Feed',
      createAnnouncement: 'New Announcement',
      newAnnouncements: 'New announcements',
      viewAnnouncements: 'View announcements',
      dismissAnnouncement: 'Dismiss',
      pinBeforePublish: 'Pin to All',
      officialOnly: 'Official communication',
    },
    citizenDashboard: {
      greeting: 'Hello',
      quickAccess: 'Quick access to services',
      searchProvider: 'Find a provider',
      searchProviderDesc: 'Find a doctor or specialist',
      interactiveMap: 'Interactive map',
      interactiveMapDesc: 'Explore nearby facilities',
      emergencies: 'Emergencies',
      emergenciesDesc: '24/7 emergency services',
      aiAssistant: 'AI Medical Assistant',
      aiAssistantDesc: 'Ask your health questions',
      bloodDonation: 'Blood donation',
      bloodDonationDesc: 'Respond to urgent calls',
      communityHub: 'Community',
      communityHubDesc: 'Connect with other patients',
      medicalAds: 'Medical ads',
      medicalAdsDesc: 'Health offers and news',
      medicalResearch: 'Medical research',
      medicalResearchDesc: 'Articles and publications',
      myProfile: 'My profile',
      myProfileDesc: 'Manage your information',
      myFavorites: 'My favorites',
      myFavoritesDesc: 'Saved providers',
      appointments: 'Appointments',
      appointmentsDesc: 'Manage your consultations',
      freeGiving: 'Free giving',
      freeGivingDesc: 'Offer or receive help',
      tabNotifications: 'Notifications',
      tabUpcoming: 'Upcoming',
      tabHistory: 'History',
      tabOffers: 'My Offers',
      tabReviews: 'My Reviews',
      tabFavorites: 'Favorites',
      emptyNotifications: 'No notifications',
      emptyNotificationsHint: 'You\'ll be notified of appointment changes',
      emptyUpcoming: 'No upcoming appointments',
      emptyUpcomingHint: 'Your next appointments will appear here',
      emptyHistory: 'No appointment history',
      emptyOffers: 'No offers published',
      emptyOffersHint: 'Offer help to the community',
      emptyReviews: 'No reviews given',
      emptyReviewsHint: 'Share your experience with providers',
      emptyFavorites: 'No favorites saved',
      emptyFavoritesHint: 'Save your favorite providers',
      findDoctor: 'Find a doctor',
      createOffer: 'Create an offer',
      browseProviders: 'Browse providers',
      bookAgain: 'Book again',
      viewProvider: 'View profile',
      allFilter: 'All',
      completedFilter: 'Completed',
      cancelledFilter: 'Cancelled',
      confirmedFilter: 'Confirmed',
      pendingFilter: 'Pending',
      markAllRead: 'Mark all read',
      clearNotifs: 'Clear',
      noFilterResults: 'No appointments with this filter',
      rdvWith: 'Appointment with',
      statusChange: 'Status change',
    },
  },
};
