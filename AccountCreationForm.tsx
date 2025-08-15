import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Check, X } from 'lucide-react';

type AccountCreationFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAccount: (formData: any) => void;
};

export function AccountCreationForm({ isOpen, onOpenChange, onCreateAccount }: AccountCreationFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  });
  const [isLoading, setIsLoading] = useState(false);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onCreateAccount(formData);
    resetForm();
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: ''
    });
  };

  const isFormValid = Object.entries(formData).every(([key, value]) => validateField(key, value));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <Input
                  id="firstName"
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
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isLoading}>
              {isLoading ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}