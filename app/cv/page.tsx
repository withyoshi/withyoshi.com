import Chatbot from "./chatbot";
import Footer from "./footer";
import Header from "./header";
import PDFDownloadSection from "./pdf-download";
import Skills from "./skills";
import Summary from "./summary";
import Timeline from "./timeline";

export default function CVPage() {
  return (
    <>
      <div className="bg-white sm:rounded-2xl sm:border-1 sm:border-gray-300 sm:shadow-lg">
        <header className="border-gray-300 border-b-1 p-8 px-4 sm:p-10">
          <Header />
        </header>
        <main>
          <Summary className="p-8 sm:p-10" />
          <Skills className="bg-mint-600 p-2 py-4 sm:p-4" />
          <Timeline className="p-8 sm:p-10" />
        </main>
        <footer>
          <Footer />
        </footer>
      </div>
      <PDFDownloadSection />
      <Chatbot />
    </>
  );
}
