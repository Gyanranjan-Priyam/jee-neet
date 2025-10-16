"use client";

import { useAuth } from "@/lib/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugUserPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>User ID:</strong> {user?.id || 'Not logged in'}
            </div>
            <div>
              <strong>Email:</strong> {user?.email || 'N/A'}
            </div>
            <div>
              <strong>User Type:</strong> {user?.user_metadata?.user_type || 'Not set'}
            </div>
            <div>
              <strong>Full User Metadata:</strong>
              <pre className="mt-2 p-2 bg-gray-100 rounded">
                {JSON.stringify(user?.user_metadata, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Full User Object:</strong>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs max-h-96 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}