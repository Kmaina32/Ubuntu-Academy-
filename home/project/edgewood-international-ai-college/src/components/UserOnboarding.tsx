
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, BookOpen, LayoutDashboard, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { getHeroData } from '@/lib/firebase-service';
import { usePathname } from 'next/navigation';

const onboardingSteps = [
    {
        icon: <LayoutDashboard className="h-10 w-10 text-primary" />,
        title: "Welcome to your Dashboard!",
        description: "This is your personal space where you can track your progress, see your completed courses, and manage your learning goals."
    },
    {
        icon: <BookOpen className="h-10 w-10 text-primary" />,
        title: "Explore Courses",
        description: "Visit the main page to browse our full catalog of courses. When you enroll in a course, it will appear on your dashboard."
    },
    {
        icon: <User className="h-10 w-10 text-primary" />,
        title: "Build Your Profile",
        description: "Head to your profile to build your portfolio, showcase your projects, and attract potential employers."
    }
];

const ONBOARDING_STORAGE_KEY = 'manda_onboarding_completed';

export function UserOnboarding() {
    const { user } = useAuth();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await getHeroData();
            setIsEnabled(settings.onboardingEnabled || false);
        };
        fetchSettings();
        
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'mkenya-skilled-onboarding') {
                setIsEnabled(event.newValue === 'true');
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        // Show tutorial only on the dashboard for logged-in users who haven't seen it
        if (isEnabled && user && pathname === '/dashboard') {
            const hasCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY);
            if (!hasCompleted) {
                // Add a small delay to allow the dashboard to render first
                setTimeout(() => setIsOpen(true), 1000);
            }
        }
    }, [isEnabled, user, pathname]);

    const handleNext = () => {
        if (step < onboardingSteps.length - 1) {
            setStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (step > 0) {
            setStep(prev => prev - 1);
        }
    };

    const handleClose = () => {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
        setIsOpen(false);
    };
    
    if (!isOpen) {
        return null;
    }

    const currentStep = onboardingSteps[step];
    const progress = ((step + 1) / onboardingSteps.length) * 100;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md" onEscapeKeyDown={handleClose}>
                <DialogHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        {currentStep.icon}
                    </div>
                    <DialogTitle className="text-2xl font-headline">{currentStep.title}</DialogTitle>
                    <DialogDescription className="px-4">
                        {currentStep.description}
                    </DialogDescription>
                </DialogHeader>
                <div className="px-6 py-4">
                    <Progress value={progress} className="w-full h-2" />
                </div>
                <DialogFooter className="flex-row justify-between sm:justify-between w-full">
                    <Button variant="ghost" onClick={handleClose}>Skip</Button>
                    <div className="flex gap-2">
                        {step > 0 && (
                            <Button variant="outline" onClick={handlePrev}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Previous
                            </Button>
                        )}
                        <Button onClick={handleNext}>
                            {step === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
                            {step < onboardingSteps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
