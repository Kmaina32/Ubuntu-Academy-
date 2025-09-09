
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Program } from '@/lib/mock-data';
import { Layers } from 'lucide-react';

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0">
        <Link href={`/programs/${program.id}`}>
          <div className="relative w-full h-48">
            <Image
              src={program.certificateImageUrl}
              alt={program.title}
              fill
              className="object-cover"
              data-ai-hint="certificate program"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <Badge variant="secondary" className="mb-2 flex items-center gap-1 w-fit">
            <Layers className="h-3 w-3" />
            {program.courseIds.length} Courses
        </Badge>
        <CardTitle className="text-xl mb-2 font-headline">{program.title}</CardTitle>
        <p className="text-muted-foreground text-sm line-clamp-3">{program.description}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
         <Button asChild className="w-full">
            <Link href={`/programs/${program.id}`}>View Program</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
