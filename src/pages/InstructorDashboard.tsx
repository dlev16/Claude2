import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  GraduationCap,
  LogOut,
  Search,
  Edit,
  Users,
  CheckCircle,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Student } from "./Dashboard";
import InstructorStudentDetailModal from "@/components/InstructorStudentDetailModal";
import InstructorEditStudentModal from "@/components/InstructorEditStudentModal";
import EmailComposeModal from "@/components/EmailComposeModal";
import AttendanceModal from "@/components/AttendanceModal";

interface InstructorDashboardProps {
  instructorName: string;
  allStudents: Student[];
  onUpdateStudent: (student: Student) => void;
}

const InstructorDashboard = ({ instructorName, allStudents, onUpdateStudent }: InstructorDashboardProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // Default to show all students
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof Student | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const itemsPerPage = 30;

  // Filter to show only this instructor's students
  const myStudents = useMemo(() => {
    return allStudents.filter((student) => student.instructor === instructorName);
  }, [allStudents, instructorName]);

  // Apply additional filters
  const filteredStudents = useMemo(() => {
    let filtered = myStudents.filter((student) => {
      const matchesSearch =
        searchTerm === "" ||
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.cunyId.includes(searchTerm) ||
        student.privateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.cunyEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "" || student.classStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort students
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }

    return filtered;
  }, [myStudents, searchTerm, statusFilter, sortColumn, sortDirection]);

  // Calculate simplified statistics
  const stats = useMemo(() => {
    const total = myStudents.length;
    const enrolled = myStudents.filter((s) => s.classStatus === "Enrolled").length;
    const dropped = myStudents.filter((s) => s.classStatus === "Dropped").length;

    return { total, enrolled, dropped };
  }, [myStudents]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sort
  const handleSort = (column: keyof Student) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Edit student
  const handleEditStudent = (updatedStudent: Student) => {
    onUpdateStudent(updatedStudent);
    toast.success("Student information updated successfully");
  };

  // Update student notes and contact log
  const handleUpdateStudent = (updatedStudent: Student) => {
    onUpdateStudent(updatedStudent);
    toast.success("Student information updated successfully");
  };

  // Export removed for security - instructors cannot export student data

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  // Logout
  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with teal accent */}
      <header className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950 border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/overview")} className="mr-2">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="bg-teal-500/10 p-2 rounded-lg">
                <GraduationCap className="w-8 h-8 text-teal-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">CLIP Management System - Instructor Portal</h1>
                <p className="text-sm text-muted-foreground">{instructorName} • Spring 2025</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-teal-500/10 text-teal-700 border-teal-300">
                Instructor View
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Simplified Statistics Cards (Only 3 cards) */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div 
            className={`bg-card rounded-lg p-6 shadow-sm border border-border cursor-pointer ${statusFilter === "" ? "ring-2 ring-teal-500" : ""}`}
            onClick={() => setStatusFilter("")}
          >
            <div className="flex items-center gap-4">
              <div className="bg-teal-500/10 p-3 rounded-lg">
                <Users className="w-8 h-8 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Students in my classes</p>
              </div>
            </div>
          </div>

          <div
            className={`bg-card rounded-lg p-6 shadow-sm border border-border cursor-pointer ${statusFilter === "Enrolled" ? "ring-2 ring-green-500" : ""}`}
            onClick={() => setStatusFilter("Enrolled")}
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Enrolled</p>
                <p className="text-3xl font-bold text-foreground">{stats.enrolled}</p>
                <p className="text-xs text-muted-foreground mt-1">Currently enrolled</p>
              </div>
            </div>
          </div>

          <div
            className={`bg-card rounded-lg p-6 shadow-sm border border-border cursor-pointer ${statusFilter === "Dropped" ? "ring-2 ring-red-500" : ""}`}
            onClick={() => setStatusFilter("Dropped")}
          >
            <div className="flex items-center gap-4">
              <div className="bg-red-500/10 p-3 rounded-lg">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dropped</p>
                <p className="text-3xl font-bold text-foreground">{stats.dropped}</p>
                <p className="text-xs text-muted-foreground mt-1">Dropped from class</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border mb-4">
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, CUNY ID, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <select
              className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Enrolled">Enrolled</option>
              <option value="Dropped">Dropped</option>
            </select>

            {(searchTerm || statusFilter) && (
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}

            {selectedStudents.length > 0 && (
              <Button variant="outline" onClick={() => setIsEmailModalOpen(true)} className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900">
                <Mail className="w-4 h-4 mr-2" />
                Email ({selectedStudents.length})
              </Button>
            )}
          </div>
        </div>

        {/* Simplified Data Table */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-center w-12">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(paginatedStudents.map(s => s.cunyId));
                        } else {
                          setSelectedStudents([]);
                        }
                      }}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer" onClick={() => handleSort("cunyId")}>
                    <div className="flex items-center gap-1">
                      CUNY ID
                      {sortColumn === "cunyId" ? (
                        sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer" onClick={() => handleSort("firstName")}>
                    <div className="flex items-center gap-1">
                      Name
                      {sortColumn === "firstName" ? (
                        sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Private Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">CUNY Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer" onClick={() => handleSort("startSemester")}>
                    <div className="flex items-center gap-1">
                      Start Semester
                      {sortColumn === "startSemester" ? (
                        sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer" onClick={() => handleSort("classStatus")}>
                    <div className="flex items-center gap-1">
                      Status
                      {sortColumn === "classStatus" ? (
                        sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student, index) => (
                  <tr
                    key={student.cunyId}
                    className={`border-b border-border hover:bg-muted/50 ${index % 2 === 0 ? "bg-card" : "bg-muted/20"}`}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.cunyId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.cunyId]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.cunyId));
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{student.cunyId}</td>
                    <td
                      className="px-4 py-3 text-sm text-primary font-medium cursor-pointer hover:underline"
                      onClick={() => {
                        setSelectedStudent(student);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{student.privateEmail}</td>
                    <td
                      className={`px-4 py-3 text-sm font-medium ${
                        student.cunyEmail.endsWith("@stu.bmcc.cuny.edu") ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {student.cunyEmail}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{student.phone}</td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      <div className="flex items-center gap-2">
                        {typeof student.startSemester === 'number' 
                          ? student.startSemester 
                          : String(student.startSemester).match(/\d+/)?.[0] || student.startSemester}
                        {(typeof student.startSemester === 'number' ? student.startSemester : parseInt(String(student.startSemester).match(/\d+/)?.[0] || '0')) > 3 && (
                          <Badge variant="destructive" className="bg-orange-600 hover:bg-orange-700">
                            ⚠️ Max
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={student.classStatus === "Enrolled" ? "bg-green-500" : "bg-red-500"}>
                        {student.classStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsAttendanceModalOpen(true);
                          }}
                          title="Take Attendance"
                        >
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsEditModalOpen(true);
                          }}
                          title="Edit Student"
                        >
                          <Edit className="w-4 h-4 text-teal-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedStudent && (
        <>
          <InstructorEditStudentModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            student={selectedStudent}
            onEdit={handleEditStudent}
          />
          <InstructorStudentDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            student={selectedStudent}
            onUpdate={handleUpdateStudent}
          />
        </>
      )}
      <EmailComposeModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        recipients={myStudents.filter(s => selectedStudents.includes(s.cunyId))}
        instructorName={instructorName}
      />
      {selectedStudent && (
        <AttendanceModal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          student={selectedStudent}
          onUpdate={handleUpdateStudent}
          instructorName={instructorName}
        />
      )}
    </div>
  );
};

export default InstructorDashboard;
