import LandingHeader from "./_components/LandingHeader";
import HeroSection from "./_components/HeroSection";
import BottomSection from "./_components/BottomSection";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <LandingHeader />
      <HeroSection />
      <BottomSection />
    </div>
  );
}
