import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { User, Mail, Phone, MapPin, Calendar, Save, Camera, Edit, Eye, EyeOff, Key, Lock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type ProfileProps = {
  user: any;
  onUserUpdate: (user: any) => void;
};

export function Profile({ user, onUserUpdate }: ProfileProps) {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    profilePhoto: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
      const currentUser = users.find((u: any) => u.id === user.id);
      
      setProfileData({
        firstName: currentUser?.firstName || '',
        lastName: currentUser?.lastName || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        bio: currentUser?.bio || '',
        location: currentUser?.location || '',
        profilePhoto: currentUser?.profilePhoto || ''
      });
    }
  }, [user]);

  const handleProfileSave = () => {
    const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    
    if (userIndex !== -1) {
      const updatedUser = {
        ...users[userIndex],
        ...profileData,
        lastUpdated: new Date().toISOString()
      };
      
      users[userIndex] = updatedUser;
      localStorage.setItem('xenjonUsers', JSON.stringify(users));
      
      // Update the current session
      onUserUpdate(updatedUser);
      
      setIsEditingProfile(false);
      toast.success('Profile updated successfully! ✅');
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    setIsLoadingPassword(true);

    try {
      // Get current user data
      const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
      const currentUser = users.find((u: any) => u.id === user.id);

      if (!currentUser) {
        throw new Error('User not found');
      }

      // Verify current password
      if (currentUser.password !== passwordData.currentPassword) {
        throw new Error('Current password is incorrect');
      }

      // Update password permanently
      const updatedUsers = users.map((u: any) => 
        u.id === user.id 
          ? { ...u, password: passwordData.newPassword, lastUpdated: new Date().toISOString() }
          : u
      );

      localStorage.setItem('xenjonUsers', JSON.stringify(updatedUsers));

      // Create password change log
      const passwordLogs = JSON.parse(localStorage.getItem('xenjonPasswordLogs') || '[]');
      passwordLogs.push({
        id: `PWD${Date.now()}`,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        action: 'Password Changed',
        timestamp: new Date().toISOString(),
        changedBy: 'self'
      });
      localStorage.setItem('xenjonPasswordLogs', JSON.stringify(passwordLogs));

      // Update user session
      const updatedUser = { ...user, lastUpdated: new Date().toISOString() };
      onUserUpdate(updatedUser);

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      
      toast.success('Password changed successfully! 🔒');
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a server
      // For demo, we'll use a placeholder URL
      const photoUrl = `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`;
      
      setProfileData(prev => ({
        ...prev,
        profilePhoto: photoUrl
      }));

      // Auto-save photo update
      const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          profilePhoto: photoUrl,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('xenjonUsers', JSON.stringify(users));
        
        onUserUpdate({
          ...user,
          profilePhoto: photoUrl,
          lastUpdated: new Date().toISOString()
        });
      }

      toast.success('Profile photo updated! 📸');
    }
  };

  const getRoleDetails = () => {
    const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
    const students = JSON.parse(localStorage.getItem('xenjonStudents') || '[]');
    const faculty = JSON.parse(localStorage.getItem('xenjonFaculty') || '[]');
    
    const currentUser = users.find((u: any) => u.id === user.id);
    
    if (user.role === 'student') {
      const studentData = students.find((s: any) => s.id === user.id);
      return {
        course: studentData?.course || currentUser?.course || 'Not assigned',
        department: studentData?.department || currentUser?.department || 'Not assigned',
        year: studentData?.year || currentUser?.year || 'Not assigned',
        enrollmentDate: studentData?.enrollmentDate || currentUser?.createdAt || 'Unknown'
      };
    } else if (user.role === 'faculty') {
      const facultyData = faculty.find((f: any) => f.id === user.id);
      return {
        department: facultyData?.department || currentUser?.department || 'Not assigned',
        position: facultyData?.position || 'Faculty Member',
        hireDate: facultyData?.hireDate || currentUser?.createdAt || 'Unknown'
      };
    }
    
    return {};
  };

  const roleDetails = getRoleDetails();

  return (
    <div className="min-h-full" style={{ backgroundColor: '#E6F3FF' }}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">My Profile 👤</h1>
            <p className="text-muted-foreground">
              Manage your account information and settings
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {user.lastUpdated ? new Date(user.lastUpdated).toLocaleString() : 'Unknown'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profileData.profilePhoto} alt="Profile" />
                      <AvatarFallback className="text-2xl">
                        {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/80 transition-colors">
                      <Camera className="w-4 h-4 text-primary-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium">{profileData.firstName} {profileData.lastName}</h3>
                    <Badge variant="outline" className="mt-1">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Quick Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{profileData.email}</span>
                  </div>
                  
                  {profileData.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{profileData.phone}</span>
                    </div>
                  )}
                  
                  {profileData.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{profileData.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Role-specific Information */}
                {user.role !== 'admin' && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium">Academic Information</h4>
                      {user.role === 'student' && (
                        <>
                          <div>
                            <Label className="text-xs text-muted-foreground">Course</Label>
                            <p className="text-sm">{roleDetails.course}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Department</Label>
                            <p className="text-sm">{roleDetails.department}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Academic Year</Label>
                            <p className="text-sm">{roleDetails.year}</p>
                          </div>
                        </>
                      )}
                      {user.role === 'faculty' && (
                        <>
                          <div>
                            <Label className="text-xs text-muted-foreground">Department</Label>
                            <p className="text-sm">{roleDetails.department}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Position</Label>
                            <p className="text-sm">{roleDetails.position}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (isEditingProfile) {
                        handleProfileSave();
                      } else {
                        setIsEditingProfile(true);
                      }
                    }}
                  >
                    {isEditingProfile ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditingProfile}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditingProfile}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditingProfile}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    disabled={!isEditingProfile}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, Country"
                    disabled={!isEditingProfile}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    disabled={!isEditingProfile}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Password Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Password & Security
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Change your password to keep your account secure
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {isChangingPassword ? 'Cancel' : 'Change Password'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isChangingPassword ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Enter your current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Enter new password (min. 8 characters)"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm your new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={handlePasswordChange}
                        disabled={isLoadingPassword}
                        className="flex-1"
                      >
                        {isLoadingPassword ? 'Changing...' : 'Change Password'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground mt-2">
                      💡 Password changes are permanent and will be saved immediately to your account.
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      Click "Change Password" to update your account password
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Last password change: {user.lastUpdated ? new Date(user.lastUpdated).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}