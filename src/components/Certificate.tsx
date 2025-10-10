
'use client';

import { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Course } from "@/lib/mock-data";
import { Download, Printer, Loader2 } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from "react-qr-code";

interface CertificateProps {
  course: Course;
  userName: string;
}

export function Certificate({ course, userName }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const certificateId = `${course.id}-${Date.now()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Manda_Network_Certificate_${course.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="font-sans">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mb-4 print:hidden">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4"/>
          Print
        </Button>
        <Button onClick={handleDownload} disabled={isDownloading}>
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4"/>
          )}
          Download PDF
        </Button>
      </div>

      {/* Certificate Container */}
      <div 
        ref={certificateRef} 
        className="max-w-5xl mx-auto bg-white border-[12px] border-gray-800 p-12 shadow-2xl relative aspect-[1.414/1] print:shadow-none print:border-4"
      >
        {/* Inner Accent Border */}
        <div className="absolute inset-0 border-4 border-red-600 m-6 rounded-xl"></div>

        {/* Watermark Seal */}
        <div className="absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none">
          <img 
            src="/seal.png" 
            alt="Watermark Seal" 
            className="w-2/3 h-auto object-contain"
          />
        </div>

        {/* Certificate Content */}
        <div className="relative z-10 flex flex-col h-full text-center">
          
          {/* Logo + Header */}
          <div className="flex justify-between items-center mb-8 print:mb-4">
            <img src="/logo.png" alt="Academy Logo" className="h-12 md:h-16" />
            <p className="text-xl md:text-2xl text-gray-600 uppercase tracking-widest">
              Certificate of Completion
            </p>
            <div className="w-12"></div> {/* Spacer */}
          </div>

          {/* Recipient Section */}
          <div className="flex-grow flex flex-col justify-center">
            <p className="text-lg text-gray-700 mb-2">This certificate is proudly presented to</p>
            <h1 className="text-5xl md:text-7xl font-bold text-green-700 my-4 underline underline-offset-4">
              {userName}
            </h1>
            <p className="text-lg text-gray-700 mt-2">
              for successfully completing the online course
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4">
              {course.title}
            </h2>
          </div>

          {/* Signatures + QR */}
          <div className="flex justify-between items-end mt-12 text-sm">
            {/* Instructor */}
            <div className="text-center w-1/3">
              <img src="/signatures/instructor.png" alt="Instructor Signature" className="h-12 mx-auto mb-2" />
              <hr className="border-gray-400 mx-auto w-3/4"/>
              <p className="uppercase text-gray-500 mt-2 tracking-wider">Instructor</p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <QRCode value={`https://academy.com/verify/${certificateId}`} size={80} />
              <p className="text-[10px] text-gray-500 mt-1">Scan to Verify</p>
            </div>

            {/* Director */}
            <div className="text-center w-1/3">
              <img src="/signatures/director.png" alt="Director Signature" className="h-12 mx-auto mb-2" />
              <hr className="border-gray-400 mx-auto w-3/4"/>
              <p className="uppercase text-gray-500 mt-2 tracking-wider">Academic Director</p>
            </div>
          </div>

          {/* Footer Info */}
          <p className="text-[10px] md:text-xs text-gray-500 mt-6">
            Issued on: {new Date().toLocaleDateString('en-GB')} | Certificate ID: {certificateId}
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body, html {
            background-color: white;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
