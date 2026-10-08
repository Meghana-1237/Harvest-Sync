import { useState } from 'react';
import { HarvestListing, Commitment, TransportOffer } from '../backend';
import { useGetCommitments, useDeleteListing, useGetTransportOffers, useAcceptTransportOffer, useGetUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Package, Users, Trash2, Truck, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import CommitmentStatusBadge from './CommitmentStatusBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface FarmerListingCardProps {
  listing: HarvestListing;
}

function getVehicleTypeLabel(vehicleType: any): string {
  if (vehicleType.__kind__ === 'Truck') return 'Truck';
  if (vehicleType.__kind__ === 'Van') return 'Van';
  if (vehicleType.__kind__ === 'Bike') return 'Bike';
  if (vehicleType.__kind__ === 'Other') return vehicleType.Other;
  return 'Unknown';
}

export default function FarmerListingCard({ listing }: FarmerListingCardProps) {
  const { data: commitments } = useGetCommitments(listing.id);
  const { data: transportOffers } = useGetTransportOffers(listing.id);
  const deleteListingMutation = useDeleteListing();
  const acceptTransportOfferMutation = useAcceptTransportOffer();

  const harvestDate = new Date(Number(listing.harvestDate) / 1_000_000);
  const commitmentCount = commitments?.length || 0;

  // Get all commitmentIds that are already linked to accepted transport offers
  const linkedCommitmentIds = new Set(
    transportOffers
      ?.filter((offer) => offer.accepted)
      .map((offer) => offer.commitmentId.toString()) || []
  );

  // Filter out commitments that are already linked
  const availableCommitments = commitments?.filter(
    (commitment) => !linkedCommitmentIds.has(commitment.id.toString())
  ) || [];

  const handleDelete = async () => {
    await deleteListingMutation.mutateAsync(listing.id);
  };

  const handleAcceptOffer = async (transporterPrincipal: any, commitmentId: bigint) => {
    try {
      await acceptTransportOfferMutation.mutateAsync({
        listingId: listing.id,
        transporter: transporterPrincipal,
        commitmentId,
      });
      toast.success('Transport offer accepted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept transport offer');
    }
  };

  return (
    <Card className="agri-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{listing.cropType}</CardTitle>
          <CommitmentStatusBadge commitmentCount={commitmentCount} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Readiness Score Display */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Readiness Score</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-help">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="text-xs text-muted-foreground">ML-Enhanced</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    This score combines growth progress (50%), your assessment (30%), and ML prediction (20%) based on historical data patterns.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">{Math.round(listing.readinessScore)}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Days: {listing.daysPassed.toString()}/{listing.totalGrowthCycle.toString()}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{listing.quantity.toString()} kg</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(harvestDate, 'PPP')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{listing.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{commitmentCount} commitment{commitmentCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {commitments && commitments.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Recent Commitments:</p>
            <div className="space-y-1">
              {commitments.slice(0, 2).map((commitment, idx) => (
                <div key={idx} className="text-xs bg-muted/50 rounded p-2">
                  <div className="flex justify-between">
                    <span>{commitment.quantity.toString()} kg</span>
                    <span className="text-primary font-medium">${commitment.price.toString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {transportOffers && transportOffers.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Truck className="h-3 w-3" />
              Transport Offers:
            </p>
            <div className="space-y-2">
              {transportOffers.map((offer, idx) => (
                <TransportOfferItem
                  key={idx}
                  offer={offer}
                  availableCommitments={availableCommitments}
                  onAccept={handleAcceptOffer}
                  isAccepting={acceptTransportOfferMutation.isPending}
                />
              ))}
            </div>
          </div>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Listing
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this harvest listing and all associated commitments.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

interface TransportOfferItemProps {
  offer: TransportOffer;
  availableCommitments: Commitment[];
  onAccept: (transporterPrincipal: any, commitmentId: bigint) => void;
  isAccepting: boolean;
}

function TransportOfferItem({ offer, availableCommitments, onAccept, isAccepting }: TransportOfferItemProps) {
  const { data: transporterProfile } = useGetUserProfile(offer.transporter);
  const [selectedCommitmentId, setSelectedCommitmentId] = useState<string>('');

  // For each commitment, fetch the buyer profile to display the buyer name
  const commitmentWithBuyerData = availableCommitments.map((commitment) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: buyerProfile } = useGetUserProfile(commitment.buyer);
    return {
      ...commitment,
      buyerName: buyerProfile?.name || 'Unknown Buyer',
    };
  });

  const handleAccept = () => {
    if (!selectedCommitmentId) {
      toast.error('Please select a commitment first');
      return;
    }
    onAccept(offer.transporter, BigInt(selectedCommitmentId));
  };

  return (
    <div className="text-xs bg-muted/50 rounded p-3 space-y-2">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <div className="font-medium text-foreground">
            {transporterProfile?.name || 'Transporter'}
          </div>
          <div className="text-muted-foreground">
            {getVehicleTypeLabel(offer.vehicleType)} • {offer.loadCapacity.toString()} kg capacity
          </div>
          <div className="text-muted-foreground">
            Route: {offer.routeStart} → {offer.routeEnd}
          </div>
        </div>
        {offer.accepted ? (
          <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        ) : null}
      </div>

      {!offer.accepted && availableCommitments.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/50">
          <label className="text-xs font-medium text-foreground">Select Commitment:</label>
          <Select value={selectedCommitmentId} onValueChange={setSelectedCommitmentId}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Choose a commitment..." />
            </SelectTrigger>
            <SelectContent>
              {commitmentWithBuyerData.map((commitment) => (
                <SelectItem key={commitment.id.toString()} value={commitment.id.toString()}>
                  {commitment.buyerName} - {commitment.quantity.toString()} kg @ ${commitment.price.toString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleAccept}
            disabled={isAccepting || !selectedCommitmentId}
            className="w-full h-7 text-xs"
          >
            {isAccepting ? 'Accepting...' : 'Accept Offer'}
          </Button>
        </div>
      )}

      {!offer.accepted && availableCommitments.length === 0 && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground italic">
            No available commitments to link
          </p>
        </div>
      )}
    </div>
  );
}
