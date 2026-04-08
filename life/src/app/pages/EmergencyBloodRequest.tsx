import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { ArrowLeft, AlertTriangle, Send, Users, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { apiRequest } from '../services/api';

export function EmergencyBloodRequest() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isCritical, setIsCritical] = useState(false);
  const [formData, setFormData] = useState({
    patientName: user?.name || '',
    bloodType: user?.blood_group || '',
    units: '1',
    hospital: '',
    location: '',
    city: '',
    contact: user?.phone || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyDonors, setNearbyDonors] = useState<any[]>([]);

  const fetchNearbyDonors = async (bg: string) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const data = await apiRequest(`/donors/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&blood_group=${encodeURIComponent(bg)}&radius_km=20`, 'GET');
          setNearbyDonors(data || []);
        } catch (e) { console.warn("Failed to fetch donor preview", e); }
      });
    }
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        patientName: user.name || prev.patientName,
        bloodType: user.blood_group || prev.bloodType,
        contact: user.phone || prev.contact
      }));
    }
  }, [user]);

  useEffect(() => {
     if (formData.bloodType) {
       fetchNearbyDonors(formData.bloodType);
     }
  }, [formData.bloodType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      await apiRequest(`/patient/request/${user.id}`, 'POST', {
        patient_name: formData.patientName,
        blood_group: formData.bloodType,
        units_required: parseInt(formData.units),
        hospital_name: formData.hospital,
        city: formData.city,
        contact_number: formData.contact,
        urgency_level: isCritical ? 'EMERGENCY' : 'HIGH'
      });
      // Show success and navigate to tracking
      navigate('/live-tracking');
    } catch (err: any) {
      setError(err.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/patient-dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Emergency Blood Request</h1>
              <p className="text-sm text-gray-500">Send urgent request to nearby donors</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Critical Mode Toggle */}
            <Card className={`p-6 mb-6 ${isCritical ? 'bg-red-50 border-red-300 animate-pulse' : 'bg-yellow-50 border-yellow-300'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`${isCritical ? 'bg-red-600' : 'bg-yellow-600'} p-3 rounded-lg`}>
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Critical Emergency Mode</h3>
                    <p className="text-sm text-gray-700">
                      {isCritical
                        ? 'All nearby donors will be notified immediately via SMS and push notification'
                        : 'Enable for life-threatening emergencies requiring immediate attention'
                      }
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isCritical}
                  onCheckedChange={setIsCritical}
                  className="data-[state=checked]:bg-red-600"
                />
              </div>
            </Card>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    type="text"
                    placeholder="Full name of patient"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodType">Blood Type Required</Label>
                    <Select
                      value={formData.bloodType}
                      onValueChange={(value) => setFormData({ ...formData, bloodType: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="units">Units Required</Label>
                    <Input
                      id="units"
                      type="number"
                      placeholder="Number of units"
                      value={formData.units}
                      onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                      className="mt-1"
                      min="1"
                      max="10"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                    <Label htmlFor="hospital">Hospital Name</Label>
                    <Input
                      id="hospital"
                      type="text"
                      placeholder="Where should donors go?"
                      value={formData.hospital}
                      onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Label htmlFor="city">City or Area</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="City name"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input
                    id="contact"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                {isCritical && (
                  <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2">⚠️ Critical Emergency Alert</h4>
                    <p className="text-sm text-red-800">
                      This request will be sent as a high-priority alert to all matching donors within 10km.
                      Only use this for life-threatening emergencies.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full text-lg py-6 ${isCritical ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <Send className="w-5 h-5 mr-2" />
                  {loading ? 'Sending...' : (isCritical ? 'Send Critical Alert to Nearby Donors' : 'Notify Nearby Donors')}
                </Button>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Donors in View ({nearbyDonors.length})
              </h3>
              <p className="text-sm text-gray-500 mb-4">The following verified donors with matching blood type are currently active in your area.</p>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {nearbyDonors.length > 0 ? (
                  nearbyDonors.map((donor, idx) => (
                    <div key={idx} className="p-3 bg-white border rounded-lg shadow-sm flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold flex-shrink-0">
                        {donor.blood_group}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{donor.name}</p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{donor.distance_km?.toFixed(1)} km • {donor.city}</span>
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">No active {formData.bloodType || 'matching'} donors found nearby right now.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t text-xs text-gray-500">
                <p>✓ All donors are verified</p>
                <p>✓ Available for immediate response</p>
              </div>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What Happens Next?</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex gap-2"><span>1.</span><span>Request sent to {nearbyDonors.length} nearby donors</span></li>
                <li className="flex gap-2"><span>2.</span><span>Donors receive instant notification</span></li>
                <li className="flex gap-2"><span>3.</span><span>Track donor arrival in real-time</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

