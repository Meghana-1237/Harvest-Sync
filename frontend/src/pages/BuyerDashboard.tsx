import { useState } from 'react';
import { useGetAvailableListings, useGetBuyerDemands } from '../hooks/useQueries';
import BuyerListingCard from '../components/BuyerListingCard';
import ListingFilters from '../components/ListingFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ShoppingCart, History, Megaphone } from 'lucide-react';
import BuyerCommitmentsView from '../components/BuyerCommitmentsView';
import PostDemandModal from '../components/PostDemandModal';
import BuyerDemandCard from '../components/BuyerDemandCard';

export default function BuyerDashboard() {
  const { data: listings, isLoading } = useGetAvailableListings();
  const { data: demands, isLoading: demandsLoading } = useGetBuyerDemands();
  const [filteredListings, setFilteredListings] = useState(listings || []);
  const [postDemandModalOpen, setPostDemandModalOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            Buyer Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Browse available harvests and make pre-harvest commitments
          </p>
        </div>
        <Button
          onClick={() => setPostDemandModalOpen(true)}
          className="gap-2"
        >
          <Megaphone className="h-4 w-4" />
          Post Demand
        </Button>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Browse Listings
          </TabsTrigger>
          <TabsTrigger value="commitments" className="gap-2">
            <History className="h-4 w-4" />
            My Commitments
          </TabsTrigger>
          <TabsTrigger value="demands" className="gap-2">
            <Megaphone className="h-4 w-4" />
            My Demands
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <ListingFilters
            listings={listings || []}
            onFilteredListings={setFilteredListings}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading available listings...</p>
              </div>
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <BuyerListingCard key={listing.id.toString()} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Listings Found</h3>
              <p className="text-muted-foreground">
                {listings && listings.length > 0
                  ? 'Try adjusting your filters to see more results'
                  : 'No harvest listings are currently available'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="commitments">
          <BuyerCommitmentsView />
        </TabsContent>

        <TabsContent value="demands" className="space-y-6">
          {demandsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your demands...</p>
              </div>
            </div>
          ) : demands && demands.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demands.map((demand) => (
                <BuyerDemandCard key={demand.id.toString()} demand={demand} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Megaphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Demands Posted Yet</h3>
              <p className="text-muted-foreground mb-4">
                Click "Post Demand" to let farmers know what crops you're looking to purchase
              </p>
              <Button
                onClick={() => setPostDemandModalOpen(true)}
                className="gap-2"
              >
                <Megaphone className="h-4 w-4" />
                Post Your First Demand
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <PostDemandModal
        open={postDemandModalOpen}
        onOpenChange={setPostDemandModalOpen}
      />
    </div>
  );
}
