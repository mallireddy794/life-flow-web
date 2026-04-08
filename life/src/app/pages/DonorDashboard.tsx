import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { 
  Heart, Bell, Settings, MapPin, MessageCircle, ClipboardList, 
  History, Activity, LogOut, LayoutDashboard, Menu, ChevronRight,
  ShieldCheck, Droplets
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { apiRequest } from '../services/api';

export function DonorDashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [bloodGroup, setBloodGroup] = useState<string>(user?.blood_group || 'Not Set');
  const [requests, setRequests] = useState<any[]>([]);
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    if (user && !user.is_profile_complete) {
      navigate('/donor-profile-setup');
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      apiRequest(`/donor/donations/history?donor_id=${user.id}`, 'GET')
        .then(data => {
          if (data.history) setHistoryCount(data.history.length);
        }).catch(err => console.error("Error fetching count:", err));

      apiRequest(`/donor/profile/${user.id}`, 'GET')
        .then(data => {
          if (data.blood_group) setBloodGroup(data.blood_group);
          if (data.is_available !== undefined) setIsAvailable(!!data.is_available);
        })
        .catch(err => console.error("Error fetching donor profile:", err));
    }
  }, [user]);

  useEffect(() => {
    if (user?.id && isAvailable) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const [nearbyResult, directResult] = await Promise.all([
              apiRequest(`/blood-requests/nearby?lat=${latitude}&lng=${longitude}&radius_km=20`, 'GET'),
              apiRequest(`/donor/requests?donor_id=${user.id}`, 'GET')
            ]);
            
            const directMapped = (directResult || []).map((dr: any) => ({
              id: dr.id,
              blood_group: dr.blood_group,
              patient_name: `Patient ${dr.patient_id}`,
              hospital_name: "Direct Request",
              distance_km: 0,
              urgency_level: dr.urgency,
              status: dr.status,
              is_direct: true
            }));

            const filteredNearby = (nearbyResult || []).filter((r: any) => r.status.toLowerCase() === 'pending');
            const filteredDirect = directMapped.filter((r: any) => r.status.toLowerCase() === 'pending');

            setRequests([...filteredDirect, ...filteredNearby]);
          } catch (err) {
            console.error("Failed to fetch requests:", err);
          }
        });
      }
    }
  }, [user, isAvailable]);

  useEffect(() => {
    if (!user?.id || !isAvailable) return;
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          apiRequest("/update-location", "POST", { user_id: user.id, lat: latitude, lng: longitude })
            .catch(err => console.error("Auto-location update failed:", err));
        },
        (error) => console.warn("Location tracking disabled:", error.message),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [user?.id, isAvailable]);

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  const handleToggleAvailability = async (checked: boolean) => {
    setIsAvailable(checked);
    if (user?.id) {
      try {
        await apiRequest(`/donor/availability/${user.id}`, 'PUT', { is_available: checked });
      } catch (err) { console.error("Failed to update availability:", err); }
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/donor-dashboard', active: true },
    { icon: MapPin, label: 'Nearby Requests', path: '/nearby-blood-requests' },
    { icon: History, label: 'Donation History', path: '/donation-history' },
    { icon: MessageCircle, label: 'Patient Chats', path: '/chat' },
    { icon: ClipboardList, label: 'Requirements', path: '/donor-requirements' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} fixed left-0 top-0 bottom-0 bg-[#030213] text-white transition-all duration-300 z-50 flex flex-col`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-xl shrink-0">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight">LifeFlow</span>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                item.active ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.active ? 'text-white' : 'group-hover:text-red-500'}`} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200">
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`${isSidebarOpen ? 'ml-64' : 'ml-20'} flex-1 flex flex-col transition-all duration-300`}>
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">Donor Panel</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className={`hidden sm:flex items-center rounded-full px-4 py-1.5 gap-2 border ${isAvailable ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
              <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className={`text-xs font-semibold ${isAvailable ? 'text-green-700' : 'text-gray-600'}`}>
                {isAvailable ? 'Ready to Donate' : 'Off-duty'}
              </span>
            </div>
            
            <button className="p-2 hover:bg-gray-100 rounded-full bg-white border border-gray-200 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">{user?.name || 'User'}</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Blood Type: {bloodGroup}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#030213] flex items-center justify-center text-white font-bold ring-2 ring-red-600/20">
                {user?.name?.[0] || 'D'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#030213] tracking-tight">Overview</h1>
            <p className="text-gray-500 mt-1">Manage your donation status and availability.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Status Card */}
            <Card className="p-8 bg-gradient-to-br from-[#030213] to-red-900 border-0 shadow-2xl relative overflow-hidden group">
               <Droplets className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform duration-700" />
               <div className="relative z-10 flex justify-between items-start">
                 <div>
                   <h3 className="text-white/70 text-sm font-bold uppercase tracking-widest mb-2">My Availability</h3>
                   <p className="text-3xl font-black text-white mb-6">
                     {isAvailable ? 'Active & Ready' : 'Currently Hidden'}
                   </p>
                   <div className="flex items-center gap-3">
                     <span className="text-white/80 text-sm">{isAvailable ? 'You are visible to patients' : 'You are not visible to patients'}</span>
                     <Switch checked={isAvailable} onCheckedChange={handleToggleAvailability} className="bg-white/20 data-[state=checked]:bg-white" />
                   </div>
                 </div>
                 <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                   <ShieldCheck className="w-8 h-8 text-red-500" />
                 </div>
               </div>
            </Card>

            {/* Quick Stats Grid */}
            <div className="lg:col-span-2 grid sm:grid-cols-3 gap-6">
              {[
                { label: 'Total Donations', val: historyCount, icon: History, color: 'red' },
                { label: 'Lives Saved', val: historyCount * 3, icon: Heart, color: 'blue' },
                { label: 'Pending Requests', val: requests.length, icon: Activity, color: 'orange' },
              ].map((stat) => (
                <Card key={stat.label} className="p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center mb-4`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-4xl font-black text-[#030213]">{stat.val}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Active Requests */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-[#030213]">Nearby Urgent Requests</h3>
               <Button variant="ghost" className="text-xs font-bold text-red-600" onClick={() => navigate('/nearby-blood-requests')}>View Map</Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.length > 0 ? (
                requests.slice(0, 3).map((req) => (
                  <Card key={req.id} className="p-6 bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer" onClick={() => navigate('/nearby-blood-requests')}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center font-black text-red-600 text-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                        {req.blood_group}
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${req.urgency_level === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {req.urgency_level}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 mb-1">{req.patient_name || 'Anonymous'}</p>
                    <p className="text-xs text-blue-600 mb-4 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {req.hospital_name}
                    </p>
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                       <span className="text-xs text-gray-500 font-bold">{req.distance_km?.toFixed(1)} km away</span>
                       <span className="text-red-600 font-bold flex items-center gap-1">Respond <ChevronRight className="w-4 h-4" /></span>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                   <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                   <p className="text-gray-500 font-medium">No urgent requests matching your blood group found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
             <Card className="p-8 bg-white border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-[#030213] mb-6">Recent Interactions</h3>
                <div className="space-y-4">
                  <p className="text-sm text-gray-400 text-center py-10">No recent chats or callbacks found.</p>
                </div>
             </Card>
             <Card className="p-8 bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#030213]">Eligibility Status</h3>
                  <span className="text-[10px] font-black uppercase bg-green-100 text-green-700 px-2 py-1 rounded-md">Eligible</span>
                </div>
                <div className="flex items-center gap-6">
                   <div className="relative w-24 h-24">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-red-600" strokeWidth="3" strokeDasharray="100, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-[#030213]">100%</div>
                   </div>
                   <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 mb-2">Ready for your next donation!</p>
                      <p className="text-xs text-gray-500">It has been more than 3 months since your last donation.</p>
                   </div>
                </div>
             </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
