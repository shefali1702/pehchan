// Runs before paint so a returning visitor never sees the splash flash.
export default function SplashGate() {
  const code = `try{document.documentElement.dataset.splash=sessionStorage.getItem("pehchan-splash")?"off":"on"}catch(e){document.documentElement.dataset.splash="off"}`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
