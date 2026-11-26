import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ShowcaseSection } from './components/ShowcaseSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HostedAiStudio } from './components/HostedAiStudio';
import { FinalCtaAndFooter } from './components/FinalCtaAndFooter';
import { ShowcaseId } from './utils/showcaseRenderer';

export function App() {
  const handleLoadSampleInStudio = (_id: ShowcaseId) => {
    document.getElementById('ai-studio')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#111111]">
      <Navbar />
      <main>
        <HeroSection />
        <ShowcaseSection onLoadSampleInStudio={handleLoadSampleInStudio} />
        <HowItWorksSection />
        <FeaturesSection />
        <HostedAiStudio />
      </main>
      <FinalCtaAndFooter />
    </div>
  );
}

export default App;
