import { Commitment } from '../backend';
import { useGetListingDetails, useGetTransportOffers } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Package, DollarSign, CheckCircle2, Truck, Clock, MapPinned } from 'lucide-react';
import { format } from 'date-fns';

interface BuyerCommitmentCardProps {
  commitment: Commitment;
}

export default function BuyerCommitmentCard({ commitment }: BuyerCommitmentCardProps) {
  const { data: listing, isLoading } = useGetListingDetails(commitment.listingId);
  const { data: transportOffers } = useGetTransportOffers(commitment.listingId);

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-card">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!listing) {
    return (
      <Card className="border-destructive/20 bg-card">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">Listing not found</p>
        </CardContent>
      </Card>
    );
  }

  const harvestDate = new Date(Number(listing.harvestDate) / 1_000_000);
  const acceptedOffer = transportOffers?.find(offer => offer.accepted);

  return (
    <Card className="border-primary/20 bg-card hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            {listing.cropType}
          </CardTitle>
          <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Committed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4 shrink-0" />
            <span>
              <span className="font-semibold text-foreground">{commitment.quantity.toString()} kg</span> committed
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4 shrink-0" />
            <span>
              Offer: <span className="font-semibold text-foreground">${commitment.price.toString()}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{format(harvestDate, 'PPP')}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{listing.location}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Readiness Score</span>
            <span className="font-semibold text-foreground">{Math.round(listing.readinessScore * 100)}%</span>
          </div>
          {listing.qualityCertificate && (
            <Badge variant="outline" className="mt-2 text-xs border-primary/30 text-primary">
              Quality Certified
            </Badge>
          )}
        </div>

        {acceptedOffer ? (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">Transport Tracking</span>
            </div>
            <div className="space-y-2 text-xs">
              {acceptedOffer.currentLocation && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPinned className="h-3 w-3 shrink-0 mt-0.5" />
                  <span>{acceptedOffer.currentLocation}</span>
                </div>
              )}
              {acceptedOffer.estimatedDeliveryTime && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0 mt-0.5" />
                  <span>ETA: {acceptedOffer.estimatedDeliveryTime}</span>
                </div>
              )}
              <div className="pt-1">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    acceptedOffer.trackingStatus === 'Delivered'
                      ? 'border-primary/30 text-primary bg-primary/5'
                      : acceptedOffer.trackingStatus === 'In Transit'
                      ? 'border-blue-500/30 text-blue-600 bg-blue-500/5'
                      : 'border-yellow-500/30 text-yellow-600 bg-yellow-500/5'
                  }`}
                >
                  {acceptedOffer.trackingStatus}
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Truck className="h-3 w-3" />
              <span>Transport not yet arranged</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
