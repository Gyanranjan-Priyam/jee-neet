import { NextResponse } from 'next/server';

export async function GET() {
  const features = [
    {
      id: '1',
      title: 'Live Interactive Classes',
      description: 'Join live classes with top educators and interact in real-time'
    },
    {
      id: '2',
      title: 'Download & Watch Offline',
      description: 'Download lectures and study materials to learn without internet'
    },
    {
      id: '3',
      title: 'Personalized Learning',
      description: 'AI-powered recommendations based on your learning pattern'
    },
    {
      id: '4',
      title: 'Mock Tests & Analysis',
      description: 'Take unlimited mock tests with detailed performance analysis'
    },
    {
      id: '5',
      title: '24/7 Doubt Support',
      description: 'Get your doubts resolved anytime by expert teachers'
    }
  ];

  return NextResponse.json(features);
}