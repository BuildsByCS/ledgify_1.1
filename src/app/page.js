import CardSection from "./components/Home/CardSection";
import CtaSection from "./components/Home/CtaSection";
import Info from "./components/Home/Info";
import Landing from "./components/Home/Landing";
import Trust from "./components/Home/Trust";

export default function Home() {
  return (
    <main className="px-[clamp(1rem,calc(0.8rem+3vw),4rem)]">
      <Landing />
      <Info />
      <CardSection />
      <Trust />
      <CtaSection />
    </main>
  );
}
