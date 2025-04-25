
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserLocations, createUserLocation } from "@/services/supabase/locations";
import { getCurrentLocation, saveUserLocation } from "@/utils/googleMapsUtils";
import { GoogleMap } from "../maps/GoogleMap";

interface LocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LocationModal = ({ open, onOpenChange }: LocationModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<{latitude: number; longitude: number} | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createLocationMutation = useMutation({
    mutationFn: createUserLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLocations'] });
      toast({
        title: "Location Saved",
        description: "Your location has been saved successfully.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not save location. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      setAddress(location.address || "");
      setCoordinates({
        latitude: location.latitude,
        longitude: location.longitude
      });
      toast({
        title: "Location Detected",
        description: "We've detected your current location.",
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Could not retrieve your current location",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLocation = () => {
    if (!coordinates) {
      toast({
        title: "Location Required",
        description: "Please detect your location or select it on the map.",
        variant: "destructive",
      });
      return;
    }

    createLocationMutation.mutate({
      user_id: "",
      address: address,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      is_default: true
    });
  };

  const handleMapClick = (lat: number, lng: number, address: string) => {
    setCoordinates({
      latitude: lat,
      longitude: lng
    });
    setAddress(address);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Your Location</DialogTitle>
          <DialogDescription>
            Choose your location to see services available in your area
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              placeholder="Enter your address" 
              className="flex-1"
            />
            <Button 
              variant="outline" 
              onClick={handleGetCurrentLocation} 
              disabled={isLoading}
            >
              <Navigation className="mr-2 h-4 w-4" />
              {isLoading ? "Detecting..." : "Current Location"}
            </Button>
          </div>

          <div className="h-64 border rounded-md overflow-hidden">
            <GoogleMap 
              location={coordinates} 
              onLocationSelect={handleMapClick} 
            />
          </div>

          {coordinates && (
            <div className="text-sm text-muted-foreground">
              <MapPin className="inline mr-1 h-4 w-4" />
              Selected coordinates: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveLocation} disabled={!coordinates || isLoading}>
            Save Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
