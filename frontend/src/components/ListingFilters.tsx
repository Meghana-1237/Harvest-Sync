import { useState, useEffect } from 'react';
import { HarvestListing } from '../backend';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, MapPin, Award } from 'lucide-react';

interface ListingFiltersProps {
  listings: HarvestListing[];
  onFilteredListings: (filtered: HarvestListing[]) => void;
}

export default function ListingFilters({ listings, onFilteredListings }: ListingFiltersProps) {
  const [cropSearch, setCropSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [certifiedOnly, setCertifiedOnly] = useState(false);

  useEffect(() => {
    let filtered = [...listings];

    if (cropSearch) {
      filtered = filtered.filter(listing =>
        listing.cropType.toLowerCase().includes(cropSearch.toLowerCase())
      );
    }

    if (locationSearch) {
      filtered = filtered.filter(listing =>
        listing.location.toLowerCase().includes(locationSearch.toLowerCase())
      );
    }

    if (certifiedOnly) {
      filtered = filtered.filter(listing => listing.qualityCertificate === true);
    }

    onFilteredListings(filtered);
  }, [cropSearch, locationSearch, certifiedOnly, listings, onFilteredListings]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cropSearch">Search by Crop</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cropSearch"
                  placeholder="e.g., Tomatoes, Lettuce..."
                  value={cropSearch}
                  onChange={(e) => setCropSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationSearch">Village-wise Variation</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="locationSearch"
                  placeholder="Filter by village or location..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="certifiedOnly"
              checked={certifiedOnly}
              onCheckedChange={(checked) => setCertifiedOnly(checked === true)}
            />
            <Label
              htmlFor="certifiedOnly"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
            >
              <Award className="h-4 w-4 text-primary" />
              Show only Crop Quality Certified harvests
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
