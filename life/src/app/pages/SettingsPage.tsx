import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { ArrowLeft, User, Bell, Shield, Globe, LogOut, Hospital } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../contexts/UserContext';

export function SettingsPage() {
  const navigate = useNavigate();
  const { role } = useUser();
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

  const handleLogout = () => {
    // Mock logout
    navigate('/');
  };

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
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Sarah Johnson" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="sarah.johnson@email.com" className="mt-1" />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue="+1 (555) 987-6543" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Input id="bloodGroup" defaultValue="A+" className="mt-1" disabled />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Medical Facility / Address</Label>
              <Input id="address" defaultValue="City General Hospital, 123 Medical Ave" className="mt-1" />
            </div>
            
            <Button className="bg-blue-600 hover:bg-blue-700">
              Update Profile
            </Button>
          </div>
        </Card>

        {/* Search / Request Preferences */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Hospital className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold">
              {role === 'donor' ? 'Donor Search Preferences' : 'Blood Request Preferences'}
            </h2>
          </div>
          
          <div className="space-y-4">
            {role === 'donor' ? (
              <>
                <div>
                  <Label htmlFor="searchRadius">Search Radius (km)</Label>
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
                  <p className="text-sm text-gray-500 mt-1">
                    How far should we search for available blood donors?
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Real-time Donor Matching</h3>
                    <p className="text-sm text-gray-600">Get instant AI-powered donor recommendations</p>
                  </div>
                  <Switch 
                    checked={settings.donorMatchAlerts}
                    onCheckedChange={(checked) => setSettings({...settings, donorMatchAlerts: checked})}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Blood Request Updates</h3>
                    <p className="text-sm text-gray-600">Get notified when donors respond to your requests</p>
                  </div>
                  <Switch 
                    checked={settings.requestUpdates}
                    onCheckedChange={(checked) => setSettings({...settings, requestUpdates: checked})}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="searchRadius">Preferred Donor Radius (km)</Label>
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
                  <p className="text-sm text-gray-500 mt-1">
                    How far should donors be searched when your request is active?
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Request Response Alerts</h3>
                    <p className="text-sm text-gray-600">Notify me when donors accept my request</p>
                  </div>
                  <Switch 
                    checked={settings.donorMatchAlerts}
                    onCheckedChange={(checked) => setSettings({...settings, donorMatchAlerts: checked})}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Emergency Alert Notifications</h3>
                    <p className="text-sm text-gray-600">Receive urgent updates during emergencies</p>
                  </div>
                  <Switch 
                    checked={settings.requestUpdates}
                    onCheckedChange={(checked) => setSettings({...settings, requestUpdates: checked})}
                  />
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold">Notification Preferences</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600">Receive donor matches and updates via email</p>
              </div>
              <Switch 
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Push Notifications</h3>
                <p className="text-sm text-gray-600">Get instant alerts when donors are available</p>
              </div>
              <Switch 
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                <p className="text-sm text-gray-600">Receive urgent donor alerts via text message</p>
              </div>
              <Switch 
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <h3 className="font-medium text-gray-900">Donor Response Alerts</h3>
                <p className="text-sm text-gray-600">Get notified immediately when donors confirm availability</p>
              </div>
              <Switch 
                checked={settings.emergencyAlerts}
                onCheckedChange={(checked) => setSettings({...settings, emergencyAlerts: checked})}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold">Privacy & Security</h2>
          </div>
          
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Privacy Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Data & Permissions
            </Button>
          </div>
        </Card>

        {/* Language Settings */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold">Language</h2>
          </div>
          
          <div>
            <Label htmlFor="language">Preferred Language</Label>
            <Select 
              value={settings.language} 
              onValueChange={(value) => setSettings({...settings, language: value})}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
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

        {/* App Version */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>LifeFlow v1.0.0</p>
          <p>© 2026 LifeFlow. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}