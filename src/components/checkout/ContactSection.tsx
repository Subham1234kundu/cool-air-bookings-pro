
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactSectionProps {
  formData: {
    fullName: string;
    phone: string;
    email: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ContactSection = ({ formData, onChange }: ContactSectionProps) => {
  return (
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
              onChange={onChange}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              placeholder="+91 12345 67890" 
              className="mt-1" 
              value={formData.phone}
              onChange={onChange}
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
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
};
