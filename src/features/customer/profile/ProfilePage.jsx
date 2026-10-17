import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, MapPin, ClipboardList, Trophy, Phone, Mail, Plus, Trash2, Calendar, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore.js';
import { apiClient } from '@/api/apiClient.js';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button.jsx';
import { ROUTE_PATHS } from '@/app/router/routePaths.js';

export function ProfilePage() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState('profile'); // profile, addresses, orders

  // Form states for adding address
  const [alias, setAlias] = useState('');
  const [details, setDetails] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Fetch full user details (e.g. for loyalty points)
  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['myProfileDetails'],
    queryFn: async () => {
      const response = await apiClient.get('/users/getMe');
      return response.data?.data;
    },
    enabled: isAuthenticated,
  });

  // Fetch addresses
  const { data: addresses = [], isLoading: isAddressesLoading } = useQuery({
    queryKey: ['myAddressesList'],
    queryFn: async () => {
      const response = await apiClient.get('/addresses');
      return response.data?.data || [];
    },
    enabled: isAuthenticated,
  });

  // Fetch orders
  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['myOrdersList'],
    queryFn: async () => {
      const response = await apiClient.get('/orders');
      return response.data?.data || [];
    },
    enabled: isAuthenticated,
  });

  // Add Address Mutation
  const addAddressMutation = useMutation({
    mutationFn: async (newAddress) => {
      const response = await apiClient.post('/addresses', newAddress);
      return response.data?.data;
    },
    onSuccess: () => {
      toast.success('New address added successfully');
      queryClient.invalidateQueries({ queryKey: ['myAddressesList'] });
      // Reset form
      setAlias('');
      setDetails('');
      setPhone('');
      setCity('');
      setPostalCode('');
      setShowAddressForm(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add address');
    },
  });

  // Delete Address Mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId) => {
      const response = await apiClient.delete(`/addresses/${addressId}`);
      return response.data?.data;
    },
    onSuccess: () => {
      toast.success('Address deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['myAddressesList'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    },
  });

  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.AUTH.LOGIN} replace />;
  }

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!alias.trim() || !details.trim() || !phone.trim() || !city.trim()) {
      toast.warning('Please fill in all required fields');
      return;
    }
    addAddressMutation.mutate({
      alias: alias.trim(),
      details: details.trim(),
      phone: phone.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
    });
  };

  return (
    <div className="space-y-8 py-6 animate-fade-in text-start">
      {/* Header */}
      <div className="border-b border-border/60 pb-4">
        <h1 className="text-2xl font-black text-foreground">My Account</h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          {user?.role === 'admin' 
            ? 'Manage delivery addresses and profile details' 
            : 'Track orders, manage delivery addresses, and view loyalty points'}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border/60 gap-4 overflow-x-auto pb-1 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 pb-3 border-b-2 px-1 transition-all ${
            activeTab === 'profile'
              ? 'border-primary text-primary font-black'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{user?.role === 'admin' ? 'Profile' : 'Profile & Loyalty'}</span>
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex items-center gap-1.5 pb-3 border-b-2 px-1 transition-all ${
            activeTab === 'addresses'
              ? 'border-primary text-primary font-black'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Addresses</span>
        </button>
        {user?.role !== 'admin' && (
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 pb-3 border-b-2 px-1 transition-all ${
              activeTab === 'orders'
                ? 'border-primary text-primary font-black'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Order History</span>
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[300px]">
        {/* Profile Details Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Info Details */}
            <div className={`${user?.role === 'admin' ? 'md:col-span-3' : 'md:col-span-2'} bg-card border border-border/60 rounded-3xl p-6 shadow-sm space-y-4`}>
              <h3 className="text-sm font-extrabold text-foreground border-b border-border/60 pb-3">Account Details</h3>
              {isProfileLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-secondary/50 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-secondary/50 rounded animate-pulse w-1/2" />
                </div>
              ) : (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold block">Full Name:</span>
                      <span className="font-extrabold text-foreground">{userProfile?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold block">Email Address:</span>
                      <span className="font-bold text-foreground">{userProfile?.email}</span>
                    </div>
                  </div>
                  {userProfile?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <span className="text-[10px] text-muted-foreground font-semibold block">Phone Number:</span>
                        <span className="font-bold text-foreground text-start inline-block dir-ltr">{userProfile.phone}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Loyalty points card */}
            {user?.role !== 'admin' && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-transparent border border-amber-500/20 rounded-3xl p-6 shadow-sm flex flex-col justify-between items-center text-center space-y-6">
                <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-amber-800 dark:text-amber-300 text-xs font-black block uppercase tracking-wider">Available Loyalty Points</span>
                  <span className="text-amber-600 dark:text-amber-400 text-4xl font-black block">
                    {isProfileLoading ? '...' : userProfile?.loyaltyPoints || 0}
                  </span>
                </div>
                <div className="text-[11px] text-amber-800 dark:text-amber-300 font-bold leading-relaxed border-t border-amber-500/20 pt-4 w-full">
                  <p>Current points value: {((userProfile?.loyaltyPoints || 0) * 0.20).toFixed(2)} EGP discount</p>
                  <p className="text-[10px] font-medium text-amber-600/70 mt-1">Redeemable directly during checkout</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Saved Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-foreground">Saved Addresses</h3>
              <Button onClick={() => setShowAddressForm(!showAddressForm)} className="rounded-xl text-xs font-bold gap-1">
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </Button>
            </div>

            {/* Add Address Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm space-y-4 max-w-xl animate-fade-in">
                <h4 className="text-xs font-extrabold text-foreground uppercase border-b border-border/60 pb-2">Add Delivery Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground">Address Label (e.g. Home, Office):</label>
                    <input
                      type="text"
                      required
                      placeholder="Home..."
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground">City / Area:</label>
                    <input
                      type="text"
                      required
                      placeholder="City..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-muted-foreground">Recipient Phone Number:</label>
                    <input
                      type="tel"
                      required
                      placeholder="Contact phone number..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-muted-foreground">Detailed Address:</label>
                    <input
                      type="text"
                      required
                      placeholder="Street name, building, apartment..."
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground">Postal Code (Optional):</label>
                    <input
                      type="text"
                      placeholder="12345..."
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={addAddressMutation.isPending} className="rounded-xl text-xs font-bold px-5">
                    Add Address
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddressForm(false)} className="rounded-xl text-xs font-bold">
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Address Grid */}
            {isAddressesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-24 bg-secondary/50 rounded-2xl animate-pulse" />
                <div className="h-24 bg-secondary/50 rounded-2xl animate-pulse" />
              </div>
            ) : addresses.length === 0 ? (
              <p className="text-xs text-muted-foreground font-semibold">You have no saved delivery addresses yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-foreground text-sm">{addr.alias}</span>
                        <button
                          onClick={() => deleteAddressMutation.mutate(addr._id)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-destructive/10 transition-colors"
                          title="Delete Address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {addr.details}, {addr.city}
                      </p>
                      <p className="text-xs font-bold text-foreground">Phone: {addr.phone}</p>
                      {addr.postalCode && <p className="text-[10px] text-muted-foreground font-medium">Postal Code: {addr.postalCode}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order History Tab */}
        {activeTab === 'orders' && user?.role !== 'admin' && (
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold text-foreground">Order History</h3>

            {isOrdersLoading ? (
              <div className="space-y-4">
                <div className="h-16 bg-secondary/50 rounded-2xl animate-pulse" />
                <div className="h-16 bg-secondary/50 rounded-2xl animate-pulse" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground font-semibold">You have not placed any orders yet.</p>
                <Link to={ROUTE_PATHS.PRODUCTS}>
                  <Button className="rounded-xl text-xs font-bold">Shop Clothing Now</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord._id}
                    className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs text-foreground bg-secondary px-2.5 py-1 rounded-xl">
                          Order #{ord._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(ord.createdAt || ord.orderDate).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                        <span>Ship to: {ord.customerName} - {ord.address}</span>
                      </div>
                      {ord.earnedPoints > 0 && (
                        <span className="text-[10px] text-emerald-600 font-extrabold block">
                          Earned from this order: +{ord.earnedPoints} loyalty points
                        </span>
                      )}
                    </div>

                    <div className="flex sm:flex-col sm:items-end justify-between items-center gap-2 shrink-0 border-t sm:border-t-0 border-border/60 pt-3 sm:pt-0">
                      <div className="space-y-0.5 sm:text-end text-start">
                        <span className="text-[10px] text-muted-foreground font-semibold block">Total Price:</span>
                        <span className="font-black text-primary text-sm">{ord.finalTotal?.toFixed(2) || ord.totalOrderPrice?.toFixed(2)} EGP</span>
                      </div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          ord.orderStatus === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : ord.orderStatus === 'cancelled'
                            ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}
                      >
                        {ord.orderStatus === 'completed'
                          ? 'Completed'
                          : ord.orderStatus === 'cancelled'
                          ? 'Cancelled'
                          : 'Processing'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
