import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, Weight, Calendar, Heart, Droplets, Activity, CheckCircle2 } from 'lucide-react';

export function DonorRequirements() {
  const navigate = useNavigate();

  const requirements = [
    {
      icon: Calendar,
      title: 'Age Requirements',
      description: 'Must be between 18-65 years old',
      detail: 'First-time donors: 18-60 years. Regular donors: up to 65 years.',
      color: 'blue'
    },
    {
      icon: Weight,
      title: 'Weight Requirement',
      description: 'Minimum weight of 50 kg (110 lbs)',
      detail: 'Must weigh at least 50 kg to safely donate blood.',
      color: 'green'
    },
    {
      icon: Activity,
      title: 'Health Conditions',
      description: 'Must be in good health',
      detail: 'No active infections, chronic illnesses, or recent surgeries.',
      color: 'purple'
    },
    {
      icon: Calendar,
      title: 'Donation Gap',
      description: 'Wait 56 days between donations',
      detail: 'At least 8 weeks gap for whole blood donation.',
      color: 'orange'
    },
    {
      icon: Droplets,
      title: 'Hemoglobin Levels',
      description: 'Adequate hemoglobin required',
      detail: 'Minimum: 12.5 g/dL for women, 13.0 g/dL for men.',
      color: 'red'
    },
    {
      icon: Heart,
      title: 'Lifestyle Factors',
      description: 'No high-risk behaviors',
      detail: 'No recent tattoos, piercings, or travel to endemic areas.',
      color: 'pink'
    },
  ];

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
              <h1 className="font-bold text-xl text-gray-900">Donor Requirements</h1>
              <p className="text-sm text-gray-500">Eligibility criteria for blood donation</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">Ready to Save Lives?</h2>
            <p className="text-red-100 text-lg mb-6">
              Before you donate, make sure you meet these eligibility requirements. 
              Your safety and the safety of recipients are our top priorities.
            </p>
            <Button 
              size="lg"
              className="bg-white text-red-600 hover:bg-gray-100"
              onClick={() => navigate('/eligibility-check')}
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Check My Eligibility
            </Button>
          </div>
        </Card>

        {/* Requirements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {requirements.map((req, index) => {
            const Icon = req.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition">
                <div className={`bg-${req.color}-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-7 h-7 text-${req.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{req.title}</h3>
                <p className="text-gray-700 font-medium mb-2">{req.description}</p>
                <p className="text-sm text-gray-600">{req.detail}</p>
              </Card>
            );
          })}
        </div>

        {/* Additional Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Before Donation</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Get a good night's sleep</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Eat a healthy meal and drink plenty of water</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Bring a valid ID and donor card if available</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Avoid fatty foods before donation</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">After Donation</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Rest for 10-15 minutes at the donation site</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Drink extra fluids for the next 24 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Avoid strenuous exercise for 24 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Keep the bandage on for at least 4 hours</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="mt-8 p-8 text-center bg-blue-50 border-blue-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Have Questions?</h3>
          <p className="text-gray-600 mb-6">
            Our medical team is here to help answer any questions about blood donation eligibility.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => navigate('/eligibility-check')}
            >
              Check My Eligibility
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/donor-dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
