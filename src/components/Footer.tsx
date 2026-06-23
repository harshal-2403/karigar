import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, ArrowUpRight, Hammer, Wrench, Zap, Palette, Sparkles, Leaf, Car, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const [hoveredService, setHoveredService] = useState(null);
  const currentYear = new Date().getFullYear();

  const services = [
    { id: 'carpenter', name: 'Carpenter', icon: <Hammer /> },
    { id: 'plumber', name: 'Plumber', icon: <Wrench /> },
    { id: 'electrician', name: 'Electrician', icon: <Zap /> },
    { id: 'painter', name: 'Painter', icon: <Palette /> },
    { id: 'cleaning', name: 'Cleaning', icon: <Sparkles /> },
    { id: 'gardener', name: 'Gardener', icon: <Leaf /> },
    { id: 'mechanic', name: 'Mechanic', icon: <Car /> }
  ];

  const company = [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/register-worker' }
  ];

  const legal = [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' },
    { name: 'Refund Policy', href: '/refund-policy' }
  ];

  return (
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] animate-grid-flow" />
      </div>
      
      {/* Gradient Orbs - Greyscale */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl animate-float-delayed" />
      
      {/* Top Border Glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-50" />
      
      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-3 group cursor-pointer">
              <img src="/karigar.png" alt="Karigar Logo" className="h-16 w-auto" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-4">
              Connecting skilled professionals with those who need them. Quality service at your doorstep.
            </p>
            <div className="space-y-1">
              <a href="tel:+918103146100" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+91 8103146100</span>
              </a>
              <a href="mailto:karigarcustomercare@gmail.com" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                <span className="text-sm">karigarcustomercare@gmail.com</span>
              </a>
            </div>
            
            {/* Stats with Animation */}
            <div className="flex gap-4 pt-2">
              <div className="group cursor-pointer">
                <div className="text-2xl font-bold text-white group-hover:text-gray-300 transition-colors">500+</div>
                <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Workers</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-2xl font-bold text-white group-hover:text-gray-300 transition-colors">1000+</div>
                <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Projects</div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="group/section">
            <h4 className="font-semibold text-white mb-6 relative inline-block text-lg">
              Services
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-gray-500 to-gray-700 group-hover/section:w-full transition-all duration-500" />
            </h4>
            <ul className="space-y-3 mb-4 md:mb-0">
              {services.slice(0, 4).map((service) => (
                <li key={service.id}>
                  <a
                    href={`/workers?service=${service.id}`}
                    onMouseEnter={() => setHoveredService(service.id)}
                    onMouseLeave={() => setHoveredService(null)}
                    className="group/link flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 text-sm cursor-pointer"
                  >
                    <span className={`text-base transition-all duration-300 ${hoveredService === service.id ? 'scale-125 rotate-12' : ''}`}>
                      {service.icon}
                    </span>
                    <span className="relative">
                      {service.name}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gray-400 group-hover/link:w-full transition-all duration-300" />
                    </span>
                    <ArrowUpRight className={`w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-all duration-300 ${hoveredService === service.id ? 'translate-x-1 -translate-y-1' : ''}`} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="group/section">
            <h4 className="font-semibold text-white mb-6 relative inline-block text-lg">
              Company
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-gray-500 to-gray-700 group-hover/section:w-full transition-all duration-500" />
            </h4>
            <ul className="space-y-3">
              {company.map((item, idx) => (
                <li key={idx}>
                  <a
                    href={item.href}
                    className="group/link relative text-gray-400 hover:text-white transition-all duration-300 text-sm cursor-pointer inline-flex items-center gap-2"
                  >
                    <span className="group-hover/link:translate-x-1 transition-transform duration-300">
                      {item.name}
                    </span>
                    <span className="w-0 h-px bg-gray-400 group-hover/link:w-4 transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="group/section hidden md:block order-last md:order-none">
            <h4 className="font-semibold text-white mb-6 relative inline-block text-lg">
              Legal
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-gray-500 to-gray-700 group-hover/section:w-full transition-all duration-500" />
            </h4>
            <ul className="space-y-3">
              {legal.map((item, idx) => (
                <li key={idx}>
                  <a
                    href={item.href}
                    className="group/link relative text-gray-400 hover:text-white transition-all duration-300 text-sm cursor-pointer inline-flex items-center gap-2"
                  >
                    <span className="group-hover/link:translate-x-1 transition-transform duration-300">
                      {item.name}
                    </span>
                    <span className="w-0 h-px bg-gray-400 group-hover/link:w-4 transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800/50 relative">
          {/* Glowing Line Animation */}
          <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-gray-500 to-transparent animate-scan" />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 text-sm">
              © {currentYear} Kaarigar. All rights reserved.
            </p>
            
            {/* Social Links with 3D Effect */}
            <div className="flex items-center gap-4">
              {              [
                { icon: Instagram, href: 'https://www.instagram.com/kaarigarhh?igsh=MWNkMmo5dWlvZTVmMw==' }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  aria-label={social.icon.name}
                >
                  {/* Glow Effect - Greyscale */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-400 rounded-lg blur-md opacity-0 group-hover:opacity-40 transition-all duration-500 scale-0 group-hover:scale-150" />
                  
                  {/* Icon Container */}
                  <div className="relative w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:border-gray-600 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                    <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300" />
                  </div>
                  
                  {/* 3D Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes grid-flow {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(4rem);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.1);
          }
        }
        
        @keyframes scan {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
        
        .animate-grid-flow {
          animation: grid-flow 20s linear infinite;
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </footer>
  );
};

export default Footer;