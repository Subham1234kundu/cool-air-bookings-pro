
import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin, PlusCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserLocations, setDefaultLocation } from "@/services/supabase/locations";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddressSectionProps {
  selectedLocation: any;
  setSelectedLocation: (location: any) => void;
  onAddLocation: () => void;
}

export const AddressSection = ({ 
  selectedLocation, 
  setSelectedLocation,
  onAddLocation
}: AddressSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['userLocations'],
    queryFn: fetchUserLocations,
  });

  const setDefaultLocationMutation = useMutation({
    mutationFn: setDefaultLocation,
    onSuccess: (updatedLocation) => {
      queryClient.invalidateQueries({ queryKey: ['userLocations'] });
      setSelectedLocation(updatedLocation);
      toast({
        title: "Default Location Updated",
        description: "Your default location has been updated.",
      });
    }
  });

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/checkout'
      }
    });

    if (error) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
        Service Address 
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddLocation}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Location
        </Button>
      </h2>
      
      {supabase.auth.getUser().then(u => u.data.user) ? (
        <>
          {locations?.length ? (
            <div>
              {locations.map((loc) => (
                <div 
                  key={loc.id} 
                  className={`p-4 border rounded-lg mb-2 cursor-pointer ${
                    selectedLocation?.id === loc.id ? 'border-brand bg-brand/10' : ''
                  }`}
                  onClick={() => setSelectedLocation(loc)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <MapPin className="inline mr-2 h-5 w-5 text-brand" />
                      {loc.address}
                      {loc.is_default && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    {!loc.is_default && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDefaultLocationMutation.mutate(loc.id);
                        }}
                      >
                        Set as Default
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              No saved locations. Add a location to proceed.
            </div>
          )}
        </>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Please sign in to select or add a location
          </p>
          <Button onClick={handleGoogleSignIn}>
            Sign in with Google
          </Button>
        </div>
      )}
    </div>
  );
};
