import { Hero } from '@/components/site/Hero';
import { Configurator } from '@/components/site/Configurator';
import { LegacySection } from '@/components/site/Legacy';
import { ScrollStory } from '@/components/site/ScrollStory';
import {
  FeatureGrid,
  MarqueeStrip,
  NetworkSection,
  ReserveBand,
  SafetySection,
  SpecsTable,
  TechnologySection,
} from '@/components/site/Sections';
import { getLocator } from '@/lib/api';

export default async function HomePage() {
  const { data: dealers } = await getLocator();

  return (
    <>
      <Hero />
      <MarqueeStrip />
      <ScrollStory />
      <FeatureGrid />
      <Configurator />
      <SpecsTable />
      <SafetySection />
      <TechnologySection />
      <LegacySection />
      <NetworkSection dealerCount={Array.isArray(dealers) ? dealers.length : 32} />
      <ReserveBand />
    </>
  );
}
