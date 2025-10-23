import { Course } from '@/lib/types'

interface CourseContentProps {
  course: Course
}

export function CourseContent({ course }: CourseContentProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{course.title}</h1>
      <div className="prose dark:prose-invert max-w-none">
        {/* Course content sections will go here */}
      </div>
    </div>
  )
}