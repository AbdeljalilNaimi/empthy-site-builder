import { 
  collection, 
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PlatformStats {
  totalCitizens: number;
  totalProviders: number;
  totalAdmins: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  verifiedProviders: number;
  pendingProviders: number;
  rejectedProviders: number;
  totalAppointments: number;
  appointmentsToday: number;
  totalReviews: number;
  averageRating: number;
  totalPageViews: number;
  activeUsersToday: number;
}

export interface DailyStats {
  date: string;
  newUsers: number;
  newProviders: number;
  appointments: number;
  pageViews: number;
}

export interface ProviderTypeCount {
  type: string;
  count: number;
  color: string;
}

export interface VerificationStats {
  status: string;
  count: number;
  color: string;
}

const PROVIDER_TYPE_COLORS: Record<string, string> = {
  doctor: '#3B82F6',
  clinic: '#10B981',
  hospital: '#8B5CF6',
  pharmacy: '#F59E0B',
  laboratory: '#EF4444',
  dentist: '#06B6D4',
  specialist: '#EC4899',
  other: '#6B7280',
};

function getDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

function parseFirestoreDate(field: any): Date | null {
  if (!field) return null;
  if (typeof field.toDate === 'function') return field.toDate();
  if (typeof field === 'string' || typeof field === 'number') {
    const d = new Date(field);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const [providersSnap, citizensSnap, adminsSnap, appointmentsSnap, reviewsSnap] = await Promise.all([
      getDocs(collection(db, 'providers')),
      getDocs(collection(db, 'citizens')),
      getDocs(collection(db, 'admin_profiles')),
      getDocs(collection(db, 'appointments')),
      getDocs(collection(db, 'reviews')),
    ]);

    const providers = providersSnap.docs.map(doc => doc.data());
    const reviews = reviewsSnap.docs.map(doc => doc.data());
    const appointments = appointmentsSnap.docs.map(doc => doc.data());

    const verifiedProviders = providers.filter(p => p.verified === true || p.verificationStatus === 'verified').length;
    const pendingProviders = providers.filter(p => p.verificationStatus === 'pending').length;
    const rejectedProviders = providers.filter(p => p.verificationStatus === 'rejected').length;

    const todayAppointments = appointments.filter(a => {
      const date = parseFirestoreDate(a.createdAt);
      return date && date >= todayStart;
    }).length;

    const averageRating = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
      : 0;

    const newUsersToday = citizensSnap.docs.filter(doc => {
      const date = parseFirestoreDate(doc.data().createdAt);
      return date && date >= todayStart;
    }).length;

    const newUsersThisWeek = citizensSnap.docs.filter(doc => {
      const date = parseFirestoreDate(doc.data().createdAt);
      return date && date >= weekStart;
    }).length;

    return {
      totalCitizens: citizensSnap.size,
      totalProviders: providersSnap.size,
      totalAdmins: adminsSnap.size,
      newUsersToday,
      newUsersThisWeek,
      verifiedProviders,
      pendingProviders,
      rejectedProviders,
      totalAppointments: appointmentsSnap.size,
      appointmentsToday: todayAppointments,
      totalReviews: reviewsSnap.size,
      averageRating: Math.round(averageRating * 10) / 10,
      totalPageViews: 0,
      activeUsersToday: newUsersToday,
    };
  } catch (error) {
    console.error('Failed to get platform stats:', error);
    return {
      totalCitizens: 0, totalProviders: 0, totalAdmins: 0,
      newUsersToday: 0, newUsersThisWeek: 0,
      verifiedProviders: 0, pendingProviders: 0, rejectedProviders: 0,
      totalAppointments: 0, appointmentsToday: 0,
      totalReviews: 0, averageRating: 0,
      totalPageViews: 0, activeUsersToday: 0,
    };
  }
}

/**
 * Get daily statistics from real Firestore data
 */
export async function getDailyStats(days: number = 30): Promise<DailyStats[]> {
  try {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    // Fetch all collections in parallel
    const [citizensSnap, providersSnap, appointmentsSnap] = await Promise.all([
      getDocs(collection(db, 'citizens')),
      getDocs(collection(db, 'providers')),
      getDocs(collection(db, 'appointments')),
    ]);

    // Build date buckets
    const dateBuckets: Record<string, DailyStats> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = getDateStr(d);
      dateBuckets[dateStr] = { date: dateStr, newUsers: 0, newProviders: 0, appointments: 0, pageViews: 0 };
    }

    // Aggregate citizens by createdAt date
    citizensSnap.docs.forEach(doc => {
      const date = parseFirestoreDate(doc.data().createdAt);
      if (date) {
        const dateStr = getDateStr(date);
        if (dateBuckets[dateStr]) dateBuckets[dateStr].newUsers++;
      }
    });

    // Aggregate providers by createdAt date
    providersSnap.docs.forEach(doc => {
      const date = parseFirestoreDate(doc.data().createdAt);
      if (date) {
        const dateStr = getDateStr(date);
        if (dateBuckets[dateStr]) dateBuckets[dateStr].newProviders++;
      }
    });

    // Aggregate appointments by createdAt date
    appointmentsSnap.docs.forEach(doc => {
      const date = parseFirestoreDate(doc.data().createdAt);
      if (date) {
        const dateStr = getDateStr(date);
        if (dateBuckets[dateStr]) dateBuckets[dateStr].appointments++;
      }
    });

    return Object.values(dateBuckets).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Failed to get daily stats:', error);
    return [];
  }
}

export async function getProvidersByType(): Promise<ProviderTypeCount[]> {
  try {
    const providersSnap = await getDocs(collection(db, 'providers'));
    const typeCount: Record<string, number> = {};
    providersSnap.docs.forEach(doc => {
      const type = doc.data().type || 'other';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    return Object.entries(typeCount).map(([type, count]) => ({
      type, count, color: PROVIDER_TYPE_COLORS[type] || PROVIDER_TYPE_COLORS.other,
    }));
  } catch (error) {
    console.error('Failed to get providers by type:', error);
    return [];
  }
}

export async function getVerificationStats(): Promise<VerificationStats[]> {
  try {
    const providersSnap = await getDocs(collection(db, 'providers'));
    const statusCount: Record<string, number> = { verified: 0, pending: 0, rejected: 0, unverified: 0 };
    providersSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.verificationStatus) {
        statusCount[data.verificationStatus] = (statusCount[data.verificationStatus] || 0) + 1;
      } else if (data.verified) {
        statusCount.verified++;
      } else {
        statusCount.unverified++;
      }
    });
    const colors: Record<string, string> = { verified: '#10B981', pending: '#F59E0B', rejected: '#EF4444', unverified: '#6B7280' };
    return Object.entries(statusCount)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({ status, count, color: colors[status] }));
  } catch (error) {
    console.error('Failed to get verification stats:', error);
    return [];
  }
}
