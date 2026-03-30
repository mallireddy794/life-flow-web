import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { ArrowLeft, User, Bell, Shield, Globe, LogOut, Hospital } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { apiRequest } from '../services/api';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, setUser, role } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: true,
    emergencyAlerts: true,
    donorMatchAlerts: true,
    requestUpdates: true,
    language: 'en',
    searchRadius: '10',
  });

  useEffect(() => {
    const fetchProfile = async () => {
        if (!user?.id) return;
        try {
            const endpoint = role === 'donor' ? `/donor/profile/${user.id}` : `/patient/profile/${user.id}`;
            const data = await apiRequest(endpoint, 'GET');
            setProfile(data);
        } catch (e) { console.error("Profile fetch failed", e); }
        finally { setLoading(false); }
    };
    fetchProfile();
  }, [user?.id, role]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !profile) return;
    try {
        const endpoint = role === 'donor' ? `/donor/profile/${user.id}` : `/patient/profile/${user.id}`;
        await apiRequest(endpoint, 'PUT', profile);
        alert("Profile updated successfully!");
        // Update local context as well
        setUser({ ...user, name: profile.name, blood_group: profile.blood_group });
    } catch (e) {
        alert("Failed to update profile. Please try again.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Settings...</div>;

  const accentColor = role === 'donor' ? '#dc2626' : '#2563eb'; // red-600 or blue-600
  const accentBg = role === 'donor' ? '#fef2f2' : '#eff6ff'; // red-50 or blue-50

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500">Manage your {role} account and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Information */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={profile?.name || ''} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={user?.email || profile?.email || ''} 
                  disabled
                  className="mt-1 bg-gray-50 cursor-not-allowed" 
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={profile?.phone || ''} 
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Input id="bloodGroup" value={profile?.blood_group || user?.blood_group || ''} className="mt-1" disabled />
              </div>
            </div>

            <div>
              <Label htmlFor="address">City / Location</Label>
              <Input 
                id="address" 
                value={profile?.city || profile?.hospital_name || ''} 
                onChange={(e) => setProfile({...profile, city: e.target.value, hospital_name: e.target.value})}
                className="mt-1" 
              />
            </div>
            
            <Button type="submit" style={{ backgroundColor: accentColor }}>
              Update Profile
            </Button>
          </form>
        </Card>

        {/* Search / Request Preferences */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Hospital className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold">
              {role === 'donor' ? 'Blood Request Preferences' : 'Donor Search Preferences'}
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="searchRadius">
                {role === 'donor' ? 'Request Visibility Radius (km)' : 'Preferred Donor Radius (km)'}
              </Label>
              <Select 
                value={settings.searchRadius} 
                onValueChange={(value) => setSettings({...settings, searchRadius: value})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="25">25 km</SelectItem>
                  <SelectItem value="50">50 km</SelectItem>
                  <SelectItem value="100">100 km</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: accentBg }}>
              <div>
                <h3 className="font-medium text-gray-900">
                  {role === 'donor' ? 'Emergency Request Alerts' : 'Request Response Alerts'}
                </h3>
                <p className="text-sm text-gray-600">
                  Instant notifications for active blood needs
                </p>
              </div>
              <Switch 
                checked={settings.donorMatchAlerts}
                onCheckedChange={(checked) => setSettings({...settings, donorMatchAlerts: checked})}
              />
            </div>
          </div>
        </Card>

        {/* Logout */}
        <Card className="p-6">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </Card>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>LifeFlow v1.0.0</p>
          <p>© 2026 LifeFlow. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}