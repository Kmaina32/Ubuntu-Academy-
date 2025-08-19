export interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  description: string;
  longDescription: string;
  price: number;
  imageUrl: string;
  modules: Module[];
  exam: {
    question: string;
    referenceAnswer: string;
    maxPoints: number;
  }
}

export const courses: Course[] = [
  {
    id: 'digital-marketing-101',
    title: 'Digital Marketing 101',
    instructor: 'Asha Juma',
    description: 'Master the fundamentals of digital marketing and grow your business online.',
    longDescription: 'This comprehensive course covers everything from SEO and social media marketing to email campaigns and content strategy. Designed for beginners and aspiring entrepreneurs in Kenya, you will learn practical skills to build a strong online presence and drive sales.',
    price: 4999,
    imageUrl: 'https://placehold.co/600x400',
    modules: [
      {
        id: 'module-1',
        title: 'Introduction to Digital Marketing',
        lessons: [
          { id: 'l1', title: 'What is Digital Marketing?', duration: '10 min', content: 'An overview of the digital marketing landscape.' },
          { id: 'l2', title: 'Understanding the Sales Funnel', duration: '15 min', content: 'Learn about TOFU, MOFU, and BOFU stages.' },
        ],
      },
      {
        id: 'module-2',
        title: 'Search Engine Optimization (SEO)',
        lessons: [
          { id: 'l3', title: 'On-Page SEO Basics', duration: '25 min', content: 'Optimizing your website content for search engines.' },
          { id: 'l4', title: 'Introduction to Link Building', duration: '20 min', content: 'How to get quality backlinks.' },
        ],
      },
    ],
    exam: {
      question: "You are hired to improve the online presence for a new local coffee shop in Nairobi. Outline a basic digital marketing strategy for their first three months, mentioning at least two different channels you would use and why.",
      referenceAnswer: "For a new local coffee shop in Nairobi, a good 3-month strategy would focus on building local awareness and driving foot traffic. I would prioritize two main channels: Social Media (Instagram/Facebook) and Local SEO (Google Business Profile). For social media, I'd create visually appealing posts of the coffee, ambiance, and special offers, using targeted ads for the local area. This builds a community and brand identity. For Local SEO, optimizing their Google Business Profile is crucial. This means ensuring accurate address/hours, encouraging customer reviews, and posting updates. This will make them appear in 'near me' searches, which is vital for a local business.",
      maxPoints: 10
    }
  },
  {
    id: 'mobile-app-dev-react-native',
    title: 'Mobile App Development with React Native',
    instructor: 'David Mwangi',
    description: 'Build cross-platform mobile apps for iOS and Android with React Native.',
    longDescription: 'Dive into the world of mobile development. This course takes you from setting up your development environment to building and deploying a complete mobile application. You will learn about components, state management, navigation, and accessing native device features. No prior mobile development experience required, but JavaScript knowledge is essential.',
    price: 7500,
    imageUrl: 'https://placehold.co/600x400',
    modules: [
      {
        id: 'module-1',
        title: 'Getting Started with React Native',
        lessons: [
          { id: 'l1', title: 'Setup and Environment', duration: '30 min', content: 'Installing all required tools.' },
          { id: 'l2', title: 'Core Components', duration: '45 min', content: 'View, Text, Image, and more.' },
        ],
      },
    ],
    exam: {
      question: "Explain the concept of 'state' in React Native and provide a simple example of how you would use the `useState` hook to manage a counter in a component.",
      referenceAnswer: "In React Native, 'state' is an object that holds data that can change over the course of a component's lifecycle. When the state changes, the component re-renders to display the updated information. The `useState` hook is the primary way to manage state in functional components. To create a counter, you would initialize state like this: `const [count, setCount] = useState(0);`. 'count' holds the current value (initially 0), and 'setCount' is the function to update it. A button's `onPress` could call `setCount(count + 1)` to increment the value, and the new count would be displayed in a `<Text>` component: `<Text>{count}</Text>`.",
      maxPoints: 10
    }
  },
  {
    id: 'graphic-design-canva',
    title: 'Graphic Design for Everyone with Canva',
    instructor: 'Fatuma Ali',
    description: 'Create stunning graphics for social media, presentations, and more using Canva.',
    longDescription: 'Unleash your creativity without complex software. This course teaches you all the tips and tricks to become a Canva pro. Learn about design principles, color theory, typography, and how to use Canva\'s powerful features to create professional-looking designs in minutes. Perfect for marketers, small business owners, and students.',
    price: 2500,
    imageUrl: 'https://placehold.co/600x400',
    modules: [],
    exam: {
      question: "Describe three key principles of good design that you can apply when creating a social media post in Canva to promote an event. Explain why each is important.",
      referenceAnswer: "Three key principles are Hierarchy, Contrast, and Repetition. Hierarchy is about arranging elements to show their order of importance; for an event post, the event title should be the most prominent, followed by date/time, then other details. This guides the viewer's eye. Contrast helps elements stand out from each other; for example, using a bold, large font for the headline against a simpler background, or using a bright color for a call-to-action button. This draws attention to key information. Repetition involves reusing elements like colors, fonts, or shapes to create a sense of unity and brand consistency. This makes the design look professional and cohesive.",
      maxPoints: 10
    }
  }
];

export const user = {
    name: 'Jomo Kenyatta',
    purchasedCourses: [
        { courseId: 'digital-marketing-101', progress: 50, completed: false, certificateAvailable: false },
        { courseId: 'graphic-design-canva', progress: 100, completed: true, certificateAvailable: true }
    ]
}

export type UserCourse = typeof user.purchasedCourses[0];
