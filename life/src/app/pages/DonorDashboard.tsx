import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Heart, Bell, Settings, MapPin, MessageCircle, ClipboardList, History, Activity, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { apiRequest } from '../services/api';

export function DonorDashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  useEffect(() => {
    if (user && !user.is_profile_complete) {
      navigate('/donor-profile-setup');
    }
  }, [user]);

  const [isAvailable, setIsAvailable] = useState(true);
  const [bloodGroup, setBloodGroup] = useState<string>(user?.blood_group || 'Not Set');
  const [requests, setRequests] = useState<any[]>([]);
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      apiRequest(`/donor/donations/history?donor_id=${user.id}`, 'GET')
        .then(data => {
          if (data.history) setHistoryCount(data.history.length);
        }).catch(err => console.error("Error fetching count:", err));

      apiRequest(`/donor/profile/${user.id}`, 'GET')
        .then(data => {
          if (data.blood_group) {
            setBloodGroup(data.blood_group);
          }
          if (data.is_available !== undefined) {
            setIsAvailable(!!data.is_available);
          }
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
            
            // Map direct requests to the same format as broadcasted ones
            const directMapped = (directResult || []).map((dr: any) => ({
              id: dr.id,
              blood_group: dr.blood_group,
              patient_name: `Patient ${dr.patient_id}`, // In actual app, fetch name
              hospital_name: "Direct Request",
              distance_km: 0, // Direct requests are always prioritized
              urgency_level: dr.urgency,
              status: dr.status,
              is_direct: true
            }));

            // Filter out completed/rejected
            const filteredNearby = (nearbyResult || []).filter((r: any) => r.status.toLowerCase() === 'pending');
            const filteredDirect = directMapped.filter((r: any) => r.status.toLowerCase() === 'pending');

            setRequests([...filteredDirect, ...filteredNearby]);
          } catch (err) {
            console.error("Failed to fetch requests for donor dashboard:", err);
          }
        });
      }
    }
  }, [user, isAvailable]);

  // Real-time location tracking for donor
  useEffect(() => {
    if (!user?.id || !isAvailable) return;

    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          apiRequest("/update-location", "POST", {
            user_id: user.id,
            lat: latitude,
            lng: longitude
          }).catch(err => console.error("Auto-location update failed:", err));
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
      } catch (err) {
        console.error("Failed to update availability:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 p-2 rounded-lg cursor-pointer" onClick={() => navigate('/')}>
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">LifeFlow</h1>
                <p className="text-sm text-gray-500">Donor Dashboard</p>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name || 'Guest'}!</h2>
          <p className="text-gray-600">Blood Group: <span className="font-semibold text-red-600">{bloodGroup}</span></p>
        </div>

        {/* Availability Toggle */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Donation Status</h3>
                <p className="text-red-100">
                  {isAvailable ? 'You are available to donate' : 'You are currently unavailable'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium">{isAvailable ? 'Available' : 'Unavailable'}</span>
              <Switch
                checked={isAvailable}
                onCheckedChange={handleToggleAvailability}
                className="data-[state=checked]:bg-white"
              />
            </div>
          </div>
        </Card>

        {isAvailable ? (
          <>
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <Heart className="w-6 h-6 text-red-600 fill-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Donations</p>
                    <p className="text-2xl font-bold text-gray-900">{historyCount}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lives Saved</p>
                    <p className="text-2xl font-bold text-gray-900">{historyCount * 3}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Eligible</p>
                    <p className="text-2xl font-bold text-gray-900">Now</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card
                className="p-6 hover:shadow-lg transition cursor-pointer border-2 hover:border-red-600"
                onClick={() => navigate('/nearby-blood-requests')}
              >
                <div className="bg-red-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Nearby Blood Requests</h3>
                <p className="text-gray-600 text-sm mb-4">View and respond to blood requests in your area</p>
                {requests.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {requests.slice(0, 2).map((req: any) => (
                      <div key={req.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-red-600">{req.blood_group}</span>
                          <span className="text-[10px] text-gray-500 font-bold">{req.units_required || 1} units</span>
                          <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                            {req.urgency_level}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-800 truncate">{req.patient_name}</p>
                        <p className="text-[10px] text-blue-600 font-medium truncate">📍 {req.hospital_name}</p>
                        <p className="text-[10px] text-gray-500">{req.distance_km?.toFixed(1)} km away • {req.city}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="text-red-600 font-semibold">{requests.length} Active</span>
                  <span className="text-red-600">→</span>
                </div>
              </Card>

              <Card
                className="p-6 hover:shadow-lg transition cursor-pointer border-2 hover:border-blue-600"
                onClick={() => navigate('/chat')}
              >
                <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Chat with Patient</h3>
                <p className="text-gray-600 text-sm mb-4">Communicate with patients who need your help</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">Check Inbox</span>
                  <span className="text-blue-600">→</span>
                </div>
              </Card>

              <Card
                className="p-6 hover:shadow-lg transition cursor-pointer border-2 hover:border-green-600"
                onClick={() => navigate('/donor-requirements')}
              >
                <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardList className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Check Requirements</h3>
                <p className="text-gray-600 text-sm mb-4">Review eligibility criteria for blood donation</p>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-semibold">View Info</span>
                  <span className="text-green-600">→</span>
                </div>
              </Card>

              <Card
                className="p-6 hover:shadow-lg transition cursor-pointer border-2 hover:border-purple-600"
                onClick={() => navigate('/donation-history')}
              >
                <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <History className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Donation History</h3>
                <p className="text-gray-600 text-sm mb-4">Track your past donations and impact</p>
                <div className="flex items-center justify-between">
                  <span className="text-purple-600 font-semibold">View All</span>
                  <span className="text-purple-600">→</span>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mt-8 p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {requests.length > 0 ? (
                  requests.slice(0, 3).map((req, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => navigate('/nearby-blood-requests')}>
                      <div className={`bg-red-100 p-2 rounded-lg`}>
                        <Activity className={`w-5 h-5 text-red-600`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">New blood request for {req.blood_group}</p>
                        <p className="text-sm text-gray-500">{req.hospital_name} • {req.distance_km?.toFixed(1)} km away</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No recent activity to show.
                  </div>
                )}
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900">You're currently unavailable</h3>
            <p className="text-gray-600 mt-2">Toggle the switch above to see your dashboard details.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
