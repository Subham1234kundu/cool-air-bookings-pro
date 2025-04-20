
import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, MapPin, PlusCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchUserLocations, 
  createUserLocation, 
  setDefaultLocation 
} from "@/services/supabase/locations";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { RazorpayCheckout } from "@/components/checkout/RazorpayCheckout";

const CheckoutPage = () => {
  const { items, updateQuantity, totalPrice } = useCart();
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['userLocations'],
    queryFn: fetchUserLocations,
  });

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

  const { register, handleSubmit, reset } = useForm();

  const onSubmitLocation = (formData: any) => {
    createLocationMutation.mutate({
      user_id: "",  // This will be set by the backend function
      address: formData.address,
      latitude: null,
      longitude: null,
      is_default: locations?.length === 0 ? true : false
    });
    reset();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    // Check if all required fields are filled
    setTimeout(() => {
      const { fullName, phone, email, date, timeSlot } = formData;
      setFormComplete(
        !!fullName && 
        !!phone && 
        !!email && 
        !!date && 
        !!timeSlot && 
        !!selectedLocation
      );
    }, 100);
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

  const handlePaymentSuccess = (response: any) => {
    toast({
      title: "Payment Successful",
      description: "Your booking has been confirmed. Thank you!",
    });
    // In a real app, you would create the order in the database here
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
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                Service Address 
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsLocationModalOpen(true)}
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

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      placeholder="John Doe" 
                      className="mt-1" 
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      placeholder="+91 12345 67890" 
                      className="mt-1" 
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    placeholder="john@example.com" 
                    className="mt-1" 
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Choose Date & Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Service Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    className="mt-1"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="timeSlot">Preferred Time</Label>
                  <select 
                    id="timeSlot" 
                    className="w-full rounded-md border p-2 mt-1"
                    value={formData.timeSlot}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a time slot</option>
                    <option value="morning">Morning (8 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                    <option value="evening">Evening (4 PM - 8 PM)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-4/12">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between border-b pb-3">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="text-gray-500 h-6 w-6 flex items-center justify-center rounded-full border"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="mx-2 w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-500 h-6 w-6 flex items-center justify-center rounded-full border"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="font-semibold">₹{(item.price * item.quantity).toFixed(0)}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <Input placeholder="Enter coupon code" className="flex-1" />
                <Button variant="outline" className="whitespace-nowrap">Apply</Button>
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Item Total</span>
                  <span>₹{totalPrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span>₹{(totalPrice * 0.1).toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                  <span>Total Amount</span>
                  <span>₹{(totalPrice + totalPrice * 0.1).toFixed(0)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-brand hover:bg-brand/90 mt-6"
                disabled={!formComplete}
                onClick={handleProceedToPayment}
              >
                Proceed to Payment
              </Button>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                By proceeding, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>

      {showPaymentGateway && (
        <RazorpayCheckout
          amount={totalPrice + totalPrice * 0.1}
          name={formData.fullName}
          email={formData.email}
          phone={formData.phone}
          address={selectedLocation?.address}
          orderId={1} // In a real app, you would create an order and get its ID
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}

      <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Enter the full address for your service location
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmitLocation)} className="space-y-4">
            <div>
              <Label>Full Address</Label>
              <Input 
                {...register('address', { required: 'Address is required' })}
                placeholder="Enter full address" 
              />
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={createLocationMutation.isPending}>
                {createLocationMutation.isPending ? 'Adding...' : 'Add Location'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CheckoutPage;
