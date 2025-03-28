import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MessageCircle, Upload, Users, FileText } from 'lucide-react';
import Footer from "../components/Footer";
import backgroundImage from '../assets/image.jpg';

export default function Home() {
  const features = [
    {
      icon: <MessageCircle className="w-10 h-10 text-indigo-500" />,
      title: "Real-time Chat",
      description: "Connect with fellow students instantly through our chat system."
    },
    {
      icon: <Upload className="w-10 h-10 text-emerald-500" />,
      title: "File Sharing",
      description: "Share study materials and resources with your classmates."
    },
    {
      icon: <Users className="w-10 h-10 text-violet-500" />,
      title: "Student Community",
      description: "Join a vibrant community of students sharing knowledge."
    },
    {
      icon: <FileText className="w-10 h-10 text-rose-500" />,
      title: "Resource Library",
      description: "Access a growing library of shared academic resources."
    }
  ];

  return (
    <div className="page-container">
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          <img src={backgroundImage} alt="Logo" className="w-64 h-auto" />
          
          <h1 className="text-7xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Connect. Share. Evolve.
          </h1>
          
          <p className="text-2xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent max-w-2xl">
            A next-generation platform for collaborative learning and knowledge sharing.
          </p>
          
          <div className="flex gap-4">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                Join Now
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white/70 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Why Choose PESUnity?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} 
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
