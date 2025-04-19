
import React from "react";
import { CalendarRange, CheckCircle2, Clock } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      icon: <CalendarRange className="h-8 w-8 text-brand" />,
      title: "Book a Service",
      description: "Choose from our range of AC services and select a convenient time slot."
    },
    {
      id: 2,
      icon: <CheckCircle2 className="h-8 w-8 text-brand" />,
      title: "Expert Technician Visit",
      description: "Our professional technician will arrive at your doorstep at the scheduled time."
    },
    {
      id: 3,
      icon: <Clock className="h-8 w-8 text-brand" />,
      title: "Same-Day Service",
      description: "Get your AC fixed or serviced the same day with quality workmanship."
    }
  ];
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="mt-4 text-lg text-gray-600">
            Get your AC services done in simple steps with our easy process
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div 
              key={step.id} 
              className="bg-gray-50 rounded-xl p-6 text-center relative hover:shadow-md transition-shadow"
            >
              {step.id !== steps.length && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-200" />
              )}
              <div className="flex justify-center mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
