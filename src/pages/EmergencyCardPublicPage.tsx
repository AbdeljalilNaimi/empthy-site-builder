import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getEmergencyCardByToken, logCardConsultation, EmergencyHealthCard } from '@/services/emergencyCardService';
import { Droplet, AlertTriangle, HeartPulse, Pill, Phone, User, ShieldOff, Loader2, Lock } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';

type AuthState = 'loading' | 'not_logged_in' | 'unauthorized' | 'authorized';

export default function EmergencyCardPublicPage() {
  const { token } = useParams<{ token: string }>();
  const [card, setCard] = useState<EmergencyHealthCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [providerInfo, setProviderInfo] = useState<{ uid: string; name: string; type: string } | null>(null);
  const loggedRef = useRef(false);

  // Check Firebase auth + role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        setAuthState('not_logged_in');
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const userType = data?.userType;
          if (userType === 'provider' || userType === 'admin') {
            setAuthState('authorized');
            setProviderInfo({ uid: firebaseUser.uid, name: data?.name || data?.displayName || 'Professionnel', type: userType });
          } else {
            setAuthState('unauthorized');
          }
        } else {
          setAuthState('unauthorized');
        }
      } catch {
        setAuthState('unauthorized');
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch card data only when authorized
  useEffect(() => {
    if (authState !== 'authorized' || !token) return;
    getEmergencyCardByToken(token)
      .then(data => {
        if (!data) setNotFound(true);
        else {
          setCard(data);
          // Log consultation once
          if (!loggedRef.current && providerInfo && data.id) {
            loggedRef.current = true;
            logCardConsultation(data.id, data.user_id, providerInfo.uid, providerInfo.name, providerInfo.type);
          }
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token, authState, providerInfo]);

  // Auth loading
  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not logged in
  if (authState === 'not_logged_in') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center space-y-4 max-w-md">
          <Lock className="h-16 w-16 mx-auto text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900">Accès Refusé</h1>
          <p className="text-gray-500">
            Ces informations médicales sont strictement réservées aux professionnels de santé agréés.
          </p>
          <Button asChild className="mt-4">
            <Link to={`/provider/login?redirect=/emergency-card/${token}`}>
              Se connecter en tant que professionnel
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Logged in but not a provider/admin
  if (authState === 'unauthorized') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center space-y-4 max-w-md">
          <ShieldOff className="h-16 w-16 mx-auto text-red-400" />
          <h1 className="text-2xl font-bold text-gray-900">Accès Refusé</h1>
          <p className="text-gray-500">
            Ces informations médicales sont strictement réservées aux professionnels de santé agréés.
            Votre compte n'a pas les autorisations nécessaires.
          </p>
        </div>
      </div>
    );
  }

  // Authorized - loading card
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center space-y-2">
          <ShieldOff className="h-16 w-16 mx-auto text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900">Carte introuvable</h1>
          <p className="text-gray-500">Ce lien n'est pas valide ou a expiré.</p>
        </div>
      </div>
    );
  }

  if (card && !card.is_public_for_emergencies) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center space-y-2">
          <ShieldOff className="h-16 w-16 mx-auto text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900">Accès restreint</h1>
          <p className="text-gray-500">Le propriétaire de cette carte n'a pas activé le partage d'urgence.</p>
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Red emergency header */}
      <div className="bg-red-600 text-white px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6" />
            <h1 className="text-xl font-bold uppercase tracking-wider">Urgence Médicale</h1>
          </div>
          {card.blood_group && (
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-1.5">
              <Droplet className="h-5 w-5" />
              <span className="font-black text-2xl">{card.blood_group}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-6">
        {/* Allergies */}
        {card.allergies.length > 0 && (
          <section className="space-y-2">
            <h2 className="flex items-center gap-2 text-red-600 font-bold text-lg uppercase">
              <AlertTriangle className="h-5 w-5" />
              Allergies
            </h2>
            <div className="flex flex-wrap gap-2">
              {card.allergies.map(a => (
                <span key={a} className="bg-red-100 text-red-800 font-semibold px-3 py-1 rounded-full text-sm">{a}</span>
              ))}
            </div>
          </section>
        )}

        {/* Chronic Conditions */}
        {card.chronic_conditions.length > 0 && (
          <section className="space-y-2">
            <h2 className="flex items-center gap-2 text-orange-600 font-bold text-lg uppercase">
              <HeartPulse className="h-5 w-5" />
              Maladies Chroniques
            </h2>
            <div className="flex flex-wrap gap-2">
              {card.chronic_conditions.map(c => (
                <span key={c} className="bg-orange-100 text-orange-800 font-semibold px-3 py-1 rounded-full text-sm">{c}</span>
              ))}
            </div>
          </section>
        )}

        {/* Medications */}
        {card.current_medications.length > 0 && (
          <section className="space-y-2">
            <h2 className="flex items-center gap-2 text-blue-600 font-bold text-lg uppercase">
              <Pill className="h-5 w-5" />
              Médicaments en cours
            </h2>
            <div className="flex flex-wrap gap-2">
              {card.current_medications.map(m => (
                <span key={m} className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full text-sm">{m}</span>
              ))}
            </div>
          </section>
        )}

        {/* Emergency Contact */}
        {(card.emergency_contact_name || card.emergency_contact_phone) && (
          <section className="bg-gray-100 rounded-xl p-4 space-y-2">
            <h2 className="flex items-center gap-2 font-bold text-lg uppercase">
              <Phone className="h-5 w-5" />
              Contact d'Urgence
            </h2>
            {card.emergency_contact_name && (
              <p className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                {card.emergency_contact_name}
              </p>
            )}
            {card.emergency_contact_phone && (
              <a href={`tel:${card.emergency_contact_phone}`} className="flex items-center gap-2 text-blue-600 font-mono text-lg underline">
                <Phone className="h-4 w-4" />
                {card.emergency_contact_phone}
              </a>
            )}
          </section>
        )}

        <p className="text-center text-xs text-gray-400 pt-4">
          Données partagées volontairement pour usage médical d'urgence uniquement.
        </p>
      </div>
    </div>
  );
}
