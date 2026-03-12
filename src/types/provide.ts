export type ProvideCategory = 'food' | 'medicine' | 'tools' | 'transport' | 'other';
export type ProvideStatus = 'available' | 'reserved' | 'taken';
export type ContactMethod = 'phone' | 'email' | 'in_app';

export interface ProvideOffer {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  category: ProvideCategory;
  location: {
    lat: number;
    lng: number;
    label?: string;
  };
  contactMethod: ContactMethod;
  contactValue: string;
  status: ProvideStatus;
  verified: boolean;
  imageUrl?: string;
  createdAt: string;
  providerId?: string;
  updatedAt: string;
}

// labelKey maps to t('offers', labelKey)
export const PROVIDE_CATEGORIES: { value: ProvideCategory; labelKey: string }[] = [
  { value: 'food', labelKey: 'catFood' },
  { value: 'medicine', labelKey: 'catMedicine' },
  { value: 'tools', labelKey: 'catTools' },
  { value: 'transport', labelKey: 'catTransport' },
  { value: 'other', labelKey: 'catOther' },
];

// statusKey maps to t('offers', statusKey)
export const PROVIDE_STATUS_KEYS: Record<ProvideStatus, string> = {
  available: 'statusAvailable',
  reserved: 'statusReserved',
  taken: 'statusTaken',
};
