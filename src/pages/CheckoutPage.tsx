import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserLocation } from "@/services/supabase/locations";
import { useToast } from "@/hooks/use-toast";
import RazorpayCheckout from "@/components/checkout/RazorpayCheckout";
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
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    date: '',
    timeSlot: ''
  });
  const [formComplete, setFormComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cash'>('razorpay');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
    onSuccess: (createdOrder) => {
      console.log("Order created successfully:", createdOrder);
      setCurrentOrderId(createdOrder.id);
      
      if (paymentMethod === 'razorpay') {
        setShowPaymentGateway(true);
      } else {
        handleCashPayment(createdOrder.id);
      }

      toast({
        title: "Booking Created",
        description: paymentMethod === 'razorpay' 
          ? "Proceeding to payment..." 
          : "Order placed successfully with Cash on Delivery",
      });
    },
    onError: (error) => {
      console.error("Booking creation error:", error);
      toast({
        title: "Booking Error",
        description: "Failed to create booking in database, please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCashPayment = async (orderId: number) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_method: 'cash',
          payment_status: 'pending',
          status: 'confirmed',
          address: selectedLocation?.address,
          latitude: selectedLocation?.latitude,
          longitude: selectedLocation?.longitude,
          phone: formData.phone,
          email: formData.email,
          fullname: formData.fullName,
          scheduled_at: `${formData.date}T${timeMap[formData.timeSlot] || '12:00'}:00`
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Confirmed",
        description: "Your order has been placed successfully with cash on delivery.",
      });
      
      clearCart();
      navigate("/bookings");
    } catch (error: any) {
      console.error("Cash payment update error:", error);
      toast({
        title: "Order Update Error",
        description: error?.message || "Could not update order. Please contact support.",
        variant: "destructive",
      });
    }
  };

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

    if (!selectedLocation) {
      toast({
        title: "Location Required",
        description: "Please select a delivery location before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const orderItems = items.map(item => ({
        service_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        service_name: item.name
      }));

      const timeMap: { [key: string]: string } = {
        'morning': '10:00',
        'afternoon': '14:00',
        'evening': '18:00'
      };
      
      const scheduledAt = formData.date 
        ? `${formData.date}T${timeMap[formData.timeSlot] || '12:00'}:00` 
        : new Date().toISOString();

      createBookingMutation.mutate({
        locationId: selectedLocation?.id,
        scheduledAt,
        items: orderItems,
        totalAmount: totalPrice + totalPrice * 0.1,
        address: selectedLocation?.address,
        contactInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone
        }
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Could not process your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      console.log("Payment success response:", response);
      
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_id: response.razorpay_payment_id,
          email: formData.email,
          phone: formData.phone,
          fullName: formData.fullName
        })
        .eq('id', currentOrderId);

      if (error) throw error;

      toast({
        title: "Payment Successful",
        description: "Your booking has been confirmed. Thank you!",
      });
      
      clearCart();
      navigate("/bookings");
    } catch (error: any) {
      console.error("Payment update error:", error);
      toast({
        title: "Payment Update Error",
        description: error?.message || "Payment was successful, but updating booking failed. Please contact support.",
        variant: "destructive",
      });
    }
    setShowPaymentGateway(false);
  };

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failure:", error);
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

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="flex gap-4">
                <Button
                  variant={paymentMethod === 'razorpay' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('razorpay')}
                >
                  Online Payment
                </Button>
                <Button
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('cash')}
                >
                  Cash on Delivery
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:w-4/12">
            <OrderSummary
              items={items}
              updateQuantity={updateQuantity}
              totalPrice={totalPrice}
              onProceedToPayment={handleProceedToPayment}
              formComplete={formComplete}
              paymentMethod={paymentMethod}
            />
          </div>
        </div>
      </div>

      <AddLocationDialog
        isOpen={isLocationModalOpen}
        onOpenChange={setIsLocationModalOpen}
        onSubmit={(data) => {
          createLocationMutation.mutate({
            user_id: "",
            address: data.address,
            latitude: null,
            longitude: null,
            is_default: false
          });
        }}
        isLoading={createLocationMutation.isPending}
      />

      {showPaymentGateway && currentOrderId && paymentMethod === 'razorpay' && (
        <RazorpayCheckout
          amount={totalPrice + totalPrice * 0.1}
          name={formData.fullName}
          email={formData.email}
          phone={formData.phone}
          address={selectedLocation?.address}
          orderId={currentOrderId}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
    </Layout>
  );
};

export default CheckoutPage;
