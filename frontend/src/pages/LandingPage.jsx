import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import RoleShowcase from "../components/RoleShowcase";
import Stats from "../components/Stats";
import Testimonials from "../components/Testimonials";
import Partners from "../components/Partners";
import CallToAction from "../components/CallToAction";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Partners />
        <Stats />
        <RoleShowcase />
        <Testimonials />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
};

export default LandingPage;
