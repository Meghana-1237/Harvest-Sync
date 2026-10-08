import { useState } from 'react';
import { HarvestListing, Variant_Premium_Reject_Standard } from '../backend';
import { usePredictYieldAndPrice } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Package, TrendingUp, Award, Sparkles, DollarSign, CheckCircle2, AlertTriangle, Bug, Leaf } from 'lucide-react';
import { format } from 'date-fns';
import MakeCommitmentModal from './MakeCommitmentModal';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

interface BuyerListingCardProps {
  listing: HarvestListing;
}

function getQualityGradeColor(grade: Variant_Premium_Reject_Standard): string {
  switch (grade) {
    case Variant_Premium_Reject_Standard.Premium:
      return 'bg-primary/10 text-primary border-primary/20';
    case Variant_Premium_Reject_Standard.Standard:
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
    case Variant_Premium_Reject_Standard.Reject:
      return 'bg-destructive/10 text-destructive border-destructive/20';
  }
}

export default function BuyerListingCard({ listing }: BuyerListingCardProps) {
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const harvestDate = new Date(Number(listing.harvestDate) / 1_000_000);

  const { data: prediction, isLoading: predictionLoading } = usePredictYieldAndPrice({
    cropType: listing.cropType,
    location: listing.location,
    daysPassed: listing.daysPassed,
    totalGrowthCycle: listing.totalGrowthCycle,
    quantity: listing.quantity,
  });

  const forecastDate = new Date();
  forecastDate.setDate(forecastDate.getDate() + 14);

  const hasDiagnosis = !!listing.diagnosis;
  const diagnosis = listing.diagnosis;

  return (
    <>
      <Card className="agri-card hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{listing.cropType}</CardTitle>
            <div className="flex flex-col gap-2 items-end">
              {listing.qualityCertificate && (
                <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                  <Award className="h-3 w-3 mr-1" />
                  Certified
                </Badge>
              )}
              {hasDiagnosis && diagnosis && (
                <Badge className={getQualityGradeColor(diagnosis.qualityGrade)}>
                  {diagnosis.qualityGrade}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Readiness Score with ML Enhancement */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Readiness Score</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 cursor-help">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="text-xs text-muted-foreground">ML-Enhanced</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      This score combines growth progress (50%), farmer assessment (30%), and ML prediction (20%) based on historical data patterns.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Progress value={listing.readinessScore} className="h-3 mb-2" />
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">{Math.round(listing.readinessScore)}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Growth: {listing.daysPassed.toString()}/{listing.totalGrowthCycle.toString()} days
            </div>
          </div>

          {/* Crop Diagnosis Information */}
          {hasDiagnosis && diagnosis && (
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">AI Crop Analysis</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Bug className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Pests:</span>
                  {diagnosis.healthFactors.pestDetection ? (
                    <Badge variant="destructive" className="text-xs h-4 px-1">
                      <AlertTriangle className="h-2 w-2" />
                    </Badge>
                  ) : (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs h-4 px-1">
                      <CheckCircle2 className="h-2 w-2" />
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Leaf className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Health:</span>
                  {diagnosis.healthFactors.diseases.length === 0 && 
                   diagnosis.healthFactors.nutrientDeficiencies.length === 0 ? (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs h-4 px-1">
                      Good
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 text-xs h-4 px-1">
                      Issues
                    </Badge>
                  )}
                </div>
              </div>

              {diagnosis.healthFactors.diseases.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-xs text-muted-foreground cursor-help flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                        {diagnosis.healthFactors.diseases.length} disease(s) detected
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1">
                        {diagnosis.healthFactors.diseases.map((disease, idx) => (
                          <p key={idx} className="text-xs capitalize">
                            • {disease.name} (Severity: {disease.severity.toString()})
                          </p>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {diagnosis.healthFactors.nutrientDeficiencies.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-xs text-muted-foreground cursor-help flex items-center gap-1">
                        <Leaf className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                        {diagnosis.healthFactors.nutrientDeficiencies.length} nutrient deficiency(ies)
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1">
                        {diagnosis.healthFactors.nutrientDeficiencies.map((deficiency, idx) => (
                          <p key={idx} className="text-xs capitalize">
                            • {deficiency.name} (Impact: {deficiency.impact.toString()})
                          </p>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}

          {/* Price Forecast */}
          {predictionLoading ? (
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-3">
              <Skeleton className="h-16 w-full" />
            </div>
          ) : prediction ? (
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Price Forecast</span>
                </div>
                <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30">
                  <Calendar className="h-3 w-3 mr-1" />
                  2 weeks ahead
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-primary">
                  ${prediction.predictedPrice.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground">estimated value</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Forecast for {forecastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          ) : null}

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{listing.quantity.toString()} kg available</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Harvest: {format(harvestDate, 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{listing.location}</span>
            </div>
          </div>

          <Button
            onClick={() => setShowCommitmentModal(true)}
            className="w-full"
          >
            Make Pre-Harvest Commitment
          </Button>
        </CardContent>
      </Card>

      <MakeCommitmentModal
        open={showCommitmentModal}
        onOpenChange={setShowCommitmentModal}
        listing={listing}
      />
    </>
  );
}
