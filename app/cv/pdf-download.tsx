"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

const PDFDownload = () => (
  <div className="px-10 py-5 text-center text-sm tracking-tight">
    You can also{" "}
    <a href="/cv-yansern.pdf" download="Yan-Sern-CV.pdf">
      <FontAwesomeIcon icon={faDownload} className="h-1 w-1" />
      Download my CV
    </a>{" "}
    in PDF format.
  </div>
);

export default PDFDownload;
