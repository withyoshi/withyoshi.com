"use client";
import { SiteProvider } from "../lib/site-context";
import Footer from "./home/footer";
import Header from "./home/header";
import Main from "./home/main";

function HomeContent() {
  return (
    <div className="min-h-screen overflow-hidden">
      <Header />
      <Main />
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <SiteProvider>
      <HomeContent />
    </SiteProvider>
  );
}
