
import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const CartSidebar = () => {
  const { items, totalPrice, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  
  const handleUpdateQuantity = (id: number, quantity: number) => {
    updateQuantity(id, quantity);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-brand text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {items.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center pb-4 border-b">
            <h3 className="font-semibold text-lg">Your Cart</h3>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </SheetTrigger>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <SheetTrigger asChild>
                <Link to="/services">
                  <Button variant="link" className="mt-2 text-brand">
                    Browse Services
                  </Button>
                </Link>
              </SheetTrigger>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 my-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border-b pb-3"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <div className="flex items-center mt-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-6 w-6 rounded-full border flex items-center justify-center text-gray-500"
                          >
                            -
                          </button>
                          <span className="mx-2">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 rounded-full border flex items-center justify-center text-gray-500"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-semibold">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-600 mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{totalPrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>₹{(totalPrice * 0.1).toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg mb-6">
                  <span>Total</span>
                  <span>₹{(totalPrice + totalPrice * 0.1).toFixed(0)}</span>
                </div>
                <SheetTrigger asChild>
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-brand hover:bg-brand/90"
                  >
                    Checkout
                  </Button>
                </SheetTrigger>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
