import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

export function EligibilityCheck() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      id: 0,
      question: 'Are you between 18 and 65 years old?',
      options: ['yes', 'no'],
      disqualifying: 'no'
    },
    {
      id: 1,
      question: 'Do you weigh at least 50 kg (110 lbs)?',
      options: ['yes', 'no'],
      disqualifying: 'no'
    },
    {
      id: 2,
      question: 'Are you feeling healthy and well today?',
      options: ['yes', 'no'],
      disqualifying: 'no'
    },
    {
      id: 3,
      question: 'Have you donated blood in the last 56 days?',
      options: ['yes', 'no'],
      disqualifying: 'yes'
    },
    {
      id: 4,
      question: 'Have you had any surgery in the past 6 months?',
      options: ['yes', 'no'],
      disqualifying: 'yes'
    },
    {
      id: 5,
      question: 'Are you currently taking antibiotics or other medications?',
      options: ['yes', 'no'],
      disqualifying: 'yes'
    },
    {
      id: 6,
      question: 'Have you gotten a tattoo or piercing in the last 6 months?',
      options: ['yes', 'no'],
      disqualifying: 'yes'
    },
    {
      id: 7,
      question: 'Do you have any chronic illnesses (diabetes, heart disease, etc.)?',
      options: ['yes', 'no'],
      disqualifying: 'yes'
    },
  ];

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isEligible = () => {
    return questions.every((q) => answers[q.id] !== q.disqualifying);
  };

  if (showResult) {
    const eligible = isEligible();
    
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/donor-requirements')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="font-bold text-xl text-gray-900">Eligibility Result</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-16">
          <Card className="p-12 text-center">
            {eligible ? (
              <>
                <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">You're Eligible to Donate!</h2>
                <p className="text-xl text-gray-600 mb-8">
                  Great news! Based on your responses, you meet the eligibility criteria for blood donation.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-green-900 mb-2">Next Steps:</h3>
                  <ul className="text-left text-green-800 space-y-2">
                    <li>• Schedule an appointment at a nearby hospital</li>
                    <li>• Bring a valid ID on the day of donation</li>
                    <li>• Eat a healthy meal and stay hydrated</li>
                    <li>• Get a good night's sleep before donation</li>
                  </ul>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    size="lg"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => navigate('/book-appointment')}
                  >
                    Book Appointment Now
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/donor-dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Currently Not Eligible</h2>
                <p className="text-xl text-gray-600 mb-8">
                  Based on your responses, you may not be eligible to donate at this time.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-red-900 mb-2">What You Can Do:</h3>
                  <ul className="text-left text-red-800 space-y-2">
                    <li>• Contact our medical team for a detailed consultation</li>
                    <li>• Some restrictions are temporary - check back later</li>
                    <li>• Review the full eligibility requirements</li>
                    <li>• Consider other ways to help save lives</li>
                  </ul>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      setShowResult(false);
                      setCurrentQuestion(0);
                      setAnswers({});
                    }}
                  >
                    Retake Quiz
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/donor-requirements')}
                  >
                    View Requirements
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/donor-requirements')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-xl text-gray-900">Eligibility Check</h1>
              <p className="text-sm text-gray-500">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <Card className="p-8 md:p-12">
          <div className="mb-8">
            <span className="text-sm font-medium text-red-600 mb-2 block">
              Question {currentQuestion + 1}/{questions.length}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {currentQ.question}
            </h2>
          </div>

          <RadioGroup 
            value={answers[currentQuestion]} 
            onValueChange={handleAnswer}
            className="space-y-4 mb-8"
          >
            {currentQ.options.map((option) => (
              <div
                key={option}
                className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                  answers[currentQuestion] === option
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleAnswer(option)}
              >
                <RadioGroupItem value={option} id={option} />
                <Label 
                  htmlFor={option} 
                  className="flex-1 cursor-pointer text-lg capitalize"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleNext}
              disabled={!answers[currentQuestion]}
            >
              {currentQuestion === questions.length - 1 ? 'See Results' : 'Next Question'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
