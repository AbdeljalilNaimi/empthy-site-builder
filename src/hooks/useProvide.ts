import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  createOffer,
  updateOffer,
  deleteOffer,
  subscribeToOffers,
  subscribeToMyOffers,
  type OfferInput,
} from '@/services/provide/provideService';
import { ProvideOffer, ProvideCategory } from '@/types/provide';

const QUERY_KEY = ['provide_offers'];

export const useMyOffers = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<ProvideOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) { setOffers([]); setLoading(false); return; }
    const unsub = subscribeToMyOffers(user.uid, (data) => {
      setOffers(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  return { offers, loading };
};

export const usePublicOffers = (category?: ProvideCategory) => {
  const [offers, setOffers] = useState<ProvideOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToOffers((data) => {
      setOffers(data);
      setLoading(false);
    }, category);
    return () => unsub();
  }, [category]);

  return { offers, loading };
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: (data: OfferInput & { imageUrl?: string }) =>
      createOffer({
        ...data,
        ownerId: user!.uid,
        ownerName: profile?.full_name || user?.displayName || 'Anonyme',
        verified: profile?.verification_status === 'verified',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OfferInput & { status: string; imageUrl: string }> }) =>
      updateOffer(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
