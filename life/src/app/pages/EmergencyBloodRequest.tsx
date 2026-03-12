import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { ArrowLeft, AlertTriangle, Send } from 'lucide-react';
import { useState } from 'react';

export function EmergencyBloodRequest() {
  const navigate = useNavigate();
  const [isCritical, setIsCritical] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    bloodType: '',
    units: '',
    hospital: '',
    location: '',
    city: '',
    contact: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Show success and navigate to tracking
    navigate('/live-tracking');
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

      <div className="max-w-4xl mx-auto px-4 py-8">
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

            <div>
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

            <div>
              <Label htmlFor="location">Location Details / Address</Label>
              <Input
                id="location"
                type="text"
                placeholder="Hospital address or specific location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
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

              <div>
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What Happens Next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Request sent to all matching donors in your area</li>
                <li>✓ Donors receive instant notification</li>
                <li>✓ You can track responses in real-time</li>
                <li>✓ Direct chat with interested donors</li>
              </ul>
            </div>

            {/* Nearby Donors Preview */}
            <div className="bg-white border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 border-l-4 border-red-500 pl-3">Nearby Available Donors</h4>
                <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full animate-pulse flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div> 5 Donors Live Now
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: "Suresh Reddy", bg: "O+", dist: "0.8km", status: "Ready" },
                  { name: "Rahul Sharma", bg: "B+", dist: "1.2km", status: "Online" },
                  { name: "Anjali Gupta", bg: "A-", dist: "2.5km", status: "Active" }
                ].map((d, i) => (
                  <div key={i} className="flex flex-col p-3 bg-gray-50 rounded-lg border border-gray-100 relative group hover:border-red-200 transition">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-800">{d.name}</span>
                      <span className="text-xs font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{d.bg}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">{d.dist} away</span>
                      <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div> {d.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full text-lg py-6 ${isCritical ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <Send className="w-5 h-5 mr-2" />
              {isCritical ? 'Send Critical Alert to Nearby Donors' : 'Notify Nearby Donors'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
