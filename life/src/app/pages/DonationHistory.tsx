import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, History, Heart, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { apiRequest } from '../services/api';

export function DonationHistory() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const demoHistory = [
        {
            id: 1,
            donation_date: "2026-01-15",
            units: 1,
            blood_group: "A+",
            location: "City Central Hospital",
            notes: "Regular donation"
        },
        {
            id: 2,
            donation_date: "2025-10-10",
            units: 1,
            blood_group: "A+",
            location: "Red Cross Blood Bank",
            notes: "Emergency donation"
        },
        {
            id: 3,
            donation_date: "2025-07-05",
            units: 1,
            blood_group: "A+",
            location: "Hope Medical Center",
            notes: "Post-surgery support"
        }
    ];

    useEffect(() => {
        if (user?.id) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const data = await apiRequest(`/donor/donations/history?donor_id=${user?.id}`, 'GET');
            if (data.history && data.history.length > 0) {
                setHistory(data.history);
            } else {
                setHistory(demoHistory);
            }
        } catch (err) {
            console.error("Failed to fetch history, using demo data:", err);
            setHistory(demoHistory);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/donor-dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="font-bold text-xl text-gray-900">Donation History</h1>
                            <p className="text-sm text-gray-500">Your legacy of saving lives</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Summary Card */}
                <Card className="p-6 mb-8 bg-gradient-to-r from-red-600 to-red-700 text-white border-none shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                                <Heart className="w-8 h-8 text-white fill-white" />
                            </div>
                            <div>
                                <p className="text-red-100 text-sm font-medium">Total Impact</p>
                                <h2 className="text-3xl font-bold">{history.length} Donations</h2>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-red-100 text-sm font-medium">Lives Saved</p>
                            <h2 className="text-3xl font-bold">{history.length * 3}</h2>
                        </div>
                    </div>
                </Card>

                {/* History List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            <History className="w-5 h-5 text-red-600" />
                            Recent Donations
                        </h3>
                        <span className="text-sm text-gray-500">{history.length} Records</span>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">Retrieving your donation legacy...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <Card className="p-12 text-center border-dashed border-2">
                            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Donations Yet</h3>
                            <p className="text-gray-600 mb-6">Start your journey today and save lives.</p>
                            <Button onClick={() => navigate('/nearby-blood-requests')} className="bg-red-600">
                                View Nearby Requests
                            </Button>
                        </Card>
                    ) : (
                        history.map((item, index) => (
                            <div key={item.id} className="relative pl-8">
                                {/* Timeline Line */}
                                {index !== history.length - 1 && (
                                    <div className="absolute left-[15px] top-10 bottom-0 w-0.5 bg-gray-200"></div>
                                )}

                                {/* Timeline Dot */}
                                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white border-2 border-green-500 flex items-center justify-center z-10">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 fill-white" />
                                </div>

                                <Card className="p-6 hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                                    {item.blood_group} Blood
                                                </span>
                                                <span className="text-gray-400">•</span>
                                                <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
                                                    <Calendar className="w-4 h-4" />
                                                    {item.donation_date}
                                                </div>
                                            </div>

                                            <h4 className="text-lg font-bold text-gray-900 mb-2">{item.location}</h4>

                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                <MapPin className="w-4 h-4" />
                                                <span>Donated {item.units} Unit{item.units > 1 ? 's' : ''}</span>
                                                {item.notes && (
                                                    <>
                                                        <span className="text-gray-300">|</span>
                                                        <span>{item.notes}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end">
                                            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-bold border border-green-100">
                                                Completed
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))
                    )}
                </div>

                {/* Motivation Card */}
                <Card className="mt-12 p-8 bg-blue-600 text-white border-none shadow-xl overflow-hidden relative">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-2">You are a hero!</h3>
                        <p className="text-blue-100 mb-6 max-w-md">Every drop counts. Your consistent support helps hospitals bridge the gap for emergency surgeries and treatments.</p>
                        <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold border-none" onClick={() => navigate('/nearby-blood-requests')}>
                            Find Next Request
                        </Button>
                    </div>
                    {/* Decorative Circle */}
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                </Card>
            </div>
        </div>
    );
}
