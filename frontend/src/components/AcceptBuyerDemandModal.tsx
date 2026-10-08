import { useState } from 'react';
import { BuyerDemand } from '../backend';
import { useGetSortedListings, useAcceptBuyerDemand } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, MapPin, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AcceptBuyerDemandModalProps {
  demand: BuyerDemand;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AcceptBuyerDemandModal({ demand, open, onOpenChange }: AcceptBuyerDemandModalProps) {
  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const { data: listings, isLoading: listingsLoading } = useGetSortedListings();
  const acceptDemandMutation = useAcceptBuyerDemand();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedListingId) {
      return;
    }

    try {
      await acceptDemandMutation.mutateAsync({
        demandId: demand.id,
        listingId: BigInt(selectedListingId),
      });

      setSelectedListingId('');
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const selectedListing = listings?.find((l) => l.id.toString() === selectedListingId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            Accept Buyer Demand
          </DialogTitle>
          <DialogDescription>
            Select one of your harvest listings to fulfill this buyer demand
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
          <h4 className="font-semibold text-foreground">Buyer Demand Details</h4>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>
              {demand.cropType} - {demand.quantity.toString()} kg @ ${demand.pricePerKg.toString()}/kg
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{demand.destinationSupply}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="listing">Select Your Harvest Listing</Label>
            {listingsLoading ? (
              <div className="text-sm text-muted-foreground">Loading your listings...</div>
            ) : listings && listings.length > 0 ? (
              <>
                <Select value={selectedListingId} onValueChange={setSelectedListingId}>
                  <SelectTrigger id="listing">
                    <SelectValue placeholder="Choose a listing..." />
                  </SelectTrigger>
                  <SelectContent>
                    {listings.map((listing) => {
                      const harvestDate = new Date(Number(listing.harvestDate) / 1_000_000);
                      return (
                        <SelectItem key={listing.id.toString()} value={listing.id.toString()}>
                          {listing.cropType} - {listing.quantity.toString()} kg - {listing.location} (
                          {format(harvestDate, 'MMM d, yyyy')})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose the listing you want to link to this buyer demand
                </p>
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You don't have any harvest listings yet. Create a listing first to accept buyer demands.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {selectedListing && (
            <div className="bg-primary/5 rounded-lg p-4 space-y-2 text-sm border border-primary/20">
              <h4 className="font-semibold text-foreground">Selected Listing</h4>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4 text-primary" />
                <span>{selectedListing.quantity.toString()} kg available</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{format(new Date(Number(selectedListing.harvestDate) / 1_000_000), 'PPP')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{selectedListing.location}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={acceptDemandMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!selectedListingId || acceptDemandMutation.isPending || !listings || listings.length === 0}
            >
              {acceptDemandMutation.isPending ? 'Accepting...' : 'Accept Demand'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
