import "./globals.css";
import SmoothScroll from "./components/utils/SmoothScroll";
import ScrollIndicator from "./components/utils/ScrollIndicator";

export const metadata = {
  title: "Ledgify",
  description: "Ledgify - Your Financial Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SmoothScroll>
          <ScrollIndicator />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
