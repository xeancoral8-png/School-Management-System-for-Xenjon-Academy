import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Check, X, ArrowLeft } from 'lucide-react';
import academyLogo from 'figma:asset/423041854a274a303b5abe317732e0f5a6e9a89f.png';

type SignUpFormProps = {
  onSignUp: () => void;
  onBackToLogin: () => void;
};

export function SignUpForm({ onSignUp, onBackToLogin }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateUsername = () => {
    let username = formData.firstName.charAt(0).toUpperCase() + formData.lastName;
    
    // Add random numbers
    for (let i = 0; i < 3; i++) {
      username += Math.floor(Math.random() * 10);
    }
    
    return username;
  };

  const generateId = (role: string) => {
    const prefix = role === 'faculty' ? 'FAC' : 'STU';
    const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
    const existingIds = users
      .filter((u: any) => u.id.startsWith(prefix))
      .map((u: any) => parseInt(u.id.slice(3)));
    
    const nextId = Math.max(0, ...existingIds) + 1;
    return `${prefix}${nextId.toString().padStart(3, '0')}`;
  };

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return value.length >= 2;
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'role':
        return ['faculty', 'student'].includes(value);
      default:
        return false;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
      const username = generateUsername();
      const id = generateId(formData.role);
      const password = `${formData.firstName}123!`;

      // Check if email already exists
      if (users.some((u: any) => u.email === formData.email)) {
        setError('Email already exists');
        setIsLoading(false);
        return;
      }

      const newUser = {
        id,
        username,
        email: formData.email,
        password,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('xenjonUsers', JSON.stringify(users));

      setSuccess(`Account created! Username: ${username}, Password: ${password}`);
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        onSignUp();
      }, 3000);

    } catch (err) {
      setError('An error occurred during registration');
    }

    setIsLoading(false);
  };

  const isFormValid = Object.entries(formData).every(([key, value]) => validateField(key, value));

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={onBackToLogin}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <img 
              src={academyLogo}
              alt="Xenjon Academy Logo" 
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="w-8" /> {/* Spacer for centering */}
          </div>
          <CardTitle>Create New Account</CardTitle>
          <CardDescription>Admin only - Create faculty and student accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="pr-10"
                    placeholder="John"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {formData.firstName && (
                      validateField('firstName', formData.firstName) ? 
                        <Check className="w-5 h-5 text-green-500" /> : 
                        <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="relative">
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="pr-10"
                    placeholder="Smith"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {formData.lastName && (
                      validateField('lastName', formData.lastName) ? 
                        <Check className="w-5 h-5 text-green-500" /> : 
                        <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pr-10"
                  placeholder="john.smith@xenjonacademy.edu"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {formData.email && (
                    validateField('email', formData.email) ? 
                      <Check className="w-5 h-5 text-green-500" /> : 
                      <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
              {formData.role && (
                <div className="flex justify-end">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <Check className="w-4 h-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Account Generation:</h4>
            <ul className="text-sm space-y-1">
              <li>• Username: Auto-generated (FirstnameLastname + 3 digits)</li>
              <li>• Password: Firstname123!</li>
              <li>• ID: Auto-generated (FAC### or STU###)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}