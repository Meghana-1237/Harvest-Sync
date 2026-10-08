import { useState } from 'react';
import { HarvestListing, VehicleType } from '../backend';
import { useMakeTransportOffer } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Package } from 'lucide-react';
import { format } from 'date-fns';

interface MakeTransportOfferModalProps {
  listing: HarvestListing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MakeTransportOfferModal({ listing, open, onOpenChange }: MakeTransportOfferModalProps) {
  const [vehicleType, setVehicleType] = useState<string>('');
  const [loadCapacity, setLoadCapacity] = useState('');
  const [routeStart, setRouteStart] = useState('');
  const [routeEnd, setRouteEnd] = useState('');

  const makeOfferMutation = useMakeTransportOffer();
  const harvestDate = new Date(Number(listing.harvestDate) / 1_000_000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicleType || !loadCapacity || !routeStart || !routeEnd) {
      return;
    }

    // Map the vehicle type string to the VehicleType discriminated union
    let vehicleTypeEnum: VehicleType;
    switch (vehicleType) {
      case 'Truck':
        vehicleTypeEnum = { __kind__: 'Truck', Truck: null };
        break;
      case 'Van':
        vehicleTypeEnum = { __kind__: 'Van', Van: null };
        break;
      case 'Bike':
        vehicleTypeEnum = { __kind__: 'Bike', Bike: null };
        break;
      default:
        vehicleTypeEnum = { __kind__: 'Other', Other: vehicleType };
        break;
    }

    await makeOfferMutation.mutateAsync({
      listingId: listing.id,
      vehicleType: vehicleTypeEnum,
      loadCapacity: BigInt(loadCapacity),
      routeStart,
      routeEnd
    });

    // Reset form
    setVehicleType('');
    setLoadCapacity('');
    setRouteStart('');
    setRouteEnd('');
    onOpenChange(false);
  };

  const isValid = vehicleType && loadCapacity && routeStart && routeEnd && Number(loadCapacity) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Offer Transport Service</DialogTitle>
          <DialogDescription>
            Provide logistics for this committed harvest
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
          <h4 className="font-semibold text-foreground">{listing.cropType}</h4>
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
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select value={vehicleType} onValueChange={setVehicleType} required>
              <SelectTrigger id="vehicleType">
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Truck">Truck</SelectItem>
                <SelectItem value="Van">Van</SelectItem>
                <SelectItem value="Bike">Bike</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loadCapacity">Load Capacity (kg)</Label>
            <Input
              id="loadCapacity"
              type="number"
              placeholder="Enter load capacity"
              value={loadCapacity}
              onChange={(e) => setLoadCapacity(e.target.value)}
              required
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="routeStart">Route Start Location</Label>
            <Input
              id="routeStart"
              type="text"
              placeholder="Enter starting location"
              value={routeStart}
              onChange={(e) => setRouteStart(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="routeEnd">Route End Location</Label>
            <Input
              id="routeEnd"
              type="text"
              placeholder="Enter destination location"
              value={routeEnd}
              onChange={(e) => setRouteEnd(e.target.value)}
              required
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
              disabled={!isValid || makeOfferMutation.isPending}
            >
              {makeOfferMutation.isPending ? 'Submitting...' : 'Submit Offer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
