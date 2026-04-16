import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import DifferentialSection from "@/components/landing/DifferentialSection";
import ResultsSection from "@/components/landing/ResultsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import SecuritySection from "@/components/landing/SecuritySection";
import PricingSection from "@/components/landing/PricingSection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <DifferentialSection />
      <ResultsSection />
      <TestimonialsSection />
      <SecuritySection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </div>
  );
};

export default Index;
