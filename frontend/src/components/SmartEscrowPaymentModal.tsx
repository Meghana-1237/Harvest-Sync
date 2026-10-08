import { useState } from 'react';
import { HarvestListing } from '../backend';
import { useMakeCommitment } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, MapPin, Package, Shield, Lock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface SmartEscrowPaymentModalProps {
  listing: HarvestListing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SmartEscrowPaymentModal({ listing, open, onOpenChange }: SmartEscrowPaymentModalProps) {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const makeCommitmentMutation = useMakeCommitment();
  const harvestDate = new Date(Number(listing.harvestDate) / 1_000_000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantity || !price) {
      return;
    }

    try {
      await makeCommitmentMutation.mutateAsync({
        listingId: listing.id,
        quantity: BigInt(quantity),
        price: BigInt(price)
      });

      toast.success('Commitment Created!', {
        description: `You've successfully committed to ${quantity} kg of ${listing.cropType}`,
        icon: <CheckCircle2 className="h-5 w-5" />,
      });

      setQuantity('');
      setPrice('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Commitment Failed', {
        description: error.message || 'Failed to create commitment. Please try again.',
      });
    }
  };

  const isValid = quantity && price && Number(quantity) > 0 && Number(quantity) <= Number(listing.quantity);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Shield className="h-6 w-6 text-primary" />
            Smart Escrow Payment
          </DialogTitle>
          <DialogDescription>
            Secure your pre-harvest commitment with escrow protection
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-primary/5 border-primary/20">
          <Lock className="h-5 w-5 text-primary" />
          <AlertDescription className="text-sm font-medium text-foreground ml-2">
            Funds secured until delivery
          </AlertDescription>
        </Alert>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Your payment will be held in secure escrow and only released to the farmer upon successful delivery of the harvest. This protects both parties and ensures a fair transaction.
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {makeCommitmentMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {makeCommitmentMutation.error?.message || 'Failed to create commitment'}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={makeCommitmentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!isValid || makeCommitmentMutation.isPending}
            >
              {makeCommitmentMutation.isPending ? 'Processing...' : 'Commit to Buy'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
