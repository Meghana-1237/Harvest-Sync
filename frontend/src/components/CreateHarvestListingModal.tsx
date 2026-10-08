import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateHarvestListing } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2, Camera, Mic } from 'lucide-react';
import CropPhotoAnalysisModal from './CropPhotoAnalysisModal';
import VoiceInputModal from './VoiceInputModal';

interface CreateHarvestListingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateHarvestListingModal({ open, onOpenChange }: CreateHarvestListingModalProps) {
  const [cropType, setCropType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [location, setLocation] = useState('');
  const [farmerAssessment, setFarmerAssessment] = useState('');
  const [daysPassed, setDaysPassed] = useState('');
  const [totalGrowthCycle, setTotalGrowthCycle] = useState('');
  const [qualityCertificate, setQualityCertificate] = useState(false);
  const [showPhotoAnalysis, setShowPhotoAnalysis] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createListingMutation = useCreateHarvestListing();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!cropType.trim()) newErrors.cropType = 'Crop type is required';
    if (!quantity || Number(quantity) <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!harvestDate) newErrors.harvestDate = 'Harvest date is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!farmerAssessment || Number(farmerAssessment) < 0 || Number(farmerAssessment) > 100) {
      newErrors.farmerAssessment = 'Farmer assessment must be between 0 and 100';
    }
    if (!daysPassed || Number(daysPassed) < 0) {
      newErrors.daysPassed = 'Days since planting is required';
    }
    if (!totalGrowthCycle || Number(totalGrowthCycle) <= 0) {
      newErrors.totalGrowthCycle = 'Total growth cycle is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    try {
      const harvestDateObj = new Date(harvestDate);
      const harvestDate_ns = BigInt(harvestDateObj.getTime()) * BigInt(1_000_000);

      await createListingMutation.mutateAsync({
        cropType,
        quantity: BigInt(quantity),
        harvestDate_ns,
        location,
        readinessScore: Number(farmerAssessment),
        qualityCertificate,
        daysPassed: BigInt(daysPassed),
        totalGrowthCycle: BigInt(totalGrowthCycle),
      });

      toast.success('Harvest listing created successfully!');
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create listing');
    }
  };

  const resetForm = () => {
    setCropType('');
    setQuantity('');
    setHarvestDate('');
    setLocation('');
    setFarmerAssessment('');
    setDaysPassed('');
    setTotalGrowthCycle('');
    setQualityCertificate(false);
    setErrors({});
  };

  const handlePhotoAnalysisApply = (score: number) => {
    setFarmerAssessment(score.toString());
  };

  const handleVoiceInputApply = (data: {
    cropType: string;
    quantity: bigint;
    harvestDate: bigint;
    location: string;
  }) => {
    setCropType(data.cropType);
    setQuantity(data.quantity.toString());
    const date = new Date(Number(data.harvestDate) / 1_000_000);
    setHarvestDate(date.toISOString().split('T')[0]);
    setLocation(data.location);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Harvest Listing</DialogTitle>
            <DialogDescription>
              List your upcoming harvest for pre-harvest commitments from buyers
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Entry Button */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowVoiceInput(true)}
                className="flex-1 gap-2"
              >
                <Mic className="h-4 w-4" />
                Quick Entry
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPhotoAnalysis(true)}
                className="flex-1 gap-2"
              >
                <Camera className="h-4 w-4" />
                Crop Photo Analysis
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cropType">
                  Crop Type <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cropType"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  placeholder="e.g., Tomatoes"
                />
                {errors.cropType && <p className="text-xs text-destructive">{errors.cropType}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity (kg) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g., 500"
                />
                {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="harvestDate">
                  Expected Harvest Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="harvestDate"
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                />
                {errors.harvestDate && <p className="text-xs text-destructive">{errors.harvestDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Village A"
                />
                {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmerAssessment">
                  Farmer Assessment Score (0-100) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="farmerAssessment"
                  type="number"
                  min="0"
                  max="100"
                  value={farmerAssessment}
                  onChange={(e) => setFarmerAssessment(e.target.value)}
                  placeholder="e.g., 75"
                />
                {errors.farmerAssessment && <p className="text-xs text-destructive">{errors.farmerAssessment}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="daysPassed">
                  Days Since Planting <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="daysPassed"
                  type="number"
                  min="0"
                  value={daysPassed}
                  onChange={(e) => setDaysPassed(e.target.value)}
                  placeholder="e.g., 45"
                />
                {errors.daysPassed && <p className="text-xs text-destructive">{errors.daysPassed}</p>}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="totalGrowthCycle">
                  Total Growth Cycle (days) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="totalGrowthCycle"
                  type="number"
                  min="1"
                  value={totalGrowthCycle}
                  onChange={(e) => setTotalGrowthCycle(e.target.value)}
                  placeholder="e.g., 90"
                />
                {errors.totalGrowthCycle && <p className="text-xs text-destructive">{errors.totalGrowthCycle}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="qualityCertificate"
                checked={qualityCertificate}
                onCheckedChange={(checked) => setQualityCertificate(checked as boolean)}
              />
              <Label htmlFor="qualityCertificate" className="cursor-pointer">
                I have a quality certificate for this crop
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createListingMutation.isPending}
                className="flex-1"
              >
                {createListingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Listing'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <CropPhotoAnalysisModal
        open={showPhotoAnalysis}
        onOpenChange={setShowPhotoAnalysis}
        onApplyScore={handlePhotoAnalysisApply}
      />

      <VoiceInputModal
        open={showVoiceInput}
        onOpenChange={setShowVoiceInput}
        onApplyData={handleVoiceInputApply}
      />
    </>
  );
}
