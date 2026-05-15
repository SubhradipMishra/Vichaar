import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiCheck, FiZap, FiShield, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

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
        icon: <FiZap />,
        color: '#6241fe',
        bg: 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 100%)',
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
        icon: <FiShield />,
        color: '#7c3aed',
        bg: 'linear-gradient(135deg, #f3e8ff, #fdf4ff)',
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
        icon: <FiStar />,
        color: '#db2777',
        bg: 'linear-gradient(135deg, #fce7f3, #fdf2f8)',
        popular: false
    }
];

export default function Pricing() {
    const headRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(headRef.current,
                { opacity: 0, y: 60 },
                {
                    opacity: 1, y: 0, duration: 1, ease: 'power3.out',
                    scrollTrigger: { trigger: headRef.current, start: 'top 85%' },
                }
            );
        });
        return () => ctx.revert();
    }, []);

    return (
        <section id="pricing" className="section-padding relative overflow-hidden bg-white">
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #6241fe, transparent 70%)', filter: 'blur(80px)' }} />
            
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div ref={headRef} className="text-center mb-20">
                    <motion.div className="sketch-badge mb-4 inline-block"
                        animate={{ rotate: [-1, 1, -1] }} transition={{ duration: 3, repeat: Infinity }}>
                        ✦ Simple & Transparent
                    </motion.div>
                    <h2 className="section-heading mb-5">
                        One Plan. <span className="gradient-text">Infinite Growth.</span>
                    </h2>
                    <p className="section-sub text-center mx-auto max-w-2xl">
                        Unlock the full potential of your writing with Vichaar Pro. 
                        Choose the duration that fits your journey.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.8 }}
                            className={`relative rounded-[40px] p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 border-2 ${
                                plan.popular ? 'border-primary-500 shadow-2xl shadow-primary-500/10' : 'border-gray-100'
                            }`}
                            style={{ background: plan.bg }}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-primary-600 text-white text-[10px] font-black rounded-full tracking-widest uppercase shadow-lg shadow-primary-600/30">
                                    Best Value
                                </div>
                            )}

                            <div className="mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-2xl mb-6" style={{ color: plan.color }}>
                                    {plan.icon}
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-gray-900">₹{plan.price}</span>
                                    <span className="text-gray-500 font-bold text-sm">{plan.duration}</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-primary-600 text-[10px] shadow-sm">
                                            <FiCheck />
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate('/pricing')}
                                className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all duration-300 shadow-xl ${
                                    plan.popular 
                                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/30' 
                                    : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-100 shadow-gray-200/20'
                                }`}
                            >
                                Get Started
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ or Trust Badge */}
                <div className="mt-20 text-center">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3">
                        <span className="w-10 h-px bg-gray-100" />
                        Trusted by 12,000+ writers
                        <span className="w-10 h-px bg-gray-100" />
                    </p>
                </div>
            </div>
        </section>
    );
}
