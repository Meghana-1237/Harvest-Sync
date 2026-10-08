import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';

interface CommitmentStatusBadgeProps {
  commitmentCount: number;
}

export default function CommitmentStatusBadge({ commitmentCount }: CommitmentStatusBadgeProps) {
  if (commitmentCount === 0) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="gap-1 bg-primary/10 text-primary border-primary/20">
      <CheckCircle2 className="h-3 w-3" />
      {commitmentCount} Committed
    </Badge>
  );
}
