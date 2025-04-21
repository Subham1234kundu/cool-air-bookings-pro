
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserLocation } from "@/services/supabase/locations";
import { useToast } from "@/hooks/use-toast";
import { RazorpayCheckout } from "@/components/checkout/RazorpayCheckout";
import { AddressSection } from "@/components/checkout/AddressSection";
import { ContactSection } from "@/components/checkout/ContactSection";
import { DateTimeSection } from "@/components/checkout/DateTimeSection";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { AddLocationDialog } from "@/components/checkout/AddLocationDialog";
import { supabase } from "@/integrations/supabase/client";
import { createBooking } from "@/services/supabase/bookings";

const CheckoutPage = () => {
  const { items, updateQuantity, totalPrice, clearCart } = useCart();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    date: '',
    timeSlot: ''
  });
  const [formComplete, setFormComplete] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Effect to check if form is complete whenever form data or selected location changes
  useEffect(() => {
    const { fullName, phone, email, date, timeSlot } = formData;
    const isComplete =
      !!fullName &&
      !!phone &&
      !!email &&
      !!date &&
      !!timeSlot &&
      !!selectedLocation;

    setFormComplete(isComplete);
  }, [formData, selectedLocation]);

  const createLocationMutation = useMutation({
    mutationFn: createUserLocation,
    onSuccess: (newLocation) => {
      queryClient.invalidateQueries({ queryKey: ['userLocations'] });
      setSelectedLocation(newLocation);
      setIsLocationModalOpen(false);
      toast({
        title: "Location Added",
        description: "Your new location has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not add location.",
        variant: "destructive",
      });
    }
  });

  const createBookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      toast({
        title: "Booking Confirmed",
        description: "Your booking has been saved.",
      });
      clearCart();
      navigate("/bookings");
    },
    onError: () => {
      toast({
        title: "Booking Error",
        description: "Failed to create booking in database, please contact support.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleProceedToPayment = () => {
    if (!formComplete) {
      toast({
        title: "Incomplete Information",
        description: "Please fill all required fields and select a location before proceeding.",
        variant: "destructive",
      });
      return;
    }
    setShowPaymentGateway(true);
  };

  const handlePaymentSuccess = async (response: any) => {
    // After payment, create booking in Supabase
    try {
      // Find or create mapping of cart items to services
      const orderItems = items.map(item => ({
        service_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        service_name: item.name
      }));

      // Compose scheduled datetime in ISO string
      const scheduledAt = formData.date && formData.timeSlot
        ? new Date(`${formData.date}T${formData.timeSlot}`).toISOString()
        : new Date().toISOString();

      createBookingMutation.mutate({
        locationId: selectedLocation?.id,
        scheduledAt,
        items: orderItems,
        totalAmount: totalPrice + totalPrice * 0.1,
        address: selectedLocation?.address
      });

      toast({
        title: "Payment Successful",
        description: "Your booking has been confirmed. Thank you!",
      });
    } catch (error: any) {
      toast({
        title: "Booking Error",
        description: error?.message || "Payment was successful, but booking creation failed. Please contact support.",
        variant: "destructive",
      });
    }
    setShowPaymentGateway(false);
  };

  const handlePaymentFailure = (error: any) => {
    toast({
      title: "Payment Failed",
      description: error.message || "There was an issue processing your payment.",
      variant: "destructive",
    });
    setShowPaymentGateway(false);
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              You haven't added any services to your cart yet.
            </p>
            <Link to="/services">
              <Button className="bg-brand hover:bg-brand/90">Browse Services</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-8/12 space-y-6">
            <AddressSection
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              onAddLocation={() => setIsLocationModalOpen(true)}
            />

            <ContactSection
              formData={formData}
              onChange={handleInputChange}
            />

            <DateTimeSection
              formData={formData}
              onChange={handleInputChange}
            />
          </div>

          <div className="lg:w-4/12">
            <OrderSummary
              items={items}
              updateQuantity={updateQuantity}
              totalPrice={totalPrice}
              onProceedToPayment={handleProceedToPayment}
              formComplete={formComplete}
            />
          </div>
        </div>
      </div>

      <AddLocationDialog
        isOpen={isLocationModalOpen}
        onOpenChange={setIsLocationModalOpen}
        onSubmit={(data) => {
          createLocationMutation.mutate({
            user_id: "",  // This will be set by the backend function
            address: data.address,
            latitude: null,
            longitude: null,
            is_default: false
          });
        }}
        isLoading={createLocationMutation.isPending}
      />

      {showPaymentGateway && (
        <RazorpayCheckout
          amount={totalPrice + totalPrice * 0.1}
          name={formData.fullName}
          email={formData.email}
          phone={formData.phone}
          address={selectedLocation?.address}
          orderId={1}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
    </Layout>
  );
};

export default CheckoutPage;

