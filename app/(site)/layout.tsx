import FilmNav from "@/components/site/FilmNav";
import Footer from "@/components/site/Footer";
import Splash from "@/components/site/Splash";
import SplashGate from "@/components/site/SplashGate";
import "./site.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SplashGate />
      <Splash />
      <FilmNav />
      <main className="site">{children}</main>
      <Footer />
    </>
  );
}
