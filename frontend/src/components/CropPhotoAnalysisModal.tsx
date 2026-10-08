import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAnalyzeCropMaturity } from '../hooks/useQueries';
import { Camera, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface CropPhotoAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyScore: (score: number) => void;
}

export default function CropPhotoAnalysisModal({ open, onOpenChange, onApplyScore }: CropPhotoAnalysisModalProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    readinessScore: number;
    breakdown: { color: number; texture: number; size: number };
  } | null>(null);

  const analyzeMutation = useAnalyzeCropMaturity();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      setSelectedImage(file);
      setAnalysisResult(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    try {
      const result = await analyzeMutation.mutateAsync(selectedImage);
      setAnalysisResult(result);
      toast.success('Image analyzed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze image');
    }
  };

  const handleApply = () => {
    if (analysisResult) {
      onApplyScore(analysisResult.readinessScore);
      toast.success('Readiness score applied!');
      onOpenChange(false);
      // Reset state
      setSelectedImage(null);
      setImagePreview(null);
      setAnalysisResult(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            AI Crop Photo Analysis
          </DialogTitle>
          <DialogDescription>
            Upload a photo of your crop for AI-powered maturity detection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            {imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Crop preview"
                  className="max-h-64 mx-auto rounded-lg object-contain"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    setAnalysisResult(null);
                  }}
                >
                  Change Image
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <label htmlFor="crop-image" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Select Image
                      </span>
                    </Button>
                  </label>
                  <input
                    id="crop-image"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports JPEG and PNG formats
                </p>
              </div>
            )}
          </div>

          {/* Analysis Button */}
          {selectedImage && !analysisResult && (
            <Button
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending}
              className="w-full gap-2"
            >
              {analyzeMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze Crop Maturity
                </>
              )}
            </Button>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-4 bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Analysis Complete
                </h3>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {Math.round(analysisResult.readinessScore)}
                  </div>
                  <div className="text-xs text-muted-foreground">Readiness Score</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Color Analysis</span>
                    <span className="font-medium">{Math.round(analysisResult.breakdown.color)}%</span>
                  </div>
                  <Progress value={analysisResult.breakdown.color} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Texture Analysis</span>
                    <span className="font-medium">{Math.round(analysisResult.breakdown.texture)}%</span>
                  </div>
                  <Progress value={analysisResult.breakdown.texture} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Size Analysis</span>
                    <span className="font-medium">{Math.round(analysisResult.breakdown.size)}%</span>
                  </div>
                  <Progress value={analysisResult.breakdown.size} className="h-2" />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                AI analysis based on color, texture, and size indicators
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {analysisResult && (
            <Button onClick={handleApply} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Apply Score
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
