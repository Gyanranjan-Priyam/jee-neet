import { NextResponse } from 'next/server';

export async function GET() {
  const results = [
    {
      id: '1',
      studentName: 'Arjun Sharma',
      examType: 'JEE Advanced',
      achievement: 'Secured admission in IIT Delhi',
      rank: 127,
      percentage: 98.2,
      year: 2024,
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '2',
      studentName: 'Priya Patel',
      examType: 'NEET',
      achievement: 'Secured admission in AIIMS Delhi',
      rank: 45,
      percentage: 99.1,
      year: 2024,
      imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '3',
      studentName: 'Rohit Kumar',
      examType: 'JEE Main',
      achievement: 'Secured admission in NIT Trichy',
      rank: 2453,
      percentage: 96.5,
      year: 2024,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '4',
      studentName: 'Sneha Gupta',
      examType: 'NEET',
      achievement: 'Secured admission in JIPMER',
      rank: 234,
      percentage: 97.8,
      year: 2024,
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '5',
      studentName: 'Vikash Singh',
      examType: 'JEE Advanced',
      achievement: 'Secured admission in IIT Bombay',
      rank: 89,
      percentage: 98.7,
      year: 2024,
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '6',
      studentName: 'Anjali Reddy',
      examType: 'NEET',
      achievement: 'Secured admission in CMC Vellore',
      rank: 156,
      percentage: 98.4,
      year: 2024,
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '7',
      studentName: 'Karan Mehta',
      examType: 'JEE Main',
      achievement: 'Secured admission in IIIT Hyderabad',
      rank: 1876,
      percentage: 95.9,
      year: 2024,
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '8',
      studentName: 'Divya Agarwal',
      examType: 'NEET',
      achievement: 'Secured admission in KGMU Lucknow',
      rank: 567,
      percentage: 96.2,
      year: 2024,
      imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '9',
      studentName: 'Aditya Joshi',
      examType: 'JEE Advanced',
      achievement: 'Secured admission in IIT Madras',
      rank: 298,
      percentage: 97.3,
      year: 2024,
      imageUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face'
    }
  ];

  return NextResponse.json(results);
}