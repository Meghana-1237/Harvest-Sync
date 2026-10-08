import { useState } from 'react';
import { useGetSortedListings, useGetAllBuyerDemands } from '../hooks/useQueries';
import FarmerListingCard from '../components/FarmerListingCard';
import BuyerDemandCard from '../components/BuyerDemandCard';
import CreateHarvestListingModal from '../components/CreateHarvestListingModal';
import CropDiagnosisModal from '../components/CropDiagnosisModal';
import PredictiveAnalyticsSection from '../components/PredictiveAnalyticsSection';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Sprout, ShoppingCart, Camera } from 'lucide-react';
import { HarvestListing } from '../backend';

export default function FarmerDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<HarvestListing | null>(null);
  const { data: listings, isLoading: listingsLoading } = useGetSortedListings();
  const { data: buyerDemands, isLoading: demandsLoading } = useGetAllBuyerDemands();

  const handleDiagnoseClick = (listing: HarvestListing) => {
    setSelectedListing(listing);
    setShowDiagnosisModal(true);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Sprout className="h-8 w-8 text-primary" />
              Farmer Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your harvest listings and view buyer commitments
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            New Listing
          </Button>
        </div>
      </div>

      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="listings" className="gap-2">
            <Sprout className="h-4 w-4" />
            My Listings
          </TabsTrigger>
          <TabsTrigger value="demands" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Buyer Demands
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          {listingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your listings...</p>
              </div>
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing.id.toString()} className="space-y-4">
                  <FarmerListingCard listing={listing} />
                  <Button
                    onClick={() => handleDiagnoseClick(listing)}
                    variant="outline"
                    className="w-full gap-2 border-primary/30 hover:bg-primary/5"
                  >
                    <Camera className="h-4 w-4" />
                    Diagnose Crop
                  </Button>
                  <PredictiveAnalyticsSection listing={listing} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Sprout className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Listings Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first harvest listing to start receiving commitments from buyers
              </p>
              <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Listing
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="demands" className="mt-6">
          {demandsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading buyer demands...</p>
              </div>
            </div>
          ) : buyerDemands && buyerDemands.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buyerDemands.map((demand) => (
                <BuyerDemandCard key={demand.id.toString()} demand={demand} showAcceptButton />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Buyer Demands Available</h3>
              <p className="text-muted-foreground">
                Check back later for new buyer demand requests
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateHarvestListingModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      {selectedListing && (
        <CropDiagnosisModal
          open={showDiagnosisModal}
          onOpenChange={setShowDiagnosisModal}
          listing={selectedListing}
        />
      )}
    </div>
  );
}
