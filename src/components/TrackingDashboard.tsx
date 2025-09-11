import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Gauge, 
  Clock, 
  Wifi, 
  WifiOff, 
  Settings,
  Navigation,
  Truck
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LocationData {
  lat: number;
  lon: number;
  speed: number;
  ts: number;
}

interface TrackingDashboardProps {
  vehicleId: string;
  onReset: () => void;
}

export function TrackingDashboard({ vehicleId, onReset }: TrackingDashboardProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>("prompt");
  const [error, setError] = useState<string | null>(null);

  const API_ENDPOINT = "https://your-backend-url.com/api/positions"; // Replace with actual endpoint

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
      }

      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionStatus(permission.state);

      if (permission.state === 'denied') {
        throw new Error("Location permission denied");
      }

      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get location permission";
      setError(errorMsg);
      toast({
        title: "Location Error",
        description: errorMsg,
        variant: "destructive",
      });
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, speed } = position.coords;
          resolve({
            lat: latitude,
            lon: longitude,
            speed: speed || 0, // Speed might be null
            ts: Date.now()
          });
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000
        }
      );
    });
  };

  // Send location to API
  const sendLocationData = async (locationData: LocationData) => {
    try {
      const payload = {
        vehicleId,
        lat: locationData.lat,
        lon: locationData.lon,
        speed: locationData.speed,
        ts: locationData.ts
      };

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setLastSent(new Date());
      setError(null);
      
      toast({
        title: "Location Sent",
        description: `Updated at ${new Date().toLocaleTimeString()}`,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send location";
      setError(errorMsg);
      console.error("Failed to send location:", err);
    }
  };

  // Track location continuously
  const startTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    setIsTracking(true);
    setError(null);

    // Get initial location
    try {
      const initialLocation = await getCurrentLocation();
      setLocation(initialLocation);
      await sendLocationData(initialLocation);
    } catch (err) {
      console.error("Failed to get initial location:", err);
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    toast({
      title: "Tracking Stopped",
      description: "Location tracking has been disabled",
    });
  };

  // Set up interval for continuous tracking
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isTracking) {
      intervalId = setInterval(async () => {
        try {
          const locationData = await getCurrentLocation();
          setLocation(locationData);
          await sendLocationData(locationData);
        } catch (err) {
          console.error("Tracking error:", err);
        }
      }, 5000); // Send every 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTracking, vehicleId]);

  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6);
  };

  const formatSpeed = (speed: number) => {
    return Math.round(speed * 3.6); // Convert m/s to km/h
  };

  return (
    <div className="min-h-screen bg-gradient-dashboard p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Vehicle {vehicleId}</CardTitle>
                <p className="text-sm text-muted-foreground">Driver Dashboard</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
            >
              <Settings className="w-4 h-4 mr-2" />
              Change Vehicle
            </Button>
          </CardHeader>
        </Card>

        {/* Status & Controls */}
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-success pulse-success' : 'bg-muted'}`} />
                <span className="font-medium">
                  {isTracking ? "Tracking Active" : "Tracking Inactive"}
                </span>
              </div>
              <div className="flex space-x-2">
                {!isTracking ? (
                  <Button onClick={startTracking} className="bg-gradient-success">
                    <Navigation className="w-4 h-4 mr-2" />
                    Start Tracking
                  </Button>
                ) : (
                  <Button variant="outline" onClick={stopTracking}>
                    Stop Tracking
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              {location ? (
                <div className="space-y-2 font-mono text-sm">
                  <div>
                    <span className="text-muted-foreground">Lat:</span>{" "}
                    {formatCoordinate(location.lat)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lon:</span>{" "}
                    {formatCoordinate(location.lon)}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No location data</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-primary" />
                Speed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {location ? formatSpeed(location.speed) : 0}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  km/h
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Information */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Update</span>
              <Badge variant={lastSent ? "default" : "secondary"}>
                {lastSent ? lastSent.toLocaleTimeString() : "Never"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Connection</span>
              <div className="flex items-center space-x-2">
                {error ? (
                  <WifiOff className="w-4 h-4 text-destructive" />
                ) : (
                  <Wifi className="w-4 h-4 text-success" />
                )}
                <Badge variant={error ? "destructive" : "default"}>
                  {error ? "Error" : "Connected"}
                </Badge>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}