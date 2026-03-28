import "./globals.css";
import SmoothScroll from "./components/utils/SmoothScroll";
import ScrollIndicator from "./components/utils/ScrollIndicator";
import Footer from "./components/Footer";
import GridBackground from "./components/background/GridBackground";
import NavBar from "./components/NavBar";
import StoreProvider from "./StoreProvider";

export const metadata = {
  title: "Ledgify",
  description: "Ledgify - Your Financial Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
       <div className="max-w-[1920px] mx-auto">
        <StoreProvider>
          <SmoothScroll>
            <GridBackground />
            <ScrollIndicator />
            <NavBar />
            {children}
            <Footer />
          </SmoothScroll>
        </StoreProvider>
       </div>
      </body>
    </html>
  );
}

