import { useRef } from 'react'
import Features from '../components/Features'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'
import Navbar from '../components/LandingNavbar'

const Landing = () => {
    const featuresRef = useRef(null);
    const howItWorksRef = useRef(null);

    const scrollTo = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' })
    }

    return <>
        <Navbar onFeaturesClick={() => scrollTo(featuresRef)}
            onHowItWorksClick={() => scrollTo(howItWorksRef)}
        />
        <Hero />
        <div ref={featuresRef}>
            <Features />
        </div>
        <div ref={howItWorksRef}>
            <HowItWorks />
        </div>
        <Testimonials />
        <Footer />
    </>
}

export default Landing