import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Star, GraduationCap, Camera, Briefcase, Scissors, MessageSquare } from 'lucide-react';
import { useFirebase } from './FirebaseContext';
import { useNavigate } from 'react-router-dom';

const ServicesPage = () => {
  const { user, loading } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user?.email === "johansonsebudi@gmail.com") {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  const services = [
    { name: "Graduation outfits", icon: <GraduationCap className="w-8 h-8" />, desc: "Complete packages to make your graduation day memorable and stress-free." },
    { name: "Photoshoot outfits", icon: <Camera className="w-8 h-8" />, desc: "Curated looks perfect for professional, creative, and graduation photoshoots." },
    { name: "Internship interview packages", icon: <Briefcase className="w-8 h-8" />, desc: "Professional attire that helps you make the best first impression." },
    { name: "Makeup services", icon: <Scissors className="w-8 h-8" />, desc: "Professional makeup application for your special events and photoshoots." },
    { name: "Styling advice", icon: <MessageSquare className="w-8 h-8" />, desc: "One-on-one consultations to help you find your perfect look for any occasion." }
  ];

  return (
    <div className="min-h-screen font-sans bg-[#FDFCFB]">
      <Navbar />
      
      <main className="pt-32 pb-24">
        {/* Header */}
        <section className="max-w-7xl mx-auto px-6 mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-botswana-blue/10 text-botswana-blue text-xs font-bold uppercase tracking-wider mb-6">
              <Star size={14} fill="currentColor" />
              <span>What We Offer</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight tracking-tighter mb-6 uppercase">
              Our <br/><span className="font-serif italic font-normal text-botswana-blue lowercase">Services.</span>
            </h1>
            <p className="text-lg text-black/60 max-w-2xl mx-auto leading-relaxed">
              Comprehensive styling and preparation services designed to help you succeed, from graduation day to your first big interview.
            </p>
          </motion.div>
        </section>

        {/* Services Grid */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 rounded-3xl border border-black/5 flex flex-col gap-6 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-botswana-blue/10 text-botswana-blue flex items-center justify-center group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold mb-3">{service.name}</h3>
                  <p className="text-black/60 leading-relaxed">{service.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesPage;
