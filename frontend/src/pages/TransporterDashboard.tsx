import { useState } from 'react';
import { useGetAvailableListings } from '../hooks/useQueries';
import TransportOpportunityCard from '../components/TransportOpportunityCard';
import RouteOptimizerModal from '../components/RouteOptimizerModal';
import { Button } from '@/components/ui/button';
import { Truck, Sparkles } from 'lucide-react';

export default function TransporterDashboard() {
  const { data: listings, isLoading } = useGetAvailableListings();
  const [showRouteOptimizer, setShowRouteOptimizer] = useState(false);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Truck className="h-8 w-8 text-primary" />
              Transporter Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Find transport opportunities and optimize your routes
            </p>
          </div>
          <Button onClick={() => setShowRouteOptimizer(true)} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Route Optimizer
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading transport opportunities...</p>
          </div>
        </div>
      ) : listings && listings.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <TransportOpportunityCard key={listing.id.toString()} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Transport Opportunities</h3>
          <p className="text-muted-foreground">
            Check back later for new harvest listings requiring transport
          </p>
        </div>
      )}

      <RouteOptimizerModal
        open={showRouteOptimizer}
        onOpenChange={setShowRouteOptimizer}
      />
    </div>
  );
}
