import { useState } from 'react';
import { BuyerDemand } from '../backend';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, DollarSign, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import AcceptBuyerDemandModal from './AcceptBuyerDemandModal';
import { AppRole } from '../backend';

interface BuyerDemandCardProps {
  demand: BuyerDemand;
  showAcceptButton?: boolean;
}

export default function BuyerDemandCard({ demand, showAcceptButton = false }: BuyerDemandCardProps) {
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const { data: userProfile } = useGetCallerUserProfile();
  const createdDate = new Date(Number(demand.createdAt) / 1_000_000);

  const isFarmer = userProfile?.appRole === AppRole.Farmer;
  const isDemandOpen = demand.status === 'open';
  const canAccept = showAcceptButton && isFarmer && isDemandOpen;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fulfilled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl font-bold text-foreground">
              {demand.cropType}
            </CardTitle>
            <Badge className={getStatusColor(demand.status)}>
              {demand.status.charAt(0).toUpperCase() + demand.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-sm">
              <span className="font-semibold text-foreground">{demand.quantity.toString()}</span> kg needed
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-sm">
              <span className="font-semibold text-foreground">${demand.pricePerKg.toString()}</span> per kg
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm">{demand.destinationSupply}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Posted {format(createdDate, 'PPP')}</span>
          </div>

          {canAccept && (
            <Button
              onClick={() => setShowAcceptModal(true)}
              className="w-full mt-4 gap-2"
              size="sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              Accept Demand
            </Button>
          )}
        </CardContent>
      </Card>

      {canAccept && (
        <AcceptBuyerDemandModal
          demand={demand}
          open={showAcceptModal}
          onOpenChange={setShowAcceptModal}
        />
      )}
    </>
  );
}
