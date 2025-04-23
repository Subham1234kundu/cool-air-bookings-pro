import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { ServiceItem } from "@/context/CartContext";

interface OrderSummaryProps {
  items: ServiceItem[];
  updateQuantity: (id: number, quantity: number) => void;
  totalPrice: number;
  onProceedToPayment: () => void;
  formComplete: boolean;
  paymentMethod: 'razorpay' | 'cash';
}

export const OrderSummary = ({ 
  items, 
  updateQuantity, 
  totalPrice,
  onProceedToPayment,
  formComplete,
  paymentMethod 
}: OrderSummaryProps) => {
  return (
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
        onClick={onProceedToPayment}
      >
        {paymentMethod === 'cash' ? 'Confirm Order' : 'Proceed to Payment'}
      </Button>
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        By proceeding, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};
