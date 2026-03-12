import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, Users, Heart, MessageCircle, CheckCircle, Bell, MapPin, AlertCircle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { role } = useUser();
  // accent color and titles change based on current user role
  const accent = role === 'donor' ? 'red' : 'blue';
  const headerTitle = role === 'donor' ? 'Donor Notifications' : 'Patient Notifications';

  const notifications = [
    {
      id: 1,
      type: 'match',
      icon: Users,
      title: 'New Donor Matches Found',
      message: '8 compatible donors found nearby with A+ blood type',
      time: '5 minutes ago',
      unread: true,
      color: 'green',
      roles: ['donor']
    },
    {
      id: 2,
      type: 'response',
      icon: CheckCircle,
      title: 'Donor Confirmed Availability',
      message: 'John Smith (A+) confirmed - Available today at 2:00 PM',
      time: '15 minutes ago',
      unread: true,
      color: 'blue',
      roles: ['donor']
    },
    {
      id: 3,
      type: 'message',
      icon: MessageCircle,
      title: 'New Message from Donor',
      message: 'Michael Johnson: "I can come to the hospital within 30 minutes"',
      time: '30 minutes ago',
      unread: true,
      color: 'purple',
      roles: ['donor']
    },
    {
      id: 4,
      type: 'location',
      icon: MapPin,
      title: 'Donor Nearby',
      message: 'David Lee (A+) is now 0.8 km away and available',
      time: '1 hour ago',
      unread: true,
      color: 'orange',
      roles: ['donor']
    },
    {
      id: 5,
      type: 'match',
      icon: Heart,
      title: 'AI Match Score Updated',
      message: 'Found 3 high-compatibility donors (95%+ match)',
      time: '2 hours ago',
      unread: false,
      color: 'red',
      roles: ['donor']
    },
    {
      id: 6,
      type: 'response',
      icon: CheckCircle,
      title: 'Blood Request Active',
      message: 'Your emergency request has been sent to 24 nearby donors',
      time: '3 hours ago',
      unread: false,
      color: 'green',
      roles: ['patient']
    },
    {
      id: 7,
      type: 'message',
      icon: MessageCircle,
      title: 'Message from Emma Williams',
      message: '"I am available tomorrow morning. Please let me know the details."',
      time: '5 hours ago',
      unread: false,
      color: 'purple',
      roles: ['donor']
    },
    {
      id: 8,
      type: 'match',
      icon: Users,
      title: '2 More Donors Available',
      message: 'Sarah Chen and Robert Taylor are now available in your area',
      time: '6 hours ago',
      unread: false,
      color: 'blue',
      roles: ['donor']
    },
    {
      id: 9,
      type: 'response',
      icon: AlertCircle,
      title: 'Request Status Update',
      message: '12 donors viewed your request, 4 responded positively',
      time: '1 day ago',
      unread: false,
      color: 'orange',
      roles: ['patient']
    },
  ];

  // show all notifications regardless of role; both donor and patient messages should be visible
  const visibleNotifications = notifications; // previously filtered by role

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
<div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="font-bold text-xl text-gray-900">{headerTitle}</h1>
                <p className="text-sm text-gray-500">
                  {visibleNotifications.filter(n => n.unread).length} unread
                </p>
              </div>
            </div>
            
            <Button variant="outline" size="sm">
              Mark All as Read
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button variant="outline" size="sm" className={`border-${accent}-600 text-${accent}-600 bg-${accent}-50`}> 
            All Notifications
          </Button>
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-1" />
            {role === 'donor' ? 'Donor Matches' : 'Donor Requests'}
          </Button>
          <Button variant="outline" size="sm">
            <CheckCircle className="w-4 h-4 mr-1" />
            Responses
          </Button>
          <Button variant="outline" size="sm">
            <MessageCircle className="w-4 h-4 mr-1" />
            Messages
          </Button>
          <Button variant="outline" size="sm">
            <MapPin className="w-4 h-4 mr-1" />
            Nearby
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {visibleNotifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <Card 
                key={notification.id} 
                className={`p-4 cursor-pointer hover:shadow-md transition ${
                  notification.unread ? `bg-${accent}-50 border-${accent}-200` : 'bg-white'
                }`}
                onClick={() => {
                  if (notification.type === 'message') {
                    navigate('/chat');
                  } else if (notification.type === 'match') {
                    navigate('/matched-donors');
                  } else if (notification.type === 'response') {
                    navigate('/live-tracking');
                  } else if (notification.type === 'location') {
                    navigate('/donor-map');
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`bg-${notification.color}-100 p-3 rounded-lg flex-shrink-0`}>
                    <Icon className={`w-6 h-6 text-${notification.color}-600`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                        {notification.unread && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{notification.message}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State (if no notifications) */}
        {visibleNotifications.length === 0 && (
          <Card className="p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600">
              {role === 'donor'
                ? "You're all caught up! Check back later for donor updates."
                : "You're all caught up! Check back later for patient updates."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}