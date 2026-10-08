import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { AppRole } from '../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sprout } from 'lucide-react';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [appRole, setAppRole] = useState<AppRole | ''>('');

  const saveProfileMutation = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !contact || !location || !appRole) {
      return;
    }

    await saveProfileMutation.mutateAsync({
      name,
      contact,
      location,
      appRole: appRole as AppRole
    });
  };

  const isValid = name && contact && location && appRole;

  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Sprout className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Welcome to HarvestSync</DialogTitle>
          <DialogDescription className="text-center">
            Please complete your profile to get started
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact Information</Label>
            <Input
              id="contact"
              placeholder="Email or phone number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="City, Region"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">I am a...</Label>
            <Select value={appRole} onValueChange={(value) => setAppRole(value as AppRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AppRole.Farmer}>Farmer</SelectItem>
                <SelectItem value={AppRole.Buyer}>Buyer</SelectItem>
                <SelectItem value={AppRole.Transporter}>Transporter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || saveProfileMutation.isPending}
          >
            {saveProfileMutation.isPending ? 'Creating Profile...' : 'Complete Setup'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
