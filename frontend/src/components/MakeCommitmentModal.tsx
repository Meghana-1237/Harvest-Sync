import { useState } from 'react';
import { HarvestListing } from '../backend';
import { useMakeCommitment } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Package } from 'lucide-react';
import { format } from 'date-fns';

interface MakeCommitmentModalProps {
  listing: HarvestListing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MakeCommitmentModal({ listing, open, onOpenChange }: MakeCommitmentModalProps) {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const makeCommitmentMutation = useMakeCommitment();
  const harvestDate = new Date(Number(listing.harvestDate) / 1_000_000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantity || !price) {
      return;
    }

    await makeCommitmentMutation.mutateAsync({
      listingId: listing.id,
      quantity: BigInt(quantity),
      price: BigInt(price)
    });

    setQuantity('');
    setPrice('');
    onOpenChange(false);
  };

  const isValid = quantity && price && Number(quantity) > 0 && Number(quantity) <= Number(listing.quantity);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make Pre-Harvest Commitment</DialogTitle>
          <DialogDescription>
            Commit to purchasing this harvest before it's picked
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
          <h4 className="font-semibold text-foreground">{listing.cropType}</h4>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{listing.quantity.toString()} kg available</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(harvestDate, 'PPP')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{listing.location}</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (kg)</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Enter quantity to commit"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="1"
              max={listing.quantity.toString()}
            />
            <p className="text-xs text-muted-foreground">
              Maximum: {listing.quantity.toString()} kg
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Offer Price ($)</Label>
            <Input
              id="price"
              type="number"
              placeholder="Enter your offer price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!isValid || makeCommitmentMutation.isPending}
            >
              {makeCommitmentMutation.isPending ? 'Committing...' : 'Commit to Buy'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
