import Link from "next/link";
import TruckBorder from "@/components/sign/TruckBorder";

export default function Footer() {
  return (
    <footer className="foot">
      <TruckBorder variant="lotus" colours={["ink", "rani", "marigold"]} height={34} />
      <div className="foot-in">
        <p className="foot-line">She may forget the day. She will still feel who loves her.</p>
        <div className="foot-row">
          <span className="foot-deva">पहचान</span>
          <nav className="foot-links" aria-label="Footer">
            <Link href="/about">About</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/principles">Principles</Link>
            <Link href="/demo">Demo</Link>
          </nav>
          <p className="foot-small">Pehchan offers comfort and connection. It does not diagnose, treat or slow dementia.</p>
        </div>
      </div>
    </footer>
  );
}
