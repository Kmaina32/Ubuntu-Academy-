
'use client';

import { Button } from "@/components/ui/button";
import { Course } from "@/lib/mock-data";
import { Download } from "lucide-react";

interface CertificateProps {
  course: Course;
  userName: string;
}

export function Certificate({ course, userName }: CertificateProps) {

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="font-sans">
        <div className="flex justify-end mb-4 print:hidden">
            <Button onClick={handlePrint}>
                <Download className="mr-2 h-4 w-4"/>
                Download / Print
            </Button>
        </div>
        <div className="max-w-4xl mx-auto bg-white border-8 border-black p-10 shadow-2xl relative aspect-[1.414/1] print:shadow-none print:border-4">
            <div className="absolute inset-0 border-2 border-red-600 m-3 print:border-1"></div>
            <div className="relative z-10 flex flex-col h-full text-center">

                <div className="mb-8 print:mb-4">
                    <p className="text-xl text-gray-500 uppercase tracking-widest print:text-base">Certificate of Completion</p>
                </div>

                <div className="flex-grow flex flex-col justify-center">
                    <p className="text-lg text-black mb-2 print:text-sm">This certificate is proudly presented to</p>
                    <h1 className="text-7xl font-signature text-green-700 my-4 print:text-5xl print:my-2">{userName}</h1>
                    <p className="text-lg text-black mt-2 print:text-sm">
                        for successfully completing the online course
                    </p>
                    <h2 className="text-4xl font-bold text-black mt-4 font-headline print:text-2xl print:mt-2">
                        {course.title}
                    </h2>
                </div>

                <div className="flex justify-between items-end text-sm print:text-xs">
                    <div className="text-center w-1/3">
                        <p className="font-signature text-3xl text-black print:text-2xl">{course.instructor}</p>
                        <hr className="border-gray-400 mt-1 mx-auto w-3/4"/>
                        <p className="uppercase text-gray-500 mt-2 tracking-wider">Instructor</p>
                    </div>

                    <div className="w-36 h-36 print:w-24 print:h-24">
                         <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="48" fill="white" stroke="black" strokeWidth="2"/>
                            <circle cx="50" cy="50" r="42" fill="none" stroke="black" strokeWidth="1" strokeDasharray="4 2"/>
                            <text x="50" y="35" fontFamily="PT Sans, sans-serif" fontSize="8" textAnchor="middle" fill="black" fontWeight="bold">MKENYA SKILLED</text>
                            <text x="50" y="48" fontFamily="PT Sans, sans-serif" fontSize="12" textAnchor="middle" fill="#B91C1C" fontWeight="bold">OFFICIAL</text>
                            <text x="50" y="60" fontFamily="PT Sans, sans-serif" fontSize="12" textAnchor="middle" fill="#15803D" fontWeight="bold">SEAL</text>
                            <text x="50" y="75" fontFamily="PT Sans, sans-serif" fontSize="8" textAnchor="middle" fill="black" fontWeight="bold">EST. 2024</text>
                            <path d="M 20 50 A 30 30 0 0 1 80 50" fill="none"/>
                        </svg>
                    </div>
                    
                    <div className="text-center w-1/3">
                         <p className="font-signature text-3xl text-black print:text-2xl">A. Omolo</p>
                        <hr className="border-gray-400 mt-1 mx-auto w-3/4"/>
                        <p className="uppercase text-gray-500 mt-2 tracking-wider">Academic Director</p>
                   </div>
                </div>
                 <p className="text-xs text-gray-400 mt-6 print:mt-2 print:text-[8px]">Issued on: {new Date().toLocaleDateString('en-GB')} | Certificate ID: 123-456-789</p>
            </div>
        </div>
        <style jsx global>{`
            @media print {
                body, html {
                    background-color: white;
                }
                .bg-secondary {
                    background-color: white !important;
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
