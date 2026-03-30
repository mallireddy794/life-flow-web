import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { User } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { apiRequest } from '../services/api';

export function PatientProfileSetup() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    bloodGroup: user?.blood_group || '',
    hospitalName: user?.hospital_name || '',
    phone: user?.phone || '',
    unitsNeeded: user?.units_needed || 0,
    city: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      await apiRequest(`/patient/profile/${user.id}`, 'PUT', {
        phone: formData.phone,
        blood_group: formData.bloodGroup,
        hospital_name: formData.hospitalName,
        units_needed: parseInt(formData.unitsNeeded.toString()),
        city: formData.city
      });

      // Update user context
      setUser({
        ...user,
        name: formData.fullName,
        blood_group: formData.bloodGroup,
        phone: formData.phone,
        hospital_name: formData.hospitalName,
        units_needed: parseInt(formData.unitsNeeded.toString()),
        is_profile_complete: true
      });

      navigate('/patient-dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="bg-blue-100 p-4 rounded-full inline-block mb-4">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Patient Profile</h1>
            <p className="text-gray-600">Provide details to help donors find you in time of need</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="mt-1"
                required
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select 
                  value={formData.bloodGroup} 
                  onValueChange={(value) => setFormData({...formData, bloodGroup: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
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
                <Label htmlFor="unitsNeeded">Units Needed (Total)</Label>
                <Input
                  id="unitsNeeded"
                  type="number"
                  placeholder="e.g., 2"
                  value={formData.unitsNeeded}
                  onChange={(e) => setFormData({...formData, unitsNeeded: parseInt(e.target.value) || 0})}
                  className="mt-1"
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="hospitalName">Hospital Name</Label>
              <Input
                id="hospitalName"
                type="text"
                placeholder="Hospital where you are admitted"
                value={formData.hospitalName}
                onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                className="mt-1"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Your current city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Contact Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Primary contact for donors"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
              disabled={loading}
            >
              {loading ? 'Saving Profile...' : 'Save Profile & Continue'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
