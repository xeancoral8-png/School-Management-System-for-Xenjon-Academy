import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, GraduationCap, BookOpen, Clock, MapPin, Mail, Phone, Search, MessageSquare, Calendar } from 'lucide-react';

type ClassEnrollment = {
  id: string;
  className: string;
  course: string;
  department: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  students: {
    id: string;
    name: string;
    email: string;
  }[];
  schedule: string;
  location: string;
  semester: string;
  createdAt: string;
};

type ClassesModuleProps = {
  user: any;
};

export function ClassesModule({ user }: ClassesModuleProps) {
  const [enrollments, setEnrollments] = useState<ClassEnrollment[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassEnrollment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadClassEnrollments();
  }, []);

  const loadClassEnrollments = () => {
    const allEnrollments = JSON.parse(localStorage.getItem('xenjonClassEnrollments') || '[]');
    
    let userEnrollments: ClassEnrollment[] = [];
    
    if (user.role === 'faculty') {
      // Faculty sees classes they're teaching
      userEnrollments = allEnrollments.filter((enrollment: ClassEnrollment) => 
        enrollment.instructor.id === user.id
      );
    } else if (user.role === 'student') {
      // Students see classes they're enrolled in
      userEnrollments = allEnrollments.filter((enrollment: ClassEnrollment) => 
        enrollment.students.some(student => student.id === user.id)
      );
    }
    
    setEnrollments(userEnrollments);
    if (userEnrollments.length > 0 && !selectedClass) {
      setSelectedClass(userEnrollments[0]);
    }
  };

  const handleSendMessage = (recipientId: string, recipientName: string) => {
    // Redirect to messaging with pre-filled recipient
    // This would integrate with the messaging system
    console.log(`Send message to ${recipientName} (${recipientId})`);
    // You could dispatch an action or use a callback to switch to messages view
  };

  const filteredClasses = enrollments.filter(enrollment =>
    enrollment.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClassStats = () => {
    const totalClasses = enrollments.length;
    const totalStudents = enrollments.reduce((acc, enrollment) => acc + enrollment.students.length, 0);
    const avgStudentsPerClass = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;
    
    return { totalClasses, totalStudents, avgStudentsPerClass };
  };

  const stats = getClassStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">My Classes</h1>
          <p className="text-muted-foreground">
            {user.role === 'faculty' 
              ? 'Manage your classes and view enrolled students'
              : 'View your enrolled classes and classmates'
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user.role === 'faculty' ? 'Classes Teaching' : 'Enrolled Classes'}
            </CardTitle>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Active classes this semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user.role === 'faculty' ? 'Total Students' : 'Total Classmates'}
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {user.role === 'faculty' ? 'Students across all classes' : 'Classmates in all your classes'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Class Size</CardTitle>
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgStudentsPerClass}</div>
            <p className="text-xs text-muted-foreground">
              Students per class on average
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredClasses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No classes found matching your search' : 'No classes found'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredClasses.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedClass?.id === enrollment.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedClass(enrollment)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-2">{enrollment.className}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {enrollment.course}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                            <Clock className="w-3 h-3" />
                            <span>{enrollment.schedule}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Users className="w-3 h-3" />
                            <span>{enrollment.students.length} students</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Class Details */}
        <div className="lg:col-span-2">
          {selectedClass ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedClass.className}</CardTitle>
                    <p className="text-muted-foreground mt-1">{selectedClass.course}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {selectedClass.schedule}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedClass.location}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{selectedClass.semester}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="students">
                      {user.role === 'faculty' ? 'Students' : 'Classmates'}
                    </TabsTrigger>
                    <TabsTrigger value="instructor">Instructor</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Class Information</h4>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium">Department</Label>
                            <p className="text-sm text-muted-foreground">{selectedClass.department}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Course</Label>
                            <p className="text-sm text-muted-foreground">{selectedClass.course}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Schedule</Label>
                            <p className="text-sm text-muted-foreground">{selectedClass.schedule}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Location</Label>
                            <p className="text-sm text-muted-foreground">{selectedClass.location}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Class Statistics</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span className="text-sm font-medium">Total Students</span>
                            </div>
                            <Badge variant="secondary">{selectedClass.students.length}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm font-medium">Semester</span>
                            </div>
                            <Badge variant="outline">{selectedClass.semester}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="students" className="mt-6">
                    <div>
                      <h4 className="font-medium mb-4">
                        {user.role === 'faculty' ? 'Enrolled Students' : 'Your Classmates'} ({selectedClass.students.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedClass.students.map((student) => (
                          <div key={student.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback>
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h5 className="font-medium">{student.name}</h5>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Mail className="w-3 h-3" />
                                    {student.email}
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendMessage(student.id, student.name)}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="instructor" className="mt-6">
                    <div>
                      <h4 className="font-medium mb-4">Class Instructor</h4>
                      <div className="p-6 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarFallback className="text-lg">
                              {selectedClass.instructor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h5 className="text-lg font-medium">{selectedClass.instructor.name}</h5>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Mail className="w-4 h-4" />
                              {selectedClass.instructor.email}
                            </div>
                            <Badge variant="outline" className="mt-2">
                              Instructor
                            </Badge>
                          </div>
                          {user.role === 'student' && (
                            <Button
                              onClick={() => handleSendMessage(selectedClass.instructor.id, selectedClass.instructor.name)}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Send Message
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a Class</h3>
                <p className="text-muted-foreground">
                  Choose a class from the list to view details and {user.role === 'faculty' ? 'students' : 'classmates'}.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Label({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
      {children}
    </label>
  );
}