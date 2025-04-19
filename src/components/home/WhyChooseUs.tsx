
import React from "react";
import { BadgeCheck, Clock, DollarSign, ShieldCheck, Users } from "lucide-react";

export const WhyChooseUs = () => {
  const reasons = [
    {
      icon: <Clock className="h-6 w-6 text-skyblue" />,
      title: "On-Time Service",
      description: "Our technicians arrive at the scheduled time or we offer a discount on your service."
    },
    {
      icon: <Users className="h-6 w-6 text-skyblue" />,
      title: "Verified Professionals",
      description: "All our technicians are skilled, experienced, and thoroughly background-checked."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-skyblue" />,
      title: "Service Warranty",
      description: "All repairs and services come with a 30-day warranty for your peace of mind."
    },
    {
      icon: <DollarSign className="h-6 w-6 text-skyblue" />,
      title: "Transparent Pricing",
      description: "No hidden fees or charges. Pay only what you see in the upfront quote."
    },
    {
      icon: <BadgeCheck className="h-6 w-6 text-skyblue" />,
      title: "Genuine Parts",
      description: "We only use genuine and high-quality parts for all repairs and replacements."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold">Why Choose Us</h2>
          <p className="mt-4 text-lg text-gray-600">
            Experience superior AC services with our commitment to excellence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="flex items-start p-4">
              <div className="mr-4 mt-1">{reason.icon}</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{reason.title}</h3>
                <p className="text-gray-600">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
