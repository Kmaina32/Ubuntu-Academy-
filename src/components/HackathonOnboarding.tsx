
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { ArrowRight, ArrowLeft, Trophy, GitBranch, Award } from 'lucide-react';
import { Progress } from './ui/progress';

const onboardingSteps = [
    {
        icon: <Trophy className="h-10 w-10 text-primary" />,
        title: "Find a Hackathon",
        description: "Browse the list of upcoming and live hackathons. Choose one that sparks your interest and fits your skills."
    },
    {
        icon: <GitBranch className="h-10 w-10 text-primary" />,
        title: "Register & Build",
        description: "Register for the event, form your team, and start building your project. Pay close attention to the rules and submission deadlines."
    },
    {
        icon: <Award className="h-10 w-10 text-primary" />,
        title: "Submit & Win",
        description: "Submit your project through the portal before the deadline. Winners are announced and get featured on our leaderboard!"
    }
];

const ONBOARDING_STORAGE_KEY = 'hackathon_onboarding_completed';

export function HackathonOnboarding() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (!hasCompletedOnboarding) {
            setIsOpen(true);
        }
    }, []);

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
