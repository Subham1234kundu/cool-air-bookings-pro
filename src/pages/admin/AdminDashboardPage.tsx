
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, TabsList, TabsTrigger, Tabs } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const fetchDashboardData = async () => {
  // Fetch orders data
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*');

  // Fetch services data
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*');
    
  // Fetch reviews data
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*');
    
  // Fetch bookings by category for pie chart
  const { data: categoryBookings, error: categoryError } = await supabase
    .from('orders')
    .select('order_items(service_id), services!inner(category_id, categories!inner(name))')
    .limit(50);

  if (ordersError || servicesError || reviewsError || categoryError) {
    throw new Error(ordersError?.message || servicesError?.message || reviewsError?.message || categoryError?.message);
  }

  // Process data for pie chart
  const categoryCounts: Record<string, number> = {};
  if (categoryBookings) {
    categoryBookings.forEach((booking: any) => {
      if (booking.order_items && booking.order_items.length > 0) {
        const categoryName = booking.services?.categories?.name;
        if (categoryName) {
          categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
        }
      }
    });
  }

  const bookingsByCategory = Object.keys(categoryCounts).map(name => ({
    name,
    value: categoryCounts[name]
  }));

  // Generate daily sales data for the past week
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const dailySales = last7Days.map(date => {
    const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
    const isoDate = date.toISOString().split('T')[0];
    
    // Filter orders for this date
    const dayOrders = orders?.filter(order => {
      const orderDate = new Date(order.created_at || '').toISOString().split('T')[0];
      return orderDate === isoDate;
    }) || [];
    
    // Calculate total sales for this date
    const daySales = dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    
    return { name: dayStr, sales: daySales };
  });

  return { 
    orders: orders || [], 
    services: services || [],
    reviews: reviews || [],
    dailySales,
    bookingsByCategory: bookingsByCategory.length > 0 ? bookingsByCategory : [
      { name: 'No Data', value: 1 }
    ]
  };
};

const AdminDashboardPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchDashboardData,
    refetchInterval: 30000 // Real-time update every 30 seconds
  });

  // Calculate real-time metrics
  const totalRevenue = data?.orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const totalBookings = data?.orders?.length || 0;
  const activeJobs = data?.orders?.filter(order => order.status === 'in progress').length || 0;
  const averageRating = data?.reviews && data.reviews.length > 0 
    ? data.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / data.reviews.length
    : 0;
  const reviewCount = data?.reviews?.length || 0;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Daily metrics
  const dailyBookings = data?.orders?.filter(order => {
    const today = new Date().toISOString().split('T')[0];
    const orderDate = new Date(order.created_at || '').toISOString().split('T')[0];
    return orderDate === today;
  }).length || 0;

  const dailyRevenue = data?.orders?.filter(order => {
    const today = new Date().toISOString().split('T')[0];
    const orderDate = new Date(order.created_at || '').toISOString().split('T')[0];
    return orderDate === today;
  }).reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

  const dailyCompleted = data?.orders?.filter(order => {
    const today = new Date().toISOString().split('T')[0];
    const orderDate = new Date(order.created_at || '').toISOString().split('T')[0];
    return orderDate === today && order.status === 'completed';
  }).length || 0;

  // Weekly metrics
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekStartStr = weekStart.toISOString();

  const weeklyBookings = data?.orders?.filter(order => 
    order.created_at && order.created_at > weekStartStr
  ).length || 0;

  const weeklyRevenue = data?.orders?.filter(order => 
    order.created_at && order.created_at > weekStartStr
  ).reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

  const weeklyCompleted = data?.orders?.filter(order => 
    order.created_at && order.created_at > weekStartStr && order.status === 'completed'
  ).length || 0;

  // Monthly metrics
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString();

  const monthlyBookings = data?.orders?.filter(order => 
    order.created_at && order.created_at > monthStartStr
  ).length || 0;

  const monthlyRevenue = data?.orders?.filter(order => 
    order.created_at && order.created_at > monthStartStr
  ).reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

  const monthlyCompleted = data?.orders?.filter(order => 
    order.created_at && order.created_at > monthStartStr && order.status === 'completed'
  ).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Admin dashboard overview and analytics</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Real-time revenue tracking
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              Real-time bookings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}/5.0</div>
            <p className="text-xs text-muted-foreground">
              Based on {reviewCount} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Daily revenue for the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data?.dailySales || []}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Sales']}/>
                <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Bookings by Category</CardTitle>
            <CardDescription>
              Distribution of service types
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[300px]">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data?.bookingsByCategory || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data?.bookingsByCategory?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div>
        <Tabs defaultValue="week">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="day" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{dailyBookings}</div>
                  <p className="text-sm text-muted-foreground">New bookings today</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">₹{dailyRevenue.toFixed(0)}</div>
                  <p className="text-sm text-muted-foreground">Revenue today</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{dailyCompleted}</div>
                  <p className="text-sm text-muted-foreground">Completed jobs</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">Average rating today</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="week" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{weeklyBookings}</div>
                  <p className="text-sm text-muted-foreground">New bookings this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">₹{weeklyRevenue.toFixed(0)}</div>
                  <p className="text-sm text-muted-foreground">Revenue this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{weeklyCompleted}</div>
                  <p className="text-sm text-muted-foreground">Completed jobs</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">Average rating this week</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="month" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{monthlyBookings}</div>
                  <p className="text-sm text-muted-foreground">New bookings this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">₹{monthlyRevenue.toFixed(0)}</div>
                  <p className="text-sm text-muted-foreground">Revenue this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{monthlyCompleted}</div>
                  <p className="text-sm text-muted-foreground">Completed jobs</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">Average rating this month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
