import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, Clock, MapPin, Users, BookOpen, FileText, Plus, Edit, Trash2, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type Lesson = {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  course: string;
  department: string;
  schedule: string;
  duration: number;
  location: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  materials: string[];
  assignments: Assignment[];
  enrolledStudents: string[];
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  submissions: Submission[];
};

type Submission = {
  id: string;
  studentId: string;
  studentName: string;
  content: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
};

type LessonsModuleProps = {
  user: any;
};

export function LessonsModule({ user }: LessonsModuleProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [activeTab, setActiveTab] = useState('lessons');

  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    course: '',
    department: '',
    schedule: '',
    duration: 60,
    location: '',
    materials: ''
  });

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    points: 100
  });

  const [submissionForm, setSubmissionForm] = useState({
    content: ''
  });

  const courses = JSON.parse(localStorage.getItem('xenjonCourses') || '[]');
  const departments = JSON.parse(localStorage.getItem('xenjonDepartments') || '[]');
  const students = JSON.parse(localStorage.getItem('xenjonUsers') || '[]').filter((u: any) => u.role === 'student');

  useEffect(() => {
    loadLessons();
  }, []);

  useEffect(() => {
    filterLessons();
  }, [lessons, user]);

  const loadLessons = () => {
    const allLessons = JSON.parse(localStorage.getItem('xenjonLessons') || '[]');
    setLessons(allLessons);
  };

  const filterLessons = () => {
    let filtered = lessons;

    if (user.role === 'faculty') {
      // Faculty sees only their own lessons
      filtered = filtered.filter(lesson => lesson.instructorId === user.id);
    } else if (user.role === 'student') {
      // Students see only lessons they're enrolled in
      filtered = filtered.filter(lesson => lesson.enrolledStudents.includes(user.id));
    }

    setFilteredLessons(filtered);
  };

  const generateId = (prefix: string) => {
    return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();

    if (user.role !== 'faculty') {
      toast.error('Only faculty can create lessons');
      return;
    }

    const newLesson: Lesson = {
      id: generateId('LES'),
      title: lessonForm.title,
      description: lessonForm.description,
      instructorId: user.id,
      instructorName: `${user.firstName} ${user.lastName}`,
      course: lessonForm.course,
      department: lessonForm.department,
      schedule: lessonForm.schedule,
      duration: lessonForm.duration,
      location: lessonForm.location,
      status: 'scheduled',
      materials: lessonForm.materials.split('\n').filter(m => m.trim()),
      assignments: [],
      enrolledStudents: []
    };

    const updatedLessons = [...lessons, newLesson];
    setLessons(updatedLessons);
    localStorage.setItem('xenjonLessons', JSON.stringify(updatedLessons));

    toast.success('Lesson created successfully!');
    setLessonForm({
      title: '',
      description: '',
      course: '',
      department: '',
      schedule: '',
      duration: 60,
      location: '',
      materials: ''
    });
    setIsCreateLessonOpen(false);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLesson || user.role !== 'faculty') {
      toast.error('Only faculty can create assignments');
      return;
    }

    const newAssignment: Assignment = {
      id: generateId('ASS'),
      title: assignmentForm.title,
      description: assignmentForm.description,
      dueDate: assignmentForm.dueDate,
      points: assignmentForm.points,
      submissions: []
    };

    const updatedLessons = lessons.map(lesson =>
      lesson.id === selectedLesson.id
        ? { ...lesson, assignments: [...lesson.assignments, newAssignment] }
        : lesson
    );

    setLessons(updatedLessons);
    localStorage.setItem('xenjonLessons', JSON.stringify(updatedLessons));

    // Update selected lesson
    const updatedSelectedLesson = updatedLessons.find(l => l.id === selectedLesson.id);
    setSelectedLesson(updatedSelectedLesson || null);

    toast.success('Assignment created successfully!');
    setAssignmentForm({
      title: '',
      description: '',
      dueDate: '',
      points: 100
    });
    setIsCreateAssignmentOpen(false);
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAssignment || !selectedLesson || user.role !== 'student') {
      toast.error('Only students can submit assignments');
      return;
    }

    // Check if student already submitted
    const existingSubmission = selectedAssignment.submissions.find(s => s.studentId === user.id);
    if (existingSubmission) {
      toast.error('You have already submitted this assignment');
      return;
    }

    const newSubmission: Submission = {
      id: generateId('SUB'),
      studentId: user.id,
      studentName: `${user.firstName} ${user.lastName}`,
      content: submissionForm.content,
      submittedAt: new Date().toISOString()
    };

    const updatedLessons = lessons.map(lesson =>
      lesson.id === selectedLesson.id
        ? {
            ...lesson,
            assignments: lesson.assignments.map(assignment =>
              assignment.id === selectedAssignment.id
                ? { ...assignment, submissions: [...assignment.submissions, newSubmission] }
                : assignment
            )
          }
        : lesson
    );

    setLessons(updatedLessons);
    localStorage.setItem('xenjonLessons', JSON.stringify(updatedLessons));

    // Update selected lesson and assignment
    const updatedSelectedLesson = updatedLessons.find(l => l.id === selectedLesson.id);
    setSelectedLesson(updatedSelectedLesson || null);
    const updatedSelectedAssignment = updatedSelectedLesson?.assignments.find(a => a.id === selectedAssignment.id);
    setSelectedAssignment(updatedSelectedAssignment || null);

    toast.success('Assignment submitted successfully!');
    setSubmissionForm({ content: '' });
    setIsSubmissionDialogOpen(false);
  };

  const handleEnrollStudent = (lessonId: string) => {
    if (user.role !== 'student') return;

    const updatedLessons = lessons.map(lesson =>
      lesson.id === lessonId
        ? { ...lesson, enrolledStudents: [...lesson.enrolledStudents, user.id] }
        : lesson
    );

    setLessons(updatedLessons);
    localStorage.setItem('xenjonLessons', JSON.stringify(updatedLessons));
    toast.success('Enrolled in lesson successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">Lessons & Classes</h1>
          <p className="text-muted-foreground">
            {user.role === 'faculty' 
              ? 'Manage your lessons, assignments, and student submissions'
              : 'View your enrolled lessons and submit assignments'
            }
          </p>
        </div>
        {user.role === 'faculty' && (
          <Dialog open={isCreateLessonOpen} onOpenChange={setIsCreateLessonOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Lesson
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Lesson</DialogTitle>
                <DialogDescription>
                  Create a new lesson or class session for your students.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateLesson} className="space-y-4">
                <div>
                  <Label htmlFor="title">Lesson Title</Label>
                  <Input
                    id="title"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    placeholder="Enter lesson title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                    placeholder="Describe the lesson content and objectives"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      value={lessonForm.department} 
                      onValueChange={(value) => setLessonForm({ ...lessonForm, department: value })}
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
                    <Label htmlFor="course">Course</Label>
                    <Select 
                      value={lessonForm.course} 
                      onValueChange={(value) => setLessonForm({ ...lessonForm, course: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses
                          .filter((course: any) => !lessonForm.department || course.department === lessonForm.department)
                          .map((course: any) => (
                            <SelectItem key={course.id} value={course.name}>
                              {course.name.length > 50 ? `${course.name.substring(0, 50)}...` : course.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schedule">Schedule</Label>
                    <Input
                      id="schedule"
                      type="datetime-local"
                      value={lessonForm.schedule}
                      onChange={(e) => setLessonForm({ ...lessonForm, schedule: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={lessonForm.duration}
                      onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) })}
                      min="30"
                      max="240"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={lessonForm.location}
                    onChange={(e) => setLessonForm({ ...lessonForm, location: e.target.value })}
                    placeholder="Room number or location"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="materials">Materials (one per line)</Label>
                  <Textarea
                    id="materials"
                    value={lessonForm.materials}
                    onChange={(e) => setLessonForm({ ...lessonForm, materials: e.target.value })}
                    placeholder="Textbook Chapter 1&#10;Handout PDF&#10;Calculator"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateLessonOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Lesson
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          {selectedLesson && <TabsTrigger value="details">Lesson Details</TabsTrigger>}
        </TabsList>

        <TabsContent value="lessons">
          <div className="grid gap-6">
            {filteredLessons.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No lessons found</h3>
                  <p className="text-muted-foreground">
                    {user.role === 'faculty' 
                      ? 'Create your first lesson to get started'
                      : 'No lessons available for enrollment yet'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map((lesson) => (
                  <Card key={lesson.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{lesson.title}</CardTitle>
                        <Badge className={getStatusColor(lesson.status)}>
                          {lesson.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{lesson.course}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {lesson.description}
                        </p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{new Date(lesson.schedule).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{lesson.duration} minutes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{lesson.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{lesson.enrolledStudents.length} enrolled</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedLesson(lesson);
                              setActiveTab('details');
                            }}
                          >
                            View Details
                          </Button>
                          {user.role === 'student' && !lesson.enrolledStudents.includes(user.id) && (
                            <Button 
                              size="sm" 
                              onClick={() => handleEnrollStudent(lesson.id)}
                            >
                              Enroll
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="details">
          {selectedLesson && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedLesson.title}</CardTitle>
                      <p className="text-muted-foreground mt-1">{selectedLesson.course}</p>
                      <p className="text-sm text-muted-foreground">
                        Instructor: {selectedLesson.instructorName}
                      </p>
                    </div>
                    <Badge className={getStatusColor(selectedLesson.status)}>
                      {selectedLesson.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {selectedLesson.description}
                      </p>

                      <h4 className="font-medium mb-2">Schedule & Location</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(selectedLesson.schedule).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{selectedLesson.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedLesson.location}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Materials</h4>
                      {selectedLesson.materials.length > 0 ? (
                        <ul className="text-sm space-y-1">
                          {selectedLesson.materials.map((material, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              {material}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No materials added yet</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assignments Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Assignments</CardTitle>
                    {user.role === 'faculty' && (
                      <Dialog open={isCreateAssignmentOpen} onOpenChange={setIsCreateAssignmentOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Assignment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create Assignment</DialogTitle>
                            <DialogDescription>
                              Create a new assignment for this lesson.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleCreateAssignment} className="space-y-4">
                            <div>
                              <Label htmlFor="assignmentTitle">Title</Label>
                              <Input
                                id="assignmentTitle"
                                value={assignmentForm.title}
                                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="assignmentDescription">Description</Label>
                              <Textarea
                                id="assignmentDescription"
                                value={assignmentForm.description}
                                onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                                rows={3}
                                required
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                  id="dueDate"
                                  type="datetime-local"
                                  value={assignmentForm.dueDate}
                                  onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="points">Points</Label>
                                <Input
                                  id="points"
                                  type="number"
                                  value={assignmentForm.points}
                                  onChange={(e) => setAssignmentForm({ ...assignmentForm, points: parseInt(e.target.value) })}
                                  min="1"
                                  required
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setIsCreateAssignmentOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit">Create Assignment</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedLesson.assignments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No assignments for this lesson yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {selectedLesson.assignments.map((assignment) => {
                        const userSubmission = assignment.submissions.find(s => s.studentId === user.id);
                        const isOverdue = new Date(assignment.dueDate) < new Date();
                        
                        return (
                          <div key={assignment.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h5 className="font-medium">{assignment.title}</h5>
                                <p className="text-sm text-muted-foreground">{assignment.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{assignment.points} points</p>
                                <p className={`text-sm ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                                  Due: {new Date(assignment.dueDate).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            {user.role === 'student' && (
                              <div className="flex items-center gap-2 mt-3">
                                {userSubmission ? (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-green-600">Submitted</span>
                                    {userSubmission.grade !== undefined && (
                                      <Badge variant="outline">
                                        Grade: {userSubmission.grade}/{assignment.points}
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    disabled={isOverdue}
                                    onClick={() => {
                                      setSelectedAssignment(assignment);
                                      setIsSubmissionDialogOpen(true);
                                    }}
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    {isOverdue ? 'Overdue' : 'Submit'}
                                  </Button>
                                )}
                              </div>
                            )}

                            {user.role === 'faculty' && assignment.submissions.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium mb-2">
                                  Submissions ({assignment.submissions.length})
                                </p>
                                <div className="space-y-2">
                                  {assignment.submissions.map((submission) => (
                                    <div key={submission.id} className="bg-muted/50 p-3 rounded">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">{submission.studentName}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(submission.submittedAt).toLocaleString()}
                                        </span>
                                      </div>
                                      <p className="text-sm">{submission.content}</p>
                                      {submission.grade !== undefined && (
                                        <Badge variant="outline" className="mt-2">
                                          Grade: {submission.grade}/{assignment.points}
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Submission Dialog */}
      <Dialog open={isSubmissionDialogOpen} onOpenChange={setIsSubmissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              {selectedAssignment && `Submit your work for "${selectedAssignment.title}"`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAssignment} className="space-y-4">
            <div>
              <Label htmlFor="submissionContent">Your Submission</Label>
              <Textarea
                id="submissionContent"
                value={submissionForm.content}
                onChange={(e) => setSubmissionForm({ content: e.target.value })}
                placeholder="Enter your assignment submission here..."
                rows={6}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsSubmissionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Send className="w-4 h-4 mr-2" />
                Submit Assignment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}