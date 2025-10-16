import { NextResponse } from 'next/server';

export async function GET() {
  const statistics = [
    {
      id: '1',
      icon: 'Users',
      value: '15M+',
      label: 'Students',
      description: 'Learning with us'
    },
    {
      id: '2',
      icon: 'BookOpen',
      value: '10M+',
      label: 'Tests',
      description: 'Taken successfully'
    },
    {
      id: '3',
      icon: 'Clock',
      value: '24/7',
      label: 'Support',
      description: 'Always available'
    },
    {
      id: '4',
      icon: 'MapPin',
      value: '100+',
      label: 'Centers',
      description: 'Across India'
    }
  ];

  return NextResponse.json(statistics);
}