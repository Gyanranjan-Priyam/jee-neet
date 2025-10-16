import { NextResponse } from 'next/server';

export async function GET() {
  const categories = [
    {
      id: '1',
      name: 'JEE Main & Advanced',
      description: 'Complete preparation for JEE Main and Advanced with expert guidance',
      slug: 'jee-preparation',
      imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=600&fit=crop'
    },
    {
      id: '2',
      name: 'NEET Preparation',
      description: 'Comprehensive NEET preparation with live classes and doubt solving',
      slug: 'neet-preparation',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop'
    },
    {
      id: '3',
      name: 'UPSC Preparation',
      description: 'Civil Services preparation with current affairs and mock tests',
      slug: 'upsc-preparation',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'
    },
    {
      id: '4',
      name: 'Foundation Courses',
      description: 'Strong foundation building for classes 8th, 9th and 10th',
      slug: 'foundation-courses',
      imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop'
    },
    {
      id: '5',
      name: 'Class 12 Boards',
      description: 'Board exam preparation with comprehensive study material',
      slug: 'class-12-boards',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop'
    }
  ];

  return NextResponse.json(categories);
}