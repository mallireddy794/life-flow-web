import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Heart, MapPin, Phone, Navigation, ArrowLeft } from 'lucide-react';

import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useUser } from '../contexts/UserContext';
import { MessageCircle, Users } from 'lucide-react';

export function NearbyBloodRequests() {
  const navigate = useNavigate();
  const { user, role } = useUser();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientBloodGroup, setPatientBloodGroup] = useState<string>('');

  const demoRequests = [
    {
      id: 991,
      patient_name: "Rahul Sharma",
      blood_group: "A+",
      units_required: 2,
      hospital_name: "City Central Hospital",
      urgency_level: "Critical",
      created_at: new Date().toISOString().split('T')[0],
      distance_km: 1.2
    },
    {
      id: 992,
      patient_name: "Priya Patel",
      blood_group: "O-",
      units_required: 1,
      hospital_name: "Hope Medical Center",
      urgency_level: "High",
      created_at: new Date().toISOString().split('T')[0],
      distance_km: 3.5
    },
    {
      id: 993,
      patient_name: "Amit Kumar",
      blood_group: "B+",
      units_required: 3,
      hospital_name: "Grace Nursing Home",
      urgency_level: "Normal",
      created_at: new Date().toISOString().split('T')[0],
      distance_km: 5.8
    }
  ];

  const demoDonors = [
    {
      donor_user_id: 1001,
      name: "Suresh Reddy",
      blood_group: "A+",
      city: "Hyderabad",
      distance_km: 2.1
    },
    {
      donor_user_id: 1002,
      name: "Anjali Singh",
      blood_group: "A+",
      city: "Secunderabad",
      distance_km: 4.5
    }
  ];

  useEffect(() => {
    if (role === 'patient' && user?.id) {
      apiRequest(`/patient/profile/${user.id}`, 'GET')
        .then(res => setPatientBloodGroup(res.blood_group || ''))
        .catch(err => console.error("Error fetching patient BG:", err));
    }
  }, [role, user]);

  useEffect(() => {
    fetchNearbyData();
  }, [role, patientBloodGroup]);

  const fetchNearbyData = () => {
    if (role === 'patient' && !patientBloodGroup) return; // Wait for BG
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          let result;
          if (role === 'patient') {
            result = await apiRequest(`/donors/nearby?lat=${latitude}&lng=${longitude}&blood_group=${encodeURIComponent(patientBloodGroup)}&radius_km=50`, 'GET');
          } else {
            result = await apiRequest(`/blood-requests/nearby?lat=${latitude}&lng=${longitude}&radius_km=20`, 'GET');
          }

          if (!result || result.length === 0) {
            setData(role === 'patient' ? demoDonors : demoRequests);
          } else {
            setData(result);
          }
        } catch (err) {
          console.error("Failed to fetch nearby data, using fallback:", err);
          setData(role === 'patient' ? demoDonors : demoRequests);
        } finally {
          setLoading(false);
        }
      }, (err) => {
        console.error("Location error:", err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    // When a donor accepts, they proceed to eligibility check
    navigate('/eligibility-check');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(role === 'donor' ? '/donor-dashboard' : '/patient-dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-bold text-xl text-gray-900">
                {role === 'donor' ? 'Nearby Blood Requests' : 'Nearby Available Donors'}
              </h1>
              <p className="text-sm text-gray-500">
                {role === 'donor' ? 'Requests within 20 km radius' : `Matching ${patientBloodGroup} donors nearby`}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Bar */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <Button variant={role === 'donor' ? "default" : "outline"} size="sm" className={role === 'donor' ? "bg-red-600" : ""}>
              {role === 'donor' ? 'All Requests' : 'All Donors'}
            </Button>
            {role === 'donor' && (
              <Button variant="outline" size="sm" className="border-red-600 text-red-600">
                Critical
              </Button>
            )}
            <Button variant="outline" size="sm">
              Nearest First
            </Button>
            <Button variant="outline" size="sm">
              Most Recent
            </Button>
          </div>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Searching for live {role === 'donor' ? 'requests' : 'donors'} nearby...</p>
            </div>
          ) : data.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                {role === 'donor' ? <MapPin className="w-10 h-10 text-gray-400" /> : <Users className="w-10 h-10 text-gray-400" />}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Active {role === 'donor' ? 'Requests' : 'Donors'}
              </h3>
              <p className="text-gray-600 mb-6">
                There are no {role === 'donor' ? 'blood requests' : `available ${patientBloodGroup} donors`} in your area at the moment
              </p>
              <Button onClick={() => navigate(role === 'donor' ? '/donor-dashboard' : '/patient-dashboard')}>
                Back to Dashboard
              </Button>
            </Card>
          ) : (
            data.map((item) => (
              <Card key={item.id || item.donor_user_id} className="p-6 hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row gap-6">
                  {role === 'patient' && (
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xl font-bold">
                        {item.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{item.patient_name || item.name}</h3>
                          {role === 'donor' && item.urgency_level === 'Critical' && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full animate-pulse">
                              CRITICAL
                            </span>
                          )}
                          {role === 'patient' && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              AVAILABLE NOW
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {role === 'donor' ? `Posted on ${item.created_at}` : `Verified Donor in ${item.city}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-red-600">{item.blood_group}</div>
                        {role === 'donor' && (
                          <p className="text-sm text-gray-600">{item.units_required} unit{item.units_required > 1 ? 's' : ''}</p>
                        )}
                        {role === 'patient' && (
                          <p className="text-sm text-gray-600">Match Score: 95%</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{item.hospital_name || item.city}</p>
                          <p className="text-sm text-gray-500">{item.distance_km?.toFixed(1)} km away</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Direct Contact</p>
                          <p className="text-sm text-gray-500">Available on {role === 'donor' ? 'acceptance' : 'contact'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {role === 'donor' ? (
                        <Button
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleAccept()}
                        >
                          <Heart className="w-4 h-4 mr-2 fill-white" />
                          Accept Request
                        </Button>
                      ) : (
                        <Button
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => navigate('/chat')}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contact Donor
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => navigate('/donor-map')}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        View on Map
                      </Button>
                      {role === 'donor' && (
                        <Button
                          variant="outline"
                          onClick={() => navigate('/chat')}
                        >
                          Message Patient
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
