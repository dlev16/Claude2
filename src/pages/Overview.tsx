import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  GraduationCap,
  UserCheck,
  TrendingUp,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Activity,
  Calendar,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { initialMockStudents } from "@/data/mockStudents";
import { ROLES } from "@/constants/roles";

const Overview = () => {
  const navigate = useNavigate();
  const { role, instructorName, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Calculate statistics
  const stats = useMemo(() => {
    // For instructors, filter by their name
    const studentsToCount = role === ROLES.INSTRUCTOR && instructorName
      ? initialMockStudents.filter(s => s.instructor === instructorName)
      : initialMockStudents;

    const total = studentsToCount.length;
    const active = studentsToCount.filter((s) => s.termStatus === "Active (BMCC)" || s.termStatus === "Active (Other)").length;
    const paid = studentsToCount.filter((s) => s.payment === "Paid").length;
    const unpaid = total - paid;
    const bmcc = studentsToCount.filter((s) => s.termStatus === "Active (BMCC)").length;

    return { total, active, paid, unpaid, bmcc, inactive: total - active };
  }, [role, instructorName]);

  const recentActivity = [
    { action: "New student enrolled", time: "2 hours ago", type: "success" },
    { action: "Payment received", time: "4 hours ago", type: "info" },
    { action: "Grade updated", time: "5 hours ago", type: "warning" },
    { action: "Report generated", time: "1 day ago", type: "default" },
  ];

  const quickActions = [
    {
      title: "Student Management",
      description: "View and manage all student records",
      icon: Users,
      action: () => navigate("/dashboard"),
      roles: [ROLES.ADMIN, ROLES.OFFICE, ROLES.INSTRUCTOR],
    },
    {
      title: "User Management",
      description: "Manage system users and permissions",
      icon: Settings,
      action: () => navigate("/user-management"),
      roles: [ROLES.ADMIN],
    },
    {
      title: "Reports",
      description: "Generate and view reports",
      icon: FileText,
      action: () => navigate("/dashboard"),
      roles: [ROLES.ADMIN, ROLES.OFFICE],
    },
    {
      title: "My Students",
      description: "View students in your classes",
      icon: GraduationCap,
      action: () => navigate("/dashboard"),
      roles: [ROLES.INSTRUCTOR],
    },
  ];

  const getMetricTrend = (value: number, max: number) => {
    return Math.round((value / max) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Student Portal</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Badge variant="outline" className="hidden sm:inline-flex">
                {role}
              </Badge>
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {darkMode ? "🌞" : "🌙"}
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Welcome back{instructorName ? `, ${instructorName}` : ""}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here's what's happening with your students today
          </p>
        </div>

        {/* Stats Grid - Simplified for Instructors */}
        {role === ROLES.INSTRUCTOR ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  My Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.total}</div>
                <Progress value={100} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">Students in my classes</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Students
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.active}</div>
                <Progress value={getMetricTrend(stats.active, stats.total)} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {getMetricTrend(stats.active, stats.total)}% of total
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.total}</div>
                <Progress value={100} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">All enrolled students</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Students
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.active}</div>
                <Progress value={getMetricTrend(stats.active, stats.total)} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {getMetricTrend(stats.active, stats.total)}% of total
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  BMCC Students
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.bmcc}</div>
                <Progress value={getMetricTrend(stats.bmcc, stats.total)} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">Currently at BMCC</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Payments Paid
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.paid}</div>
                <Progress value={getMetricTrend(stats.paid, stats.total)} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.unpaid} pending payment
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Access key features and tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions
                  .filter((action) => action.roles.includes(role!))
                  .map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto flex-col items-start gap-2 p-4 hover:bg-accent hover:text-accent-foreground"
                      onClick={action.action}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <action.icon className="h-5 w-5" />
                        <span className="font-semibold text-sm sm:text-base">{action.title}</span>
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </div>
                      <p className="text-xs text-muted-foreground text-left">{action.description}</p>
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics - Hidden for instructors */}
        {role !== ROLES.INSTRUCTOR && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Enrollment Status
              </CardTitle>
              <CardDescription>Student distribution by status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Active Students</span>
                  <span className="text-sm text-muted-foreground">{stats.active}</span>
                </div>
                <Progress value={getMetricTrend(stats.active, stats.total)} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Inactive Students</span>
                  <span className="text-sm text-muted-foreground">{stats.inactive}</span>
                </div>
                <Progress value={getMetricTrend(stats.inactive, stats.total)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Payment Status
              </CardTitle>
              <CardDescription>Financial overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Paid</span>
                  <span className="text-sm text-muted-foreground">{stats.paid}</span>
                </div>
                <Progress value={getMetricTrend(stats.paid, stats.total)} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Pending</span>
                  <span className="text-sm text-muted-foreground">{stats.unpaid}</span>
                </div>
                <Progress value={getMetricTrend(stats.unpaid, stats.total)} />
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </main>
    </div>
  );
};

export default Overview;
