
import React, { useState } from 'react';
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
import { Calendar, Clock, MapPin, Search, User, Package } from "lucide-react";

// Mock data - replace with actual data fetching when connected to Supabase
const mockBookings = Array(10).fill(null).map((_, i) => ({
  id: `ORD-${1000 + i}`,
  customerName: `Customer ${i + 1}`,
  services: i % 3 === 0 ? ['AC Repair', 'Cleaning'] : i % 3 === 1 ? ['Installation'] : ['Maintenance'],
  date: new Date(Date.now() + ((i - 5) * 86400000)).toISOString(), // -5 to +5 days from now
  time: `${10 + (i % 8)}:00 ${(i % 8) < 2 ? 'AM' : 'PM'}`,
  location: `Area ${i + 1}, City`,
  status: i % 4 === 0 ? 'Pending' : i % 4 === 1 ? 'Confirmed' : i % 4 === 2 ? 'In Progress' : 'Completed',
  total: 1500 + (i * 500),
  address: `${100 + i} Main Street, Area ${i + 1}, City, 10000${i}`,
  phone: `+91 9876543${100 + i}`,
  email: `customer${i + 1}@example.com`,
  payment: {
    method: i % 2 === 0 ? 'Razorpay' : 'Cash',
    status: i % 5 === 0 ? 'Pending' : 'Paid',
    transactionId: i % 2 === 0 ? `TXN-${10000 + i}` : null
  }
}));

const AdminBookingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<null | any>(null);

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const viewBookingDetails = (booking: any) => {
    setSelectedBooking(booking);
  };

  const updateStatus = (newStatus: string) => {
    // This would update the status in the database
    // For now, we just update the local state
    if (selectedBooking) {
      setSelectedBooking({
        ...selectedBooking,
        status: newStatus
      });
      
      // In a real implementation, we would call an API or Supabase function
      console.log(`Status updated to ${newStatus} for booking ${selectedBooking.id}`);
    }
  };

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
                <TableHead>Customer</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>{booking.customerName}</TableCell>
                  <TableCell>{booking.services.join(', ')}</TableCell>
                  <TableCell>
                    {new Date(booking.date).toLocaleDateString()} - {booking.time}
                  </TableCell>
                  <TableCell>{booking.location}</TableCell>
                  <TableCell>
                    <div className={`px-2 py-1 rounded-full text-xs inline-flex items-center font-medium
                      ${booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                      ${booking.status === 'In Progress' ? 'bg-purple-100 text-purple-800' : ''}
                      ${booking.status === 'Completed' ? 'bg-green-100 text-green-800' : ''}
                    `}>
                      {booking.status}
                    </div>
                  </TableCell>
                  <TableCell>₹{booking.total.toFixed(2)}</TableCell>
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
              <DialogTitle>Booking Details - {selectedBooking.id}</DialogTitle>
              <DialogDescription>
                View and manage booking details
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <User className="h-5 w-5" /> Customer Information
                  </h3>
                  <div className="grid gap-1 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedBooking.customerName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{selectedBooking.phone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedBooking.email}</span>
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
                      <span className="font-medium">{new Date(selectedBooking.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{selectedBooking.time}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">{selectedBooking.status}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Package className="h-5 w-5" /> Services
                  </h3>
                  <div className="mt-2 space-y-2">
                    {selectedBooking.services.map((service: string, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{service}</span>
                        <span className="font-medium">₹{(selectedBooking.total / selectedBooking.services.length).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-semibold border-t pt-2">
                      <span>Total:</span>
                      <span>₹{selectedBooking.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Payment Information</h3>
                  <div className="grid gap-1 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Method:</span>
                      <span className="font-medium">{selectedBooking.payment.method}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-medium ${selectedBooking.payment.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedBooking.payment.status}
                      </span>
                    </div>
                    {selectedBooking.payment.transactionId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transaction ID:</span>
                        <span className="font-medium">{selectedBooking.payment.transactionId}</span>
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
                  <p className="text-sm mt-1">{selectedBooking.address}</p>
                  
                  {/* Map placeholder - replace with actual Google Map in production */}
                  <div className="mt-2 border rounded-md bg-slate-100 h-48 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Google Map would be displayed here</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Update Status</h3>
                  <div className="flex flex-col gap-2 mt-2">
                    <p className="text-sm text-muted-foreground">Current status: <span className="font-medium">{selectedBooking.status}</span></p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={selectedBooking.status === 'Pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateStatus('Pending')}
                        disabled={selectedBooking.status === 'Pending'}
                      >
                        Pending
                      </Button>
                      <Button
                        variant={selectedBooking.status === 'Confirmed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateStatus('Confirmed')}
                        disabled={selectedBooking.status === 'Confirmed'}
                      >
                        Confirmed
                      </Button>
                      <Button
                        variant={selectedBooking.status === 'In Progress' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateStatus('In Progress')}
                        disabled={selectedBooking.status === 'In Progress'}
                      >
                        In Progress
                      </Button>
                      <Button
                        variant={selectedBooking.status === 'Completed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateStatus('Completed')}
                        disabled={selectedBooking.status === 'Completed'}
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
