"use client";

export default function PrintButton() {
  return (
    <button className="fa-btn sm-print" onClick={() => window.print()}>
      Print or save as PDF
    </button>
  );
}
