import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, Search, Edit, Archive, Filter, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

type Faculty = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  phone: string;
  hireDate: string;
  status: 'active' | 'archived';
};

type FacultyModuleProps = {
  user: any;
};

export function FacultyModule({ user }: FacultyModuleProps) {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState<Partial<Faculty>>({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
    phone: '',
    hireDate: '',
    status: 'active'
  });

  const departments = JSON.parse(localStorage.getItem('xenjonDepartments') || '[]');

  useEffect(() => {
    loadFaculty();
  }, []);

  useEffect(() => {
    filterFaculty();
  }, [faculty, searchTerm, departmentFilter]);

  const loadFaculty = () => {
    const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
    const facultyData = JSON.parse(localStorage.getItem('xenjonFaculty') || '[]');
    
    // Merge user data with faculty details
    const mergedFaculty = users
      .filter((u: any) => u.role === 'faculty')
      .map((user: any) => {
        const details = facultyData.find((f: any) => f.id === user.id) || {};
        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          department: details.department || 'Engineering',
          position: details.position || 'Assistant Professor',
          phone: details.phone || '+1 (555) 123-4567',
          hireDate: details.hireDate || '2024-01-01',
          status: details.status || 'active'
        };
      });

    setFaculty(mergedFaculty);
  };

  const filterFaculty = () => {
    let filtered = faculty.filter(f => f.status === 'active');

    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(f => f.department === departmentFilter);
    }

    setFilteredFaculty(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
  };

  const generateId = () => {
    const existingIds = faculty
      .map(f => parseInt(f.id.slice(3)))
      .filter(id => !isNaN(id));
    const nextId = Math.max(0, ...existingIds) + 1;
    return `FAC${nextId.toString().padStart(3, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const facultyData = JSON.parse(localStorage.getItem('xenjonFaculty') || '[]');
    const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
    
    if (editingFaculty) {
      // Update existing faculty
      const updatedFaculty = faculty.map(f =>
        f.id === editingFaculty.id ? { ...f, ...formData } as Faculty : f
      );
      setFaculty(updatedFaculty);

      // Update faculty details storage
      const facultyIndex = facultyData.findIndex((f: any) => f.id === editingFaculty.id);
      if (facultyIndex >= 0) {
        facultyData[facultyIndex] = { ...facultyData[facultyIndex], ...formData };
      } else {
        facultyData.push({ id: editingFaculty.id, ...formData });
      }
      localStorage.setItem('xenjonFaculty', JSON.stringify(facultyData));

      // Update main users storage
      const userIndex = users.findIndex((u: any) => u.id === editingFaculty.id);
      if (userIndex >= 0) {
        users[userIndex] = {
          ...users[userIndex],
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        };
        localStorage.setItem('xenjonUsers', JSON.stringify(users));
      }
    } else {
      // Add new faculty
      const newId = generateId();
      const newFaculty: Faculty = {
        ...formData as Faculty,
        id: newId
      };
      
      setFaculty([...faculty, newFaculty]);
      
      // Add to faculty details storage
      facultyData.push(newFaculty);
      localStorage.setItem('xenjonFaculty', JSON.stringify(facultyData));

      // Add to users storage
      const newUser = {
        id: newId,
        username: `${formData.firstName}${formData.lastName}${Math.floor(Math.random() * 1000)}`,
        email: formData.email,
        password: `${formData.firstName}123!`,
        role: 'faculty',
        firstName: formData.firstName,
        lastName: formData.lastName,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('xenjonUsers', JSON.stringify(users));
    }

    resetForm();
  };

  const handleArchive = (facultyId: string) => {
    const updatedFaculty = faculty.map(f =>
      f.id === facultyId ? { ...f, status: 'archived' as const } : f
    );
    setFaculty(updatedFaculty);

    const facultyData = JSON.parse(localStorage.getItem('xenjonFaculty') || '[]');
    const updatedDetails = facultyData.map((f: any) =>
      f.id === facultyId ? { ...f, status: 'archived' } : f
    );
    localStorage.setItem('xenjonFaculty', JSON.stringify(updatedDetails));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      position: '',
      phone: '',
      hireDate: '',
      status: 'active'
    });
    setEditingFaculty(null);
    setIsAddDialogOpen(false);
  };

  const startEdit = (f: Faculty) => {
    setFormData(f);
    setEditingFaculty(f);
    setIsAddDialogOpen(true);
  };

  const canModify = user?.role === 'admin';

  return (
    <div className="min-h-full" style={{ backgroundColor: '#B3E5FC' }}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Faculty Management</h1>
            <p className="text-muted-foreground">Manage faculty members and their information</p>
          </div>
          {canModify && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Faculty
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
                  <DialogDescription>
                    {editingFaculty ? 'Update faculty member information and details.' : 'Fill in the information to add a new faculty member to the system.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select 
                        value={formData.department} 
                        onValueChange={(value) => setFormData({ ...formData, department: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept: any) => (
                            <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Select 
                        value={formData.position} 
                        onValueChange={(value) => setFormData({ ...formData, position: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Professor">Professor</SelectItem>
                          <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                          <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                          <SelectItem value="Lecturer">Lecturer</SelectItem>
                          <SelectItem value="Instructor">Instructor</SelectItem>
                          <SelectItem value="Department Head">Department Head</SelectItem>
                          <SelectItem value="Dean">Dean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hireDate">Hire Date</Label>
                      <Input
                        id="hireDate"
                        type="date"
                        value={formData.hireDate}
                        onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="md:w-56">
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name.length > 30 ? `${dept.name.substring(0, 30)}...` : dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={resetFilters}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Faculty Table */}
        <Card>
          <CardHeader>
            <CardTitle>Faculty Members ({filteredFaculty.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredFaculty.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No faculty members found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Hire Date</TableHead>
                      {canModify && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFaculty.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-mono">{f.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{f.firstName} {f.lastName}</p>
                          </div>
                        </TableCell>
                        <TableCell>{f.email}</TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <Badge variant="outline" className="text-xs">
                              {f.department.length > 25 ? `${f.department.substring(0, 25)}...` : f.department}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{f.position}</Badge>
                        </TableCell>
                        <TableCell>{f.phone}</TableCell>
                        <TableCell>{new Date(f.hireDate).toLocaleDateString()}</TableCell>
                        {canModify && (
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(f)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleArchive(f.id)}
                              >
                                <Archive className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}