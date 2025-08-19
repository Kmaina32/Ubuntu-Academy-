'use client';

import { Button } from "@/components/ui/button";
import { Course, user } from "@/lib/mock-data";
import { Download, Camera } from "lucide-react";

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
            <div className="max-w-4xl mx-auto bg-white border border-gray-200 shadow-lg relative">
                
                {/* Decorative Shapes */}
                <div className="absolute top-0 left-0 w-1/4 h-1/4 bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}>
                   <div className="w-full h-full bg-purple-100" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                </div>
                 <div className="absolute top-0 left-0 w-1/4 h-1/4" style={{ clipPath: 'polygon(0 0, 90% 0, 0 90%)' }}>
                   <div className="w-full h-full bg-[#7C5985]" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                </div>


                <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-white" style={{ clipPath: 'polygon(100% 100%, 0% 100%, 100% 0%)' }}>
                    <div className="w-full h-full bg-purple-100" style={{ clipPath: 'polygon(100% 100%, 0% 100%, 100% 0%)' }}></div>
                </div>
                 <div className="absolute bottom-0 right-0 w-1/4 h-1/4" style={{ clipPath: 'polygon(100% 100%, 10% 100%, 100% 10%)' }}>
                    <div className="w-full h-full bg-[#7C5985]" style={{ clipPath: 'polygon(100% 100%, 0% 100%, 100% 0%)' }}></div>
                </div>

                {/* Seal */}
                <div className="absolute top-8 right-16 w-20 h-28">
                    <svg width="80" height="112" viewBox="0 0 80 112" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M40 8C22.33 8 8 22.33 8 40C8 57.67 22.33 72 40 72C57.67 72 72 57.67 72 40C72 22.33 57.67 8 40 8Z" fill="#7C5985"/>
                        <path d="M40 16C26.75 16 16 26.75 16 40C16 53.25 26.75 64 40 64C53.25 64 64 53.25 64 40C64 26.75 53.25 16 40 16Z" fill="#8E6F97"/>
                        <path d="M28 72H52V112L40 96L28 112V72Z" fill="#7C5985"/>
                    </svg>
                </div>
                
                <div className="p-12 md:p-20 text-center relative z-10">
                    <h1 className="text-5xl font-extrabold text-gray-800 tracking-wider">CERTIFICATE</h1>
                    <p className="text-xl font-semibold text-gray-700 mt-1">OF ACHIEVEMENT</p>
                    
                    <p className="mt-12 text-gray-600">This certificate is presented to</p>
                    
                    <h2 className="text-6xl font-signature text-gray-800 my-4">{user.name}</h2>
                    <hr className="w-1/2 mx-auto border-gray-300"/>

                    <p className="mt-8 text-gray-600">
                        by Mkenya Skilled for successfully completing
                    </p>
                    <p className="text-xl font-bold text-gray-800 mt-2 tracking-wide uppercase">
                        {course.title}
                    </p>

                    <div className="flex justify-between items-end mt-20 text-gray-600">
                       <div className="text-left">
                            <p className="font-bold">{new Date().toLocaleDateString('en-GB')}</p>
                            <hr className="border-gray-400"/>
                            <p className="text-sm uppercase">Date</p>
                       </div>
                       <div className="text-right">
                            <div className="flex items-center justify-end gap-2 text-gray-500">
                                <Camera className="h-8 w-8" />
                                <span className="text-2xl font-bold">Mkenya Skilled</span>
                            </div>
                       </div>
                    </div>
                </div>

                 <div className="absolute bottom-4 right-8 text-xs text-gray-400 z-10">
                    Certification n°0000000014
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
                    border: none !important;
                }
                body * {
                    visibility: hidden;
                }
                .container, .container * {
                    visibility: visible;
                }
                .container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
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
