import React from 'react';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

type User = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'faculty' | 'student';
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  createdAt: string;
};

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Welcome to Xenjon Academy</h2>
          <p className="text-sm text-muted-foreground">School Management System</p>
        </div>
      </div>
    </div>
  );
}