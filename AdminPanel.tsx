import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { UserCog, Eye, EyeOff, Shield, Users, GraduationCap, Key, RefreshCw, Trash2, Search, Settings, Database, Activity, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { AccountCreationForm } from './admin/AccountCreationForm';
import { UserManagementTable } from './admin/UserManagementTable';

type AdminPanelProps = {
  user: any;
};

export function AdminPanel({ user }: AdminPanelProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [passwordLogs, setPasswordLogs] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Default passwords by role
  const defaultPasswords = {
    admin: 'Admin123!',
    faculty: 'Faculty123!',
    student: 'Student123!'
  };

  useEffect(() => {
    loadUsers();
    loadPasswordLogs();
  }, []);

  const loadUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
    setUsers(allUsers);
  };

  const loadPasswordLogs = () => {
    const logs = JSON.parse(localStorage.getItem('xenjonPasswordLogs') || '[]');
    setPasswordLogs(logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  const handlePasswordVisibilityToggle = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredUserIds = filteredUsers.map(u => u.id);
      setSelectedUsers(filteredUserIds);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleChangePassword = (user: any) => {
    // Create a password reset log for this specific user
    const resetLog = {
      id: `PWD${Date.now()}_${user.id}`,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'Individual Password Reset',
      timestamp: new Date().toISOString(),
      changedBy: `${user.firstName} ${user.lastName} (Admin)`
    };

    const updatedUser = {
      ...user,
      password: defaultPasswords[user.role as keyof typeof defaultPasswords] || 'DefaultPass123!',
      lastUpdated: new Date().toISOString()
    };

    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    
    localStorage.setItem('xenjonUsers', JSON.stringify(updatedUsers));
    
    const existingLogs = JSON.parse(localStorage.getItem('xenjonPasswordLogs') || '[]');
    localStorage.setItem('xenjonPasswordLogs', JSON.stringify([resetLog, ...existingLogs]));
    
    setUsers(updatedUsers);
    loadPasswordLogs();
    
    toast.success(`Password for ${user.firstName} ${user.lastName} has been reset! 🔑`);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
  };

  const handleResetAllPasswords = async () => {
    setIsResetting(true);
    
    try {
      // Reset all user passwords to defaults
      const updatedUsers = users.map(u => ({
        ...u,
        password: defaultPasswords[u.role as keyof typeof defaultPasswords] || 'DefaultPass123!',
        lastUpdated: new Date().toISOString()
      }));

      localStorage.setItem('xenjonUsers', JSON.stringify(updatedUsers));

      // Create password reset logs for all users
      const resetLogs = users.map(u => ({
        id: `PWD${Date.now()}_${u.id}`,
        userId: u.id,
        userName: `${u.firstName} ${u.lastName}`,
        action: 'Password Reset to Default',
        timestamp: new Date().toISOString(),
        changedBy: `${user.firstName} ${user.lastName} (Admin)`
      }));

      const existingLogs = JSON.parse(localStorage.getItem('xenjonPasswordLogs') || '[]');
      localStorage.setItem('xenjonPasswordLogs', JSON.stringify([...resetLogs, ...existingLogs]));

      setUsers(updatedUsers);
      loadPasswordLogs();
      setIsResetDialogOpen(false);
      
      toast.success(`All ${users.length} account passwords have been reset to defaults! 🔄`);
    } catch (error) {
      toast.error('Failed to reset passwords');
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetSelectedPasswords = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setIsResetting(true);

    try {
      const updatedUsers = users.map(u => {
        if (selectedUsers.includes(u.id)) {
          return {
            ...u,
            password: defaultPasswords[u.role as keyof typeof defaultPasswords] || 'DefaultPass123!',
            lastUpdated: new Date().toISOString()
          };
        }
        return u;
      });

      localStorage.setItem('xenjonUsers', JSON.stringify(updatedUsers));

      // Create password reset logs for selected users
      const resetLogs = selectedUsers.map(userId => {
        const userData = users.find(u => u.id === userId);
        return {
          id: `PWD${Date.now()}_${userId}`,
          userId: userId,
          userName: userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown User',
          action: 'Password Reset to Default (Selected)',
          timestamp: new Date().toISOString(),
          changedBy: `${user.firstName} ${user.lastName} (Admin)`
        };
      });

      const existingLogs = JSON.parse(localStorage.getItem('xenjonPasswordLogs') || '[]');
      localStorage.setItem('xenjonPasswordLogs', JSON.stringify([...resetLogs, ...existingLogs]));

      setUsers(updatedUsers);
      loadPasswordLogs();
      setSelectedUsers([]);
      setIsResetDialogOpen(false);
      
      toast.success(`${selectedUsers.length} account password(s) have been reset to defaults! 🔄`);
    } catch (error) {
      toast.error('Failed to reset selected passwords');
    } finally {
      setIsResetting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getUserStats = () => {
    return {
      total: users.length,
      admin: users.filter(u => u.role === 'admin').length,
      faculty: users.filter(u => u.role === 'faculty').length,
      student: users.filter(u => u.role === 'student').length,
      activeToday: users.filter(u => {
        const lastActive = new Date(u.lastUpdated || u.createdAt);
        const today = new Date();
        return lastActive.toDateString() === today.toDateString();
      }).length
    };
  };

  const stats = getUserStats();

  return (
    <div className="min-h-full" style={{ backgroundColor: '#F5F5DC' }}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Admin Panel ⚙️</h1>
            <p className="text-muted-foreground">
              Manage users, passwords, and system administration
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faculty</CardTitle>
              <UserCog className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.faculty}</div>
              <p className="text-xs text-muted-foreground">Faculty members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.student}</div>
              <p className="text-xs text-muted-foreground">Enrolled students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admin}</div>
              <p className="text-xs text-muted-foreground">System admins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Today</CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeToday}</div>
              <p className="text-xs text-muted-foreground">Users online</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="accounts">User Accounts</TabsTrigger>
            <TabsTrigger value="passwords">Password Management</TabsTrigger>
            <TabsTrigger value="create">Create Account</TabsTrigger>
            <TabsTrigger value="logs">Password Logs</TabsTrigger>
          </TabsList>

          {/* User Accounts Tab */}
          <TabsContent value="accounts">
            <UserManagementTable 
              users={filteredUsers}
              searchTerm={searchTerm}
              roleFilter={roleFilter}
              showPasswords={showPasswords}
              onSearchChange={setSearchTerm}
              onRoleFilterChange={setRoleFilter}
              onResetFilters={handleResetFilters}
              onTogglePassword={handlePasswordVisibilityToggle}
              onChangePassword={handleChangePassword}
            />
          </TabsContent>

          {/* Password Management Tab */}
          <TabsContent value="passwords">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Password Management
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      View and reset user passwords. All password changes are logged.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedUsers.length > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset Selected ({selectedUsers.length})
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset Selected Passwords?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will reset the passwords for {selectedUsers.length} selected account(s) to their default values. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleResetSelectedPasswords}
                              disabled={isResetting}
                            >
                              {isResetting ? 'Resetting...' : 'Reset Passwords'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reset All Passwords
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset All Passwords?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will reset ALL {users.length} user passwords to their default values:
                            <br />• Admin accounts: "Admin123!"
                            <br />• Faculty accounts: "Faculty123!"
                            <br />• Student accounts: "Student123!"
                            <br /><br />This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleResetAllPasswords}
                            disabled={isResetting}
                          >
                            {isResetting ? 'Resetting...' : 'Reset All Passwords'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Select Controls */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all" className="text-sm">
                      Select All ({filteredUsers.length})
                    </Label>
                  </div>
                </div>

                {/* Password Table */}
                <div className="border rounded-lg">
                  <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 font-medium text-sm">
                    <div className="col-span-1">Select</div>
                    <div className="col-span-3">User</div>
                    <div className="col-span-2">Role</div>
                    <div className="col-span-4">Password</div>
                    <div className="col-span-2">Actions</div>
                  </div>
                  <Separator />
                  <ScrollArea className="h-96">
                    {filteredUsers.map((userData) => (
                      <div key={userData.id} className="grid grid-cols-12 gap-4 p-3 border-b last:border-b-0 items-center">
                        <div className="col-span-1">
                          <Checkbox
                            checked={selectedUsers.includes(userData.id)}
                            onCheckedChange={(checked) => handleUserSelection(userData.id, checked as boolean)}
                          />
                        </div>
                        
                        <div className="col-span-3">
                          <div>
                            <p className="font-medium">{userData.firstName} {userData.lastName}</p>
                            <p className="text-xs text-muted-foreground">{userData.email}</p>
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          <Badge variant="outline">
                            {userData.role}
                          </Badge>
                        </div>
                        
                        <div className="col-span-4">
                          <div className="flex items-center gap-2">
                            <Input
                              type={showPasswords[userData.id] ? 'text' : 'password'}
                              value={userData.password}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePasswordVisibilityToggle(userData.id)}
                            >
                              {showPasswords[userData.id] ? 
                                <EyeOff className="w-4 h-4" /> : 
                                <Eye className="w-4 h-4" />
                              }
                            </Button>
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUsers([userData.id]);
                              handleResetSelectedPasswords();
                            }}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Reset
                          </Button>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>

                {selectedUsers.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {selectedUsers.length} user(s) selected for password reset
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Account Tab */}
          <TabsContent value="create">
            <AccountCreationForm 
              onAccountCreated={() => {
                loadUsers();
                toast.success('Account created successfully!');
              }}
            />
          </TabsContent>

          {/* Password Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Password Change Logs
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Complete history of all password changes and resets
                </p>
              </CardHeader>
              <CardContent>
                {passwordLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No password logs yet</p>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {passwordLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {log.action.includes('Reset') ? 
                              <RefreshCw className="w-4 h-4 text-primary" /> :
                              <Key className="w-4 h-4 text-primary" />
                            }
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">{log.action}</h5>
                            <p className="text-sm text-muted-foreground">
                              User: {log.userName} • Changed by: {log.changedBy}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}