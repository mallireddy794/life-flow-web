import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, CheckCircle2, Clock, MapPin, Heart } from 'lucide-react';

import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { apiRequest } from '../services/api';

export function LiveRequestTracking() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchTrackingInfo();
      const interval = setInterval(fetchTrackingInfo, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchTrackingInfo = async () => {
    try {
      const data = await apiRequest(`/patient/tracking/${user?.id}`, 'GET');
      setTrackingData(data);
    } catch (err) {
      console.error("Tracking fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading status...</div>;
  if (!trackingData) return <div className="min-h-screen flex items-center justify-center">No active request found.</div>;

  const { request, match, stages } = trackingData;

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
              <h1 className="font-bold text-xl text-gray-900">Live Request Tracking</h1>
              <p className="text-sm text-gray-500">Track your blood request in real-time</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Status Overview */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Request Status: {request.request_status}</h2>
              <p className="text-blue-100">Blood Type: {request.blood_group} • Units: {request.units_required} • Hospital: {request.hospital_name}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg">
              <Heart className="w-8 h-8 animate-pulse" />
            </div>
          </div>
        </Card>

        {/* Progress Tracker */}
        <Card className="p-8">
          <h3 className="text-xl font-semibold mb-8">Request Progress</h3>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div
              className="absolute left-6 top-0 w-0.5 bg-blue-600 transition-all duration-500"
              style={{ height: match ? '75%' : '25%' }}
            ></div>

            {/* Stages */}
            <div className="space-y-8">
              {(stages as any[]).map((stage) => (
                <div key={stage.id} className="relative flex items-start gap-6">
                  {/* Status Icon */}
                  <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${stage.status === 'completed'
                    ? 'bg-green-600'
                    : stage.status === 'active'
                      ? 'bg-blue-600 animate-pulse'
                      : 'bg-gray-300'
                    }`}>
                    {stage.status === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : stage.status === 'active' ? (
                      <Clock className="w-6 h-6 text-white" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>

                  {/* Stage Content */}
                  <div className="flex-1 pb-8">
                    <div className="bg-white border-2 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-lg text-gray-900">{stage.title}</h4>
                      </div>
                      <p className="text-gray-600">
                        {stage.id === 1 && "Emergency request broadcasted."}
                        {stage.id === 2 && (match ? `${match.donor_name} accepted your request.` : "Waiting for a donor to accept...")}
                        {stage.id === 3 && (match ? "Donor is moving towards your location." : "Pending match...")}
                        {stage.id === 4 && "Donation process finalization."}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Donor Information */}
        {match ? (
          <Card className="mt-6 p-6">
            <h3 className="text-lg font-semibold mb-4">Matched Donor Details</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
                <span className="text-xl font-bold">{match.donor_name[0]}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{match.donor_name}</h4>
                <p className="text-sm text-gray-600">Verified Donor • Matching blood group</p>
              </div>
              <Button onClick={() => navigate('/chat')}>
                Contact Donor
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>Live tracking enabled - donor is on the way</span>
            </div>
          </Card>
        ) : (
          <Card className="mt-6 p-6 text-center border-dashed border-2">
            <p className="text-gray-500 py-4">Waiting for a donor to accept your request...</p>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/chat')}
          >
            Chat with Donor
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/donor-map', {
              state: match ? {
                focusLat: match.donor_lat,
                focusLng: match.donor_lng,
                donorName: match.donor_name
              } : null
            })}
          >
            <MapPin className="w-4 h-4 mr-2" />
            View on Map
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/patient-dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
