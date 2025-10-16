import { NextResponse } from 'next/server';

export async function GET() {
  const courses = [
    {
      id: '1',
      title: 'Complete JEE Main & Advanced 2024',
      instructor: 'Dr. Rajesh Kumar',
      imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
      badge: 'Bestseller',
      rating: 4.8,
      studentsEnrolled: 45000,
      duration: '12 months',
      price: 15999,
      originalPrice: 25999
    },
    {
      id: '2',
      title: 'NEET Biology Masterclass',
      instructor: 'Dr. Priya Singh',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
      badge: 'New',
      rating: 4.9,
      studentsEnrolled: 32000,
      duration: '10 months',
      price: 12999,
      originalPrice: 19999
    },
    {
      id: '3',
      title: 'Physics for JEE & NEET',
      instructor: 'Prof. Amit Sharma',
      imageUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=300&fit=crop',
      rating: 4.7,
      studentsEnrolled: 28000,
      duration: '8 months',
      price: 9999,
      originalPrice: 14999
    },
    {
      id: '4',
      title: 'Chemistry Complete Course',
      instructor: 'Dr. Neha Agarwal',
      imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop',
      rating: 4.6,
      studentsEnrolled: 25000,
      duration: '9 months',
      price: 11999,
      originalPrice: 17999
    },
    {
      id: '5',
      title: 'Mathematics for Competitive Exams',
      instructor: 'Prof. Suresh Gupta',
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
      badge: 'Popular',
      rating: 4.8,
      studentsEnrolled: 38000,
      duration: '11 months',
      price: 13999,
      originalPrice: 21999
    },
    {
      id: '6',
      title: 'UPSC Prelims Strategy',
      instructor: 'Dr. Kavita Mishra',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      rating: 4.5,
      studentsEnrolled: 22000,
      duration: '6 months',
      price: 8999,
      originalPrice: 13999
    },
    {
      id: '7',
      title: 'Foundation Mathematics Class 10',
      instructor: 'Prof. Ravi Verma',
      imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
      rating: 4.7,
      studentsEnrolled: 18000,
      duration: '12 months',
      price: 6999,
      originalPrice: 9999
    },
    {
      id: '8',
      title: 'Class 12 Physics Boards',
      instructor: 'Dr. Sanjay Khanna',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
      rating: 4.6,
      studentsEnrolled: 15000,
      duration: '10 months',
      price: 7999,
      originalPrice: 11999
    }
  ];

  return NextResponse.json(courses);
}