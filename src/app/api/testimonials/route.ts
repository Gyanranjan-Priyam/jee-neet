import { NextResponse } from 'next/server';

export async function GET() {
  const testimonials = [
    {
      id: '1',
      studentName: 'Rahul Sharma',
      examCleared: 'JEE Advanced 2024',
      quote: 'EduLearn transformed my preparation journey. The live classes and doubt-solving sessions were incredibly helpful. I couldn\'t have cracked JEE without their guidance.',
      rating: 5,
      verified: true,
      videoUrl: 'https://example.com/testimonial1.mp4',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face'
    },
    {
      id: '2',
      studentName: 'Ananya Patel',
      examCleared: 'NEET 2024',
      quote: 'The biology courses by Dr. Priya Singh were exceptional. The way complex topics were explained made everything so clear. Highly recommend EduLearn!',
      rating: 5,
      verified: true,
      imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face'
    },
    {
      id: '3',
      studentName: 'Vikas Kumar',
      examCleared: 'JEE Main 2024',
      quote: 'Affordable pricing with premium quality education. The mock tests helped me identify my weak areas and improve consistently.',
      rating: 5,
      verified: true,
      videoUrl: 'https://example.com/testimonial3.mp4',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
    },
    {
      id: '4',
      studentName: 'Priyanka Singh',
      examCleared: 'NEET 2024',
      quote: 'The comprehensive study material and regular assessments kept me on track. Thank you EduLearn for making my dream come true!',
      rating: 4,
      verified: true,
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face'
    },
    {
      id: '5',
      studentName: 'Arjun Gupta',
      examCleared: 'JEE Advanced 2024',
      quote: 'The physics courses were mind-blowing. Complex concepts were made so simple to understand. I scored 98% in physics!',
      rating: 5,
      verified: true,
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face'
    },
    {
      id: '6',
      studentName: 'Sneha Reddy',
      examCleared: 'NEET 2024',
      quote: 'The 24/7 doubt support was a game-changer for me. Whenever I was stuck, help was just a click away. Amazing platform!',
      rating: 5,
      verified: true,
      videoUrl: 'https://example.com/testimonial6.mp4',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face'
    }
  ];

  return NextResponse.json(testimonials);
}