import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, MapPin, Phone, Clock, Navigation } from 'lucide-react';

export function NearbyHospitals() {
  const navigate = useNavigate();

  const hospitals = [
    {
      id: 1,
      name: 'City General Hospital',
      address: '123 Medical Center Dr, New York, NY 10001',
      distance: '0.5 km',
      phone: '+1 (555) 123-4567',
      bloodBank: true,
      emergency: true,
      hours: '24/7'
    },
    {
      id: 2,
      name: 'Memorial Medical Center',
      address: '456 Healthcare Ave, New York, NY 10002',
      distance: '1.2 km',
      phone: '+1 (555) 234-5678',
      bloodBank: true,
      emergency: true,
      hours: '24/7'
    },
    {
      id: 3,
      name: 'St. Mary\'s Hospital',
      address: '789 Wellness Blvd, New York, NY 10003',
      distance: '2.1 km',
      phone: '+1 (555) 345-6789',
      bloodBank: true,
      emergency: false,
      hours: '6 AM - 10 PM'
    },
    {
      id: 4,
      name: 'Central Medical Clinic',
      address: '321 Health St, New York, NY 10004',
      distance: '2.8 km',
      phone: '+1 (555) 456-7890',
      bloodBank: true,
      emergency: false,
      hours: '8 AM - 8 PM'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="font-bold text-xl text-gray-900">Nearby Hospitals</h1>
              <p className="text-sm text-gray-500">Blood banks and medical facilities</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {hospitals.map((hospital) => (
            <Card key={hospital.id} className="p-6 hover:shadow-lg transition">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{hospital.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {hospital.bloodBank && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                            Blood Bank Available
                          </span>
                        )}
                        {hospital.emergency && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                            24/7 Emergency
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{hospital.distance}</div>
                      <p className="text-sm text-gray-600">away</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-gray-700">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{hospital.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm">{hospital.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm">Hours: {hospital.hours}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Hospital
                    </Button>
                    <Button variant="outline">
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/donor-map')}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      View on Map
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
