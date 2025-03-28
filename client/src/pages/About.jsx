import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen } from "lucide-react";

export default function About() {
  const sections = [
    {
      icon: <GraduationCap className="w-10 h-10 text-indigo-500" />,
      title: "Our Mission",
      content: "To facilitate seamless collaboration and resource sharing among students, enhancing the learning experience through digital connectivity."
    },
    {
      icon: <Users className="w-10 h-10 text-emerald-500" />,
      title: "Who We Are",
      content: "A platform created by students for students, understanding the needs of modern education and the power of collaborative learning."
    },
    {
      icon: <BookOpen className="w-10 h-10 text-violet-500" />,
      title: "What We Offer",
      content: "A comprehensive suite of tools including real-time chat, file sharing, and resource management, all designed to support your academic journey."
    }
  ];

  return (
    <div className="page-container">
  <div className="max-w-7xl mx-auto px-4 py-24">
        <h1 className="text-5xl font-bold text-center mb-16 text-white">About PESUnity</h1>
        <div className="grid md:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white/70 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
              <div className="flex flex-col items-center text-center space-y-4">
                {section.icon}
                <h2 className="text-2xl font-semibold text-slate-800">{section.title}</h2>
                <p className="text-slate-600">{section.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 