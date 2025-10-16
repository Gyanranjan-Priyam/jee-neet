import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Portal - JEE-NEET Preparation',
  description: 'Student dashboard for JEE and NEET preparation with comprehensive study materials, practice tests, and progress tracking.',
};

interface StudentLayoutProps {
  children: ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}