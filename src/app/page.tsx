import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { InstallGuide } from "@/components/InstallGuide";
import { Navbar } from "@/components/Navbar";
import { Pricing } from "@/components/Pricing";
import { Screenshots } from "@/components/Screenshots";
import { getScreenshots } from "@/lib/screenshots";

export default function HomePage() {
  const screenshots = getScreenshots();

  return (
    <div className="relative flex min-h-screen flex-col bg-charcoal">
      <Navbar />
      <main className="flex-1">
        <Hero record={screenshots[0]} />
        <InstallGuide />
        <Features />
        <Screenshots screenshots={screenshots} />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
