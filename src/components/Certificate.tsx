'use client';

import { Button } from "@/components/ui/button";
import { Course, user } from "@/lib/mock-data";
import { Download, Gem } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CertificateProps {
  course: Course;
}

export function Certificate({ course }: CertificateProps) {

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-secondary font-body print:bg-white">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
            <div className="flex justify-end mb-4 print:hidden">
                <Button onClick={handlePrint}>
                    <Download className="mr-2 h-4 w-4"/>
                    Download / Print
                </Button>
            </div>
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/3 bg-gray-900 p-8 text-white flex flex-col justify-between" style={{backgroundImage: 'linear-gradient(to bottom, #006233, #000000, #CE1126)'}}>
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <Gem className="h-10 w-10 text-white" />
                                <span className="font-bold text-2xl font-headline">Mkenya Skilled</span>
                            </div>
                            <h2 className="text-4xl font-bold font-headline leading-tight">Certificate of Completion</h2>
                        </div>
                        <div className="mt-8">
                            <p className="text-sm opacity-80">Issued on</p>
                            <p className="font-semibold text-lg">{new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="md:w-2/3 p-8 md:p-12 flex flex-col justify-between">
                        <div>
                            <p className="text-lg text-muted-foreground uppercase tracking-wider">This certificate is awarded to</p>
                            <h1 className="text-5xl font-bold text-primary my-2 font-headline">{user.name}</h1>
                            <p className="text-lg text-muted-foreground">for successfully completing the course</p>
                            <h3 className="text-3xl font-semibold text-accent mt-2 font-headline">{course.title}</h3>
                        </div>
                        <div className="mt-12 flex justify-between items-end">
                            <div className="text-sm text-muted-foreground">
                                <p className="font-signature text-4xl text-gray-800 -mb-4">{course.instructor}</p>
                                <p className="font-bold text-card-foreground text-base">{course.instructor}</p>
                                <Separator className="my-1 bg-gray-400" />
                                <p>Lead Instructor</p>
                            </div>
                            <div className="relative h-28 w-28">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="h-full w-full" viewBox="0 0 120 120">
                                        <defs>
                                            <linearGradient id="sealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{stopColor: '#D4AF37', stopOpacity:1}} />
                                            <stop offset="100%" style={{stopColor: '#B8860B', stopOpacity:1}} />
                                            </linearGradient>
                                        </defs>
                                        <circle cx="60" cy="60" r="56" fill="url(#sealGradient)" />
                                        <circle cx="60" cy="60" r="50" fill="transparent" stroke="#fff" strokeWidth="2"/>
                                        <text x="60" y="50" fontFamily="serif" fontSize="10" fill="white" textAnchor="middle">MKENYA SKILLED</text>
                                        <text x="60" y="75" fontFamily="serif" fontSize="10" fill="white" textAnchor="middle">VERIFIED</text>
                                        <Gem className="text-white" x="52" y="55" width="16" height="16" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style jsx global>{`
            @media print {
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
