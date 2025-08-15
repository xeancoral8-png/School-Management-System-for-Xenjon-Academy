import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, Search, Edit, Archive, RotateCcw } from 'lucide-react';

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  course: string;
  department: string;
  year: string;
  phone: string;
  enrollmentDate: string;
  status: 'active' | 'archived';
};

type StudentModuleProps = {
  user: any;
};

export function StudentModule({ user }: StudentModuleProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({
    firstName: '',
    lastName: '',
    email: '',
    course: '',
    department: '',
    year: '',
    phone: '',
    enrollmentDate: '',
    status: 'active'
  });

  // Available courses filtered by selected department
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);

  const courses = JSON.parse(localStorage.getItem('xenjonCourses') || '[]');
  const departments = JSON.parse(localStorage.getItem('xenjonDepartments') || '[]');

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, courseFilter, departmentFilter]);

  // Update available courses when department is selected in form
  useEffect(() => {
    if (formData.department) {
      const departmentCourses = courses.filter((course: any) => course.department === formData.department);
      setAvailableCourses(departmentCourses);
      
      // Clear course selection if the current course doesn't belong to the new department
      if (formData.course && !departmentCourses.some((course: any) => course.name === formData.course)) {
        setFormData(prev => ({ ...prev, course: '' }));
      }
    } else {
      setAvailableCourses([]);
    }
  }, [formData.department, courses]);

  const loadStudents = () => {
    const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
    const studentData = JSON.parse(localStorage.getItem('xenjonStudents') || '[]');
    
    // Merge user data with student details
    const mergedStudents = users
      .filter((u: any) => u.role === 'student')
      .map((user: any) => {
        const details = studentData.find((s: any) => s.id === user.id) || {};
        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          course: details.course || 'Bachelor of Science in Computer Science (BSCS)',
          department: details.department || 'Information Technology / Computer Studies',
          year: details.year || '2024',
          phone: details.phone || '+1 (555) 123-4567',
          enrollmentDate: details.enrollmentDate || '2024-01-01',
          status: details.status || 'active'
        };
      });

    setStudents(mergedStudents);
  };

  const filterStudents = () => {
    let filtered = students.filter(s => s.status === 'active');

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (courseFilter !== 'all') {
      filtered = filtered.filter(s => s.course === courseFilter);
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(s => s.department === departmentFilter);
    }

    setFilteredStudents(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCourseFilter('all');
    setDepartmentFilter('all');
  };

  const generateId = () => {
    const existingIds = students
      .map(s => parseInt(s.id.slice(3)))
      .filter(id => !isNaN(id));
    const nextId = Math.max(0, ...existingIds) + 1;
    return `STU${nextId.toString().padStart(3, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const studentData = JSON.parse(localStorage.getItem('xenjonStudents') || '[]');
    const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
    
    if (editingStudent) {
      // Update existing student
      const updatedStudents = students.map(s =>
        s.id === editingStudent.id ? { ...s, ...formData } as Student : s
      );
      setStudents(updatedStudents);

      // Update student details storage
      const studentIndex = studentData.findIndex((s: any) => s.id === editingStudent.id);
      if (studentIndex >= 0) {
        studentData[studentIndex] = { ...studentData[studentIndex], ...formData };
      } else {
        studentData.push({ id: editingStudent.id, ...formData });
      }
      localStorage.setItem('xenjonStudents', JSON.stringify(studentData));

      // Update main users storage
      const userIndex = users.findIndex((u: any) => u.id === editingStudent.id);
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
      // Add new student
      const newId = generateId();
      const newStudent: Student = {
        ...formData as Student,
        id: newId
      };
      
      setStudents([...students, newStudent]);
      
      // Add to student details storage
      studentData.push(newStudent);
      localStorage.setItem('xenjonStudents', JSON.stringify(studentData));

      // Add to users storage
      const newUser = {
        id: newId,
        username: `${formData.firstName}${formData.lastName}${Math.floor(Math.random() * 1000)}`,
        email: formData.email,
        password: `${formData.firstName}123!`,
        role: 'student',
        firstName: formData.firstName,
        lastName: formData.lastName,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('xenjonUsers', JSON.stringify(users));
    }

    resetForm();
  };

  const handleArchive = (studentId: string) => {
    const updatedStudents = students.map(s =>
      s.id === studentId ? { ...s, status: 'archived' as const } : s
    );
    setStudents(updatedStudents);

    const studentData = JSON.parse(localStorage.getItem('xenjonStudents') || '[]');
    const updatedDetails = studentData.map((s: any) =>
      s.id === studentId ? { ...s, status: 'archived' } : s
    );
    localStorage.setItem('xenjonStudents', JSON.stringify(updatedDetails));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      course: '',
      department: '',
      year: '',
      phone: '',
      enrollmentDate: '',
      status: 'active'
    });
    setEditingStudent(null);
    setIsAddDialogOpen(false);
    setAvailableCourses([]);
  };

  const startEdit = (s: Student) => {
    setFormData(s);
    setEditingStudent(s);
    setIsAddDialogOpen(true);
    
    // Set available courses for the selected department
    if (s.department) {
      const departmentCourses = courses.filter((course: any) => course.department === s.department);
      setAvailableCourses(departmentCourses);
    }
  };

  const handleDepartmentChange = (value: string) => {
    setFormData({ ...formData, department: value, course: '' });
  };

  const canModify = user?.role === 'admin';

  return (
    <div className="min-h-full" style={{ backgroundColor: '#C1E1C1' }}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Student Management</h1>
            <p className="text-muted-foreground">Manage student records and enrollment</p>
          </div>
          {canModify && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                  <DialogDescription>
                    {editingStudent ? 'Update student information and enrollment details.' : 'Fill in the information to add a new student to the system. Select a department first to see available courses.'}
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
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={handleDepartmentChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department first" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="course">Course</Label>
                    <Select 
                      value={formData.course} 
                      onValueChange={(value) => setFormData({ ...formData, course: value })}
                      disabled={!formData.department}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.department ? "Select course" : "Select department first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCourses.map((course: any) => (
                          <SelectItem key={course.id} value={course.name}>{course.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year">Academic Year</Label>
                      <Select 
                        value={formData.year} 
                        onValueChange={(value) => setFormData({ ...formData, year: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2026">2026</SelectItem>
                          <SelectItem value="2027">2027</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                    <Input
                      id="enrollmentDate"
                      type="date"
                      value={formData.enrollmentDate}
                      onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingStudent ? 'Update Student' : 'Add Student'}
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
              <div className="md:w-48">
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-48">
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course: any) => (
                      <SelectItem key={course.id} value={course.name}>
                        {course.name.length > 50 ? `${course.name.substring(0, 50)}...` : course.name}
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

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Students ({filteredStudents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No students found</p>
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
                      <TableHead>Course</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Enrollment Date</TableHead>
                      {canModify && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono">{s.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{s.firstName} {s.lastName}</p>
                          </div>
                        </TableCell>
                        <TableCell>{s.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{s.department}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <Badge variant="outline" className="text-xs">
                              {s.course.length > 40 ? `${s.course.substring(0, 40)}...` : s.course}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{s.year}</TableCell>
                        <TableCell>{s.phone}</TableCell>
                        <TableCell>{new Date(s.enrollmentDate).toLocaleDateString()}</TableCell>
                        {canModify && (
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(s)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleArchive(s.id)}
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