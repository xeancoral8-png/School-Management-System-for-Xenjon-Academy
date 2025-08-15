import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  MessageSquare,
  UserCheck,
  Bell,
  ChevronRight,
  Database,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

type DashboardProps = {
  user: any;
  onNavigate?: (view: string) => void;
};

export function Dashboard({ user, onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    activeSessions: 0
  });

  const [userStats, setUserStats] = useState({
    unreadMessages: 0,
    upcomingClasses: 0,
    pendingAssignments: 0,
    totalClasses: 0
  });

  const [chartData, setChartData] = useState({
    courseEnrollments: [] as any[],
    facultyByDepartment: [] as any[]
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [showAllDepartments, setShowAllDepartments] = useState(false);

  // Department-specific colors from COLOR_REFERENCE.md
  const departmentColorMap: { [key: string]: string } = {
    'Arts and Sciences': '#4285F4',                    // Google Blue
    'Education': '#00C851',                            // Material Green  
    'Business and Management': '#FF8A00',              // Material Orange
    'Engineering': '#FF4444',                          // Material Red
    'Information Technology / Computer Studies': '#9C27B0', // Material Purple
    'Nursing and Allied Health': '#00BCD4',           // Material Cyan
    'Criminal Justice Education': '#795548',          // Material Brown
    'Tourism Management': '#FF9800',                  // Material Amber
    'Agriculture and Fisheries': '#4CAF50',          // Material Light Green
    'Law': '#607D8B',                                 // Material Blue Grey
    'Architecture and Fine Arts': '#E91E63'          // Material Pink
  };

  useEffect(() => {
    loadDashboardData();
    loadUserSpecificData();
    loadChartData();
    loadRecentActivity();
  }, [user]);

  const loadDashboardData = () => {
    const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
    const courses = JSON.parse(localStorage.getItem('xenjonCourses') || '[]');
    
    setStats({
      totalStudents: users.filter((u: any) => u.role === 'student').length,
      totalFaculty: users.filter((u: any) => u.role === 'faculty').length,
      totalCourses: courses.length,
      activeSessions: Math.floor(Math.random() * 50) + 20 // Simulated active sessions
    });
  };

  const loadChartData = () => {
    const courses = JSON.parse(localStorage.getItem('xenjonCourses') || '[]');
    const departments = JSON.parse(localStorage.getItem('xenjonDepartments') || '[]');
    
    // Prepare course enrollment data for bar chart
    const courseEnrollmentData = courses
      .slice(0, 10) // Show top 10 courses for better visibility
      .map((course: any) => ({
        name: course.name.length > 30 ? course.name.substring(0, 30) + '...' : course.name,
        fullName: course.name,
        students: course.students || 0,
        department: course.department
      }))
      .sort((a: any, b: any) => b.students - a.students);

    // Prepare faculty by department data for pie chart with department-specific colors
    const facultyByDeptData = departments.map((dept: any) => {
      // Create abbreviated names for the pie chart labels
      let shortName = dept.name;
      if (dept.name.includes('/')) {
        shortName = dept.name.split('/')[0].trim();
      }
      if (shortName.length > 20) {
        shortName = shortName.substring(0, 18) + '...';
      }

      return {
        name: dept.name,
        shortName: shortName,
        faculty: dept.faculty || 0,
        color: departmentColorMap[dept.name] || '#6B7280',
        percentage: 0 // Will be calculated
      };
    });

    // Calculate percentages for pie chart
    const totalFaculty = facultyByDeptData.reduce((sum, dept) => sum + dept.faculty, 0);
    facultyByDeptData.forEach(dept => {
      dept.percentage = totalFaculty > 0 ? Math.round((dept.faculty / totalFaculty) * 100) : 0;
    });

    setChartData({
      courseEnrollments: courseEnrollmentData,
      facultyByDepartment: facultyByDeptData
    });
  };

  const loadRecentActivity = () => {
    const messages = JSON.parse(localStorage.getItem('xenjonMessages') || '[]');
    const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');

    const activities = [];

    // Add recent user registrations
    const recentUsers = users
      .filter((u: any) => u.createdAt)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);

    recentUsers.forEach((newUser: any) => {
      if (newUser.role === 'student') {
        activities.push({
          id: `activity_${newUser.id}`,
          type: 'user',
          title: 'New student enrolled',
          description: `${newUser.firstName} ${newUser.lastName} joined ${newUser.course || 'the academy'}`,
          timestamp: newUser.createdAt,
          icon: GraduationCap,
          color: 'text-blue-600'
        });
      } else if (newUser.role === 'faculty') {
        activities.push({
          id: `activity_${newUser.id}`,
          type: 'user',
          title: 'Faculty member added',
          description: `${newUser.firstName} ${newUser.lastName} joined ${newUser.department || 'the academy'}`,
          timestamp: newUser.createdAt,
          icon: Users,
          color: 'text-green-600'
        });
      }
    });

    // Add recent messages
    const recentMessages = messages
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 2);

    recentMessages.forEach((message: any) => {
      activities.push({
        id: `activity_msg_${message.id}`,
        type: 'message',
        title: 'New message sent',
        description: `${message.senderName} sent: "${message.subject}"`,
        timestamp: message.timestamp,
        icon: MessageSquare,
        color: 'text-purple-600'
      });
    });

    // Add course update activity
    activities.push({
      id: 'activity_course_update',
      type: 'system',
      title: 'Course updated',
      description: 'Mathematics course curriculum revised',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      icon: BookOpen,
      color: 'text-orange-600'
    });

    // Add system backup activity
    activities.push({
      id: 'activity_backup',
      type: 'system',
      title: 'System backup completed',
      description: 'Daily backup completed successfully',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      icon: Database,
      color: 'text-gray-600'
    });

    // Sort by timestamp and take most recent
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 4);

    setRecentActivity(sortedActivities);
  };

  const loadUserSpecificData = () => {
    const messages = JSON.parse(localStorage.getItem('xenjonMessages') || '[]');
    const events = JSON.parse(localStorage.getItem('xenjonCalendarEvents') || '[]');
    const lessons = JSON.parse(localStorage.getItem('xenjonLessons') || '[]');
    const enrollments = JSON.parse(localStorage.getItem('xenjonClassEnrollments') || '[]');

    // Calculate user-specific stats
    const unreadMessages = messages.filter((msg: any) => 
      msg.recipientId === user.id && !msg.read
    ).length;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingEvents = events.filter((event: any) => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= tomorrow && 
             (event.createdBy === user.id || event.participants.includes(user.id));
    });

    let userEnrollments = 0;
    let pendingAssignments = 0;

    if (user.role === 'faculty') {
      userEnrollments = enrollments.filter((e: any) => e.instructor.id === user.id).length;
      lessons.forEach((lesson: any) => {
        if (lesson.instructorId === user.id) {
          lesson.assignments?.forEach((assignment: any) => {
            pendingAssignments += assignment.submissions?.length || 0;
          });
        }
      });
    } else if (user.role === 'student') {
      userEnrollments = enrollments.filter((e: any) => 
        e.students.some((s: any) => s.id === user.id)
      ).length;
      lessons.forEach((lesson: any) => {
        if (lesson.enrolledStudents?.includes(user.id)) {
          lesson.assignments?.forEach((assignment: any) => {
            const hasSubmitted = assignment.submissions?.some((sub: any) => sub.studentId === user.id);
            if (!hasSubmitted && new Date(assignment.dueDate) > new Date()) {
              pendingAssignments++;
            }
          });
        }
      });
    }

    setUserStats({
      unreadMessages,
      upcomingClasses: upcomingEvents.length,
      pendingAssignments,
      totalClasses: userEnrollments
    });

    setUpcomingEvents(upcomingEvents);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserDisplayName = () => {
    if (user.role === 'admin' && (user.firstName === 'System' || user.firstName.toLowerCase() === 'system')) {
      return user.lastName && user.lastName !== 'Administrator' ? user.lastName : 'Administrator';
    }
    return user.firstName;
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  };

  const QuickActionCard = ({ 
    title, 
    description, 
    icon: Icon, 
    color, 
    badge, 
    onClick 
  }: {
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    badge?: number;
    onClick: () => void;
  }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium">{title}</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badge && badge > 0 && (
              <Badge variant="destructive" className="text-xs">
                {badge}
              </Badge>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Simple Bar Chart Component
  const SimpleBarChart = ({ data }: { data: any[] }) => {
    const maxValue = Math.max(...data.map(item => item.students));
    
    return (
      <div className="space-y-3">
        {data.slice(0, 8).map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium truncate max-w-[200px]" title={item.fullName}>
                {item.name}
              </span>
              <span className="text-muted-foreground">{item.students}</span>
            </div>
            <Progress 
              value={(item.students / maxValue) * 100} 
              className="h-2"
              style={{ 
                '--progress-foreground': '#4285F4' 
              } as React.CSSProperties}
            />
          </div>
        ))}
      </div>
    );
  };

  // Simple Pie Chart Component using CSS
  const SimplePieChart = ({ data }: { data: any[] }) => {
    const totalFaculty = data.reduce((sum, dept) => sum + dept.faculty, 0);
    
    return (
      <div className="space-y-4">
        {/* Visual representation using stacked bars */}
        <div className="space-y-2">
          {data.slice(0, 6).map((dept, index) => {
            const percentage = totalFaculty > 0 ? (dept.faculty / totalFaculty) * 100 : 0;
            return (
              <div key={dept.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: dept.color }}
                    />
                    <span className="font-medium truncate max-w-[150px]" title={dept.name}>
                      {dept.shortName}
                    </span>
                  </div>
                  <span className="text-muted-foreground">{dept.faculty} ({percentage.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: dept.color 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const navigateToMessages = () => onNavigate?.('messages');
  const navigateToCalendar = () => onNavigate?.('calendar');
  const navigateToClasses = () => onNavigate?.('classes');
  const navigateToLessons = () => onNavigate?.('lessons');
  const toggleDepartmentView = () => setShowAllDepartments(!showAllDepartments);

  if (user?.role === 'admin') {
    return (
      <div className="min-h-full" style={{ backgroundColor: '#FEDADE' }}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2">{getGreeting()}, {getUserDisplayName()}! 👋</h1>
              <p className="text-muted-foreground">Here's what's happening at Xenjon Academy today</p>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Active enrollments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faculty Members</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFaculty}</div>
                <p className="text-xs text-muted-foreground">Teaching staff</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
                <p className="text-xs text-muted-foreground">Available programs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeSessions}</div>
                <p className="text-xs text-muted-foreground">Online right now</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Students per Course Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Students per Course</CardTitle>
                <p className="text-sm text-muted-foreground">Number of enrolled students by course</p>
              </CardHeader>
              <CardContent>
                <div className="h-80 p-4">
                  <SimpleBarChart data={chartData.courseEnrollments} />
                </div>
              </CardContent>
            </Card>

            {/* Faculty per Department Chart */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg">Faculty per Department</CardTitle>
                <p className="text-sm text-muted-foreground">Distribution of faculty across departments</p>
              </CardHeader>
              <CardContent>
                <div className="h-80 p-4">
                  <SimplePieChart 
                    data={showAllDepartments ? chartData.facultyByDepartment : chartData.facultyByDepartment.slice(0, 6)} 
                  />
                </div>
                
                {/* Enhanced Legend with Department Colors and Expandable Functionality */}
                {chartData.facultyByDepartment.length > 6 && (
                  <div className="mt-4 border-t border-border pt-4">
                    <div className="flex justify-center">
                      <button
                        onClick={toggleDepartmentView}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-muted/50"
                      >
                        {showAllDepartments ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            +{chartData.facultyByDepartment.length - 6} more departments
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <p className="text-sm text-muted-foreground">Latest system activities and updates</p>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className={`p-2 bg-muted rounded-lg ${activity.color}`}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">{activity.title}</h5>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full" style={{ backgroundColor: '#FEDADE' }}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">{getGreeting()}, {getUserDisplayName()}! 🎓</h1>
            <p className="text-muted-foreground">
              Welcome to your {user.role} dashboard
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Last login: {user.lastUpdated ? new Date(user.lastUpdated).toLocaleString() : 'Unknown'}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.unreadMessages}</div>
              <p className="text-xs text-muted-foreground">New messages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.role === 'faculty' ? 'Classes Teaching' : 'Enrolled Classes'}
              </CardTitle>
              <UserCheck className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalClasses}</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.role === 'faculty' ? 'To Grade' : 'Assignments Due'}
              </CardTitle>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.pendingAssignments}</div>
              <p className="text-xs text-muted-foreground">
                {user.role === 'faculty' ? 'Submissions' : 'Due soon'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.upcomingClasses}</div>
              <p className="text-xs text-muted-foreground">Scheduled events</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-medium mb-4">Quick Actions ⚡</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickActionCard
              title="Messages 💬"
              description="Send and receive messages"
              icon={MessageSquare}
              color="bg-blue-500"
              badge={userStats.unreadMessages}
              onClick={navigateToMessages}
            />
            
            <QuickActionCard
              title="Calendar 📅"
              description="View and manage your schedule"
              icon={Calendar}
              color="bg-green-500"
              badge={userStats.upcomingClasses}
              onClick={navigateToCalendar}
            />
            
            <QuickActionCard
              title="My Classes 👥"
              description={user.role === 'faculty' ? 'Manage your classes' : 'View classmates and instructors'}
              icon={UserCheck}
              color="bg-purple-500"
              onClick={navigateToClasses}
            />
            
            <QuickActionCard
              title="Lessons 📚"
              description="Access course materials and assignments"
              icon={BookOpen}
              color="bg-orange-500"
              badge={userStats.pendingAssignments}
              onClick={navigateToLessons}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <p className="text-sm text-muted-foreground">Your latest activities</p>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className={`p-2 bg-muted rounded-lg ${activity.color}`}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">{activity.title}</h5>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Events
              </CardTitle>
              <p className="text-sm text-muted-foreground">Your schedule for today and tomorrow</p>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No upcoming events</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <h5 className="font-medium">{event.title}</h5>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()} at {event.startTime}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}