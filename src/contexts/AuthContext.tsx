import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { toast } from 'sonner';
import { getErrorMessage, logError } from '@/utils/errorHandling';

export type UserType = 'citizen' | 'provider' | 'admin';
export type UserRole = 'patient' | 'provider' | 'admin'; // Legacy role system

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  userType: UserType;
  roles: UserRole[];
  phone?: string;
  address?: string;
  date_of_birth?: string;
  verification_status?: 'pending' | 'approved' | 'rejected' | 'verified' | 'under_review';
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'verified' | 'under_review';
  blood_group?: string;
  emergency_opt_in?: boolean;
  weight?: number;
  height?: number;
  last_donation_date?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Type check helpers
  isCitizen: boolean;
  isProvider: boolean;
  isAdmin: boolean;
  // Legacy methods (for backward compatibility)
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithGoogle: (userType?: UserType) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string; phone?: string; address?: string; date_of_birth?: string; blood_group?: string; emergency_opt_in?: boolean; weight?: number; height?: number; last_donation_date?: string }) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  refreshProfile: () => Promise<void>;
  // New type-specific methods
  loginAsCitizen: (email: string, password: string) => Promise<void>;
  signupAsCitizen: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  loginAsProvider: (email: string, password: string) => Promise<void>;
  loginAsAdmin: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSigningUpRef = useRef(false);

  // Fetch user profile and roles from Firestore
  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      // First check the users collection for userType
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      let userType: UserType = 'citizen'; // Default
      
      if (userSnap.exists()) {
        userType = userSnap.data().userType || 'citizen';
      }

      // Fetch profile from profiles collection
      const profileRef = doc(db, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        // Create profile if it doesn't exist
        await setDoc(profileRef, {
          id: userId,
          email: userEmail,
          full_name: null,
          avatar_url: null,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
        
        setProfile({
          id: userId,
          email: userEmail,
          full_name: null,
          avatar_url: null,
          userType,
          roles: []
        });
        return;
      }

      const profileData = profileSnap.data();

      // Fetch roles from user_roles collection using direct document reads
      // This avoids permission issues with where() queries on document ID patterns
      let roles: UserRole[] = [];
      try {
        const possibleRoles: UserRole[] = ['patient', 'provider', 'admin'];
        const rolePromises = possibleRoles.map(async (role) => {
          const roleDoc = await getDoc(doc(db, 'user_roles', `${userId}_${role}`));
          return roleDoc.exists() ? role : null;
        });
        const roleResults = await Promise.all(rolePromises);
        roles = roleResults.filter((role): role is UserRole => role !== null);
      } catch (roleError) {
        console.warn('Could not fetch roles, using empty array:', roleError);
        // Continue with empty roles - userType is the primary check now
      }

      // Also check type-specific collection for verification status
      let verificationStatus = profileData.verification_status;
      if (userType === 'provider') {
        const providerQuery = query(
          collection(db, 'providers'),
          where('userId', '==', userId)
        );
        const providerSnap = await getDocs(providerQuery);
        if (!providerSnap.empty) {
          verificationStatus = providerSnap.docs[0].data().verificationStatus;
        }
      }

      setProfile({
        id: profileData.id,
        email: userEmail,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        userType,
        roles,
        phone: profileData.phone,
        address: profileData.address,
        date_of_birth: profileData.date_of_birth,
        verification_status: verificationStatus,
        verificationStatus: verificationStatus,
        blood_group: profileData.blood_group,
        emergency_opt_in: profileData.emergency_opt_in,
        weight: profileData.weight,
        height: profileData.height,
        last_donation_date: profileData.last_donation_date,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Skip auth state changes during signup to prevent premature navigation
      if (isSigningUpRef.current) {
        setIsLoading(false);
        return;
      }

      if (firebaseUser) {
        // Block unverified citizen users - they must confirm email first
        if (!firebaseUser.emailVerified) {
          // Sign them out and don't set profile
          await firebaseSignOut(auth);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        setUser(firebaseUser);
        // Fetch profile when user signs in
        setTimeout(() => {
          fetchUserProfile(firebaseUser.uid, firebaseUser.email || '');
        }, 0);
      } else {
        setUser(null);
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper function to create user document with type
  const createUserDocument = async (userId: string, email: string, userType: UserType) => {
    await setDoc(doc(db, 'users', userId), {
      email,
      userType,
      createdAt: serverTimestamp()
    });
  };

  // Helper function to create type-specific document
  const createTypeDocument = async (
    userId: string, 
    userType: UserType, 
    additionalData: Record<string, any> = {}
  ) => {
    const collectionName = userType === 'citizen' ? 'citizens' : 
                          userType === 'admin' ? 'admins' : 'providers';
    
    // Only create for citizens and admins here (providers are handled separately)
    if (userType === 'citizen' || userType === 'admin') {
      await setDoc(doc(db, collectionName, userId), {
        ...additionalData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  };

  // Legacy login (defaults to citizen)
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Connexion réussie!');
    } catch (error: any) {
      logError(error, 'login');
      const message = getErrorMessage(error, 'fr');
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login as Citizen with type verification
  const loginAsCitizen = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await signInWithEmailAndPassword(auth, email, password);
      
      // Check email verification
      if (!loggedInUser.emailVerified) {
        await firebaseSignOut(auth);
        toast.error('Veuillez d\'abord confirmer votre email avant de vous connecter.');
        throw new Error('Email not verified');
      }
      // Verify user type - allow if document doesn't exist (new user) or is citizen
      const userDoc = await getDoc(doc(db, 'users', loggedInUser.uid));
      if (userDoc.exists()) {
        const userType = userDoc.data().userType;
        if (userType !== 'citizen') {
          await firebaseSignOut(auth);
          toast.error('Ce compte n\'est pas un compte citoyen. Utilisez la bonne page de connexion.');
          throw new Error('Invalid user type');
        }
      } else {
        // Create user document if it doesn't exist (legacy user or first login)
        await createUserDocument(loggedInUser.uid, email, 'citizen');
      }
      
      toast.success('Bienvenue sur CityHealth!');
    } catch (error: any) {
      logError(error, 'loginAsCitizen');
      if (error.message !== 'Invalid user type') {
        const message = getErrorMessage(error, 'fr');
        toast.error(message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login as Provider with type verification
  const loginAsProvider = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('[loginAsProvider] Attempting login for:', email);
      const { user: loggedInUser } = await signInWithEmailAndPassword(auth, email, password);
      console.log('[loginAsProvider] Firebase Auth success, uid:', loggedInUser.uid);
      
      // Verify user type - must exist and be provider
      const userDoc = await getDoc(doc(db, 'users', loggedInUser.uid));
      console.log('[loginAsProvider] User doc exists:', userDoc.exists());
      
      if (!userDoc.exists()) {
        console.log('[loginAsProvider] ERROR: User document not found in Firestore');
        await firebaseSignOut(auth);
        toast.error('Compte prestataire non configuré. Veuillez d\'abord vous inscrire.');
        throw new Error('Provider account not configured');
      }
      
      const userData = userDoc.data();
      console.log('[loginAsProvider] User type:', userData.userType);
      
      if (userData.userType !== 'provider') {
        console.log('[loginAsProvider] ERROR: Wrong user type:', userData.userType);
        await firebaseSignOut(auth);
        toast.error(`Ce compte est de type "${userData.userType}". Utilisez la page de connexion appropriée.`);
        throw new Error('Invalid user type');
      }
      
      // All verifications passed - show success
      console.log('[loginAsProvider] SUCCESS: Provider login verified');
      toast.success('Bienvenue sur votre espace prestataire!');
    } catch (error: any) {
      logError(error, 'loginAsProvider');
      // Don't show duplicate error for handled cases
      const handledErrors = ['Provider account not configured', 'Invalid user type'];
      if (!handledErrors.includes(error.message)) {
        const message = getErrorMessage(error, 'fr');
        toast.error(message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login as Admin with type verification
  const loginAsAdmin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await signInWithEmailAndPassword(auth, email, password);
      
      // Verify user type
      const userDoc = await getDoc(doc(db, 'users', loggedInUser.uid));
      if (!userDoc.exists() || userDoc.data().userType !== 'admin') {
        await firebaseSignOut(auth);
        toast.error('Accès refusé. Ce compte n\'est pas administrateur.');
        throw new Error('Invalid user type');
      }
      
      toast.success('Bienvenue Administrateur!');
    } catch (error: any) {
      logError(error, 'loginAsAdmin');
      if (error.message !== 'Invalid user type') {
        const message = getErrorMessage(error, 'fr');
        toast.error(message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy signup (defaults to citizen/patient)
  const signup = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await firebaseUpdateProfile(newUser, {
        displayName: fullName
      });

      // Create user document with type
      await createUserDocument(newUser.uid, email, 'citizen');

      // Create Firestore profile
      await setDoc(doc(db, 'profiles', newUser.uid), {
        id: newUser.uid,
        email: newUser.email,
        full_name: fullName,
        avatar_url: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      // Create citizen document
      await createTypeDocument(newUser.uid, 'citizen', {
        name: fullName,
        email: newUser.email
      });

      // Assign default 'patient' role for legacy compatibility
      await setDoc(doc(db, 'user_roles', `${newUser.uid}_patient`), {
        user_id: newUser.uid,
        role: 'patient',
        created_at: serverTimestamp()
      });

      toast.success('Compte créé avec succès!');
    } catch (error: any) {
      logError(error, 'signup');
      const message = getErrorMessage(error, 'fr');
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup as Citizen
  const signupAsCitizen = async (email: string, password: string, fullName: string, phone?: string) => {
    setIsLoading(true);
    isSigningUpRef.current = true;
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);

      // Update Firebase Auth profile
      await firebaseUpdateProfile(newUser, {
        displayName: fullName
      });

      // Send email verification with redirect to /email-verified page
      let emailSent = false;
      try {
        // Try with continueUrl first (works when domain is whitelisted in Firebase)
        await sendEmailVerification(newUser, {
          url: `${window.location.origin}/email-verified`,
        });
        emailSent = true;
      } catch (firstError: any) {
        // If domain not whitelisted, retry without continueUrl
        if (firstError?.message?.includes('UNAUTHORIZED_DOMAIN') || firstError?.code === 'auth/unauthorized-continue-uri') {
          try {
            await sendEmailVerification(newUser);
            emailSent = true;
          } catch (retryError: any) {
            console.warn('Email verification send failed (no continueUrl):', retryError);
            if (retryError?.code === 'auth/too-many-requests') {
              toast.error("Compte créé, mais l'email de vérification est temporairement bloqué. Réessayez dans quelques minutes.");
            } else {
              toast.warning("Compte créé, mais l'email de vérification n'a pas pu être envoyé. Utilisez le bouton 'Renvoyer' sur la page suivante.");
            }
          }
        } else if (firstError?.code === 'auth/too-many-requests') {
          toast.error("Compte créé, mais l'email de vérification est temporairement bloqué. Réessayez dans quelques minutes.");
        } else {
          toast.warning("Compte créé, mais l'email de vérification n'a pas pu être envoyé. Utilisez le bouton 'Renvoyer' sur la page suivante.");
        }
      }

      // Create Firestore documents (non-blocking errors won't prevent confirmation screen)
      try {
        await createUserDocument(newUser.uid, email, 'citizen');

        await setDoc(doc(db, 'profiles', newUser.uid), {
          id: newUser.uid,
          email: newUser.email,
          full_name: fullName,
          avatar_url: null,
          phone: phone || null,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });

        await createTypeDocument(newUser.uid, 'citizen', {
          name: fullName,
          email: newUser.email,
          phone: phone || null,
          preferences: { language: 'fr', theme: 'system' }
        });

        // Assign 'patient' role - may fail due to Firestore rules
        await setDoc(doc(db, 'user_roles', `${newUser.uid}_patient`), {
          user_id: newUser.uid,
          role: 'patient',
          created_at: serverTimestamp()
        });
      } catch (firestoreError) {
        console.warn('Non-critical Firestore write error during signup:', firestoreError);
      }

      // Sign out so user must verify email first
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error: any) {
      logError(error, 'signupAsCitizen');
      const message = getErrorMessage(error, 'fr');
      toast.error(message);
      throw error;
    } finally {
      isSigningUpRef.current = false;
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (userType: UserType = 'citizen') => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user document exists
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // New user - create all documents
        await createUserDocument(result.user.uid, result.user.email || '', userType);
        
        await setDoc(doc(db, 'profiles', result.user.uid), {
          id: result.user.uid,
          email: result.user.email,
          full_name: result.user.displayName,
          avatar_url: result.user.photoURL,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });

        await createTypeDocument(result.user.uid, userType, {
          name: result.user.displayName,
          email: result.user.email
        });

        // Assign role based on userType
        const role = userType === 'citizen' ? 'patient' : userType;
        await setDoc(doc(db, 'user_roles', `${result.user.uid}_${role}`), {
          user_id: result.user.uid,
          role,
          created_at: serverTimestamp()
        });
      } else {
        // Existing user - verify type matches
        const existingType = userSnap.data().userType;
        if (existingType !== userType) {
          toast.warning(`Vous êtes connecté en tant que ${existingType}. Redirection...`);
        }
      }

      toast.success('Connexion réussie!');
    } catch (error: any) {
      logError(error, 'loginWithGoogle');
      const message = getErrorMessage(error, 'fr');
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      logError(error, 'logout');
      const message = getErrorMessage(error, 'fr');
      toast.error(message);
      throw error;
    }
  };

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string; phone?: string; address?: string; date_of_birth?: string; blood_group?: string; emergency_opt_in?: boolean; weight?: number; height?: number; last_donation_date?: string }) => {
    if (!user) return;

    try {
      const profileRef = doc(db, 'profiles', user.uid);
      // Filter out undefined values - Firestore rejects them
      const cleanUpdates: Record<string, any> = { updated_at: serverTimestamp() };
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          cleanUpdates[key] = value;
        }
      }
      await updateDoc(profileRef, cleanUpdates);

      // Update Firebase Auth profile if display name changed
      if (updates.full_name) {
        await firebaseUpdateProfile(user, {
          displayName: updates.full_name
        });
      }

      // Refresh profile
      if (user.email) {
        await fetchUserProfile(user.uid, user.email);
      }
      
      toast.success('Profil mis à jour');
    } catch (error) {
      logError(error, 'updateProfile');
      const message = getErrorMessage(error, 'fr');
      toast.error(message);
      throw error;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    // Map citizen to patient for legacy compatibility
    if (role === 'patient' && profile?.userType === 'citizen') {
      return true;
    }
    return profile?.roles.includes(role) ?? false;
  };

  // Type check helpers
  const isCitizen = profile?.userType === 'citizen';
  const isProvider = profile?.userType === 'provider';
  const isAdmin = profile?.userType === 'admin';

  const refreshProfile = async () => {
    if (user?.uid && user?.email) {
      await fetchUserProfile(user.uid, user.email);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session: user,
        isAuthenticated: !!user,
        isLoading,
        isCitizen,
        isProvider,
        isAdmin,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,
        hasRole,
        refreshProfile,
        loginAsCitizen,
        signupAsCitizen,
        loginAsProvider,
        loginAsAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
