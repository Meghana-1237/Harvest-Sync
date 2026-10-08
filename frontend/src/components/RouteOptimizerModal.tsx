import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOptimizeLogisticsRoutes } from '../hooks/useQueries';
import { VehicleType, OptimizedRoute } from '../backend';
import { Truck, MapPin, TrendingDown, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RouteOptimizerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RouteOptimizerModal({ open, onOpenChange }: RouteOptimizerModalProps) {
  const [vehicleCapacity, setVehicleCapacity] = useState('');
  const [vehicleType, setVehicleType] = useState<string>('Truck');
  const [startLocation, setStartLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoute[]>([]);

  const optimizeMutation = useOptimizeLogisticsRoutes();

  const handleOptimize = async () => {
    if (!vehicleCapacity || !startLocation || !deliveryLocation) {
      toast.error('Please fill in all fields');
      return;
    }

    const vehicleTypeValue: VehicleType = 
      vehicleType === 'Truck' ? { __kind__: 'Truck', Truck: null } :
      vehicleType === 'Van' ? { __kind__: 'Van', Van: null } :
      vehicleType === 'Bike' ? { __kind__: 'Bike', Bike: null } :
      { __kind__: 'Other', Other: vehicleType };

    try {
      const routes = await optimizeMutation.mutateAsync({
        vehicleCapacity: BigInt(vehicleCapacity),
        vehicleType: vehicleTypeValue,
        startLocation,
        deliveryLocation,
      });
      setOptimizedRoutes(routes);
      if (routes.length === 0) {
        toast.info('No suitable routes found for your criteria');
      } else {
        toast.success(`Found ${routes.length} optimized route${routes.length > 1 ? 's' : ''}!`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to optimize routes');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setVehicleCapacity('');
    setVehicleType('Truck');
    setStartLocation('');
    setDeliveryLocation('');
    setOptimizedRoutes([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            AI Route Optimizer
          </DialogTitle>
          <DialogDescription>
            Find the most efficient multi-farm pickup routes to maximize capacity and reduce costs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Input Form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle-capacity">Vehicle Capacity (kg)</Label>
              <Input
                id="vehicle-capacity"
                type="number"
                value={vehicleCapacity}
                onChange={(e) => setVehicleCapacity(e.target.value)}
                placeholder="e.g., 1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle-type">Vehicle Type</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger id="vehicle-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Truck">Truck</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Bike">Bike</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-location">Start Location</Label>
              <Input
                id="start-location"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                placeholder="e.g., Warehouse A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-location">Delivery Location</Label>
              <Input
                id="delivery-location"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                placeholder="e.g., Market B"
              />
            </div>
          </div>

          <Button
            onClick={handleOptimize}
            disabled={optimizeMutation.isPending}
            className="w-full gap-2"
          >
            {optimizeMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Optimizing Routes...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Find Optimal Routes
              </>
            )}
          </Button>

          {/* Optimized Routes Display */}
          {optimizedRoutes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Optimized Routes</h3>
                <Badge variant="outline" className="bg-primary/10 border-primary/30">
                  {optimizedRoutes.length} route{optimizedRoutes.length > 1 ? 's' : ''} found
                </Badge>
              </div>

              {optimizedRoutes.map((route, index) => (
                <Card key={index} className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Route {index + 1}</span>
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {Math.round(route.costSavings)}% savings
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Pickup Sequence */}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">Pickup Sequence:</div>
                      <div className="flex flex-wrap items-center gap-2">
                        {route.pickupLocations.map((pickup, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="bg-background rounded-lg px-3 py-2 border border-primary/20">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-primary" />
                                <div>
                                  <div className="text-sm font-medium">{pickup.location}</div>
                                  <div className="text-xs text-muted-foreground">{pickup.quantity.toString()} kg</div>
                                </div>
                              </div>
                            </div>
                            {idx < route.pickupLocations.length - 1 && (
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Locations */}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">Delivery To:</div>
                      <div className="flex flex-wrap items-center gap-2">
                        {route.deliveryLocations.map((delivery, idx) => (
                          <div key={idx} className="bg-background rounded-lg px-3 py-2 border border-primary/20">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-green-600" />
                              <div>
                                <div className="text-sm font-medium">{delivery.location}</div>
                                <div className="text-xs text-muted-foreground">{delivery.quantity.toString()} kg</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Route Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-primary/10">
                      <div>
                        <div className="text-xs text-muted-foreground">Total Distance</div>
                        <div className="text-lg font-bold text-foreground">{route.distance.toFixed(1)} km</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Total Load</div>
                        <div className="text-lg font-bold text-foreground">
                          {route.pickupLocations.reduce((sum, p) => sum + Number(p.quantity), 0)} kg
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Capacity Used</div>
                        <div className="text-lg font-bold text-foreground">
                          {Math.round((route.pickupLocations.reduce((sum, p) => sum + Number(p.quantity), 0) / Number(vehicleCapacity)) * 100)}%
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" size="sm">
                      Select This Route
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
