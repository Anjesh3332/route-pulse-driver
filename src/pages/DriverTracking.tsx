import { useState, useEffect } from "react";
import { VehicleSetup } from "@/components/VehicleSetup";
import { TrackingDashboard } from "@/components/TrackingDashboard";

const DriverTracking = () => {
  const [vehicleId, setVehicleId] = useState<string | null>(null);

  // Load saved vehicle ID on mount
  useEffect(() => {
    const savedVehicleId = localStorage.getItem('driverTracking_vehicleId');
    if (savedVehicleId) {
      setVehicleId(savedVehicleId);
    }
  }, []);

  const handleVehicleIdSet = (id: string) => {
    setVehicleId(id);
    localStorage.setItem('driverTracking_vehicleId', id);
  };

  const handleReset = () => {
    setVehicleId(null);
    localStorage.removeItem('driverTracking_vehicleId');
  };

  if (!vehicleId) {
    return <VehicleSetup onVehicleIdSet={handleVehicleIdSet} />;
  }

  return <TrackingDashboard vehicleId={vehicleId} onReset={handleReset} />;
};

export default DriverTracking;