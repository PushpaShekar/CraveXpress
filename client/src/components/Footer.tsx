import { Link } from 'react-router-dom';
import { Package, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-white">CraveXpress</span>
            </div>
            <p className="text-sm">
              Your one-stop shop for fresh groceries delivered right to your doorstep. Quality products, great prices!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-500 transition">Home</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary-500 transition">Products</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-primary-500 transition">Orders</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-primary-500 transition">Help Center</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition">Returns</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition">Shipping Info</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition">Privacy Policy</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary-500" />
                <span>support@cravexpress.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary-500" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary-500" />
                <span>123 Market St, City, Country</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} CraveXpress. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

