import { useState } from 'react';
import { TransportOffer } from '../backend';
import { useUpdateTracking } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface TransportTrackingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transportOffer: TransportOffer;
}

export default function TransportTrackingModal({
  open,
  onOpenChange,
  transportOffer,
}: TransportTrackingModalProps) {
  const [currentLocation, setCurrentLocation] = useState(transportOffer.currentLocation || '');
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(
    transportOffer.estimatedDeliveryTime || ''
  );
  const [trackingStatus, setTrackingStatus] = useState(transportOffer.trackingStatus || 'Pending');

  const updateTrackingMutation = useUpdateTracking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateTrackingMutation.mutateAsync({
        listingId: transportOffer.listingId,
        currentLocation,
        estimatedDeliveryTime,
        trackingStatus,
      });
      toast.success('Tracking information updated successfully!');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tracking information');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Transport Tracking</DialogTitle>
          <DialogDescription>
            Update the current location, estimated delivery time, and status of this transport.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentLocation">Current Location</Label>
              <Input
                id="currentLocation"
                placeholder="e.g., En route to Mumbai"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDeliveryTime">Estimated Delivery Time</Label>
              <Input
                id="estimatedDeliveryTime"
                placeholder="e.g., 2026-02-25 14:00"
                value={estimatedDeliveryTime}
                onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Format: YYYY-MM-DD HH:MM
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trackingStatus">Status</Label>
              <Select value={trackingStatus} onValueChange={setTrackingStatus}>
                <SelectTrigger id="trackingStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateTrackingMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateTrackingMutation.isPending}>
              {updateTrackingMutation.isPending ? 'Updating...' : 'Update Tracking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
