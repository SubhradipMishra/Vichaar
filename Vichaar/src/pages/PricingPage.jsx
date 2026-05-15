import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import Context from '../util/context';
import { FiCheck, FiArrowLeft, FiZap, FiLayout, FiCpu } from 'react-icons/fi';
import { message } from 'antd';

const PricingPage = () => {
    const { session } = useContext(Context);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const plans = [
        {
            id: '1_month',
            name: 'Monthly',
            price: '299',
            duration: '/mo',
            features: [
                'Premium Blog Access',
                'AI Writing Assistant',
                'SEO Optimization Tips',
                'Priority Support',
                'Ad-free Experience'
            ],
            color: 'from-blue-500 to-indigo-600',
            popular: false
        },
        {
            id: '6_months',
            name: 'Semi-Annual',
            price: '1,499',
            duration: '/6 mo',
            features: [
                'All Monthly Features',
                'Advanced AI Analytics',
                'Custom Domain Support',
                'Early Access to Features',
                'Save 15% on Monthly'
            ],
            color: 'from-purple-500 to-pink-600',
            popular: true
        },
        {
            id: '12_months',
            name: 'Annual',
            price: '2,499',
            duration: '/yr',
            features: [
                'All Semi-Annual Features',
                'One-on-one Consulting',
                'Vichaar Pro Badge',
                'Unlimited AI Tokens',
                'Save 30% on Monthly'
            ],
            color: 'from-orange-400 to-red-600',
            popular: false
        }
    ];

    const handleSubscribe = async (planId) => {
        if (!session) {
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const { data: order } = await API.post('/payment/create-order', { planName: planId });

            const options = {
                key: import.meta.env.VITE_RZP_KEY || "rzp_test_SbMCXavd2ljutr",
                amount: order.amount,
                currency: order.currency,
                name: "Vichaar",
                description: `Premium Subscription - ${planId}`,
                image: "/logo.png",
                order_id: order.id,
                handler: async (response) => {
                    try {
                        const { data } = await API.post('/payment/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        if (data.success) {
                            message.success("Subscription successful! Welcome to Vichaar Pro.");
                            window.location.href = "/dashboard";
                        }
                    } catch (error) {
                        message.error("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: session.name,
                    email: session.email,
                    contact: session.mobileNumber
                },
                theme: {
                    color: "#6366f1"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Subscription Error:", error);
            message.error("Failed to initiate payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden selection:bg-primary-200" style={{ background: 'linear-gradient(160deg, #f8f7ff 0%, #ede9fe 50%, #f3e8ff 100%)' }}>
            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-200/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/20 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Header / Nav */}
            <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-20">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors font-semibold group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </button>
                <div className="text-2xl font-black tracking-tighter text-primary-600">
                    VICHAAR <span className="font-light text-gray-400">PRO</span>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                <div className="text-center mb-20">
                    <div className="sketch-badge mb-6 animate-bounce">✨ PRO FEATURES</div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-gray-900 leading-none">
                        Elevate Your <br />
                        <span className="gradient-text">Writing Journey.</span>
                    </h1>
                    <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Unlock the full potential of your voice with AI-powered tools, 
                        priority publishing, and advanced analytics.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {plans.map((plan) => (
                        <div 
                            key={plan.id}
                            className={`relative group p-10 rounded-[40px] card-glass flex flex-col ${plan.popular ? 'border-primary-400/30 ring-1 ring-primary-400/20' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="sketch-badge shadow-xl border border-primary-200">Most Popular 🔥</span>
                                </div>
                            )}

                            <div className="mb-10 text-center">
                                <h3 className="text-gray-400 text-xs font-black tracking-[0.2em] uppercase mb-4">{plan.name}</h3>
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-5xl font-black text-gray-900">₹{plan.price}</span>
                                    <span className="text-gray-400 font-medium">{plan.duration}</span>
                                </div>
                            </div>

                            <div className="space-y-5 mb-10 flex-1">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-gray-600">
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br ${plan.color} shadow-sm`}>
                                            <FiCheck className="text-white text-xs" />
                                        </div>
                                        <span className="text-[15px] font-medium leading-tight">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={loading}
                                className={`w-full py-5 rounded-[24px] font-black text-xs tracking-widest uppercase transition-all duration-300 shadow-xl ${
                                    plan.popular 
                                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/20' 
                                    : 'bg-white text-primary-600 border border-primary-100 hover:bg-primary-50 shadow-gray-200/10'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading ? 'Processing...' : 'Get Pro Access'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Bottom Value Props */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-100 pt-20">
                    <div className="text-center group">
                        <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                            <FiCpu className="text-3xl text-blue-500" />
                        </div>
                        <h4 className="text-xl font-bold mb-3 text-gray-900">AI Engine 2.0</h4>
                        <p className="text-gray-500 text-sm leading-relaxed px-4">
                            Write faster with our contextual AI that understands your unique style.
                        </p>
                    </div>
                    <div className="text-center group">
                        <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-50 flex items-center justify-center mb-6 group-hover:-rotate-6 transition-transform">
                            <FiLayout className="text-3xl text-purple-500" />
                        </div>
                        <h4 className="text-xl font-bold mb-3 text-gray-900">Priority Review</h4>
                        <p className="text-gray-500 text-sm leading-relaxed px-4">
                            Your stories get published faster with our express moderation queue.
                        </p>
                    </div>
                    <div className="text-center group">
                        <div className="w-16 h-16 mx-auto rounded-3xl bg-pink-50 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                            <FiZap className="text-3xl text-pink-500" />
                        </div>
                        <h4 className="text-xl font-bold mb-3 text-gray-900">Deep Insights</h4>
                        <p className="text-gray-500 text-sm leading-relaxed px-4">
                            Know exactly who reads your blogs with real-time audience analytics.
                        </p>
                    </div>
                </div>

                <div className="mt-24 text-center">
                    <p className="font-handwriting text-2xl text-gray-400" style={{ fontFamily: 'Caveat, cursive' }}>
                        ✦ Join 12,000+ writers already using Vichaar Pro ✦
                    </p>
                </div>
            </main>

            <footer className="max-w-7xl mx-auto px-6 py-16 text-center text-gray-400 text-xs font-semibold tracking-widest uppercase">
                &copy; 2026 Vichaar. All rights reserved. Secure payments by Razorpay.
            </footer>
        </div>
    );
};

export default PricingPage;
