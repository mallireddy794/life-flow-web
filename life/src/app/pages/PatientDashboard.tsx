import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Heart, Bell, Settings, Map, Users, Building2, AlertCircle, Activity, LogOut, MessageCircle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

export function PatientDashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [bloodGroup, setBloodGroup] = useState<string>('Not Set');
  const [donors, setDonors] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      apiRequest(`/patient/profile/${user.id}`, 'GET')
        .then(data => {
          if (data.blood_group) {
            setBloodGroup(data.blood_group);
          }
        })
        .catch(err => console.error("Error fetching patient profile:", err));
    }
  }, [user]);

  useEffect(() => {
    if (user?.id && bloodGroup !== 'Not Set') {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const data = await apiRequest(`/donors/nearby?lat=${latitude}&lng=${longitude}&blood_group=${encodeURIComponent(bloodGroup)}&radius_km=50`, 'GET');

            let combinedDonors = data || [];
            if (user?.role === 'patient') {
              const mockDonors = [
                { name: "Rahul Sharma", blood_group: "O+", distance_km: 1.2 },
                { name: "Anjali Gupta", blood_group: "A-", distance_km: 2.5 },
                { name: "Suresh Kumar", blood_group: bloodGroup, distance_km: 0.8 },
              ].map((d, i) => ({
                donor_user_id: 8000 + i,
                name: d.name,
                blood_group: d.blood_group,
                distance_km: d.distance_km,
                is_mock: true
              }));
              combinedDonors = [...mockDonors, ...combinedDonors];
            }
            setDonors(combinedDonors);
          } catch (err) {
            console.error("Failed to fetch donors for dashboard preview:", err);
          }
        });
      }
    }
  }, [user, bloodGroup]);

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg cursor-pointer" onClick={() => navigate('/')}>
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">LifeFlow</h1>
                <p className="text-sm text-gray-500">Patient Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/notifications')}
                className="p-2 hover:bg-gray-100 rounded-lg relative"
              >
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Settings className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 font-outfit">Welcome, {user?.name || 'Guest'}!</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <Activity className="w-5 h-5" />
            <span>Blood Group: <span className="font-semibold text-blue-600">{bloodGroup}</span></span>
          </div>
        </div>

        {/* Search Status Card */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Users className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">Searching for Nearby Donors</h3>
              <p className="text-blue-100">Finding the best matches in your area...</p>
            </div>
            <div className="animate-pulse">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-100">
            <Activity className="w-4 h-4" />
            <span>Last updated: 2 minutes ago</span>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Donors</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">AI Matches</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Nearby Hospitals</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Requests</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card
            className="p-6 hover:shadow-lg transition cursor-pointer border-2 hover:border-blue-600"
            onClick={() => navigate('/donor-map')}
          >
            <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Map className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">View Map</h3>
            <p className="text-gray-600 text-sm mb-4">See donors and hospitals on an interactive map</p>
            <div className="flex items-center justify-between">
              <span className="text-blue-600 font-semibold">Open Map</span>
              <span className="text-blue-600">→</span>
            </div>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition cursor-pointer border-2 hover:border-green-600"
            onClick={() => navigate('/matched-donors')}
          >
            <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">View Matches</h3>
            <p className="text-gray-600 text-sm mb-4">AI-matched donors with high compatibility</p>
            <div className="flex items-center justify-between">
              <span className="text-green-600 font-semibold">8 Matches</span>
              <span className="text-green-600">→</span>
            </div>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition cursor-pointer border-2 hover:border-purple-600"
            onClick={() => navigate('/nearby-blood-requests')}
          >
            <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Nearby Donors</h3>
            <p className="text-gray-600 text-sm mb-4">Browse all available donors in your area</p>
            {donors.length > 0 ? (
              <div className="space-y-3 mb-4">
                {donors.slice(0, 2).map((donor: any) => (
                  <div key={donor.donor_user_id} className="p-3 bg-purple-50 rounded-lg border border-purple-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {donor.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{donor.name}</p>
                      <p className="text-[10px] text-gray-500">{donor.distance_km?.toFixed(1)} km away • {donor.blood_group}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="text-purple-600 font-semibold">{donors.length} Donors</span>
              <span className="text-purple-600">→</span>
            </div>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition cursor-pointer border-2 hover:border-orange-600"
            onClick={() => navigate('/nearby-hospitals')}
          >
            <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Nearby Hospitals</h3>
            <p className="text-gray-600 text-sm mb-4">Find blood banks and medical facilities</p>
            <div className="flex items-center justify-between">
              <span className="text-orange-600 font-semibold">12 Hospitals</span>
              <span className="text-orange-600">→</span>
            </div>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition cursor-pointer border-2 hover:border-blue-600"
            onClick={() => navigate('/chat', { state: { name: 'Suresh Reddy (Donor)' } })}
          >
            <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Chat with Donor</h3>
            <p className="text-gray-600 text-sm mb-4">Communicate with donors who responded to you</p>
            <div className="flex items-center justify-between">
              <span className="text-blue-600 font-semibold">1 New Response</span>
              <span className="text-blue-600">→</span>
            </div>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition cursor-pointer border-2 hover:border-red-600 md:col-span-1"
            onClick={() => navigate('/emergency-blood-request')}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="bg-red-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <AlertCircle className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 font-outfit">Emergency Request</h3>
                <p className="text-gray-600 text-sm mb-4">Urgent broadcast to all nearby donors</p>
              </div>
              <span className="text-red-600 font-semibold">Broadcasting...</span>
            </div>
          </Card>
        </div>

        {/* Active Request Status */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Active Request Status</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Blood Request Active</h4>
                  <p className="text-blue-700">Looking for {bloodGroup} blood donors</p>
                </div>
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600"
                  onClick={() => navigate('/live-tracking')}
                >
                  Track Status
                </Button>
              </div>
              <div className="text-sm text-blue-800 space-y-2">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  8 donors matched in your area
                </p>
                <p className="flex items-center gap-2 font-bold">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  2 donors responded to your request
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  Request sent 30 minutes ago
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Donor Interactions</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100 cursor-pointer hover:bg-green-100 transition" onClick={() => navigate('/chat', { state: { name: 'Suresh Reddy (Donor)' } })}>
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                  SR
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Suresh Reddy</h4>
                  <p className="text-sm text-green-700">Accepted your request and is coming!</p>
                  <p className="text-[10px] text-gray-500 mt-1">2 minutes ago</p>
                </div>
                <Button size="sm" className="bg-green-600 h-8">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Chat
                </Button>
              </div>

              <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition cursor-pointer" onClick={() => navigate('/matched-donors')}>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  AS
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Anjali Sharma</h4>
                  <p className="text-sm text-gray-600">Interested in donating to your request</p>
                  <p className="text-[10px] text-gray-500 mt-1">15 minutes ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
