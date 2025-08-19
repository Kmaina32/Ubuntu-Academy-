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
    <div className="bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="flex justify-end mb-4 print:hidden">
            <Button onClick={handlePrint}>
                <Download className="mr-2 h-4 w-4"/>
                Download/Print
            </Button>
        </div>
        <div className="p-8 bg-white shadow-2xl" style={{ border: '10px solid', borderImageSlice: 1, borderImageSource: 'linear-gradient(to bottom right, #006233, #000000, #CE1126)'}}>
            <div className="p-4 border-2" style={{borderColor: '#CE1126'}}>
                <div className="text-center space-y-4 text-[#333]">
                    <h1 className="text-5xl font-bold font-headline text-primary" style={{fontFamily: "'PT Sans', sans-serif"}}>Certificate of Completion</h1>
                    
                    <p className="text-lg">This is to certify that</p>
                    
                    <h2 className="text-4xl font-bold text-accent" style={{fontFamily: "'PT Sans', sans-serif"}}>{user.name}</h2>
                    
                    <p className="text-lg">has successfully completed the course</p>
                    
                    <h3 className="text-3xl font-semibold text-primary" style={{fontFamily: "'PT Sans', sans-serif"}}>{course.title}</h3>

                    <div className="flex justify-between items-end pt-8 text-sm">
                        <div className="text-center">
                            <p className="font-bold border-b-2 border-gray-400 pb-1">{course.instructor}</p>
                            <p>Lead Instructor</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold border-b-2 border-gray-400 pb-1">{new Date().toLocaleDateString()}</p>
                            <p>Date of Issue</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
