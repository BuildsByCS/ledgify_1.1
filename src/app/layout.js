import "./globals.css";
import SmoothScroll from "./components/utils/SmoothScroll";
import ScrollIndicator from "./components/utils/ScrollIndicator";
import Footer from "./components/Footer";
import GridBackground from "./components/background/GridBackground";

export const metadata = {
  title: "Ledgify",
  description: "Ledgify - Your Financial Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SmoothScroll>
          <GridBackground />
          <ScrollIndicator />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
