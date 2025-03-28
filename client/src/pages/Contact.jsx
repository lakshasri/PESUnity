import { Phone, Mail, MapPin } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

export default function Contact() {
  const contactMethods = [
    {
      icon: <Phone className="w-6 h-6 text-blue-500" />,
      title: "Phone",
      description: "Mon-Fri from 9am to 5pm",
      contact: "+91 5748452574"
    },
    {
      icon: <Mail className="w-6 h-6 text-blue-500" />,
      title: "Email",
      description: "24/7 Support",
      contact: "support@pesunity.edu"
    },
    {
      icon: <MapPin className="w-6 h-6 text-blue-500" />,
      title: "Location",
      description: "Main Campus",
      contact: "Bangalore, Karnataka"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {contactMethods.map((method, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                {method.icon}
                <h3 className="text-xl font-semibold">{method.title}</h3>
                <p className="text-gray-500">{method.description}</p>
                <p className="font-medium">{method.contact}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
