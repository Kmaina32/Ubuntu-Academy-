
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/lib/mock-data';
import { Check } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  aiHint: string;
}

export function CourseCard({ course, isEnrolled, aiHint }: CourseCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0">
        <Image
          src={course.imageUrl}
          alt={course.title}
          width={600}
          height={400}
          className="w-full h-48 object-cover"
          data-ai-hint={aiHint}
        />
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <Badge variant="secondary" className="mb-2">{course.category}</Badge>
        <CardTitle className="text-xl mb-2 font-headline">{course.title}</CardTitle>
        <p className="text-muted-foreground text-sm">{course.description}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <p className="text-lg font-bold text-primary">
          {course.price > 0 ? `Ksh ${course.price.toLocaleString()}` : 'Free'}
        </p>
        {isEnrolled ? (
            <Button disabled variant="outline">
                <Check className="mr-2 h-4 w-4" />
                Enrolled
            </Button>
        ) : (
            <Button asChild>
                <Link href={`/courses/${course.id}`}>View Course</Link>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
