import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ShowcaseSection } from './components/ShowcaseSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { FeaturesSection } from './components/FeaturesSection';
import { RestorationStudio } from './components/RestorationStudio';
import { FinalCtaAndFooter } from './components/FinalCtaAndFooter';
import { ShowcaseId } from './utils/showcaseRenderer';

export function App() {
  const [studioSampleRequest, setStudioSampleRequest] = useState<{
    id: ShowcaseId;
    nonce: number;
  } | null>(null);

  const handleLoadSampleInStudio = (id: ShowcaseId) => {
    setStudioSampleRequest({ id, nonce: Date.now() });
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#111111]">
      <Navbar />
      <main>
        <HeroSection />
        <ShowcaseSection onLoadSampleInStudio={handleLoadSampleInStudio} />
        <HowItWorksSection />
        <FeaturesSection />
        <RestorationStudio externalSampleRequest={studioSampleRequest} />
      </main>
      <FinalCtaAndFooter />
    </div>
  );
}

export default App;
