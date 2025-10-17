import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/constants/roles";
import {
  GraduationCap,
  Moon,
  Sun,
  RefreshCw,
  LogOut,
  Search,
  Upload,
  Download,
  Plus,
  Edit,
  Trash2,
  Users,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Check,
  Settings,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import AddStudentModal from "@/components/AddStudentModal";
import EditStudentModal from "@/components/EditStudentModal";
import StudentDetailModal from "@/components/StudentDetailModal";
import BulkActionModal from "@/components/BulkActionModal";
import FilterPresetModal from "@/components/FilterPresetModal";
import ExportExcelModal from "@/components/ExportExcelModal";
import EmailComposeModal from "@/components/EmailComposeModal";

export interface AttendanceRecord {
  date: string;
  status: "Present" | "Absent" | "Late";
  notes?: string;
  recordedBy: string;
  timestamp: string;
}

export interface AttendanceRule {
  id: string;
  name: string;
  type: "absence_threshold" | "lateness_pattern" | "consecutive_absences" | "attendance_percentage";
  threshold: number;
  isViolated: boolean;
  violationMessage?: string;
}

export interface Student {
  cunyId: string;
  firstName: string;
  lastName: string;
  privateEmail: string;
  cunyEmail: string;
  phone: string;
  startSemester: number; // Number of semesters already spent in the program
  currentSemester: string; // Current semester enrolled
  instructor: string;
  classTime: string;
  termStatus: string;
  cunyExam: string;
  accuplacerScore: number;
  essayScore: number;
  essayLink: string;
  michiganScore: number;
  tuitionStatus: string;
  payment: "Paid" | "Not Paid";
  notes: string;
  classStatus: "Enrolled" | "Dropped";
  instructorNotes: string;
  contactLog: { date: string; type: string; notes: string }[];
  history: { timestamp: string; action: string; user: string }[];
  attendance: AttendanceRecord[];
  attendanceRules: AttendanceRule[];
}

interface DashboardProps {
  initialStudentsData: Student[];
  onUpdateStudents: (students: Student[]) => void;
}

const Dashboard = ({ initialStudentsData, onUpdateStudents }: DashboardProps) => {
  const navigate = useNavigate();
  const { logout, role, instructorName } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [students, setStudents] = useState<Student[]>(initialStudentsData);

  // Sync local students with parent when they change
  useEffect(() => {
    onUpdateStudents(students);
  }, [students, onUpdateStudents]);
  // Load default semester from localStorage
  const getDefaultSemester = () => {
    return localStorage.getItem("defaultCurrentSemester") || "";
  };

  const [lastSync, setLastSync] = useState(new Date().toLocaleString());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSemesterFilter, setCurrentSemesterFilter] = useState<string>(getDefaultSemester());
  const [instructorFilter, setInstructorFilter] = useState("");
  const [termStatusFilter, setTermStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof Student | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filterPresets, setFilterPresets] = useState<Array<{ name: string; filters: any }>>([]);
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Sync with CUNYfirst
  const handleSync = () => {
    setLastSync(new Date().toLocaleString());
    toast.success("Synced with CUNYfirst successfully");
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    // Require an explicit semester selection. If none selected, show nothing.
    if (currentSemesterFilter === "") {
      return [];
    }

    let filtered = students.filter((student) => {
      const matchesSearch =
        searchTerm === "" ||
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.cunyId.includes(searchTerm) ||
        student.privateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.cunyEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCurrentSemester = student.currentSemester === currentSemesterFilter;
      const matchesInstructor = instructorFilter === "" || student.instructor === instructorFilter;
      const matchesTermStatus = termStatusFilter === "" || student.termStatus === termStatusFilter;
      const matchesPayment = paymentFilter === "" || student.payment === paymentFilter;

      return matchesSearch && matchesCurrentSemester && matchesInstructor && matchesTermStatus && matchesPayment;
    });

    // Apply stat card filter
    if (activeStatFilter) {
      if (activeStatFilter === "active-bmcc") {
        filtered = filtered.filter((s) => s.termStatus === "TERM ACTIVE/BMCC");
      } else if (activeStatFilter === "active-other") {
        filtered = filtered.filter((s) => s.termStatus === "TERM ACTIVE/NOT BMCC");
      } else if (activeStatFilter === "not-active") {
        filtered = filtered.filter((s) => s.termStatus === "TERM NOT ACTIVE");
      } else if (activeStatFilter === "paid") {
        filtered = filtered.filter((s) => s.payment === "Paid");
      } else if (activeStatFilter === "not-paid") {
        filtered = filtered.filter((s) => s.payment === "Not Paid");
      }
    }

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
  }, [students, searchTerm, currentSemesterFilter, instructorFilter, termStatusFilter, paymentFilter, activeStatFilter, sortColumn, sortDirection]);

  // Calculate statistics based on filtered data
  const stats = useMemo(() => {
    const activeBMCC = filteredStudents.filter((s) => s.termStatus === "TERM ACTIVE/BMCC").length;
    const activeOther = filteredStudents.filter((s) => s.termStatus === "TERM ACTIVE/NOT BMCC").length;
    const notActive = filteredStudents.filter((s) => s.termStatus === "TERM NOT ACTIVE").length;
    
    const paidCount = filteredStudents.filter((s) => s.payment === "Paid").length;
    const notPaidCount = filteredStudents.filter((s) => s.payment === "Not Paid").length;

    return {
      total: filteredStudents.length,
      activeBMCC,
      activeOther,
      notActive,
      paidCount,
      notPaidCount,
    };
  }, [filteredStudents]);

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

  // Handle select all
  const handleSelectAll = () => {
    if (selectedStudents.length === paginatedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(paginatedStudents.map((s) => s.cunyId));
    }
  };

  // Handle select student
  const handleSelectStudent = (cunyId: string) => {
    if (selectedStudents.includes(cunyId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== cunyId));
    } else {
      setSelectedStudents([...selectedStudents, cunyId]);
    }
  };

  // Add student
  const handleAddStudent = (student: Student) => {
    if (students.find((s) => s.cunyId === student.cunyId)) {
      toast.error("Student with this CUNY ID already exists");
      return;
    }
    setStudents([...students, student]);
    toast.success("Student added successfully");
  };

  // Edit student
  const handleEditStudent = (updatedStudent: Student) => {
    setStudents(students.map((s) => (s.cunyId === updatedStudent.cunyId ? updatedStudent : s)));
    toast.success("Student updated successfully");
  };

  // Delete student
  const handleDeleteStudent = (cunyId: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter((s) => s.cunyId !== cunyId));
      toast.success("Student deleted successfully");
    }
  };

  // Import Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const importedStudents: Student[] = jsonData.map((row: any) => ({
          cunyId: String(row["CUNY ID"] || row["CUNYID"] || row["cunyId"] || ""),
          firstName: String(row["First Name"] || row["FirstName"] || row["firstName"] || ""),
          lastName: String(row["Last Name"] || row["LastName"] || row["lastName"] || ""),
          privateEmail: String(row["Private Email"] || row["PrivateEmail"] || row["privateEmail"] || ""),
          cunyEmail: String(row["CUNY Email"] || row["CUNYEmail"] || row["cunyEmail"] || ""),
          phone: String(row["Phone"] || row["phone"] || ""),
          startSemester: Number(row["Start Semester"] || row["StartSemester"] || row["startSemester"] || 0),
          instructor: String(row["Instructor"] || row["instructor"] || ""),
          classTime: String(row["Class Time"] || row["ClassTime"] || row["classTime"] || ""),
          termStatus: String(row["Term Status"] || row["TermStatus"] || row["termStatus"] || ""),
          cunyExam: String(row["CUNY Exam"] || row["CUNYExam"] || row["cunyExam"] || ""),
          accuplacerScore: Number(row["Accuplacer Score"] || row["AccuplacerScore"] || row["accuplacerScore"] || 0),
          essayScore: Number(row["Essay Score"] || row["EssayScore"] || row["essayScore"] || 0),
          essayLink: String(row["Essay Link"] || row["EssayLink"] || row["essayLink"] || ""),
          michiganScore: Number(row["Michigan Score"] || row["MichiganScore"] || row["michiganScore"] || 0),
          tuitionStatus: String(row["Tuition Status"] || row["TuitionStatus"] || row["tuitionStatus"] || ""),
          payment: (String(row["Payment"] || row["payment"] || "Paid") === "Paid" ? "Paid" : "Not Paid") as "Paid" | "Not Paid",
          notes: String(row["Notes"] || row["notes"] || ""),
          currentSemester: String(row["Current Semester"] || row["CurrentSemester"] || row["currentSemester"] || "Spring 2026"),
          classStatus: "Enrolled" as "Enrolled" | "Dropped",
          instructorNotes: "",
          contactLog: [],
          history: [{ timestamp: new Date().toISOString(), action: "Imported", user: "admin" }],
        }));

        setStudents(importedStudents);
        setLastSync(new Date().toLocaleString());
        toast.success(`Imported ${importedStudents.length} students successfully`);
      } catch (error) {
        toast.error("Failed to import Excel file");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  // Export Excel - now opens modal
  const handleExportExcel = () => {
    setIsExportModalOpen(true);
  };

  // Handle bulk action
  const handleBulkAction = (field: string, value: string) => {
    const updatedStudents = students.map((s) => {
      if (selectedStudents.includes(s.cunyId)) {
        return { ...s, [field]: value };
      }
      return s;
    });
    setStudents(updatedStudents);
    setSelectedStudents([]);
    toast.success(`Updated ${selectedStudents.length} students`);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setCurrentSemesterFilter(getDefaultSemester());
    setInstructorFilter("");
    setTermStatusFilter("");
    setPaymentFilter("");
    setActiveStatFilter(null);
  };

  // Save default semester
  const handleSaveDefaultSemester = (semester: string) => {
    localStorage.setItem("defaultCurrentSemester", semester);
    setCurrentSemesterFilter(semester);
    toast.success(semester ? `Default semester set to ${semester}` : "Default semester cleared");
  };

  // Get unique current semesters from students
  const uniqueCurrentSemesters = useMemo(() => {
    const semesters = new Set(students.map((s) => s.currentSemester));
    return Array.from(semesters).sort();
  }, [students]);

  // Save filter preset
  const handleSavePreset = (name: string) => {
    const preset = {
      name,
      filters: {
        searchTerm,
        currentSemesterFilter,
        instructorFilter,
        termStatusFilter,
        paymentFilter,
      },
    };
    setFilterPresets([...filterPresets, preset]);
    toast.success("Filter preset saved");
  };

  // Load filter preset
  const handleLoadPreset = (preset: any) => {
    setSearchTerm(preset.filters.searchTerm);
    setCurrentSemesterFilter(preset.filters.currentSemesterFilter || "");
    setInstructorFilter(preset.filters.instructorFilter);
    setTermStatusFilter(preset.filters.termStatusFilter);
    setPaymentFilter(preset.filters.paymentFilter);
    setActiveStatFilter(null);
    toast.success("Filter preset loaded");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/overview")} className="mr-2">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="bg-primary/10 p-2 rounded-lg">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">CLIP Management System</h1>
                <p className="text-sm text-muted-foreground">
                  {instructorName || (role === 'admin' ? 'Administrator' : role === 'office' ? 'Office Staff' : 'Instructor')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-4">
                <p className="text-xs text-muted-foreground">Last Sync</p>
                <p className="text-sm font-medium text-foreground">{lastSync}</p>
              </div>
              <Button variant="outline" size="icon" onClick={toggleDarkMode}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground whitespace-nowrap">Default Semester:</label>
                <select
                  value={getDefaultSemester()}
                  onChange={(e) => handleSaveDefaultSemester(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background text-foreground text-sm min-w-[160px]"
                >
                  <option value="">None (show none)</option>
                  {uniqueCurrentSemesters.map((semester) => (
                    <option key={semester} value={semester}>
                      {semester}
                    </option>
                  ))}
                </select>
              </div>
              {hasPermission(role, 'canManageUsers') && (
                <Button variant="outline" onClick={() => navigate("/user-management")}>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              )}
              <Button variant="default" onClick={handleSync} className="bg-success hover:bg-success/90">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync with CUNYfirst
              </Button>
              <Button variant="outline" onClick={async () => {
                await logout();
                toast.success("Logged out successfully");
                navigate("/", { replace: true });
              }}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div
            className={`bg-card p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all ${
              activeStatFilter === null ? "border-primary" : "border-transparent hover:border-primary/50"
            }`}
            onClick={() => setActiveStatFilter(null)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div
            className={`bg-card p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all ${
              activeStatFilter === "active-bmcc" ? "border-success" : "border-transparent hover:border-success/50"
            }`}
            onClick={() => setActiveStatFilter(activeStatFilter === "active-bmcc" ? null : "active-bmcc")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active BMCC</p>
                <p className="text-3xl font-bold text-foreground">{stats.activeBMCC}</p>
              </div>
              <div className="w-3 h-3 bg-success rounded-full"></div>
            </div>
          </div>

          <div
            className={`bg-card p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all ${
              activeStatFilter === "active-other" ? "border-warning" : "border-transparent hover:border-warning/50"
            }`}
            onClick={() => setActiveStatFilter(activeStatFilter === "active-other" ? null : "active-other")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Other CUNY</p>
                <p className="text-3xl font-bold text-foreground">{stats.activeOther}</p>
              </div>
              <div className="w-3 h-3 bg-warning rounded-full"></div>
            </div>
          </div>

          <div
            className={`bg-card p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all ${
              activeStatFilter === "not-active" ? "border-destructive" : "border-transparent hover:border-destructive/50"
            }`}
            onClick={() => setActiveStatFilter(activeStatFilter === "not-active" ? null : "not-active")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Not Active</p>
                <p className="text-3xl font-bold text-foreground">{stats.notActive}</p>
              </div>
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
            </div>
          </div>

          <div
            className={`bg-card p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all ${
              activeStatFilter === "paid" ? "border-success" : "border-transparent hover:border-success/50"
            }`}
            onClick={() => setActiveStatFilter(activeStatFilter === "paid" ? null : "paid")}
          >
            <div>
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-2xl font-bold text-success">{stats.paidCount}</p>
            </div>
          </div>

          <div
            className={`bg-card p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all ${
              activeStatFilter === "not-paid" ? "border-destructive" : "border-transparent hover:border-destructive/50"
            }`}
            onClick={() => setActiveStatFilter(activeStatFilter === "not-paid" ? null : "not-paid")}
          >
            <div>
              <p className="text-sm text-muted-foreground">Not Paid</p>
              <p className="text-2xl font-bold text-destructive">{stats.notPaidCount}</p>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-card p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, CUNY ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background text-foreground"
            >
              <option value="">All Instructors</option>
              <option value="Prof. James Wilson">Prof. James Wilson</option>
              <option value="Dr. Lisa Anderson">Dr. Lisa Anderson</option>
              <option value="Dr. Maria Rodriguez">Dr. Maria Rodriguez</option>
              <option value="Dr. Sarah Mitchell">Dr. Sarah Mitchell</option>
            </select>
            <Button variant="outline" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            {selectedStudents.length > 0 && (
              <>
                <Button variant="outline" onClick={() => setIsBulkModalOpen(true)}>
                  Bulk Actions ({selectedStudents.length})
                </Button>
                <Button variant="outline" onClick={() => setIsEmailModalOpen(true)} className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900">
                  <Mail className="w-4 h-4 mr-2" />
                  Email ({selectedStudents.length})
                </Button>
              </>
            )}
            <Button variant="outline" onClick={handleClearFilters}>
              Clear All
            </Button>
            {hasPermission(role, 'canImportExcel') && (
              <label>
                <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" />
                <Button variant="default" className="bg-success hover:bg-success/90" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Excel
                  </span>
                </Button>
              </label>
            )}
            <Button variant="default" className="bg-purple-600 hover:bg-purple-700" onClick={handleExportExcel}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="default" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <select
                value={termStatusFilter}
                onChange={(e) => setTermStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-md bg-background text-foreground"
              >
                <option value="">All Term Status</option>
                <option value="TERM ACTIVE/BMCC">TERM ACTIVE/BMCC</option>
                <option value="TERM ACTIVE/NOT BMCC">TERM ACTIVE/NOT BMCC</option>
                <option value="TERM NOT ACTIVE">TERM NOT ACTIVE</option>
              </select>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-4 py-2 border rounded-md bg-background text-foreground"
              >
                <option value="">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Not Paid">Not Paid</option>
              </select>
              <Button variant="outline" size="sm" onClick={() => setIsPresetModalOpen(true)}>
                Save Preset
              </Button>
              {filterPresets.map((preset, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleLoadPreset(preset)}
                >
                  {preset.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70"
                    onClick={() => handleSort("cunyId")}
                  >
                    <div className="flex items-center gap-2">
                      CUNY ID
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70"
                    onClick={() => handleSort("firstName")}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Private Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">CUNY Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Start Semester</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Current Semester</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Instructor</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Term Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">CUNY Exam</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Accuplacer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Essay</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Michigan</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Tuition</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Payment</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr
                    key={student.cunyId}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.cunyId)}
                        onChange={() => handleSelectStudent(student.cunyId)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{student.cunyId}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsDetailModalOpen(true);
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        {student.firstName} {student.lastName}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{student.privateEmail}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm ${
                          student.cunyEmail.endsWith("@stu.bmcc.cuny.edu")
                            ? "text-success font-medium"
                            : "text-destructive font-medium"
                        }`}
                      >
                        {student.cunyEmail}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{student.phone}</td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      <div className="flex items-center gap-2">
                        {student.startSemester}
                        {student.startSemester > 3 && (
                          <Badge variant="destructive" className="bg-orange-600 hover:bg-orange-700">
                            ⚠️ Max
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{student.currentSemester}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{student.instructor}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          student.termStatus === "TERM ACTIVE/BMCC"
                            ? "default"
                            : student.termStatus === "TERM ACTIVE/NOT BMCC"
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          student.termStatus === "TERM ACTIVE/BMCC"
                            ? "bg-success hover:bg-success/90"
                            : student.termStatus === "TERM ACTIVE/NOT BMCC"
                            ? "bg-warning hover:bg-warning/90"
                            : ""
                        }
                      >
                        {student.termStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          student.cunyExam === "ACESL-COMP"
                            ? "default"
                            : student.cunyExam === "Scheduled"
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          student.cunyExam === "ACESL-COMP"
                            ? "bg-success hover:bg-success/90"
                            : student.cunyExam === "Scheduled"
                            ? "bg-primary hover:bg-primary/90"
                            : ""
                        }
                      >
                        {student.cunyExam}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{student.accuplacerScore}</td>
                    <td className="px-4 py-3">
                      {student.essayLink ? (
                        <a
                          href={student.essayLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {student.essayScore}
                        </a>
                      ) : (
                        <span className="text-sm text-foreground">{student.essayScore}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{student.michiganScore}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{student.tuitionStatus}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium ${
                          student.payment === "Paid" ? "text-success" : "text-destructive"
                        }`}
                      >
                        {student.payment}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStudent(student.cunyId)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddStudent}
      />
      {selectedStudent && (
        <>
          <EditStudentModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedStudent(null);
            }}
            onEdit={handleEditStudent}
            student={selectedStudent}
          />
          <StudentDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedStudent(null);
            }}
            student={selectedStudent}
            onUpdateNotes={(notes) => {
              const updated = { ...selectedStudent, notes };
              handleEditStudent(updated);
              setSelectedStudent(updated);
            }}
          />
        </>
      )}
      <BulkActionModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onApply={handleBulkAction}
        selectedCount={selectedStudents.length}
      />
      <FilterPresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onSave={handleSavePreset}
      />
      <ExportExcelModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={filteredStudents}
      />
      <EmailComposeModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        recipients={students.filter(s => selectedStudents.includes(s.cunyId))}
        instructorName={instructorName || undefined}
      />
    </div>
  );
};

export default Dashboard;
