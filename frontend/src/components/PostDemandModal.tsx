import { useState } from 'react';
import { useCreateBuyerDemand } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Megaphone, Package, DollarSign, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface PostDemandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PostDemandModal({ open, onOpenChange }: PostDemandModalProps) {
  const [cropType, setCropType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [destinationSupply, setDestinationSupply] = useState('');

  const createDemandMutation = useCreateBuyerDemand();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cropType || !quantity || !pricePerKg || !destinationSupply) {
      return;
    }

    try {
      await createDemandMutation.mutateAsync({
        cropType,
        quantity: BigInt(quantity),
        pricePerKg: BigInt(pricePerKg),
        destinationSupply
      });

      toast.success('Demand Posted!', {
        description: `Your demand for ${quantity} kg of ${cropType} has been posted successfully.`,
      });

      // Reset form
      setCropType('');
      setQuantity('');
      setPricePerKg('');
      setDestinationSupply('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Failed to Post Demand', {
        description: error.message || 'Failed to post demand. Please try again.',
      });
    }
  };

  const isValid = cropType && quantity && pricePerKg && destinationSupply && 
                  Number(quantity) > 0 && Number(pricePerKg) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Megaphone className="h-6 w-6 text-primary" />
            Post Demand
          </DialogTitle>
          <DialogDescription>
            Let farmers know what crops you're looking to purchase
          </DialogDescription>
        </DialogHeader>

        <div className="bg-primary/5 rounded-lg p-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            Post your crop requirements to help farmers plan their harvests and connect with suppliers who can meet your needs.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cropType" className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Crop Type
            </Label>
            <Input
              id="cropType"
              placeholder="e.g., Tomatoes, Lettuce, Corn"
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Quantity (kg)
            </Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Enter quantity needed"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricePerKg" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Price per kg ($)
            </Label>
            <Input
              id="pricePerKg"
              type="number"
              placeholder="Enter your offer price per kg"
              value={pricePerKg}
              onChange={(e) => setPricePerKg(e.target.value)}
              required
              min="0.01"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinationSupply" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Destination Supply Location
            </Label>
            <Input
              id="destinationSupply"
              placeholder="Enter delivery destination"
              value={destinationSupply}
              onChange={(e) => setDestinationSupply(e.target.value)}
              required
            />
          </div>

          {createDemandMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {createDemandMutation.error?.message || 'Failed to post demand'}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={createDemandMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!isValid || createDemandMutation.isPending}
            >
              {createDemandMutation.isPending ? 'Posting...' : 'Post Demand'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
