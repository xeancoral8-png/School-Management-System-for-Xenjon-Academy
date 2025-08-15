import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, Edit, Archive, BookOpen, Building, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

type Course = {
  id: string;
  name: string;
  department: string;
  code: string;
  credits: number;
  description: string;
  status: 'active' | 'archived';
};

type Department = {
  id: string;
  name: string;
  head: string;
  description: string;
  established: string;
  status: 'active' | 'archived';
};

type AcademicYear = {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  semester: string;
  status: 'active' | 'archived';
};

type SystemSettingsProps = {
  user: any;
};

export function SystemSettings({ user }: SystemSettingsProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [activeTab, setActiveTab] = useState('courses');
  
  // Dialog states
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false);
  
  // Edit states
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  
  // Form states
  const [courseForm, setCourseForm] = useState<Partial<Course>>({
    name: '', department: '', code: '', credits: 0, description: '', status: 'active'
  });
  const [departmentForm, setDepartmentForm] = useState<Partial<Department>>({
    name: '', head: '', description: '', established: '', status: 'active'
  });
  const [yearForm, setYearForm] = useState<Partial<AcademicYear>>({
    year: '', startDate: '', endDate: '', semester: '', status: 'active'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load courses
    const courseData = JSON.parse(localStorage.getItem('xenjonCourses') || '[]');
    const coursesWithStatus = courseData.map((course: any) => ({
      ...course,
      code: course.code || `${course.name.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 1000)}`,
      credits: course.credits || 3,
      description: course.description || `${course.name} course description`,
      status: course.status || 'active'
    }));
    setCourses(coursesWithStatus);

    // Load departments
    const deptData = JSON.parse(localStorage.getItem('xenjonDepartments') || '[]');
    const departmentsWithStatus = deptData.map((dept: any) => ({
      ...dept,
      description: dept.description || `${dept.name} department`,
      established: dept.established || '2020-01-01',
      status: dept.status || 'active'
    }));
    setDepartments(departmentsWithStatus);

    // Load or create academic years
    let yearData = JSON.parse(localStorage.getItem('xenjonAcademicYears') || '[]');
    if (yearData.length === 0) {
      yearData = [
        {
          id: 'AY2024-1',
          year: '2024-2025',
          startDate: '2024-09-01',
          endDate: '2025-01-31',
          semester: 'Fall 2024',
          status: 'active'
        },
        {
          id: 'AY2024-2',
          year: '2024-2025',
          startDate: '2025-02-01',
          endDate: '2025-06-30',
          semester: 'Spring 2025',
          status: 'active'
        }
      ];
      localStorage.setItem('xenjonAcademicYears', JSON.stringify(yearData));
    }
    setAcademicYears(yearData);
  };

  // Course functions
  const generateCourseId = () => {
    const existingIds = courses.map(c => parseInt(c.id.slice(2))).filter(id => !isNaN(id));
    const nextId = Math.max(0, ...existingIds) + 1;
    return `CS${nextId.toString().padStart(3, '0')}`;
  };

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCourse) {
      const updatedCourses = courses.map(c =>
        c.id === editingCourse.id ? { ...c, ...courseForm } as Course : c
      );
      setCourses(updatedCourses);
      localStorage.setItem('xenjonCourses', JSON.stringify(updatedCourses));
    } else {
      const newCourse: Course = {
        ...courseForm as Course,
        id: generateCourseId()
      };
      const updatedCourses = [...courses, newCourse];
      setCourses(updatedCourses);
      localStorage.setItem('xenjonCourses', JSON.stringify(updatedCourses));
    }

    resetCourseForm();
  };

  const resetCourseForm = () => {
    setCourseForm({ name: '', department: '', code: '', credits: 0, description: '', status: 'active' });
    setEditingCourse(null);
    setIsCourseDialogOpen(false);
  };

  const startEditCourse = (course: Course) => {
    setCourseForm(course);
    setEditingCourse(course);
    setIsCourseDialogOpen(true);
  };

  const archiveCourse = (courseId: string) => {
    const updatedCourses = courses.map(c =>
      c.id === courseId ? { ...c, status: 'archived' as const } : c
    );
    setCourses(updatedCourses);
    localStorage.setItem('xenjonCourses', JSON.stringify(updatedCourses));
  };

  // Department functions
  const generateDepartmentId = () => {
    const existingIds = departments.map(d => parseInt(d.id.slice(3))).filter(id => !isNaN(id));
    const nextId = Math.max(0, ...existingIds) + 1;
    return `DEP${nextId.toString().padStart(3, '0')}`;
  };

  const handleDepartmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDepartment) {
      const updatedDepartments = departments.map(d =>
        d.id === editingDepartment.id ? { ...d, ...departmentForm } as Department : d
      );
      setDepartments(updatedDepartments);
      localStorage.setItem('xenjonDepartments', JSON.stringify(updatedDepartments));
    } else {
      const newDepartment: Department = {
        ...departmentForm as Department,
        id: generateDepartmentId()
      };
      const updatedDepartments = [...departments, newDepartment];
      setDepartments(updatedDepartments);
      localStorage.setItem('xenjonDepartments', JSON.stringify(updatedDepartments));
    }

    resetDepartmentForm();
  };

  const resetDepartmentForm = () => {
    setDepartmentForm({ name: '', head: '', description: '', established: '', status: 'active' });
    setEditingDepartment(null);
    setIsDepartmentDialogOpen(false);
  };

  const startEditDepartment = (department: Department) => {
    setDepartmentForm(department);
    setEditingDepartment(department);
    setIsDepartmentDialogOpen(true);
  };

  const archiveDepartment = (departmentId: string) => {
    const updatedDepartments = departments.map(d =>
      d.id === departmentId ? { ...d, status: 'archived' as const } : d
    );
    setDepartments(updatedDepartments);
    localStorage.setItem('xenjonDepartments', JSON.stringify(updatedDepartments));
  };

  // Academic Year functions
  const generateYearId = () => {
    const existingIds = academicYears.map(y => parseInt(y.id.slice(2).split('-')[0])).filter(id => !isNaN(id));
    const nextId = Math.max(2023, ...existingIds) + 1;
    return `AY${nextId}-1`;
  };

  const handleYearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingYear) {
      const updatedYears = academicYears.map(y =>
        y.id === editingYear.id ? { ...y, ...yearForm } as AcademicYear : y
      );
      setAcademicYears(updatedYears);
      localStorage.setItem('xenjonAcademicYears', JSON.stringify(updatedYears));
    } else {
      const newYear: AcademicYear = {
        ...yearForm as AcademicYear,
        id: generateYearId()
      };
      const updatedYears = [...academicYears, newYear];
      setAcademicYears(updatedYears);
      localStorage.setItem('xenjonAcademicYears', JSON.stringify(updatedYears));
    }

    resetYearForm();
  };

  const resetYearForm = () => {
    setYearForm({ year: '', startDate: '', endDate: '', semester: '', status: 'active' });
    setEditingYear(null);
    setIsYearDialogOpen(false);
  };

  const startEditYear = (year: AcademicYear) => {
    setYearForm(year);
    setEditingYear(year);
    setIsYearDialogOpen(true);
  };

  const archiveYear = (yearId: string) => {
    const updatedYears = academicYears.map(y =>
      y.id === yearId ? { ...y, status: 'archived' as const } : y
    );
    setAcademicYears(updatedYears);
    localStorage.setItem('xenjonAcademicYears', JSON.stringify(updatedYears));
  };

  const canModify = user?.role === 'admin';

  if (!canModify) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>You don't have permission to access system settings.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-full" style={{ backgroundColor: '#F0F8FF' }}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="mb-2">System Settings</h1>
          <p className="text-muted-foreground">Manage courses, departments, and academic years</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="academic-years">Academic Years</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Course Management
                  </CardTitle>
                </div>
                <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetCourseForm(); setIsCourseDialogOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCourseSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="courseName">Course Name</Label>
                          <Input
                            id="courseName"
                            value={courseForm.name}
                            onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="courseCode">Course Code</Label>
                          <Input
                            id="courseCode"
                            value={courseForm.code}
                            onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="courseDepartment">Department</Label>
                          <Input
                            id="courseDepartment"
                            value={courseForm.department}
                            onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="courseCredits">Credits</Label>
                          <Input
                            id="courseCredits"
                            type="number"
                            value={courseForm.credits}
                            onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="courseDescription">Description</Label>
                        <Input
                          id="courseDescription"
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={resetCourseForm}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingCourse ? 'Update Course' : 'Add Course'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.filter(c => c.status === 'active').map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-mono">{course.code}</TableCell>
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell>{course.department}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>
                          <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                            {course.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => startEditCourse(course)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => archiveCourse(course.id)}>
                              <Archive className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Department Management
                  </CardTitle>
                </div>
                <Dialog open={isDepartmentDialogOpen} onOpenChange={setIsDepartmentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetDepartmentForm(); setIsDepartmentDialogOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingDepartment ? 'Edit Department' : 'Add New Department'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleDepartmentSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="deptName">Department Name</Label>
                        <Input
                          id="deptName"
                          value={departmentForm.name}
                          onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="deptHead">Department Head</Label>
                          <Input
                            id="deptHead"
                            value={departmentForm.head}
                            onChange={(e) => setDepartmentForm({ ...departmentForm, head: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="deptEstablished">Established Date</Label>
                          <Input
                            id="deptEstablished"
                            type="date"
                            value={departmentForm.established}
                            onChange={(e) => setDepartmentForm({ ...departmentForm, established: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="deptDescription">Description</Label>
                        <Input
                          id="deptDescription"
                          value={departmentForm.description}
                          onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={resetDepartmentForm}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingDepartment ? 'Update Department' : 'Add Department'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Head</TableHead>
                      <TableHead>Established</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.filter(d => d.status === 'active').map((department) => (
                      <TableRow key={department.id}>
                        <TableCell className="font-medium">{department.name}</TableCell>
                        <TableCell>{department.head}</TableCell>
                        <TableCell>{new Date(department.established).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={department.status === 'active' ? 'default' : 'secondary'}>
                            {department.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => startEditDepartment(department)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => archiveDepartment(department.id)}>
                              <Archive className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic-years" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Academic Year Management
                  </CardTitle>
                </div>
                <Dialog open={isYearDialogOpen} onOpenChange={setIsYearDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetYearForm(); setIsYearDialogOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Academic Year
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingYear ? 'Edit Academic Year' : 'Add New Academic Year'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleYearSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="yearName">Academic Year</Label>
                          <Input
                            id="yearName"
                            value={yearForm.year}
                            onChange={(e) => setYearForm({ ...yearForm, year: e.target.value })}
                            placeholder="2024-2025"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="semester">Semester</Label>
                          <Input
                            id="semester"
                            value={yearForm.semester}
                            onChange={(e) => setYearForm({ ...yearForm, semester: e.target.value })}
                            placeholder="Fall 2024"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={yearForm.startDate}
                            onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={yearForm.endDate}
                            onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={resetYearForm}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingYear ? 'Update Academic Year' : 'Add Academic Year'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {academicYears.filter(y => y.status === 'active').map((year) => (
                      <TableRow key={year.id}>
                        <TableCell className="font-medium">{year.year}</TableCell>
                        <TableCell>{year.semester}</TableCell>
                        <TableCell>{new Date(year.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(year.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={year.status === 'active' ? 'default' : 'secondary'}>
                            {year.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => startEditYear(year)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => archiveYear(year.id)}>
                              <Archive className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}