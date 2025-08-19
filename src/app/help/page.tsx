
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { HelpCircle } from "lucide-react";

export default function HelpPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto bg-secondary p-3 rounded-full w-fit mb-4">
                    <HelpCircle className="h-8 w-8 text-secondary-foreground" />
                </div>
              <CardTitle className="text-2xl font-headline">Help Center</CardTitle>
              <CardDescription>Find answers to your questions.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Our comprehensive help center is being built. Please check back soon!</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
