import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, Phone, MapPin, Activity, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { apiRequest } from '../services/api';

export function MatchedDonors() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState<string>('');

  useEffect(() => {
    if (user?.blood_group) {
        setBloodGroup(user.blood_group);
        fetchDonors(user.blood_group);
    } else if (user?.id) {
        // Fallback or search in people nearby (large radius)
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
              const data = await apiRequest(`/patients/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius_km=10000`, 'GET');
              const self = data.find((p: any) => p.id === user.id);
              if (self && self.blood_group) {
                setBloodGroup(self.blood_group);
                fetchDonors(self.blood_group);
              } else {
                fetchDonors('A+'); // Ultimate fallback
              }
            } catch (e) { 
              console.error("Searching self failed");
              fetchDonors('A+'); 
            }
          });
        } else {
          fetchDonors('A+');
        }
    }
  }, [user]);

  const fetchDonors = (bg: string) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use the more advanced AI emergency-donors endpoint
          const response = await apiRequest('/emergency-donors', 'POST', {
             patient_id: user?.id,
             blood_group: bg,
             lat: latitude,
             lng: longitude,
             radius_km: 50
          });
          
          // Map to the format donor list expects (handling both structures)
          setDonors(response.nearby_donors || []);
        } catch (err) {
          console.error("Failed to fetch matched donors:", err);
          setDonors([]);
        } finally {
          setLoading(false);
        }
      }, (err) => {
        console.error("Location error:", err);
        setDonors([]);
        setLoading(false);
      });
    } else {
      setDonors([]);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/patient-dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-bold text-xl text-gray-900">AI-Matched Donors</h1>
              <p className="text-sm text-gray-500">Best compatibility matches for you</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Banner */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-start gap-4">
            <div className="bg-green-600 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">AI-Powered Matching</h3>
              <p className="text-gray-700">
                Our AI algorithm matches you with donors based on blood type compatibility,
                proximity, availability, and donation history for the best outcomes.
              </p>
              {bloodGroup && <p className="mt-2 text-sm font-bold text-green-700">Currently searching for {bloodGroup} matches.</p>}
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Finding the best live matches for you...</p>
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No available {bloodGroup} donors found nearby.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {donors.map((donor: any) => (
              <Card key={donor.donor_user_id || donor.donor_id} className="p-6 hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Donor Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
                      <span className="text-2xl font-bold">{(donor.name || 'D').split(' ').map((n: string) => n[0]).join('')}</span>
                    </div>
                  </div>

                  {/* Donor Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{donor.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {donor.distance_km?.toFixed(1)} km away
                          </span>
                          <span>•</span>
                          <span>Available in {donor.city || 'Your Area'}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-bold text-red-600 mb-1">{donor.blood_group}</div>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Available Now
                        </span>
                      </div>
                    </div>

                    {/* AI Match Score and Metrics */}
                    <div className="mb-4 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">AI Compatibility Score</span>
                          <span className="text-sm font-bold text-green-600">{donor.ai_score || 95}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                            style={{ width: `${donor.ai_score || 95}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Acceptance Rate</p>
                          <p className="text-sm font-bold text-blue-600">{donor.p_acceptance_rate || '80%'}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Response Time</p>
                          <p className="text-sm font-bold text-purple-600">{donor.response_time_avg || 5} min</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Status</p>
                          <p className="text-sm font-bold text-green-600">Active</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => navigate('/chat', { state: { recipientId: donor.donor_user_id || donor.donor_id, name: donor.name } })}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact Donor
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/donor-map')}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        View on Map
                      </Button>
                      <Button
                        variant="outline"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/donor-map')}
          >
            View All Donors on Map
          </Button>
        </div>
      </div>
    </div>
  );
}
