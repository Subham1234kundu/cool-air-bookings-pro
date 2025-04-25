
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Search, User, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GoogleMap } from '@/components/maps/GoogleMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fetchAllBookings = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

const updateBookingStatus = async ({ id, status }: { id: number, status: string }) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

const AdminBookingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<null | any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: fetchAllBookings,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });

  const updateMutation = useMutation({
    mutationFn: updateBookingStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast({
        title: "Booking Updated",
        description: "The booking status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.id.toString().includes(searchTerm.toLowerCase()) || 
      booking.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const viewBookingDetails = (booking: any) => {
    setSelectedBooking(booking);
  };

  const updateStatus = (newStatus: string) => {
    if (selectedBooking) {
      updateMutation.mutate({
        id: selectedBooking.id,
        status: newStatus
      });
      
      // Update local state for immediate UI feedback
      setSelectedBooking({
        ...selectedBooking,
        status: newStatus
      });
    }
  };

  const openInGoogleMaps = () => {
    if (selectedBooking && selectedBooking.latitude && selectedBooking.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${selectedBooking.latitude},${selectedBooking.longitude}`;
      window.open(url, '_blank');
    } else {
      toast({
        title: "No Location Data",
        description: "This booking doesn't have location coordinates.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading bookings...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading bookings: {error instanceof Error ? error.message : "Unknown error"}</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">Manage customer service bookings</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search bookings..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking: any) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>{booking.address || "No address"}</TableCell>
                  <TableCell>
                    {new Date(booking.scheduled_at).toLocaleDateString()} - {new Date(booking.scheduled_at).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    <div className={`px-2 py-1 rounded-full text-xs inline-flex items-center font-medium
                      ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                      ${booking.status === 'in progress' ? 'bg-purple-100 text-purple-800' : ''}
                      ${booking.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    `}>
                      {booking.status || "Pending"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`px-2 py-1 rounded-full text-xs inline-flex items-center font-medium
                      ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    `}>
                      {booking.payment_status || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell>₹{booking.total_amount?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => viewBookingDetails(booking)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    No bookings found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Booking Details Dialog */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Booking Details - Order #{selectedBooking.id}</DialogTitle>
              <DialogDescription>
                View and manage booking details
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="details">Booking Details</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <User className="h-5 w-5" /> Customer Information
                      </h3>
                      <div className="grid gap-1 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">User ID:</span>
                          <span className="font-medium">{selectedBooking.user_id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{selectedBooking.email || "Not available"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">{selectedBooking.phone || "Not available"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Calendar className="h-5 w-5" /> Appointment Details
                      </h3>
                      <div className="grid gap-1 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">
                            {selectedBooking.scheduled_at 
                              ? new Date(selectedBooking.scheduled_at).toLocaleDateString() 
                              : "Not scheduled"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Time:</span>
                          <span className="font-medium">
                            {selectedBooking.scheduled_at 
                              ? new Date(selectedBooking.scheduled_at).toLocaleTimeString() 
                              : "Not scheduled"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium">{selectedBooking.status || "Pending"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Package className="h-5 w-5" /> Services
                      </h3>
                      <div className="mt-2 space-y-2">
                        {selectedBooking.order_items && selectedBooking.order_items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.service_name}</span>
                            <span className="font-medium">₹{item.unit_price.toFixed(2)} x {item.quantity}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-semibold border-t pt-2">
                          <span>Total:</span>
                          <span>₹{selectedBooking.total_amount?.toFixed(2) || "0.00"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Payment Information</h3>
                      <div className="grid gap-1 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <span className={`font-medium ${selectedBooking.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {selectedBooking.payment_status || "Unpaid"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Method:</span>
                          <span className="font-medium capitalize">{selectedBooking.payment_method || "Not specified"}</span>
                        </div>
                        {selectedBooking.payment_id && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Transaction ID:</span>
                            <span className="font-medium">{selectedBooking.payment_id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <MapPin className="h-5 w-5" /> Service Address
                      </h3>
                      <p className="text-sm mt-1">{selectedBooking.address || "No address provided"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Update Status</h3>
                      <div className="flex flex-col gap-2 mt-2">
                        <p className="text-sm text-muted-foreground">Current status: <span className="font-medium">{selectedBooking.status || "Pending"}</span></p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={selectedBooking.status === 'pending' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStatus('pending')}
                            disabled={selectedBooking.status === 'pending'}
                          >
                            Pending
                          </Button>
                          <Button
                            variant={selectedBooking.status === 'confirmed' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStatus('confirmed')}
                            disabled={selectedBooking.status === 'confirmed'}
                          >
                            Confirmed
                          </Button>
                          <Button
                            variant={selectedBooking.status === 'in progress' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStatus('in progress')}
                            disabled={selectedBooking.status === 'in progress'}
                          >
                            In Progress
                          </Button>
                          <Button
                            variant={selectedBooking.status === 'completed' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStatus('completed')}
                            disabled={selectedBooking.status === 'completed'}
                          >
                            Completed
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Actions</h3>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Contact Customer
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Send Reminder
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="location">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Customer Location</h3>
                    <Button onClick={openInGoogleMaps} disabled={!selectedBooking.latitude || !selectedBooking.longitude}>
                      Open in Google Maps
                    </Button>
                  </div>
                  
                  <div className="h-72 border rounded-md overflow-hidden">
                    {selectedBooking.latitude && selectedBooking.longitude ? (
                      <GoogleMap 
                        location={{
                          latitude: selectedBooking.latitude,
                          longitude: selectedBooking.longitude
                        }}
                        height="100%"
                        readOnly={true}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <div className="text-center">
                          <MapPin className="mx-auto h-10 w-10 text-gray-400" />
                          <p className="mt-2 text-gray-500">No location data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Location Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="font-medium">{selectedBooking.address || "Not available"}</span>
                      </div>
                      {selectedBooking.latitude && selectedBooking.longitude && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Coordinates:</span>
                          <span className="font-medium">
                            {selectedBooking.latitude.toFixed(6)}, {selectedBooking.longitude.toFixed(6)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AdminBookingsPage;
