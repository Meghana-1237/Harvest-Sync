import { useGetCommitmentsByBuyer } from '../hooks/useQueries';
import BuyerCommitmentCard from './BuyerCommitmentCard';
import { Package } from 'lucide-react';

export default function BuyerCommitmentsView() {
  const { data: commitments, isLoading } = useGetCommitmentsByBuyer();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your commitments...</p>
        </div>
      </div>
    );
  }

  if (!commitments || commitments.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          View all your pre-harvest commitments here.
        </p>
        
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Commitments Yet</h3>
          <p className="text-muted-foreground">
            Browse available listings and make your first pre-harvest commitment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        You have {commitments.length} active commitment{commitments.length !== 1 ? 's' : ''}.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {commitments.map((commitment, index) => (
          <BuyerCommitmentCard key={index} commitment={commitment} />
        ))}
      </div>
    </div>
  );
}
