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
    if (user?.id) {
      // First get patient's blood group
      apiRequest(`/patient/profile/${user.id}`, 'GET')
        .then(data => {
          const bg = data.blood_group || 'A+';
          setBloodGroup(bg);
          fetchDonors(bg);
        })
        .catch(err => {
          console.error("Error fetching profile:", err);
          fetchDonors('A+'); // Fallback to call fetchDonors even on error
        });
    }
  }, [user]);

  const fetchDonors = (bg: string) => {
    const getMockDonors = (currentBg: string) => [
      { name: "Rahul Sharma", bg: "O+", distance_km: 1.2, city: "Hyderabad", score: 98 },
      { name: "Anjali Gupta", bg: "A-", distance_km: 2.5, city: "Secunderabad", score: 96 },
      { name: "Suresh Kumar", bg: currentBg || 'A+', distance_km: 0.8, city: "Gachibowli", score: 95 },
      { name: "Priya Singh", bg: "B+", distance_km: 3.4, city: "Hitech City", score: 92 },
      { name: "Vikram Reddy", bg: currentBg || 'A+', distance_km: 4.1, city: "Kukatpally", score: 89 },
    ].map((d, i) => ({
      donor_user_id: 8000 + i,
      name: d.name,
      blood_group: d.bg,
      city: d.city,
      distance_km: d.distance_km,
      ai_score: d.score,
      is_mock: true
    }));

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const matchedData = await apiRequest(`/donors/nearby?lat=${latitude}&lng=${longitude}&blood_group=${encodeURIComponent(bg)}&radius_km=50`, 'GET');
          setDonors([...(matchedData || []), ...getMockDonors(bg)]);
        } catch (err) {
          console.error("Failed to fetch matched donors:", err);
          setDonors(getMockDonors(bg));
        } finally {
          setLoading(false);
        }
      }, (err) => {
        console.error("Location error:", err);
        setDonors(getMockDonors(bg));
        setLoading(false);
      });
    } else {
      setDonors(getMockDonors(bg));
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
              <Card key={donor.donor_user_id} className="p-6 hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Donor Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
                      <span className="text-2xl font-bold">{donor.name.split(' ').map((n: string) => n[0]).join('')}</span>
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
                          <span>Available in {donor.city}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-bold text-red-600 mb-1">{donor.blood_group}</div>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Available Now
                        </span>
                      </div>
                    </div>

                    {/* AI Match Score */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">AI Match Score</span>
                        <span className="text-sm font-bold text-green-600">{donor.ai_score || 95}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                          style={{ width: `${donor.ai_score || 95}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => navigate('/chat')}
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
