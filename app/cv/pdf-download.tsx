"use client";

import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const PDFDownload = () => (
  <div className="px-10 py-5 text-center text-sm tracking-tight">
    <a download="Yan-Sern-CV.pdf" href="/cv-yansern.pdf">
      <FontAwesomeIcon className="-mt-1 h-1 w-1" icon={faDownload} />{" "}
      <span className="font-semibold">Download</span>{" "}
      <span className="text-black">this resume in PDF format.</span>
    </a>
  </div>
);

export default PDFDownload;
