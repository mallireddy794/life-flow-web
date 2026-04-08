import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  Heart, Bell, Settings, Map, Users, Building2, AlertCircle, 
  Activity, LogOut, MessageCircle, Home, Calendar, LayoutDashboard,
  Search, Menu, X, ChevronRight
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

export function PatientDashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [bloodGroup, setBloodGroup] = useState<string>(user?.blood_group || 'Not Set');
  const [donors, setDonors] = useState<any[]>([]);

  useEffect(() => {
    if (user && !user.is_profile_complete) {
      navigate('/patient-profile-setup');
    }
  }, [user]);

  useEffect(() => {
    if (user?.blood_group) {
      setBloodGroup(user.blood_group);
    } else if (user?.id) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const data = await apiRequest(`/patients/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius_km=10000`, 'GET');
            const self = data.find((p: any) => p.id === user.id);
            if (self && self.blood_group) {
              setBloodGroup(self.blood_group);
            }
          } catch (e) { console.error("Could not find self in nearby patients", e); }
        });
      }
    }
  }, [user]);

  useEffect(() => {
    if (user?.id && bloodGroup !== 'Not Set') {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const data = await apiRequest(`/donors/nearby?lat=${latitude}&lng=${longitude}&blood_group=${encodeURIComponent(bloodGroup)}&radius_km=50`, 'GET');
            setDonors(data || []);
          } catch (err) {
            console.error("Dashboard donor fetch error:", err);
          }
        });
      }
    }
  }, [user, bloodGroup]);

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/patient-dashboard', active: true },
    { icon: Map, label: 'Search Map', path: '/donor-map' },
    { icon: Users, label: 'Matched Donors', path: '/matched-donors' },
    { icon: MessageCircle, label: 'Messages', path: '/chat' },
    { icon: Calendar, label: 'Appointments', path: '/donation-history' },
    { icon: Building2, label: 'Hospitals', path: '/nearby-hospitals' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } fixed left-0 top-0 bottom-0 bg-[#030213] text-white transition-all duration-300 z-50 flex flex-col`}
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
                item.active ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.active ? 'text-white' : 'group-hover:text-red-500'}`} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
          >
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
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">Overview</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-1.5 gap-2 border border-gray-200">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-gray-600">Blood Group: {bloodGroup}</span>
            </div>
            
            <button className="p-2 hover:bg-gray-100 rounded-full relative bg-white border border-gray-200">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">{user?.name || 'User'}</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Patient ID: {user?.id?.slice(0, 8)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#030213] to-red-600 flex items-center justify-center text-white font-bold shadow-lg shadow-red-900/10">
                {user?.name?.[0] || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#030213] tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitor your requests and find donors instantly.</p>
          </div>

          {/* Hero Stats Card */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-[#030213] to-red-900 text-white border-0 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Heart className="w-48 h-48 fill-white" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-6">
                  <Activity className="w-3 h-3 text-red-500" />
                  AI Matching Active
                </div>
                <h2 className="text-4xl font-bold mb-4">Emergency Support <br/>at your fingertips.</h2>
                <p className="text-red-100/70 mb-8 max-w-md">Our AI system is currently scanning for donors that match your blood type <b>{bloodGroup}</b> in your vicinity.</p>
                <div className="flex gap-4">
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 h-12 shadow-xl shadow-red-900/40 border-0"
                    onClick={() => navigate('/emergency-blood-request')}
                  >
                    Broadcast Emergency
                  </Button>
                  <Button 
                    className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 rounded-xl px-6 h-12"
                    onClick={() => navigate('/donor-map')}
                  >
                    Explore Map
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Available Matches</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[#030213]">{donors.length}</span>
                  <span className="text-sm font-medium text-gray-400">donors online</span>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Search Radius</span>
                  <span className="font-bold text-[#030213]">50.0 km</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-red-500"></div>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between hover:bg-red-50 hover:text-red-600 rounded-xl"
                  onClick={() => navigate('/matched-donors')}
                >
                  View Details <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Map, title: 'Live Tracking', desc: 'Track donor arrival', color: 'blue', path: '/live-tracking' },
              { icon: Users, title: 'Find Donors', desc: 'Browse matched donors', color: 'red', path: '/nearby-blood-requests' },
              { icon: Building2, title: 'Hospitals', desc: 'Nearby blood banks', color: 'orange', path: '/nearby-hospitals' },
              { icon: MessageCircle, title: 'Chat Support', desc: 'Talk to match donors', color: 'indigo', path: '/chat' },
            ].map((item) => (
              <Card 
                key={item.title}
                className="p-6 border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group bg-white"
                onClick={() => navigate(item.path)}
              >
                <div className={`w-12 h-12 rounded-2xl bg-${item.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                </div>
                <h3 className="font-bold text-[#030213] mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>

          {/* Activity Section */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#030213]">Recent Activity</h3>
                <Button variant="ghost" className="text-xs font-bold text-red-600 hover:bg-red-50">View History</Button>
              </div>
              <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {donors.length > 0 ? (
                    donors.slice(0, 4).map((donor) => (
                      <div key={donor.donor_user_id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-[#030213]">
                            {donor.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">{donor.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{donor.blood_group} • {donor.distance_km?.toFixed(1)}km away</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-tighter bg-green-100 text-green-700 px-2 py-1 rounded-md">Available</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-xl border-gray-200 hover:border-red-600 hover:text-red-600"
                            onClick={() => navigate('/chat', { state: { recipientId: donor.donor_user_id, name: donor.name } })}
                          >
                            Chat
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-400 font-medium">No donor activity detected in your current radius.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#030213] mb-6">Active Status</h3>
              <Card className="p-6 border-0 shadow-sm bg-[#030213] text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <h4 className="font-bold">No Urgent Requests</h4>
                </div>
                <p className="text-sm text-gray-400 mb-6">You currently have no active emergency broadcasts. Start one if you need blood urgently.</p>
                <Button 
                  className="w-full bg-white text-[#030213] hover:bg-gray-100 rounded-xl font-bold shadow-lg"
                  onClick={() => navigate('/emergency-blood-request')}
                >
                  Start New Request
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
