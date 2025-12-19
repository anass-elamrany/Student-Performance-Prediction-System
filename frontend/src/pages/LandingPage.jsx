import Navbar from "../components/Navbar";
import ScrollToTop from "../components/ScrollToTop";
import Hero from "../components/Hero";
import RoleShowcase from "../components/RoleShowcase";
import Stats from "../components/Stats";
import Partners from "../components/Partners";
import CallToAction from "../components/CallToAction";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <>
      <div id="back-to-top-anchor" />
      <Navbar />
      <main>
        <Hero />
        <Partners />
        <Stats />
        <RoleShowcase />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default LandingPage;
