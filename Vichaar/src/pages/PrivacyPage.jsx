import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckOutlined, LockOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="min-h-screen bg-[#fcfcfe] pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block p-4 rounded-[24px] bg-green-50 text-green-600 mb-6">
            <ShieldCheckOutlined className="text-4xl" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">Privacy & Security</h1>
          <p className="text-gray-500 text-lg">Your data privacy is our top priority.</p>
        </motion.div>

        <div className="bg-white rounded-[48px] p-8 md:p-16 border border-green-50 shadow-2xl shadow-green-100/50 space-y-12">
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <LockOutlined className="text-green-600" /> Data Encryption
            </h2>
            <p className="text-gray-600 leading-relaxed">
              All communications between your browser and Vichaar servers are encrypted using industry-standard SSL/TLS technology. Your passwords are never stored in plain text; we use advanced salting and hashing algorithms (Bcrypt) to ensure your credentials remain secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <EyeInvisibleOutlined className="text-green-600" /> Information We Collect
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We collect minimal information required to provide our services: your name, email address, and content metadata. We do not sell your personal data to third parties. AI processing data is used solely to generate your requested content and is not used to train global models without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              Payment Security
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Payment information is processed directly by Razorpay, a PCI-DSS compliant payment gateway. Vichaar does not store your credit card details or banking credentials on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              Your Rights
            </h2>
            <p className="text-gray-600 leading-relaxed">
              You have the right to access, correct, or delete your personal data at any time through your account settings. If you wish to permanently delete your Vichaar account and all associated content, you can do so in the Profile Settings section.
            </p>
          </section>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPage;
