import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Heart, User } from 'lucide-react';
import { useState } from 'react';

export function DonorProfileSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    bloodGroup: '',
    age: '',
    gender: '',
    location: '',
    contact: '',
    lastDonation: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save profile and navigate to donor dashboard
    navigate('/donor-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="bg-red-100 p-4 rounded-full inline-block mb-4">
              <User className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Donor Profile</h1>
            <p className="text-gray-600">Help us match you with patients who need your help</p>
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
            
            <div className="grid md:grid-cols-3 gap-4">
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
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Your age"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="mt-1"
                  min="18"
                  max="65"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => setFormData({...formData, gender: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location (City, State)</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., New York, NY"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="lastDonation">Last Donation Date (Optional)</Label>
              <Input
                id="lastDonation"
                type="date"
                value={formData.lastDonation}
                onChange={(e) => setFormData({...formData, lastDonation: e.target.value})}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                This helps us determine your eligibility for donation
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Important Information</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• You must be 18-65 years old to donate blood</li>
                <li>• Minimum weight requirement: 50 kg (110 lbs)</li>
                <li>• Wait at least 56 days between whole blood donations</li>
                <li>• Be in good health and feeling well</li>
              </ul>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
            >
              Save Profile & Continue
            </Button>
          </form>
        </div>
        
        <div className="text-center mt-6">
          <button 
            onClick={() => navigate('/otp-verification')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Go back
          </button>
        </div>
      </div>
    </div>
  );
}
