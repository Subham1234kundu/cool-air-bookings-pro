
import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { Input } from "@/components/ui/input";

export function Navbar() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">
                <span className="text-skyblue">Cool</span>Air
              </span>
            </Link>
          </div>

          {/* Location Selector */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-700 mr-4 cursor-pointer">
            <MapPin className="h-4 w-4" />
            <span className="max-w-[180px] truncate">
              Select your location
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search AC services"
                className="w-full rounded-md border pl-9 py-2"
              />
            </div>
          </div>

          {/* Nav Links - Hidden on Mobile */}
          <nav className="hidden md:flex space-x-8 text-sm">
            <Link to="/services" className="text-gray-600 hover:text-skyblue transition-colors">
              Services
            </Link>
            <Link to="/bookings" className="text-gray-600 hover:text-skyblue transition-colors">
              My Bookings
            </Link>
            <Link to="/login" className="text-gray-600 hover:text-skyblue transition-colors">
              Login
            </Link>
          </nav>

          {/* Cart Button - Show on all screen sizes */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand text-xs font-medium text-white flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <CartSidebar />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
