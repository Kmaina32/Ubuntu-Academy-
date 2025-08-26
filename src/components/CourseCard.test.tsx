
import { render, screen } from '@testing-library/react'
import { CourseCard } from './CourseCard'
import type { Course } from '@/lib/mock-data'

const mockCourse: Course = {
  id: 'test-course',
  title: 'Test Course Title',
  instructor: 'Test Instructor',
  category: 'Testing',
  description: 'A short course description.',
  longDescription: 'A much longer course description for the detail page.',
  price: 1000,
  imageUrl: 'https://placehold.co/600x400',
  duration: '1 Week',
  dripFeed: 'off',
  modules: [],
  exam: [],
  createdAt: new Date().toISOString(),
};

describe('CourseCard', () => {
  it('renders course details correctly', () => {
    render(<CourseCard course={mockCourse} isEnrolled={false} aiHint="test" />)

    expect(screen.getByText(mockCourse.title)).toBeInTheDocument()
    expect(screen.getByText(mockCourse.category)).toBeInTheDocument()
    expect(screen.getByText('Ksh 1,000')).toBeInTheDocument()
    expect(screen.getByText(mockCourse.description)).toBeInTheDocument()
  });

  it('renders "View Course" button when not enrolled', () => {
    render(<CourseCard course={mockCourse} isEnrolled={false} aiHint="test" />)
    const button = screen.getByRole('link', { name: /View Course/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('href', `/courses/${mockCourse.id}`)
  });

  it('renders "Go to Course" button when enrolled', () => {
    render(<CourseCard course={mockCourse} isEnrolled={true} aiHint="test" />)
    const button = screen.getByRole('link', { name: /Go to Course/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('href', `/courses/${mockCourse.id}/learn`)
  });

  it('displays "Free" for a course with a price of 0', () => {
    const freeCourse = { ...mockCourse, price: 0 };
    render(<CourseCard course={freeCourse} isEnrolled={false} aiHint="test" />);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });
});
