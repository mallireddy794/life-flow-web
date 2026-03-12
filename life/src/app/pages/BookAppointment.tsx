import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar } from '../components/ui/calendar';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { useState } from 'react';

export function BookAppointment() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    hospital: '',
    timeSlot: '',
  });

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const hospitals = [
    'City General Hospital',
    'Memorial Medical Center',
    'St. Mary\'s Hospital',
    'Central Medical Clinic',
    'Riverside Health Center'
  ];

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/appointment-confirmation');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/nearby-blood-requests')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Book Appointment</h1>
              <p className="text-sm text-gray-500">Schedule your blood donation</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <CalendarIcon className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold">Select Date</h2>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              disabled={(date) => date < new Date()}
            />
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Appointments are available Monday to Saturday, 9 AM to 6 PM
              </p>
            </div>
          </Card>

          {/* Booking Form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Appointment Details</h2>
            <form onSubmit={handleConfirm} className="space-y-6">
              <div>
                <Label htmlFor="hospital">Select Hospital</Label>
                <Select 
                  value={formData.hospital} 
                  onValueChange={(value) => setFormData({...formData, hospital: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital} value={hospital}>
                        {hospital}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timeSlot">Select Time Slot</Label>
                <Select 
                  value={formData.timeSlot} 
                  onValueChange={(value) => setFormData({...formData, timeSlot: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-4">Appointment Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">
                        {date ? date.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'Not selected'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium">{formData.timeSlot || 'Not selected'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{formData.hospital || 'Not selected'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Before You Come:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Bring a valid ID</li>
                  <li>• Eat a healthy meal</li>
                  <li>• Stay hydrated</li>
                  <li>• Get adequate rest</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
                disabled={!date || !formData.hospital || !formData.timeSlot}
              >
                Confirm Appointment
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
