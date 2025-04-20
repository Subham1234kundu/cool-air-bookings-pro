
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimeSectionProps {
  formData: {
    date: string;
    timeSlot: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const DateTimeSection = ({ formData, onChange }: DateTimeSectionProps) => {
  return (
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
            onChange={onChange}
          />
        </div>
        <div>
          <Label htmlFor="timeSlot">Preferred Time</Label>
          <select 
            id="timeSlot" 
            className="w-full rounded-md border p-2 mt-1"
            value={formData.timeSlot}
            onChange={onChange}
          >
            <option value="">Select a time slot</option>
            <option value="morning">Morning (8 AM - 12 PM)</option>
            <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
            <option value="evening">Evening (4 PM - 8 PM)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
