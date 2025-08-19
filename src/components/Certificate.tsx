
'use client';

import { Button } from "@/components/ui/button";
import { Course, user } from "@/lib/mock-data";
import { Download } from "lucide-react";

interface CertificateProps {
  course: Course;
}

export function Certificate({ course }: CertificateProps) {

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 font-sans print:bg-white">
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-end mb-4 print:hidden">
                <Button onClick={handlePrint}>
                    <Download className="mr-2 h-4 w-4"/>
                    Download / Print
                </Button>
            </div>
            <div className="max-w-4xl mx-auto bg-white border-8 border-primary p-10 shadow-2xl relative aspect-[1.414/1]">
                <div className="absolute inset-0 border-2 border-accent m-3"></div>
                <div className="relative z-10 flex flex-col h-full text-center">

                    <div className="mb-8">
                        <p className="text-xl text-muted-foreground uppercase tracking-widest">Certificate of Completion</p>
                    </div>

                    <div className="flex-grow flex flex-col justify-center">
                        <p className="text-lg text-foreground mb-2">This certificate is proudly presented to</p>
                        <h1 className="text-7xl font-signature text-primary my-4">{user.name}</h1>
                        <p className="text-lg text-foreground mt-2">
                            for successfully completing the online course
                        </p>
                        <h2 className="text-4xl font-bold text-foreground mt-4 font-headline">
                            {course.title}
                        </h2>
                    </div>

                    <div className="flex justify-between items-end mt-16">
                        <div className="text-center w-1/3">
                            <p className="font-signature text-3xl text-gray-800">{course.instructor}</p>
                            <hr className="border-gray-400 mt-1 mx-auto w-3/4"/>
                            <p className="text-sm uppercase text-gray-500 mt-2 tracking-wider">Instructor</p>
                        </div>

                        <div className="w-36 h-36">
                             <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="48" fill="#F5EEFF" stroke="#9D4EDD" strokeWidth="2"/>
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#9D4EDD" strokeWidth="1" strokeDasharray="4 2"/>
                                <text x="50" y="35" fontFamily="PT Sans, sans-serif" fontSize="8" textAnchor="middle" fill="#5A189A" fontWeight="bold">MKENYA SKILLED</text>
                                <text x="50" y="48" fontFamily="PT Sans, sans-serif" fontSize="12" textAnchor="middle" fill="#5A189A" fontWeight="bold">OFFICIAL</text>
                                <text x="50" y="60" fontFamily="PT Sans, sans-serif" fontSize="12" textAnchor="middle" fill="#5A189A" fontWeight="bold">SEAL</text>
                                <text x="50" y="75" fontFamily="PT Sans, sans-serif" fontSize="8" textAnchor="middle" fill="#5A189A" fontWeight="bold">EST. 2024</text>
                                <path d="M 20 50 A 30 30 0 0 1 80 50" fill="none"/>
                            </svg>
                        </div>
                        
                        <div className="text-center w-1/3">
                             <p className="font-signature text-3xl text-gray-800">A. Omolo</p>
                            <hr className="border-gray-400 mt-1 mx-auto w-3/4"/>
                            <p className="text-sm uppercase text-gray-500 mt-2 tracking-wider">Academic Director</p>
                       </div>
                    </div>
                     <p className="text-xs text-gray-400 mt-6">Issued on: {new Date().toLocaleDateString('en-GB')} | Certificate ID: 123-456-789</p>
                </div>
            </div>
        </div>
        <style jsx global>{`
            @media print {
                body, html {
                    background-color: white;
                }
                .container {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    max-width: 100%;
                }
                .bg-gray-100 {
                    background-color: white !important;
                }
                .shadow-2xl {
                    box-shadow: none !important;
                }
                .border-primary {
                    border-color: #9D4EDD !important;
                }
                .border-accent {
                    border-color: #E94560 !important;
                }
                body * {
                    visibility: hidden;
                }
                .max-w-4xl, .max-w-4xl * {
                    visibility: visible;
                }
                .max-w-4xl {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 2.5rem;
                    box-sizing: border-box;
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
