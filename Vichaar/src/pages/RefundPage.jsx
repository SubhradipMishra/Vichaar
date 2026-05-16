import React from 'react';
import { motion } from 'framer-motion';
import { TransactionOutlined, HistoryOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const RefundPage = () => {
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
          <div className="inline-block p-4 rounded-[24px] bg-indigo-50 text-indigo-600 mb-6">
            <TransactionOutlined className="text-4xl" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">Refund Policy</h1>
          <p className="text-gray-500 text-lg">Transparent & Fair Billing</p>
        </motion.div>

        <div className="bg-white rounded-[48px] p-8 md:p-16 border border-indigo-50 shadow-2xl shadow-indigo-100/50 space-y-12">
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              Subscription Cancellations
            </h2>
            <p className="text-gray-600 leading-relaxed">
              You can cancel your Vichaar Pro subscription at any time. Upon cancellation, your pro features will remain active until the end of your current billing period (monthly or yearly). We do not provide pro-rated refunds for the remaining time in a cycle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              7-Day Satisfaction Guarantee
            </h2>
            <p className="text-gray-600 leading-relaxed">
              If you are unsatisfied with Vichaar Pro, we offer a full refund for first-time subscribers within the first 7 days of purchase. To request a refund, please contact our support team with your transaction ID.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              Failed Transactions
            </h2>
            <p className="text-gray-600 leading-relaxed">
              If a payment is debited from your account but the subscription is not activated, our system will automatically detect the discrepancy and initiate a refund within 5-7 business days. Alternatively, you can reach out to us to manually activate your plan.
            </p>
          </section>

          <div className="p-8 rounded-[32px] bg-indigo-50 border border-indigo-100 flex flex-col md:flex-row items-center gap-6">
            <CustomerServiceOutlined className="text-4xl text-indigo-600" />
            <div>
              <h4 className="font-bold text-indigo-900 mb-1">Need help with a refund?</h4>
              <p className="text-indigo-700 text-sm">Contact our support team at support@vichaar.ai. We're here to help 24/7.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RefundPage;
