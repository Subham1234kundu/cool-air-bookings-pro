
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useQuery } from '@tanstack/react-query';
import { fetchUserBookings } from '@/services/supabase/bookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';

const MyBookingsPage = () => {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: fetchUserBookings,
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
        
        {isLoading ? (
          <div>Loading bookings...</div>
        ) : bookings?.length === 0 ? (
          <div className="text-center py-12">
            <CalendarCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No bookings found</h3>
            <p className="text-gray-600">You haven't made any bookings yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings?.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <CardTitle>Booking #{booking.id}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>Status: {booking.status}</p>
                    <p>Date: {format(new Date(booking.scheduled_at), 'PPP')}</p>
                    <p>Total Amount: ₹{booking.total_amount}</p>
                    <p>Address: {booking.address}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyBookingsPage;
