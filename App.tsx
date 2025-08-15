import React, { useState, useEffect } from "react";
import { LoginForm } from "./components/LoginForm";
import { SignUpForm } from "./components/SignUpForm";
import { Dashboard } from "./components/Dashboard";
import { FacultyModule } from "./components/FacultyModule";
import { StudentModule } from "./components/StudentModule";
import { ReportsModule } from "./components/ReportsModule";
import { SystemSettings } from "./components/SystemSettings";
import { Profile } from "./components/Profile";
import { AdminPanel } from "./components/AdminPanel";
import { MessagingModule } from "./components/MessagingModule";
import { LessonsModule } from "./components/LessonsModule";
import { CalendarModule } from "./components/CalendarModule";
import { ClassesModule } from "./components/ClassesModule";
import { UpdateTimeModule } from "./components/UpdateTimeModule";
import { Header } from "./components/Header";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import {
  LogOut,
  User,
  Settings,
  Users,
  GraduationCap,
  FileText,
  BarChart3,
  UserCog,
  MessageSquare,
  BookOpen,
  Bell,
  Calendar,
  UserCheck,
  Clock,
} from "lucide-react";
import academyLogo from "figma:asset/423041854a274a303b5abe317732e0f5a6e9a89f.png";

type User = {
  id: string;
  username: string;
  email: string;
  role: "admin" | "faculty" | "student";
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  createdAt: string;
  lastUpdated?: string;
};

type AppState = {
  currentView: string;
  user: User | null;
  isAuthenticated: boolean;
  showSignUp: boolean;
  unreadMessages: number;
  notifications: any[];
};

