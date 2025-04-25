
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin } from "lucide-react";
import { LocationModal } from "./LocationModal";
import { useQuery } from "@tanstack/react-query";
import { fetchUserLocations } from "@/services/supabase/locations";

export const Hero = () => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const { data: userLocations } = useQuery({
    queryKey: ['userLocations'],
    queryFn: fetchUserLocations,
  });

  // Show location modal on first visit if no locations are saved
  useEffect(() => {
    const hasShownLocationModal = localStorage.getItem('hasShownLocationModal');
    if (!hasShownLocationModal && userLocations && userLocations.length === 0) {
      setIsLocationModalOpen(true);
      localStorage.setItem('hasShownLocationModal', 'true');
    }
  }, [userLocations]);

  const defaultLocation = userLocations?.find(loc => loc.is_default) || userLocations?.[0];

  return (
    <>
      <div className="bg-gradient-to-r from-acblue-50 to-white py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {defaultLocation && (
            <div 
              className="flex items-center gap-1 mb-4 text-sm cursor-pointer"
              onClick={() => setIsLocationModalOpen(true)}
            >
              <MapPin className="h-4 w-4 text-brand" />
              <span className="text-gray-700">
                Showing services for: {defaultLocation.address}
              </span>
              <span className="text-brand font-medium">(Change)</span>
            </div>
          )}

          <div className="flex flex-col-reverse md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12 mt-8 md:mt-0 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                Professional AC Services at Your Doorstep
              </h1>
              <p className="mt-4 text-lg text-gray-700 max-w-lg">
                Expert technicians, affordable rates, and same-day service. 
                Keep your space cool and comfortable year-round.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to="/services">
                  <Button className="bg-brand hover:bg-brand/90 text-white px-6 py-5 text-base">
                    Book a Service
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="px-6 py-5 text-base"
                  onClick={() => setIsLocationModalOpen(true)}
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Set Your Location
                </Button>
              </div>
              <div className="mt-8 flex items-center justify-center md:justify-start text-sm">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                  ))}
                </div>
                <div className="ml-3">
                  <div className="font-medium">4.8/5 rating</div>
                  <div className="text-gray-500">10,000+ happy customers</div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="/lovable-uploads/aac8a73b-f3d1-470c-88b0-ef9bd1c7ad39.png"
                alt="AC Technician installing an air conditioner"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      <LocationModal 
        open={isLocationModalOpen} 
        onOpenChange={setIsLocationModalOpen} 
      />
    </>
  );
};
