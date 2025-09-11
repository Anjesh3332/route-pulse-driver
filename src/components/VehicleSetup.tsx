import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Navigation } from "lucide-react";

interface VehicleSetupProps {
  onVehicleIdSet: (vehicleId: string) => void;
}

export function VehicleSetup({ onVehicleIdSet }: VehicleSetupProps) {
  const [vehicleId, setVehicleId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicleId.trim()) {
      onVehicleIdSet(vehicleId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dashboard flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            <Truck className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Driver Tracking</CardTitle>
            <p className="text-muted-foreground">
              Enter your vehicle ID to start location tracking
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="vehicleId" className="text-sm font-medium">
                Vehicle ID
              </label>
              <Input
                id="vehicleId"
                type="text"
                placeholder="e.g., BUS-001, VAN-042"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-primary hover:bg-primary/90 shadow-status"
              disabled={!vehicleId.trim()}
            >
              <Navigation className="w-5 h-5 mr-2" />
              Start Tracking
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}