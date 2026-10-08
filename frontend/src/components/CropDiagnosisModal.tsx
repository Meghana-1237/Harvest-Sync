import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { useCamera } from '../camera/useCamera';
import { useDiagnoseCrop } from '../hooks/useQueries';
import { HarvestListing } from '../backend';
import CropDiagnosisResultsCard from './CropDiagnosisResultsCard';
import { toast } from 'sonner';

interface CropDiagnosisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: HarvestListing;
}

export default function CropDiagnosisModal({ open, onOpenChange, listing }: CropDiagnosisModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const diagnoseMutation = useDiagnoseCrop();
  
  const {
    isActive,
    isSupported,
    error: cameraError,
    isLoading: cameraLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: 'environment',
    width: 1920,
    height: 1080,
    quality: 0.95,
    format: 'image/jpeg',
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleStartCamera = async () => {
    const success = await startCamera();
    if (!success) {
      toast.error('Failed to start camera. Please check permissions.');
    }
  };

  const handleCapture = async () => {
    const photo = await capturePhoto();
    if (photo) {
      setUploadedFile(photo);
      const url = URL.createObjectURL(photo);
      setPreviewUrl(url);
      await stopCamera();
      setActiveTab('upload');
    } else {
      toast.error('Failed to capture photo');
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      toast.error('Please select or capture an image first');
      return;
    }

    try {
      await diagnoseMutation.mutateAsync({
        listingId: listing.id,
        imageFile: uploadedFile,
      });
      toast.success('Crop diagnosis completed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze crop');
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    diagnoseMutation.reset();
    if (isActive) {
      stopCamera();
    }
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            AI Crop Diagnosis
          </DialogTitle>
          <DialogDescription>
            Upload or capture a high-resolution photo of your crop for AI-powered analysis
          </DialogDescription>
        </DialogHeader>

        {diagnoseMutation.isSuccess && diagnoseMutation.data ? (
          <div className="space-y-4">
            <CropDiagnosisResultsCard 
              analysis={diagnoseMutation.data} 
              listing={listing}
            />
            <div className="flex gap-2">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Analyze Another
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        ) : diagnoseMutation.isPending ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-8 w-8 text-primary/50" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Scanning Crop...</h3>
              <p className="text-sm text-muted-foreground">
                AI is analyzing your crop for readiness, quality, and health factors
              </p>
            </div>
            <div className="w-full max-w-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Analyzing color maturity</span>
                <Loader2 className="h-3 w-3 animate-spin" />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Inspecting texture quality</span>
                <Loader2 className="h-3 w-3 animate-spin" />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Detecting health issues</span>
                <Loader2 className="h-3 w-3 animate-spin" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'camera')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </TabsTrigger>
                <TabsTrigger value="camera" className="gap-2" disabled={isSupported === false}>
                  <Camera className="h-4 w-4" />
                  Use Camera
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4 mt-4">
                {previewUrl ? (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Crop preview" 
                      className="w-full h-auto max-h-96 object-contain rounded-lg border border-border"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setUploadedFile(null);
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Select a high-resolution photo of your crop
                    </p>
                    <label htmlFor="file-upload">
                      <Button asChild variant="outline">
                        <span>Choose File</span>
                      </Button>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="camera" className="space-y-4 mt-4">
                {isSupported === false ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Camera is not supported on this device</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        style={{ display: isActive ? 'block' : 'none' }}
                      />
                      {!isActive && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Camera className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    
                    {cameraError && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                        <p className="font-medium">Camera Error</p>
                        <p className="text-xs mt-1">{cameraError.message}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {!isActive ? (
                        <Button 
                          onClick={handleStartCamera} 
                          disabled={cameraLoading}
                          className="flex-1"
                        >
                          {cameraLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Starting...
                            </>
                          ) : (
                            <>
                              <Camera className="h-4 w-4 mr-2" />
                              Start Camera
                            </>
                          )}
                        </Button>
                      ) : (
                        <>
                          <Button 
                            onClick={handleCapture} 
                            className="flex-1"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Capture Photo
                          </Button>
                          <Button 
                            onClick={stopCamera} 
                            variant="outline"
                          >
                            Stop
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {uploadedFile && !diagnoseMutation.isPending && (
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button onClick={handleAnalyze} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Analyze Crop
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Reset
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