export default function App() {
  const [state, setState] = useState<AppState>({
    currentView: "dashboard",
    user: null,
    isAuthenticated: false,
    showSignUp: false,
    unreadMessages: 0,
    notifications: [],
  });

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("xenjonUser");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // Update last login time
      const updatedUser = {
        ...user,
        lastUpdated: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        user: updatedUser,
        isAuthenticated: true,
      }));
      localStorage.setItem(
        "xenjonUser",
        JSON.stringify(updatedUser),
      );
      updateUserInStorage(updatedUser);
      loadNotifications(updatedUser);
    }

    // Initialize demo data if not exists
    initializeDemoData();
  }, []);

  const updateUserInStorage = (user: User) => {
    const users = JSON.parse(
      localStorage.getItem("xenjonUsers") || "[]",
    );
    const updatedUsers = users.map((u: any) =>
      u.id === user.id
        ? { ...u, lastUpdated: user.lastUpdated }
        : u,
    );
    localStorage.setItem(
      "xenjonUsers",
      JSON.stringify(updatedUsers),
    );
  };

  const loadNotifications = (user: User) => {
    const messages = JSON.parse(
      localStorage.getItem("xenjonMessages") || "[]",
    );
    const unreadCount = messages.filter(
      (msg: any) => msg.recipientId === user.id && !msg.read,
    ).length;

    const notifications = JSON.parse(
      localStorage.getItem("xenjonNotifications") || "[]",
    )
      .filter((notif: any) => notif.userId === user.id)
      .slice(0, 5);

    setState((prev) => ({
      ...prev,
      unreadMessages: unreadCount,
      notifications,
    }));
  };

  const initializeDemoData = () => {
    if (!localStorage.getItem("xenjonUsers")) {
      const now = new Date().toISOString();
      const demoUsers = [
        {
          id: "ADM001",
          username: "Admin123",
          email: "admin@xenjonacademy.edu",
          password: "Admin123!",
          role: "admin",
          firstName: "Administrator",
          lastName: "Xenjon",
          createdAt: now,
          lastUpdated: now,
        },
        {
          id: "FAC001",
          username: "JSmith456",
          email: "j.smith@xenjonacademy.edu",
          password: "Faculty123!",
          role: "faculty",
          firstName: "John",
          lastName: "Smith",
          department: "Engineering",
          createdAt: now,
          lastUpdated: now,
        },
        {
          id: "STU001",
          username: "EJones789",
          email: "e.jones@student.xenjonacademy.edu",
          password: "Student123!",
          role: "student",
          firstName: "Emily",
          lastName: "Jones",
          course:
            "Bachelor of Science in Computer Science (BSCS)",
          year: "2024",
          createdAt: now,
          lastUpdated: now,
        },
      ];
      localStorage.setItem(
        "xenjonUsers",
        JSON.stringify(demoUsers),
      );
    }

    // Initialize user time settings
    if (!localStorage.getItem("xenjonUserTimeSettings")) {
      const demoTimeSettings = [
        {
          userId: "FAC001",
          timezone: "America/New_York",
          workingHours: {
            start: "09:00",
            end: "17:00",
          },
          workingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
          ],
          breakTime: {
            start: "12:00",
            end: "13:00",
          },
          availabilityStatus: "available",
          automaticUpdates: true,
          lastModified: new Date().toISOString(),
        },
        {
          userId: "STU001",
          timezone: "America/New_York",
          workingHours: {
            start: "08:00",
            end: "18:00",
          },
          workingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
          ],
          breakTime: {
            start: "12:00",
            end: "13:00",
          },
          availabilityStatus: "available",
          automaticUpdates: true,
          lastModified: new Date().toISOString(),
        },
      ];
      localStorage.setItem(
        "xenjonUserTimeSettings",
        JSON.stringify(demoTimeSettings),
      );
    }

    // Initialize calendar events
    if (!localStorage.getItem("xenjonCalendarEvents")) {
      const demoEvents = [
        {
          id: "EVT001",
          title: "Programming Lecture",
          description: "Introduction to Programming concepts",
          date: "2024-12-16",
          startTime: "09:00",
          endTime: "11:00",
          type: "class",
          createdBy: "FAC001",
          participants: ["STU001"],
          location: "Room 101",
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
        {
          id: "EVT002",
          title: "Assignment Deadline",
          description: "Final project submission due",
          date: "2024-12-20",
          startTime: "23:59",
          endTime: "23:59",
          type: "assignment",
          createdBy: "FAC001",
          participants: ["STU001"],
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      ];
      localStorage.setItem(
        "xenjonCalendarEvents",
        JSON.stringify(demoEvents),
      );
    }

    // Initialize class enrollments
    if (!localStorage.getItem("xenjonClassEnrollments")) {
      const demoEnrollments = [
        {
          id: "CLS001",
          className: "Introduction to Programming",
          course:
            "Bachelor of Science in Computer Science (BSCS)",
          department:
            "Information Technology / Computer Studies",
          instructor: {
            id: "FAC001",
            name: "John Smith",
            email: "j.smith@xenjonacademy.edu",
          },
          students: [
            {
              id: "STU001",
              name: "Emily Jones",
              email: "e.jones@student.xenjonacademy.edu",
            },
          ],
          schedule: "MWF 9:00-10:30 AM",
          location: "Room 101",
          semester: "Fall 2024",
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(
        "xenjonClassEnrollments",
        JSON.stringify(demoEnrollments),
      );
    }

    // Initialize messages
    if (!localStorage.getItem("xenjonMessages")) {
      const demoMessages = [
        {
          id: "MSG001",
          senderId: "FAC001",
          recipientId: "STU001",
          subject: "Assignment Submission",
          message:
            "Please submit your final project by the end of this week. 📚✨",
          timestamp: new Date(
            Date.now() - 86400000,
          ).toISOString(),
          read: false,
          senderName: "John Smith",
          recipientName: "Emily Jones",
          hasEmoji: true,
        },
      ];
      localStorage.setItem(
        "xenjonMessages",
        JSON.stringify(demoMessages),
      );
    }

    // Initialize lessons
    if (!localStorage.getItem("xenjonLessons")) {
      const demoLessons = [
        {
          id: "LES001",
          title: "Introduction to Programming",
          description: "Basic programming concepts and syntax",
          instructorId: "FAC001",
          instructorName: "John Smith",
          course:
            "Bachelor of Science in Computer Science (BSCS)",
          department:
            "Information Technology / Computer Studies",
          schedule: "2024-12-16T09:00:00",
          duration: 120,
          location: "Room 101",
          status: "scheduled",
          materials: [
            "Textbook Chapter 1",
            "Practice Exercises",
          ],
          assignments: [
            {
              id: "ASS001",
              title: "Hello World Program",
              description: "Create your first program",
              dueDate: "2024-12-20T23:59:00",
              points: 10,
              submissions: [],
            },
          ],
          enrolledStudents: ["STU001"],
        },
      ];
      localStorage.setItem(
        "xenjonLessons",
        JSON.stringify(demoLessons),
      );
    }

    // Initialize notifications
    if (!localStorage.getItem("xenjonNotifications")) {
      const demoNotifications = [
        {
          id: "NOT001",
          userId: "STU001",
          type: "message",
          title: "New Message from John Smith",
          message:
            "You have received a new message about Assignment Submission",
          timestamp: new Date(
            Date.now() - 86400000,
          ).toISOString(),
          read: false,
        },
      ];
      localStorage.setItem(
        "xenjonNotifications",
        JSON.stringify(demoNotifications),
      );
    }

    // Initialize departments with proper college structure
    if (!localStorage.getItem("xenjonDepartments")) {
      localStorage.setItem(
        "xenjonDepartments",
        JSON.stringify([
          {
            id: "ARTS001",
            name: "Arts and Sciences",
            head: "Dr. Maria Santos",
            faculty: 15,
          },
          {
            id: "EDU001",
            name: "Education",
            head: "Prof. Robert Johnson",
            faculty: 12,
          },
          {
            id: "BUS001",
            name: "Business and Management",
            head: "Dr. Patricia Williams",
            faculty: 10,
          },
          {
            id: "ENG001",
            name: "Engineering",
            head: "Dr. Michael Brown",
            faculty: 18,
          },
          {
            id: "IT001",
            name: "Information Technology / Computer Studies",
            head: "Prof. Sarah Davis",
            faculty: 14,
          },
          {
            id: "NURS001",
            name: "Nursing and Allied Health",
            head: "Dr. Jennifer Miller",
            faculty: 16,
          },
          {
            id: "CJ001",
            name: "Criminal Justice Education",
            head: "Prof. David Wilson",
            faculty: 8,
          },
          {
            id: "TOUR001",
            name: "Tourism Management",
            head: "Dr. Lisa Garcia",
            faculty: 7,
          },
          {
            id: "AGRI001",
            name: "Agriculture and Fisheries",
            head: "Prof. James Rodriguez",
            faculty: 9,
          },
          {
            id: "LAW001",
            name: "Law",
            head: "Dr. Amanda Martinez",
            faculty: 6,
          },
          {
            id: "ARCH001",
            name: "Architecture and Fine Arts",
            head: "Prof. Christopher Lee",
            faculty: 11,
          },
        ]),
      );
    }

    // Initialize courses with department mapping
    if (!localStorage.getItem("xenjonCourses")) {
      const coursesByDepartment = [
        // Arts and Sciences
        {
          id: "ARTS001_001",
          name: "Bachelor of Arts in English Language Studies",
          department: "Arts and Sciences",
          students: 35,
        },
        {
          id: "ARTS001_002",
          name: "Bachelor of Arts in Communication",
          department: "Arts and Sciences",
          students: 42,
        },
        {
          id: "ARTS001_003",
          name: "Bachelor of Science in Psychology",
          department: "Arts and Sciences",
          students: 48,
        },
        {
          id: "ARTS001_004",
          name: "Bachelor of Arts in Political Science",
          department: "Arts and Sciences",
          students: 28,
        },
        {
          id: "ARTS001_005",
          name: "Bachelor of Science in Biology",
          department: "Arts and Sciences",
          students: 38,
        },
        {
          id: "ARTS001_006",
          name: "Bachelor of Science in Mathematics",
          department: "Arts and Sciences",
          students: 25,
        },

        // Education
        {
          id: "EDU001_001",
          name: "Bachelor of Elementary Education (BEEd)",
          department: "Education",
          students: 45,
        },
        {
          id: "EDU001_002",
          name: "Bachelor of Secondary Education (BSEd) - English",
          department: "Education",
          students: 32,
        },
        {
          id: "EDU001_003",
          name: "Bachelor of Secondary Education (BSEd) - Mathematics",
          department: "Education",
          students: 28,
        },
        {
          id: "EDU001_004",
          name: "Bachelor of Secondary Education (BSEd) - Science",
          department: "Education",
          students: 35,
        },
        {
          id: "EDU001_005",
          name: "Bachelor of Secondary Education (BSEd) - Social Studies",
          department: "Education",
          students: 24,
        },
        {
          id: "EDU001_006",
          name: "Bachelor of Physical Education",
          department: "Education",
          students: 30,
        },
        {
          id: "EDU001_007",
          name: "Bachelor of Early Childhood Education",
          department: "Education",
          students: 26,
        },

        // Business and Management
        {
          id: "BUS001_001",
          name: "Bachelor of Science in Business Administration (BSBA) - Marketing Management",
          department: "Business and Management",
          students: 55,
        },
        {
          id: "BUS001_002",
          name: "Bachelor of Science in Business Administration (BSBA) - Financial Management",
          department: "Business and Management",
          students: 48,
        },
        {
          id: "BUS001_003",
          name: "Bachelor of Science in Business Administration (BSBA) - Human Resource Management",
          department: "Business and Management",
          students: 42,
        },
        {
          id: "BUS001_004",
          name: "Bachelor of Science in Accountancy",
          department: "Business and Management",
          students: 68,
        },
        {
          id: "BUS001_005",
          name: "Bachelor of Science in Entrepreneurship",
          department: "Business and Management",
          students: 38,
        },
        {
          id: "BUS001_006",
          name: "Bachelor of Science in Office Administration",
          department: "Business and Management",
          students: 22,
        },

        // Engineering
        {
          id: "ENG001_001",
          name: "Bachelor of Science in Civil Engineering",
          department: "Engineering",
          students: 72,
        },
        {
          id: "ENG001_002",
          name: "Bachelor of Science in Electrical Engineering",
          department: "Engineering",
          students: 65,
        },
        {
          id: "ENG001_003",
          name: "Bachelor of Science in Mechanical Engineering",
          department: "Engineering",
          students: 58,
        },
        {
          id: "ENG001_004",
          name: "Bachelor of Science in Computer Engineering",
          department: "Engineering",
          students: 82,
        },
        {
          id: "ENG001_005",
          name: "Bachelor of Science in Electronics Engineering",
          department: "Engineering",
          students: 45,
        },

        // Information Technology / Computer Studies
        {
          id: "IT001_001",
          name: "Bachelor of Science in Information Technology (BSIT)",
          department:
            "Information Technology / Computer Studies",
          students: 95,
        },
        {
          id: "IT001_002",
          name: "Bachelor of Science in Computer Science (BSCS)",
          department:
            "Information Technology / Computer Studies",
          students: 88,
        },
        {
          id: "IT001_003",
          name: "Bachelor of Science in Information Systems (BSIS)",
          department:
            "Information Technology / Computer Studies",
          students: 52,
        },
        {
          id: "IT001_004",
          name: "Associate in Computer Technology (ACT)",
          department:
            "Information Technology / Computer Studies",
          students: 36,
        },

        // Nursing and Allied Health
        {
          id: "NURS001_001",
          name: "Bachelor of Science in Nursing",
          department: "Nursing and Allied Health",
          students: 125,
        },
        {
          id: "NURS001_002",
          name: "Bachelor of Science in Medical Technology",
          department: "Nursing and Allied Health",
          students: 45,
        },
        {
          id: "NURS001_003",
          name: "Bachelor of Science in Pharmacy",
          department: "Nursing and Allied Health",
          students: 38,
        },
        {
          id: "NURS001_004",
          name: "Bachelor of Science in Radiologic Technology",
          department: "Nursing and Allied Health",
          students: 32,
        },
        {
          id: "NURS001_005",
          name: "Bachelor of Science in Physical Therapy",
          department: "Nursing and Allied Health",
          students: 42,
        },

        // Criminal Justice Education
        {
          id: "CJ001_001",
          name: "Bachelor of Science in Criminology",
          department: "Criminal Justice Education",
          students: 85,
        },
        {
          id: "CJ001_002",
          name: "Bachelor of Science in Industrial Security Management",
          department: "Criminal Justice Education",
          students: 28,
        },
        {
          id: "CJ001_003",
          name: "Bachelor of Science in Forensic Science",
          department: "Criminal Justice Education",
          students: 35,
        },

        // Tourism Management
        {
          id: "TOUR001_001",
          name: "Bachelor of Science in Hospitality Management",
          department: "Tourism Management",
          students: 45,
        },
        {
          id: "TOUR001_002",
          name: "Bachelor of Science in Tourism Management",
          department: "Tourism Management",
          students: 52,
        },
        {
          id: "TOUR001_003",
          name: "Associate in Hotel and Restaurant Services",
          department: "Tourism Management",
          students: 28,
        },

        // Agriculture and Fisheries
        {
          id: "AGRI001_001",
          name: "Bachelor of Science in Agriculture",
          department: "Agriculture and Fisheries",
          students: 38,
        },
        {
          id: "AGRI001_002",
          name: "Bachelor of Science in Agribusiness",
          department: "Agriculture and Fisheries",
          students: 32,
        },
        {
          id: "AGRI001_003",
          name: "Bachelor of Science in Fisheries",
          department: "Agriculture and Fisheries",
          students: 25,
        },

        // Law
        {
          id: "LAW001_001",
          name: "Juris Doctor (JD)",
          department: "Law",
          students: 95,
        },
        {
          id: "LAW001_002",
          name: "Bachelor of Laws (LLB)",
          department: "Law",
          students: 68,
        },

        // Architecture and Fine Arts
        {
          id: "ARCH001_001",
          name: "Bachelor of Science in Architecture",
          department: "Architecture and Fine Arts",
          students: 72,
        },
        {
          id: "ARCH001_002",
          name: "Bachelor of Fine Arts",
          department: "Architecture and Fine Arts",
          students: 45,
        },
        {
          id: "ARCH001_003",
          name: "Bachelor of Interior Design",
          department: "Architecture and Fine Arts",
          students: 38,
        },
      ];

      localStorage.setItem(
        "xenjonCourses",
        JSON.stringify(coursesByDepartment),
      );
    }

    // Initialize student data with proper course mapping
    if (!localStorage.getItem("xenjonStudents")) {
      localStorage.setItem(
        "xenjonStudents",
        JSON.stringify([
          {
            id: "STU001",
            course:
              "Bachelor of Science in Computer Science (BSCS)",
            department:
              "Information Technology / Computer Studies",
            year: "2024",
            phone: "+1 (555) 123-4567",
            enrollmentDate: "2024-01-15",
            status: "active",
          },
        ]),
      );
    }

    // Initialize faculty data with proper department mapping
    if (!localStorage.getItem("xenjonFaculty")) {
      localStorage.setItem(
        "xenjonFaculty",
        JSON.stringify([
          {
            id: "FAC001",
            department: "Engineering",
            position: "Assistant Professor",
            phone: "+1 (555) 987-6543",
            hireDate: "2023-08-15",
            status: "active",
          },
        ]),
      );
    }
  };

  const handleLogin = (user: User) => {
    const updatedUser = {
      ...user,
      lastUpdated: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      user: updatedUser,
      isAuthenticated: true,
      showSignUp: false,
    }));
    localStorage.setItem(
      "xenjonUser",
      JSON.stringify(updatedUser),
    );
    updateUserInStorage(updatedUser);
    loadNotifications(updatedUser);
  };

  const handleLogout = () => {
    setState((prev) => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      currentView: "dashboard",
      unreadMessages: 0,
      notifications: [],
    }));
    localStorage.removeItem("xenjonUser");
  };

  const handleSignUp = () => {
    setState((prev) => ({
      ...prev,
      showSignUp: false,
    }));
  };

  // Handle user updates from Profile component
  const handleUserUpdate = (updatedUser: User) => {
    const userWithTimestamp = {
      ...updatedUser,
      lastUpdated: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      user: userWithTimestamp,
    }));
    // Also update the session storage to persist the changes
    localStorage.setItem(
      "xenjonUser",
      JSON.stringify(userWithTimestamp),
    );
    updateUserInStorage(userWithTimestamp);
  };

  if (!state.isAuthenticated) {
    if (state.showSignUp) {
      return (
        <SignUpForm
          onSignUp={handleSignUp}
          onBackToLogin={() =>
            setState((prev) => ({ ...prev, showSignUp: false }))
          }
        />
      );
    }
    return (
      <LoginForm
        onLogin={handleLogin}
        onSignUp={() =>
          setState((prev) => ({ ...prev, showSignUp: true }))
        }
      />
    );
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    ...(state.user?.role !== "admin"
      ? [
          {
            id: "messages",
            label: "Messages",
            icon: MessageSquare,
            badge:
              state.unreadMessages > 0
                ? state.unreadMessages
                : null,
          },
          { id: "calendar", label: "Calendar", icon: Calendar },
          {
            id: "classes",
            label: "My Classes",
            icon: UserCheck,
          },
          { id: "lessons", label: "Lessons", icon: BookOpen },
          {
            id: "update-time",
            label: "Update Time",
            icon: Clock,
          },
        ]
      : []),
    ...(state.user?.role === "admin"
      ? [
          { id: "faculty", label: "Faculty", icon: Users },
          {
            id: "students",
            label: "Student",
            icon: GraduationCap,
          },
          { id: "reports", label: "Reports", icon: FileText },
        ]
      : []),
    {
      id: "settings",
      label: "System Settings",
      icon: Settings,
    },
    { id: "profile", label: "My Profile", icon: User },
    ...(state.user?.role === "admin"
      ? [{ id: "admin", label: "Admin Panel", icon: UserCog }]
      : []),
  ];

  const renderContent = () => {
    switch (state.currentView) {
      case "dashboard":
        return (
          <Dashboard
            user={state.user}
            onNavigate={(view) =>
              setState((prev) => ({
                ...prev,
                currentView: view,
              }))
            }
          />
        );
      case "messages":
        return (
          <MessagingModule
            user={state.user}
            onUpdateNotifications={() =>
              loadNotifications(state.user!)
            }
          />
        );
      case "calendar":
        return <CalendarModule user={state.user} />;
      case "classes":
        return <ClassesModule user={state.user} />;
      case "lessons":
        return <LessonsModule user={state.user} />;
      case "update-time":
        return (
          <UpdateTimeModule
            user={state.user}
            onUserUpdate={handleUserUpdate}
          />
        );
      case "faculty":
        return <FacultyModule user={state.user} />;
      case "students":
        return <StudentModule user={state.user} />;
      case "reports":
        return <ReportsModule user={state.user} />;
      case "settings":
        return <SystemSettings user={state.user} />;
      case "profile":
        return (
          <Profile
            user={state.user}
            onUserUpdate={handleUserUpdate}
          />
        );
      case "admin":
        return state.user?.role === "admin" ? (
          <AdminPanel user={state.user} />
        ) : (
          <Dashboard
            user={state.user}
            onNavigate={(view) =>
              setState((prev) => ({
                ...prev,
                currentView: view,
              }))
            }
          />
        );
      default:
        return (
          <Dashboard
            user={state.user}
            onNavigate={(view) =>
              setState((prev) => ({
                ...prev,
                currentView: view,
              }))
            }
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <img
              src={academyLogo}
              alt="Xenjon Academy Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h2 className="font-medium">Xenjon Academy</h2>
              <p className="text-sm text-muted-foreground">
                Management System
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={
                state.currentView === item.id
                  ? "default"
                  : "ghost"
              }
              className="w-full justify-start relative"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  currentView: item.id,
                }))
              }
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
              {item.badge && (
                <Badge
                  variant="destructive"
                  className="ml-auto text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5"
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          {/* Notifications */}
          {state.notifications.length > 0 && (
            <div className="mb-3 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Recent Notifications
                </span>
              </div>
              <div className="space-y-1">
                {state.notifications
                  .slice(0, 2)
                  .map((notif: any) => (
                    <div
                      key={notif.id}
                      className="text-xs text-muted-foreground"
                    >
                      {notif.title}
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-3">
            {/* Profile photo or initials */}
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-primary">
              {state.user?.profilePhoto ? (
                <img
                  src={state.user.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary-foreground text-sm font-medium">
                  {state.user?.firstName?.[0]}
                  {state.user?.lastName?.[0]}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {state.user?.firstName} {state.user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {state.user?.role}
              </p>
              <p className="text-xs text-muted-foreground">
                Last active:{" "}
                {state.user?.lastUpdated
                  ? new Date(
                      state.user.lastUpdated,
                    ).toLocaleTimeString()
                  : "Unknown"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <Header user={state.user} onLogout={handleLogout} />

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}