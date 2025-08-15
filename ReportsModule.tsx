import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Download, FileText, Users, GraduationCap, RotateCcw, RefreshCw } from 'lucide-react';

type ReportsModuleProps = {
  user: any;
};

export function ReportsModule({ user }: ReportsModuleProps) {
  const [reportType, setReportType] = useState('students');
  const [courseFilter, setCourseFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const courses = JSON.parse(localStorage.getItem('xenjonCourses') || '[]');
  const departments = JSON.parse(localStorage.getItem('xenjonDepartments') || '[]');

  useEffect(() => {
    generateReport();
  }, [reportType, courseFilter, departmentFilter]);

  const generateReport = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Always fetch fresh data from localStorage
    const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
    const studentData = JSON.parse(localStorage.getItem('xenjonStudents') || '[]');
    const facultyData = JSON.parse(localStorage.getItem('xenjonFaculty') || '[]');

    let data = [];

    if (reportType === 'students') {
      data = users
        .filter((u: any) => u.role === 'student')
        .map((user: any) => {
          const details = studentData.find((s: any) => s.id === user.id) || {};
          return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            course: details.course || 'Computer Science',
            department: details.department || 'Engineering',
            year: details.year || '2024',
            enrollmentDate: details.enrollmentDate || '2024-01-01',
            status: details.status || 'active'
          };
        })
        .filter((s: any) => s.status === 'active');

      // Apply course filter
      if (courseFilter !== 'all') {
        data = data.filter((s: any) => s.course === courseFilter);
      }

      // Apply department filter
      if (departmentFilter !== 'all') {
        data = data.filter((s: any) => s.department === departmentFilter);
      }
    } else {
      data = users
        .filter((u: any) => u.role === 'faculty')
        .map((user: any) => {
          const details = facultyData.find((f: any) => f.id === user.id) || {};
          return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            department: details.department || 'Engineering',
            position: details.position || 'Assistant Professor',
            hireDate: details.hireDate || '2024-01-01',
            phone: details.phone || '+1 (555) 123-4567',
            status: details.status || 'active'
          };
        })
        .filter((f: any) => f.status === 'active');

      // Apply department filter
      if (departmentFilter !== 'all') {
        data = data.filter((f: any) => f.department === departmentFilter);
      }
    }

    setReportData(data);
    setLastUpdated(new Date());
    setLoading(false);
  };

  const resetFilters = () => {
    setCourseFilter('all');
    setDepartmentFilter('all');
  };

  const refreshReport = () => {
    generateReport();
  };

  const exportReport = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSV = () => {
    if (reportData.length === 0) return '';

    const headers = Object.keys(reportData[0]).filter(key => key !== 'status').join(',');
    const rows = reportData.map(row => {
      const filteredRow = Object.entries(row)
        .filter(([key]) => key !== 'status')
        .map(([, value]) => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        );
      return filteredRow.join(',');
    });

    return [headers, ...rows].join('\n');
  };

  const getReportSummary = () => {
    if (reportType === 'students') {
      const courseCounts = reportData.reduce((acc: any, student: any) => {
        acc[student.course] = (acc[student.course] || 0) + 1;
        return acc;
      }, {});

      const departmentCounts = reportData.reduce((acc: any, student: any) => {
        acc[student.department] = (acc[student.department] || 0) + 1;
        return acc;
      }, {});

      return {
        total: reportData.length,
        byCategory: courseCounts,
        byDepartment: departmentCounts
      };
    } else {
      const departmentCounts = reportData.reduce((acc: any, faculty: any) => {
        acc[faculty.department] = (acc[faculty.department] || 0) + 1;
        return acc;
      }, {});

      const positionCounts = reportData.reduce((acc: any, faculty: any) => {
        acc[faculty.position] = (acc[faculty.position] || 0) + 1;
        return acc;
      }, {});

      return {
        total: reportData.length,
        byCategory: positionCounts,
        byDepartment: departmentCounts
      };
    }
  };

  const summary = getReportSummary();

  return (
    <div className="min-h-full" style={{ backgroundColor: '#FFDAB9' }}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Reports</h1>
            <p className="text-muted-foreground">Generate and export detailed reports</p>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshReport} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportReport} disabled={reportData.length === 0 || loading}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Report Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-48">
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="students">Student Report</SelectItem>
                    <SelectItem value="faculty">Faculty Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {reportType === 'students' && (
                <div className="md:w-48">
                  <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map((course: any) => (
                        <SelectItem key={course.id} value={course.name}>{course.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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

              <Button variant="outline" onClick={resetFilters}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              {reportType === 'students' ? 
                <GraduationCap className="w-4 h-4 text-muted-foreground" /> :
                <Users className="w-4 h-4 text-muted-foreground" />
              }
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">
                {reportType === 'students' ? 'Active students' : 'Active faculty'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                By {reportType === 'students' ? 'Course' : 'Position'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(summary.byCategory).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="truncate">{key}</span>
                    <span className="font-medium">{value as number}</span>
                  </div>
                ))}
                {Object.keys(summary.byCategory).length === 0 && (
                  <p className="text-xs text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">By Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(summary.byDepartment).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="truncate">{key}</span>
                    <span className="font-medium">{value as number}</span>
                  </div>
                ))}
                {Object.keys(summary.byDepartment).length === 0 && (
                  <p className="text-xs text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {reportType === 'students' ? 'Student' : 'Faculty'} Report Data
              {loading && <span className="ml-2 text-sm text-muted-foreground">(Loading...)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Generating report...</p>
              </div>
            ) : reportData.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No data found for the selected filters</p>
                <Button variant="outline" onClick={refreshReport} className="mt-2">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      {reportType === 'students' ? (
                        <>
                          <TableHead>Course</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Enrollment Date</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead>Department</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Hire Date</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-mono">{record.id}</TableCell>
                        <TableCell className="font-medium">{record.name}</TableCell>
                        <TableCell>{record.email}</TableCell>
                        {reportType === 'students' ? (
                          <>
                            <TableCell>
                              <Badge variant="outline">{record.course}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{record.department}</Badge>
                            </TableCell>
                            <TableCell>{record.year}</TableCell>
                            <TableCell>{new Date(record.enrollmentDate).toLocaleDateString()}</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>
                              <Badge variant="secondary">{record.department}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{record.position}</Badge>
                            </TableCell>
                            <TableCell>{record.phone}</TableCell>
                            <TableCell>{new Date(record.hireDate).toLocaleDateString()}</TableCell>
                          </>
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