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
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bloodGroup, setBloodGroup] = useState<string | null>(null);

  // Custom icon for hospitals
  const hospitalIcon = L.divIcon({
    className: 'custom-hospital-marker',
    html: `<div class="w-8 h-8 bg-blue-600 rounded-lg shadow-lg flex items-center justify-center p-1 border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-full h-full">
              <path d="M11 11V7H13V11H17V13H13V17H11V13H7V11H11ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" />
            </svg>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  // Fetch patient's blood group first if they are a patient
  useEffect(() => {
    if (user?.blood_group) {
        setBloodGroup(user.blood_group);
    } else if (user?.id && user.role === 'patient') {
        // Find self in nearby list as fallback
        if (position) {
          fetchNearbyData(position, 'A+'); // Start with default, will update when self found
        }
    }
  }, [user, position === null]);

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
        fetchNearbyData(newPos, bloodGroup || 'A+');

        // If user is a donor, update their location in DB
        if (user?.id && user.role === 'donor') {
          apiRequest("/update_location", "POST", {
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
        fetchNearbyData(position, bloodGroup || 'A+');
      }
    }, 10000); // Refresh every 10 seconds

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(pollInterval);
    };
  }, [bloodGroup, position === null]); // only re-run effect if position was null and is now established, or bloodGroup changes

  const fetchNearbyData = async (pos: [number, number], bg: string) => {
    try {
      const [donorData, hospitalData] = await Promise.all([
        apiRequest(`/donors/nearby?lat=${pos[0]}&lng=${pos[1]}&radius_km=10&blood_group=${encodeURIComponent(bg)}`, 'GET'),
        apiRequest(`/hospitals/nearby?lat=${pos[0]}&lng=${pos[1]}`, 'GET')
      ]);

      setDonors(donorData || []);
      setHospitals(hospitalData || []);
    } catch (err) {
      console.error("Failed to fetch map data:", err);
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
                    key={`donor-${idx}`}
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
                          onClick={() => navigate('/chat', { state: { recipientId: donor.donor_user_id, name: donor.name } })}
                        >
                          Contact Now
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Hospital Markers */}
                {hospitals.map((hospital) => (
                  <Marker
                    key={`hosp-${hospital.id}`}
                    position={[hospital.latitude, hospital.longitude]}
                    icon={hospitalIcon}
                  >
                    <Popup>
                      <div className="p-1 min-w-[200px]">
                        <p className="font-bold text-base mb-1 text-blue-800">{hospital.name}</p>
                        <p className="text-xs text-gray-600 mb-2">{hospital.address}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {hospital.blood_bank && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded animate-pulse">Blood Bank</span>}
                          {hospital.emergency && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded">24/7 ER</span>}
                        </div>
                        <div className="flex gap-2">
                           <Button size="sm" className="flex-1 h-7 text-[10px] bg-green-600">Call</Button>
                           <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px]" onClick={() => navigate('/nearby-hospitals')}>Details</Button>
                        </div>
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
          <div className="space-y-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <Card className="p-4 border-2">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                Nearest Donors ({donors.length})
              </h3>
              <div className="space-y-3">
                {donors.length === 0 ? (
                  <p className="text-center text-gray-500 py-4 text-sm">No donors nearby.</p>
                ) : (
                  donors.slice(0, 5).map((donor, idx) => (
                    <div key={idx} className="p-2 border rounded-lg hover:bg-red-50 cursor-pointer text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{donor.name}</span>
                        <span className="text-red-600 font-bold">{donor.blood_group}</span>
                      </div>
                      <p className="text-[10px] text-gray-500">{donor.distance_km?.toFixed(1)} km away</p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-4 border-2">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                Nearby Hospitals ({hospitals.length})
              </h3>
              <div className="space-y-3">
                {hospitals.map((h) => (
                  <div key={h.id} className="p-2 border rounded-lg hover:bg-blue-50 cursor-pointer text-sm">
                    <p className="font-medium text-blue-900">{h.name}</p>
                    <p className="text-[10px] text-gray-600 truncate">{h.address}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-gray-500">{h.distance}</span>
                      {h.blood_bank && <span className="text-[8px] bg-red-100 text-red-700 px-1 rounded font-bold">BLOOD BANK</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-gray-900 text-white border-0 shadow-xl">
              <h3 className="font-semibold mb-3 text-sm">Live Map Legend</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
                  <span>Available Donors</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-lg bg-blue-600"></div>
                  <span>Hospitals / Blood Banks</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span>Your Location</span>
                </div>
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

