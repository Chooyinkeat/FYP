import { Metadata } from "next";
import Hero from "@/components/Hero";
// import Brands from "@/components/Brands";
import Feature from "@/components/Features";
import About from "@/components/About";
// import FeaturesTab from "@/components/FeaturesTab";
// import FunFact from "@/components/FunFact";
import Integration from "@/components/Integration";
// import CTA from "@/components/CTA";
// import FAQ from "@/components/FAQ";
// import Pricing from "@/components/Pricing";
// import Contact from "@/components/Contact";
import Blog from "@/components/Blog";
// import Testimonial from "@/components/Testimonial";
export const metadata = {
  title: "Lost & Found System for Community – Final Year Project",
  description:
    "A smart web-based system to help individuals report, search, and reclaim lost items efficiently using image matching and identity verification.",
  icons: {
    icon: "/images/favicon.ico",
    shortcut: "/images/favicon.ico",
    apple: "/images/favicon.ico",
  },
};

export default function Home() {
  return (
    <main>
      <Hero />
      {/* <Brands /> */}
      <Feature />
      <About />
      {/* fdsjfsd */}
      {/* <FeaturesTab /> */}
      {/* <FunFact /> */}
      <Integration />
      {/* <CTA /> */}
      {/* <FAQ /> */}
      {/* <Testimonial /> */}
      {/* <Pricing /> */}
      {/* <Contact /> */}
      <Blog />
    </main>
  );
}
