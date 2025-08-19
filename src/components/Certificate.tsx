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
            <div className="max-w-4xl mx-auto bg-white border-4 border-purple-800 p-8 shadow-lg relative aspect-[1.414/1]">
                <div className="absolute inset-0 border-2 border-purple-300 m-2"></div>
                <div className="relative z-10 flex flex-col h-full">

                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold text-purple-900 tracking-wider">
                            Certificate of Completion
                        </h1>
                        <p className="text-xl text-gray-600 mt-2">This certificate is proudly presented to</p>
                    </div>

                    <div className="text-center my-8 flex-grow flex flex-col justify-center">
                        <h2 className="text-7xl font-signature text-purple-800">{user.name}</h2>
                        <p className="text-lg text-gray-600 mt-4">
                            for successfully completing the course
                        </p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-2">
                            {course.title}
                        </h3>
                    </div>

                    <div className="flex justify-between items-end mt-12">
                        <div className="text-center">
                            <p className="font-signature text-2xl text-gray-700">{course.instructor}</p>
                            <hr className="border-gray-400 mt-1"/>
                            <p className="text-sm uppercase text-gray-500">Instructor</p>
                        </div>

                        <div className="w-32 h-32">
                             <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="48" fill="#F5EEFF" stroke="#9D4EDD" strokeWidth="2"/>
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#9D4EDD" strokeWidth="1" strokeDasharray="4 2"/>
                                <text x="50" y="35" fontFamily="PT Sans" fontSize="8" textAnchor="middle" fill="#5A189A" fontWeight="bold">MKENYA SKILLED</text>
                                <text x="50" y="48" fontFamily="PT Sans" fontSize="12" textAnchor="middle" fill="#5A189A" fontWeight="bold">OFFICIAL</text>
                                <text x="50" y="60" fontFamily="PT Sans" fontSize="12" textAnchor="middle" fill="#5A189A" fontWeight="bold">SEAL</text>
                                <text x="50" y="75" fontFamily="PT Sans" fontSize="8" textAnchor="middle" fill="#5A189A" fontWeight="bold">EST. 2024</text>
                                <path d="M 20 50 A 30 30 0 0 1 80 50" fill="none"/>
                            </svg>
                        </div>
                        
                        <div className="text-center">
                             <p className="font-signature text-2xl text-gray-700">Director</p>
                            <hr className="border-gray-400 mt-1"/>
                            <p className="text-sm uppercase text-gray-500">Academic Director</p>
                       </div>
                    </div>
                     <p className="text-xs text-gray-400 text-center mt-4">Issued on: {new Date().toLocaleDateString('en-GB')} | Certificate ID: 123-456-789</p>
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
                .shadow-lg {
                    box-shadow: none !important;
                }
                .border {
                    border-width: 4px !important;
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
                    padding: 2rem;
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
