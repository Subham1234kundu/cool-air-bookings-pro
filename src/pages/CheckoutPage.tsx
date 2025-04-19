
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const CheckoutPage = () => {
  const { items, updateQuantity, totalPrice } = useCart();

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
          {/* Left Column - Checkout Form */}
          <div className="lg:w-8/12 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+91 12345 67890" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" placeholder="john@example.com" className="mt-1" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Service Address</h2>
              <Button className="w-full bg-brand hover:bg-brand/90 mb-4">
                Select an Address
              </Button>
              <div className="text-sm text-gray-600 text-center">
                Google Maps integration will be added here
              </div>
            </div>

            {/* Date & Time Slot */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Choose Date & Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Service Date</Label>
                  <Input id="date" type="date" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="time">Preferred Time</Label>
                  <select id="time" className="w-full rounded-md border p-2 mt-1">
                    <option value="">Select a time slot</option>
                    <option value="morning">Morning (8 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                    <option value="evening">Evening (4 PM - 8 PM)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-4/12">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {/* Cart Items */}
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
              
              {/* Coupon Code */}
              <div className="flex items-center gap-2 mb-6">
                <Input placeholder="Enter coupon code" className="flex-1" />
                <Button variant="outline" className="whitespace-nowrap">Apply</Button>
              </div>
              
              {/* Price Summary */}
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
              
              <Button className="w-full bg-brand hover:bg-brand/90 mt-6">
                Proceed to Payment
              </Button>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                By proceeding, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
