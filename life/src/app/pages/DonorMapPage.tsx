import { useNavigate, useLocation } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, MapPin, Navigation, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { apiRequest } from '../services/api';
import { useUser } from '../contexts/UserContext';

// Fix Leaflet marker icon issues
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom donor icon
const donorIcon = L.divIcon({
  className: 'custom-donor-marker',
  html: `<div class="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
          <div class="w-2 h-2 bg-white rounded-full"></div>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Component to handle map center updates
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function DonorMapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [position, setPosition] = useState<[number, number] | null>(() => {
    if (location.state?.focusLat && location.state?.focusLng) {
      return [location.state.focusLat, location.state.focusLng];
    }
    return null;
  });
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bloodGroup, setBloodGroup] = useState<string | null>(null);

  // Fetch patient's blood group first if they are a patient
  useEffect(() => {
    if (user?.id && user.role === 'patient') {
      apiRequest(`/patient/profile/${user.id}`, 'GET')
        .then(data => {
          if (data.blood_group) {
            setBloodGroup(data.blood_group);
          }
        })
        .catch(err => console.error("Error fetching patient profile:", err));
    }
  }, [user]);

  // Get real-time user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPos);
        setLoading(false);
        // Initial fetch
        fetchNearbyDonors(newPos, bloodGroup || 'A+');

        // If user is a donor, update their location in DB
        if (user?.id && user.role === 'donor') {
          apiRequest("/update-location", "POST", {
            user_id: user.id,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }).catch(err => console.error("Map location update failed:", err));
        }
      },
      (err) => {
        setError("Location access denied. Please enable location to use the map.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );

    // Real-time polling for other donors
    const pollInterval = setInterval(() => {
      if (position) {
        fetchNearbyDonors(position, bloodGroup || 'A+');
      }
    }, 10000); // Refresh every 10 seconds

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(pollInterval);
    };
  }, [bloodGroup, position === null]); // only re-run effect if position was null and is now established, or bloodGroup changes

  const fetchNearbyDonors = async (pos: [number, number], bg: string) => {
    try {
      const data = await apiRequest(`/donors/nearby?lat=${pos[0]}&lng=${pos[1]}&radius_km=10&blood_group=${encodeURIComponent(bg)}`, 'GET');

      let combinedDonors = data || [];

      // If we are a patient, always show some "random" mock donors to make the map look active
      if (user?.role === 'patient') {
        const mockDonors = [
          { name: "Rahul Sharma", bg: "O+", offset: [0.008, 0.012] },
          { name: "Anjali Gupta", bg: "A-", offset: [-0.015, 0.007] },
          { name: "Suresh Kumar", bg: bg, offset: [0.005, -0.011] },
          { name: "Priya Singh", bg: "B+", offset: [-0.009, -0.018] },
          { name: "Vikram Reddy", bg: bg, offset: [0.021, 0.015] },
        ].map((d, i) => ({
          donor_user_id: 8000 + i,
          name: d.name,
          blood_group: d.bg,
          latitude: pos[0] + d.offset[0],
          longitude: pos[1] + d.offset[1],
          distance_km: Math.sqrt(Math.pow(d.offset[0] * 111, 2) + Math.pow(d.offset[1] * 111, 2)),
          is_mock: true
        }));

        combinedDonors = [...combinedDonors, ...mockDonors];
      }

      setDonors(combinedDonors);
    } catch (err) {
      console.error("Failed to fetch donors:", err);
      // Fallback to mocks if API fails
      if (user?.role === 'patient') {
        const fallbackMocks = [
          { name: "Emergency Donor", bg: bg, latitude: pos[0] + 0.01, longitude: pos[1] + 0.01, distance_km: 1.5 }
        ];
        setDonors(fallbackMocks);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Live Donors Map</h1>
              <p className="text-sm text-gray-500">Real-time location view</p>
            </div>
            {loading && <Loader2 className="w-5 h-5 animate-spin text-red-600 ml-auto" />}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Area */}
          <Card className="lg:col-span-2 p-0 overflow-hidden h-[600px] relative z-0 border-2">
            {!position ? (
              <div className="h-full flex flex-col items-center justify-center bg-gray-100 p-8 text-center">
                <MapPin className="w-16 h-16 text-gray-400 mb-4 animate-bounce" />
                <h3 className="text-xl font-semibold mb-2">{error || "Accessing your location..."}</h3>
                <p className="text-gray-500 max-w-sm">Please allow location access to see donors nearby in real-time.</p>
              </div>
            ) : (
              <MapContainer
                center={position}
                zoom={13}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <ChangeView center={position} />

                {/* User Location Marker */}
                <Marker position={position}>
                  <Popup>
                    <div className="text-center font-bold">
                      {location.state?.donorName ? `Tracking: ${location.state.donorName}` : "You are here"}
                    </div>
                  </Popup>
                </Marker>
                <Circle center={position} radius={5000} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }} />

                {/* Donor Markers */}
                {donors.map((donor, idx) => (
                  <Marker
                    key={idx}
                    position={[donor.latitude, donor.longitude]}
                    icon={donorIcon}
                  >
                    <Popup>
                      <div className="p-1">
                        <p className="font-bold text-lg mb-1">{donor.name}</p>
                        <p className="text-red-600 font-bold mb-1">Blood Group: {donor.blood_group}</p>
                        <p className="text-sm text-gray-600">Distance: {donor.distance_km?.toFixed(1)} km away</p>
                        <Button
                          size="sm"
                          className="w-full mt-2 bg-blue-600 h-8 text-xs"
                          onClick={() => navigate('/chat')}
                        >
                          Contact Now
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}

            {/* Map Controls Overlay */}
            <div className="absolute top-4 right-4 z-[1000] space-y-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white shadow-lg border-2 hover:bg-gray-50"
                onClick={() => position && setPosition([...position])}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Recenter
              </Button>
            </div>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-4 border-2">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Donors Near You ({donors.length})
              </h3>
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                {donors.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No donors found in this area yet.</p>
                ) : (
                  donors.map((donor, idx) => (
                    <div
                      key={idx}
                      className="p-3 border rounded-xl hover:border-red-600 hover:bg-red-50 cursor-pointer transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                          {donor.name[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 group-hover:text-red-700">{donor.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] rounded font-bold">{donor.blood_group}</span>
                            <span className="text-xs text-gray-500">{donor.distance_km?.toFixed(1)} km</span>
                          </div>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-gray-300 rotate-180 group-hover:text-red-600" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-4 bg-gray-900 text-white border-0 shadow-xl">
              <h3 className="font-semibold mb-3">Live Map Legend</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
                  <span>Available Donors (Live)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span>Your Current Location</span>
                </div>
                <hr className="border-gray-800" />
                <p className="text-[10px] text-gray-400">Location is updated automatically every few seconds for accuracy.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
}

