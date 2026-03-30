import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Heart, MapPin, Phone, Navigation, ArrowLeft, Calendar as CalendarIcon, MessageCircle, Users, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useUser } from '../contexts/UserContext';

export function NearbyBloodRequests() {
  const navigate = useNavigate();
  const { user, role } = useUser();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientBloodGroup, setPatientBloodGroup] = useState<string>('');



  useEffect(() => {
    if (role === 'patient' && user?.id) {
      apiRequest(`/patient/profile/${user.id}`, 'GET')
        .then(res => {
          if (res.blood_group) {
            setPatientBloodGroup(res.blood_group);
          } else {
            console.warn("Patient blood group not found in profile");
            setLoading(false);
          }
        })
        .catch(err => {
          console.error("Error fetching patient BG:", err);
          setLoading(false);
        });
    } else if (role !== 'patient') {
      // Watcher effect will handle this
    }
  }, [role, user]);

  useEffect(() => {
    fetchNearbyData();
  }, [role, patientBloodGroup]);

  const fetchNearbyData = () => {
    if (role === 'patient' && !patientBloodGroup) return; // Wait for BG
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          let result;
          if (role === 'patient') {
            result = await apiRequest(`/donors/nearby?lat=${latitude}&lng=${longitude}&blood_group=${encodeURIComponent(patientBloodGroup)}&radius_km=50`, 'GET');
          } else {
            // Donor view: Combine broadcasted and direct requests
            const [broadcasted, direct] = await Promise.all([
              apiRequest(`/blood-requests/nearby?lat=${latitude}&lng=${longitude}&radius_km=20`, 'GET'),
              apiRequest(`/donor/requests?donor_id=${user.id}`, 'GET')
            ]);
            
            const directMapped = (direct || []).map((dr: any) => ({
                id: dr.id,
                blood_group: dr.blood_group,
                patient_name: `Patient ${dr.patient_id}`,
                hospital_name: "DIRECT REQUEST",
                city: 'Local',
                units_required: dr.units_needed,
                urgency_level: dr.urgency,
                status: dr.status,
                distance_km: 0,
                is_direct: true
            }));

            result = [...directMapped.filter((r: any) => r.status.toLowerCase() !== 'completed'), ...broadcasted];
          }

          setData(result && Array.isArray(result) ? result : []);
        } catch (err) {
          console.error("Failed to fetch nearby data:", err);
          setData([]);
        } finally {
          setLoading(false);
        }
      }, (err) => {
        console.error("Location error:", err);
        setLoading(false);
      }, { timeout: 10000 }); // 10 second timeout
    } else {
      console.warn("Geolocation not supported");
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: number) => {
    if (!user?.id) return;
    try {
      await apiRequest('/donor/accept_request', 'POST', {
        request_id: requestId,
        donor_id: user.id
      });
      navigate('/eligibility-check');
    } catch (err) {
      console.error("Accept failed:", err);
    }
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
                          <div className="mt-1">
                            <p className="text-sm font-semibold text-gray-800">{item.units_required} unit{item.units_required > 1 ? 's' : ''} needed</p>
                            <p className="text-xs text-blue-600 font-medium">📍 {item.hospital_name || 'Hospital'}</p>
                            <p className="text-[10px] text-gray-500 capitalize">{item.city || 'Local Area'}</p>
                          </div>
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
                          onClick={() => handleAccept(item.id)}
                        >
                          <Heart className="w-4 h-4 mr-2 fill-white" />
                          Accept Request
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 font-semibold"
                            onClick={() => navigate('/chat', { 
                              state: { 
                                recipientId: item.id || item.donor_user_id, 
                                name: item.name 
                              } 
                            })}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contact Donor
                          </Button>
                          <Button
                            variant="outline"
                            className="border-red-600 text-red-600 hover:bg-red-50"
                            onClick={async () => {
                              try {
                                await apiRequest('/patient/send_request', 'POST', {
                                  patient_id: user.id,
                                  donor_id: item.donor_user_id || item.id,
                                  blood_group: patientBloodGroup || user.blood_group,
                                  units_required: 1,
                                  urgency_level: 'NORMAL',
                                  city: item.city || 'Local'
                                });
                                alert(`Request sent to ${item.name}! They will see it on their dashboard.`);
                              } catch (err: any) {
                                console.error("Send request failed:", err);
                                alert(err.message || "Failed to send request.");
                              }
                            }}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send Request
                          </Button>
                        </div>
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
