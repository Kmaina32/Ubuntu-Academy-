import type { MetadataRoute } from 'next';
import { getAllCourses, getAllPrograms } from '@/lib/firebase-service';
import { slugify } from '@/lib/utils';

const BASE_URL = 'https://mkenya-skilled.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch dynamic data
  const courses = await getAllCourses();
  const programs = await getAllPrograms();

  const courseEntries: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${BASE_URL}/courses/${slugify(course.title)}`,
    lastModified: new Date(course.createdAt),
    changeFrequency: 'weekly',
  }));
  
  const programEntries: MetadataRoute.Sitemap = programs.map((program) => ({
    url: `${BASE_URL}/programs/${program.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
  }));

  // Define static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
        url: `${BASE_URL}/programs`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
        url: `${BASE_URL}/help`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    },
    {
        url: `${BASE_URL}/for-business`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    }
  ];

  return [
    ...staticRoutes,
    ...courseEntries,
    ...programEntries,
  ];
}
