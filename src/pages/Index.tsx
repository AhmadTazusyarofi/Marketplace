import { Navbar } from "@/components/Navbar";
import { CategoryBar } from "@/components/CategoryBar";
import { HeroSection } from "@/components/HeroSection";
import { ProductGrid } from "@/components/ProductGrid";
import FlashSaleSection from "@/components/FlashSaleSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryBar />
      <HeroSection />
      <FlashSaleSection />
      <ProductGrid />
      <Footer />
    </div>
  );
};

export default Index;
