import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import TrustedBy from '../components/TrustedBy'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'
import Pricing from '../components/Pricing'
import CTA from '../components/CTA'
import Footer from '../components/Footer'
import { scrollToHash } from '../util/site'

export default function LandingPage() {
  const location = useLocation()

  useEffect(() => {
    document.title = 'Vichaar - AI-Powered Blogging Platform'
  }, [])

  useEffect(() => {
    if (location.hash) {
      window.requestAnimationFrame(() => scrollToHash(location.hash))
      return
    }

    window.scrollTo(0, 0)
  }, [location.hash, location.pathname])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
