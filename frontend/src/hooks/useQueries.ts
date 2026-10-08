import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { HarvestListing, Commitment, TransportOffer, UserProfile, VehicleType, BuyerDemand, PredictYieldResult, OptimizedRoute, ParsedHarvestData, CropAnalysisReport } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(user: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user.toString()],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getUserProfile(user);
      } catch (error) {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Harvest Listing Queries
export function useGetSortedListings() {
  const { actor, isFetching } = useActor();

  return useQuery<HarvestListing[]>({
    queryKey: ['sortedListings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSortedListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAvailableListings() {
  const { actor, isFetching } = useActor();

  return useQuery<HarvestListing[]>({
    queryKey: ['availableListings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetListingDetails(listingId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<HarvestListing>({
    queryKey: ['listingDetails', listingId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getListingDetails(listingId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchListingsByCrop(cropType: string) {
  const { actor, isFetching } = useActor();

  return useQuery<HarvestListing[]>({
    queryKey: ['searchListings', cropType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchListingsByCrop(cropType);
    },
    enabled: !!actor && !isFetching && !!cropType,
  });
}

export function useCreateHarvestListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      cropType: string;
      quantity: bigint;
      harvestDate_ns: bigint;
      location: string;
      readinessScore: number;
      qualityCertificate: boolean;
      daysPassed: bigint;
      totalGrowthCycle: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createHarvestListing(
        params.cropType,
        params.quantity,
        params.harvestDate_ns,
        params.location,
        params.readinessScore,
        params.qualityCertificate,
        params.daysPassed,
        params.totalGrowthCycle
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sortedListings'] });
      queryClient.invalidateQueries({ queryKey: ['availableListings'] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sortedListings'] });
      queryClient.invalidateQueries({ queryKey: ['availableListings'] });
    },
  });
}

// Commitment Queries
export function useGetCommitments(listingId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Commitment[]>({
    queryKey: ['commitments', listingId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCommitments(listingId);
      } catch (error) {
        // If unauthorized, return empty array
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCommitmentsByBuyer() {
  const { actor, isFetching } = useActor();

  return useQuery<Commitment[]>({
    queryKey: ['buyerCommitments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCommitmentsByBuyer();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMakeCommitment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      listingId: bigint;
      quantity: bigint;
      price: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.makeCommitment(params.listingId, params.quantity, params.price);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['commitments'] });
      queryClient.invalidateQueries({ queryKey: ['commitments', variables.listingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['buyerCommitments'] });
      queryClient.invalidateQueries({ queryKey: ['availableListings'] });
    },
  });
}

// Transport Offer Queries
export function useGetTransportOffers(listingId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<TransportOffer[]>({
    queryKey: ['transportOffers', listingId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getTransportOffers(listingId);
      } catch (error) {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMakeTransportOffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      listingId: bigint;
      vehicleType: VehicleType;
      loadCapacity: bigint;
      routeStart: string;
      routeEnd: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.makeTransportOffer(
        params.listingId,
        params.vehicleType,
        params.loadCapacity,
        params.routeStart,
        params.routeEnd
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportOffers'] });
    },
  });
}

export function useAcceptTransportOffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      listingId: bigint;
      transporter: Principal;
      commitmentId: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptTransportOffer(params.listingId, params.transporter, params.commitmentId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transportOffers', variables.listingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['sortedListings'] });
      queryClient.invalidateQueries({ queryKey: ['availableListings'] });
    },
  });
}

export function useUpdateTracking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      listingId: bigint;
      currentLocation: string;
      estimatedDeliveryTime: string;
      trackingStatus: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTracking(
        params.listingId,
        params.currentLocation,
        params.estimatedDeliveryTime,
        params.trackingStatus
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transportOffers', variables.listingId.toString()] });
    },
  });
}

// Buyer Demand Queries
export function useGetBuyerDemands() {
  const { actor, isFetching } = useActor();

  return useQuery<BuyerDemand[]>({
    queryKey: ['buyerDemands'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBuyerDemands();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllBuyerDemands() {
  const { actor, isFetching } = useActor();

  return useQuery<BuyerDemand[]>({
    queryKey: ['allBuyerDemands'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return actor.getAllBuyerDemands();
      } catch (error) {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBuyerDemand() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      cropType: string;
      quantity: bigint;
      pricePerKg: bigint;
      destinationSupply: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBuyerDemand(
        params.cropType,
        params.quantity,
        params.pricePerKg,
        params.destinationSupply
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyerDemands'] });
      queryClient.invalidateQueries({ queryKey: ['allBuyerDemands'] });
    },
  });
}

export function useAcceptBuyerDemand() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { demandId: bigint; listingId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptBuyerDemand(params.demandId, params.listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBuyerDemands'] });
      queryClient.invalidateQueries({ queryKey: ['buyerDemands'] });
      toast.success('Buyer demand accepted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to accept buyer demand');
    },
  });
}

// AI/ML Feature Hooks

// 1. Predictive Analytics
export function usePredictYieldAndPrice(params: {
  cropType: string;
  location: string;
  daysPassed: bigint;
  totalGrowthCycle: bigint;
  quantity: bigint;
}) {
  const { actor, isFetching } = useActor();

  return useQuery<PredictYieldResult>({
    queryKey: ['predictYieldAndPrice', params.cropType, params.location, params.daysPassed.toString(), params.totalGrowthCycle.toString(), params.quantity.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.predictYieldAndPrice(
        params.cropType,
        params.location,
        params.daysPassed,
        params.totalGrowthCycle,
        params.quantity
      );
    },
    enabled: !!actor && !isFetching && !!params.cropType && !!params.location,
  });
}

// 2. Computer Vision - Crop Maturity Analysis
export function useAnalyzeCropMaturity() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (imageFile: File | Blob) => {
      if (!actor) throw new Error('Actor not available');
      
      // Convert image to Uint8Array
      const arrayBuffer = await imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Call backend with image bytes
      const readinessScore = await actor.analyzeCropMaturity(uint8Array);
      
      // Create mock breakdown for display (backend only returns score)
      return {
        readinessScore,
        breakdown: {
          color: Math.min(readinessScore + 5, 100),
          texture: Math.max(readinessScore - 3, 0),
          size: readinessScore,
        },
      };
    },
  });
}

// 3. Logistics Route Optimization
export function useOptimizeLogisticsRoutes() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: {
      vehicleCapacity: bigint;
      vehicleType: VehicleType;
      startLocation: string;
      deliveryLocation: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.optimizeLogisticsRoutes(
        params.vehicleCapacity,
        params.vehicleType,
        params.startLocation,
        params.deliveryLocation
      );
    },
  });
}

// 4. Natural Language Processing - Parse Harvest Input
export function useParseHarvestInput() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (rawInput: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.parseHarvestInput(rawInput);
    },
  });
}

// 5. AI Crop Diagnosis
export function useDiagnoseCrop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      listingId: bigint;
      imageFile: File | Blob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Convert image to Uint8Array
      const arrayBuffer = await params.imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Call backend with listing ID and image bytes
      const analysis = await actor.diagnoseCrop(params.listingId, uint8Array);
      
      return analysis;
    },
    onSuccess: (_, variables) => {
      // Invalidate listing queries to refresh with new diagnosis data
      queryClient.invalidateQueries({ queryKey: ['sortedListings'] });
      queryClient.invalidateQueries({ queryKey: ['availableListings'] });
      queryClient.invalidateQueries({ queryKey: ['listingDetails', variables.listingId.toString()] });
    },
  });
}
