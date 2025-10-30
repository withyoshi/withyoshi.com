"use client";

import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const pdfUrl =
  "https://oewk5grf1gotrdpu.public.blob.vercel-storage.com/cv-resume-pdf/Yan%20Sern%27s%20Resume%20-%20Full-Stack%20Software%20Engineer%20%28V2%29.pdf";

const PDFDownload = () => (
  <div className="px-10 py-5 text-center text-sm tracking-tight">
    <a
      aria-label="Download Yan Sern's Resume in PDF format"
      className="rounded hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      download="Yan Sern's Resume - Full-Stack Software Engineer (V2).pdf"
      href={pdfUrl}
      target="_blank"
      title="Download Yan Sern's Resume in PDF format"
    >
      <FontAwesomeIcon className="-mt-1 h-1 w-1" icon={faDownload} />{" "}
      <span className="font-semibold">Download</span>{" "}
      <span className="text-black">this resume in PDF format.</span>
    </a>
  </div>
);

export default PDFDownload;
