import { CropAnalysisReport, HarvestListing, Variant_Premium_Reject_Standard } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  Bug, 
  Leaf, 
  Calendar, 
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { addDays, format } from 'date-fns';

interface CropDiagnosisResultsCardProps {
  analysis: CropAnalysisReport;
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

function getQualityGradeIcon(grade: Variant_Premium_Reject_Standard) {
  switch (grade) {
    case Variant_Premium_Reject_Standard.Premium:
      return <CheckCircle2 className="h-4 w-4" />;
    case Variant_Premium_Reject_Standard.Standard:
      return <AlertCircle className="h-4 w-4" />;
    case Variant_Premium_Reject_Standard.Reject:
      return <XCircle className="h-4 w-4" />;
  }
}

function calculatePredictedHarvestDate(readinessScore: number): Date {
  const today = new Date();
  if (readinessScore >= 80) {
    return today; // Ready now
  } else if (readinessScore >= 50) {
    return addDays(today, 7); // 1 week
  } else {
    return addDays(today, 14); // 2 weeks
  }
}

function calculateMarketPrice(grade: Variant_Premium_Reject_Standard, baseQuantity: bigint): number {
  const quantity = Number(baseQuantity);
  switch (grade) {
    case Variant_Premium_Reject_Standard.Premium:
      return quantity * 8.5; // $8.50 per kg
    case Variant_Premium_Reject_Standard.Standard:
      return quantity * 5.0; // $5.00 per kg
    case Variant_Premium_Reject_Standard.Reject:
      return quantity * 2.0; // $2.00 per kg
  }
}

function getSeverityBadge(severity: number) {
  if (severity >= 7) {
    return <Badge variant="destructive" className="text-xs">High</Badge>;
  } else if (severity >= 4) {
    return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 text-xs">Medium</Badge>;
  } else {
    return <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Low</Badge>;
  }
}

function getImpactBadge(impact: number) {
  if (impact >= 7) {
    return <Badge variant="destructive" className="text-xs">High</Badge>;
  } else if (impact >= 4) {
    return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 text-xs">Medium</Badge>;
  } else {
    return <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Low</Badge>;
  }
}

export default function CropDiagnosisResultsCard({ analysis, listing }: CropDiagnosisResultsCardProps) {
  const predictedHarvestDate = calculatePredictedHarvestDate(analysis.harvestReadinessScore);
  const bestMarketPrice = calculateMarketPrice(analysis.qualityGrade, listing.quantity);

  return (
    <Card className="agri-card border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          Crop Diagnosis Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Harvest Readiness Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Harvest Readiness</span>
            </div>
            <span className="text-2xl font-bold text-primary">
              {Math.round(analysis.harvestReadinessScore)}%
            </span>
          </div>
          <Progress value={analysis.harvestReadinessScore} className="h-3" />
          <p className="text-xs text-muted-foreground">
            AI-analyzed based on color maturity, size development, and visual texture
          </p>
        </div>

        {/* Quality Grade */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Crop Quality Grade</span>
            <Badge className={getQualityGradeColor(analysis.qualityGrade)}>
              {getQualityGradeIcon(analysis.qualityGrade)}
              <span className="ml-1">{analysis.qualityGrade}</span>
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Based on visual texture analysis and overall crop condition
          </p>
        </div>

        {/* Health Monitoring */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Health Monitoring</span>
          </div>

          {/* Pest Detection */}
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Pest Detection</span>
              </div>
              {analysis.healthFactors.pestDetection ? (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Detected
                </Badge>
              ) : (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Clear
                </Badge>
              )}
            </div>
          </div>

          {/* Diseases */}
          {analysis.healthFactors.diseases.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Diseases Detected</span>
              </div>
              <div className="space-y-2">
                {analysis.healthFactors.diseases.map((disease, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-background/50 rounded p-2">
                    <span className="capitalize">{disease.name}</span>
                    {getSeverityBadge(Number(disease.severity))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nutrient Deficiencies */}
          {analysis.healthFactors.nutrientDeficiencies.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium">Nutrient Deficiencies</span>
              </div>
              <div className="space-y-2">
                {analysis.healthFactors.nutrientDeficiencies.map((deficiency, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-background/50 rounded p-2">
                    <span className="capitalize">{deficiency.name}</span>
                    {getImpactBadge(Number(deficiency.impact))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.healthFactors.diseases.length === 0 && 
           analysis.healthFactors.nutrientDeficiencies.length === 0 && 
           !analysis.healthFactors.pestDetection && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-primary">Excellent Health</p>
              <p className="text-xs text-muted-foreground mt-1">
                No significant health issues detected
              </p>
            </div>
          )}
        </div>

        {/* Predictions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium">Predicted Harvest Date</span>
            </div>
            <p className="text-lg font-bold text-primary">
              {format(predictedHarvestDate, 'MMM dd, yyyy')}
            </p>
            <p className="text-xs text-muted-foreground">
              {analysis.harvestReadinessScore >= 80 
                ? 'Ready for harvest now' 
                : analysis.harvestReadinessScore >= 50 
                ? 'Approximately 1 week' 
                : 'Approximately 2 weeks'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">Best Market Price</span>
            </div>
            <p className="text-lg font-bold text-primary">
              ${bestMarketPrice.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              Based on {analysis.qualityGrade} grade quality
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
