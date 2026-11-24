import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { InstallGuide } from "@/components/InstallGuide";
import { Navbar } from "@/components/Navbar";
import { Pricing } from "@/components/Pricing";
import { Screenshots } from "@/components/Screenshots";
import { getScreenshotAvailability } from "@/lib/screenshots";

export default function HomePage() {
  const availability = getScreenshotAvailability();

  return (
    <div className="relative flex min-h-screen flex-col bg-charcoal">
      <Navbar />
      <main className="flex-1">
        <Hero recordAvailable={availability["/screenshots/1-record.png"] ?? false} />
        <InstallGuide />
        <Features />
        <Screenshots availability={availability} />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
