import { useNavigate } from 'react-router';
import { Heart, Menu, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useState } from 'react';

interface NavigationProps {
  transparent?: boolean;
}

export function Navigation({ transparent = false }: NavigationProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${transparent ? 'bg-transparent' : 'bg-white shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="bg-red-600 p-2 rounded-lg">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">LifeFlow</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/')} className="text-gray-700 hover:text-red-600 transition">
              Home
            </button>
            <button onClick={() => navigate('/#about')} className="text-gray-700 hover:text-red-600 transition">
              About
            </button>
            <button onClick={() => navigate('/donor-dashboard')} className="text-gray-700 hover:text-red-600 transition">
              Donor
            </button>
            <button onClick={() => navigate('/patient-dashboard')} className="text-gray-700 hover:text-red-600 transition">
              Patient
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 bg-white border-t">
            <div className="flex flex-col gap-3">
              <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">
                Home
              </button>
              <button onClick={() => { navigate('/#about'); setMobileMenuOpen(false); }} className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">
                About
              </button>
              <button onClick={() => { navigate('/donor-dashboard'); setMobileMenuOpen(false); }} className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">
                Donor
              </button>
              <button onClick={() => { navigate('/patient-dashboard'); setMobileMenuOpen(false); }} className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">
                Patient
              </button>
              <div className="px-4 pt-2 flex flex-col gap-2">
                <Button variant="outline" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                  Login
                </Button>
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}>
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
