import { HarvestListing } from '../backend';
import { usePredictYieldAndPrice } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface PredictiveAnalyticsSectionProps {
  listing: HarvestListing;
}

export default function PredictiveAnalyticsSection({ listing }: PredictiveAnalyticsSectionProps) {
  const { data: prediction, isLoading, error } = usePredictYieldAndPrice({
    cropType: listing.cropType,
    location: listing.location,
    daysPassed: listing.daysPassed,
    totalGrowthCycle: listing.totalGrowthCycle,
    quantity: listing.quantity,
  });

  // Calculate forecast date (2 weeks from now)
  const forecastDate = new Date();
  forecastDate.setDate(forecastDate.getDate() + 14);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Predictions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !prediction) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Predictions
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30">
            <Calendar className="h-3 w-3 mr-1" />
            2 weeks ahead
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-background/50 rounded-lg p-3 border border-primary/10">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Predicted Yield</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {prediction.predictedYield.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">kg</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on growth cycle and historical data
          </p>
        </div>

        <div className="bg-background/50 rounded-lg p-3 border border-primary/10">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Predicted Market Price</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              ${prediction.predictedPrice.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">total</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Estimated market value at harvest
          </p>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-primary/10">
          Forecast for {forecastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </CardContent>
    </Card>
  );
}
