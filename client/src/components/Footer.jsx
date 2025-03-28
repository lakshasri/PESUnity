import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="backdrop-blur-glass bg-white/50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-text-secondary">
            © 2024 LAKS. Shaping the future of education.
          </div>
          <div className="flex space-x-8">
            <Link to="/about" className="text-text-secondary hover:text-primary transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="text-text-secondary hover:text-primary transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 