import { useState } from 'react';
import { HarvestListing } from '../backend';
import { useGetCommitments } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Package } from 'lucide-react';
import { format } from 'date-fns';
import MakeTransportOfferModal from './MakeTransportOfferModal';

interface TransportOpportunityCardProps {
  listing: HarvestListing;
}

export default function TransportOpportunityCard({ listing }: TransportOpportunityCardProps) {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const { data: commitments } = useGetCommitments(listing.id);
  const harvestDate = new Date(Number(listing.harvestDate) / 1_000_000);
  const hasCommitments = commitments && commitments.length > 0;

  return (
    <>
      <Card className="agri-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{listing.cropType}</CardTitle>
            {hasCommitments && (
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                {commitments.length} Commitment{commitments.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
          </div>

          {hasCommitments ? (
            <div className="pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Buyer Commitments:</p>
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
          ) : (
            <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
              No commitments yet
            </div>
          )}

          <Button
            onClick={() => setShowOfferModal(true)}
            className="w-full"
          >
            Offer Transport
          </Button>
        </CardContent>
      </Card>

      <MakeTransportOfferModal
        listing={listing}
        open={showOfferModal}
        onOpenChange={setShowOfferModal}
      />
    </>
  );
}
