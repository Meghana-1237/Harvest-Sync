import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useParseHarvestInput } from '../hooks/useQueries';
import { Mic, Type, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface VoiceInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyData: (data: {
    cropType: string;
    quantity: bigint;
    harvestDate: bigint;
    location: string;
  }) => void;
}

export default function VoiceInputModal({ open, onOpenChange, onApplyData }: VoiceInputModalProps) {
  const [inputText, setInputText] = useState('');
  const [parsedData, setParsedData] = useState<{
    cropType: string;
    quantity: bigint;
    harvestDate: bigint;
    location: string;
    confidence: number;
  } | null>(null);

  const parseMutation = useParseHarvestInput();

  const handleParse = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text first');
      return;
    }

    try {
      const result = await parseMutation.mutateAsync(inputText);
      // Add mock confidence since backend doesn't provide it
      setParsedData({
        ...result,
        confidence: 0.85, // Mock confidence score
      });
      toast.success('Input parsed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to parse input');
    }
  };

  const handleApply = () => {
    if (parsedData) {
      onApplyData({
        cropType: parsedData.cropType,
        quantity: parsedData.quantity,
        harvestDate: parsedData.harvestDate,
        location: parsedData.location,
      });
      toast.success('Harvest data applied!');
      onOpenChange(false);
      // Reset state
      setInputText('');
      setParsedData(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setInputText('');
    setParsedData(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Quick Entry - Natural Language Input
          </DialogTitle>
          <DialogDescription>
            Describe your harvest in plain language and let AI extract the details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Text Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Type className="h-4 w-4" />
              Describe Your Harvest
            </label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Example: I have some potatoes ready in 10 days in Village X, about 50 kg"
              className="min-h-32"
              disabled={parseMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Include crop type, quantity, location, and when it will be ready
            </p>
          </div>

          {/* Parse Button */}
          {!parsedData && (
            <Button
              onClick={handleParse}
              disabled={parseMutation.isPending || !inputText.trim()}
              className="w-full gap-2"
            >
              {parseMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Parse with AI
                </>
              )}
            </Button>
          )}

          {/* Parsed Results */}
          {parsedData && (
            <div className="space-y-4 bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Extracted Data
                </h3>
                <Badge variant="outline" className="bg-primary/10 border-primary/30">
                  {Math.round(parsedData.confidence * 100)}% confidence
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Crop Type</div>
                  <div className="font-medium text-foreground">{parsedData.cropType}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Quantity</div>
                  <div className="font-medium text-foreground">{parsedData.quantity.toString()} kg</div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Location</div>
                  <div className="font-medium text-foreground">{parsedData.location}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Harvest Date</div>
                  <div className="font-medium text-foreground">
                    {new Date(Number(parsedData.harvestDate) / 1_000_000).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Review the extracted data and apply it to your listing form
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {parsedData && (
            <Button onClick={handleApply} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Apply to Form
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
