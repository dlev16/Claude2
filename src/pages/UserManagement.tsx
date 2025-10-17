import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Edit,
  Trash2,
  MoreVertical,
  ShieldCheck,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import AddUserModal from "@/components/AddUserModal";
import EditUserModal from "@/components/EditUserModal";
import DeleteUserConfirmModal from "@/components/DeleteUserConfirmModal";
import { User, UserRole, UserStatus, CreateUserData, UpdateUserData } from "@/types/user";
import { formatDistanceToNow } from "date-fns";

// Mock data - replace with API calls
const mockUsers: User[] = [
  // Admin
  {
    id: "1",
    username: "admin",
    firstName: "System",
    lastName: "Administrator",
    email: "admin@institution.edu",
    role: "admin",
    status: "active",
    phone: "(555) 000-0001",
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "system",
  },
  // Teachers (12)
  {
    id: "2",
    username: "jwilson",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@institution.edu",
    role: "teacher",
    status: "active",
    phone: "(555) 123-4567",
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "3",
    username: "landerson",
    firstName: "Lisa",
    lastName: "Anderson",
    email: "lisa.anderson@institution.edu",
    role: "teacher",
    status: "active",
    phone: "(555) 234-5678",
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "4",
    username: "mrodriguez",
    firstName: "Maria",
    lastName: "Rodriguez",
    email: "maria.rodriguez@institution.edu",
    role: "teacher",
    status: "active",
    phone: "(555) 345-6789",
    lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "5",
    username: "smitchell",
    firstName: "Sarah",
    lastName: "Mitchell",
    email: "sarah.mitchell@institution.edu",
    role: "teacher",
    status: "active",
    phone: "(555) 456-7890",
    lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 175 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "6",
    username: "mchen",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@institution.edu",
    role: "teacher",
    status: "active",
    phone: "(555) 567-8901",
    lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 160 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "7",
    username: "jlopez",
    firstName: "Jennifer",
    lastName: "Lopez",
    email: "jennifer.lopez@institution.edu",
    role: "teacher",
    status: "active",
    phone: "(555) 678-9012",
    lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 145 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "8",
    username: "dkim",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@institution.edu",
    role: "teacher",
    status: "active",
    phone: "(555) 789-0123",
    lastLogin: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 130 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "9",
    username: "ebrown",
    firstName: "Emily",
    lastName: "Brown",
    email: "emily.brown@institution.edu",
    role: "teacher",
    status: "active",
    phone: "(555) 890-1234",
    lastLogin: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 115 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "10",
    username: "rtaylor",
    firstName: "Robert",
    lastName: "Taylor",
    email: "robert.taylor@institution.edu",
    role: "teacher",
    status: "active",
    phone: "(555) 901-2345",
    lastLogin: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "11",
    username: "awhite",
    firstName: "Amanda",
    lastName: "White",
    email: "amanda.white@institution.edu",
    role: "teacher",
    status: "active",
    phone: "(555) 012-3456",
    lastLogin: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "12",
    username: "daytime",
    firstName: "Daytime",
    lastName: "Gateway",
    email: "daytime.gateway@institution.edu",
    role: "teacher",
    status: "active",
    phone: "(555) 123-7890",
    lastLogin: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "13",
    username: "evening",
    firstName: "Evening",
    lastName: "Gateway",
    email: "evening.gateway@institution.edu",
    role: "teacher",
    status: "active",
    phone: "(555) 234-8901",
    lastLogin: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  // Office Staff (7)
  {
    id: "14",
    username: "pjohnson",
    firstName: "Patricia",
    lastName: "Johnson",
    email: "patricia.johnson@institution.edu",
    role: "office",
    status: "active",
    phone: "(555) 111-2222",
    lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "15",
    username: "twilliams",
    firstName: "Thomas",
    lastName: "Williams",
    email: "thomas.williams@institution.edu",
    role: "office",
    status: "active",
    phone: "(555) 222-3333",
    lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 105 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "16",
    username: "bdavis",
    firstName: "Barbara",
    lastName: "Davis",
    email: "barbara.davis@institution.edu",
    role: "office",
    status: "active",
    phone: "(555) 333-4444",
    lastLogin: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "17",
    username: "cmiller",
    firstName: "Christopher",
    lastName: "Miller",
    email: "christopher.miller@institution.edu",
    role: "office",
    status: "active",
    phone: "(555) 444-5555",
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "18",
    username: "nmoore",
    firstName: "Nancy",
    lastName: "Moore",
    email: "nancy.moore@institution.edu",
    role: "office",
    status: "active",
    phone: "(555) 555-6666",
    lastLogin: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "19",
    username: "mthompson",
    firstName: "Mark",
    lastName: "Thompson",
    email: "mark.thompson@institution.edu",
    role: "office",
    status: "active",
    phone: "(555) 666-7777",
    lastLogin: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
  {
    id: "20",
    username: "sgarcia",
    firstName: "Susan",
    lastName: "Garcia",
    email: "susan.garcia@institution.edu",
    role: "office",
    status: "active",
    phone: "(555) 777-8888",
    lastLogin: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin",
  },
];

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof User | null>("lastName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const itemsPerPage = 10;
  const currentUserId = "admin"; // Replace with actual current user ID

  // Filter users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        searchTerm === "" ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "" || user.role === roleFilter;
      const matchesStatus = statusFilter === "" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort users
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, sortColumn, sortDirection]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const admins = users.filter((u) => u.role === "admin").length;
    const teachers = users.filter((u) => u.role === "teacher").length;
    const staff = users.filter((u) => u.role === "office").length;
    
    return { total, active, admins, teachers, staff };
  }, [users]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column: keyof User) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleAddUser = async (userData: CreateUserData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check for duplicate email
    if (users.some((u) => u.email === userData.email)) {
      return { success: false, error: "A user with this email already exists" };
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + "A1!";

    const newUser: User = {
      id: String(users.length + 1),
      ...userData,
      status: "pending",
      createdAt: new Date().toISOString(),
      createdBy: currentUserId,
    };

    setUsers([...users, newUser]);
    
    return { success: true, temporaryPassword: tempPassword };
  };

  const handleUpdateUser = async (userId: string, updates: UpdateUserData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setUsers(
      users.map((u) =>
        u.id === userId
          ? {
              ...u,
              ...updates,
              lastModifiedAt: new Date().toISOString(),
              lastModifiedBy: currentUserId,
            }
          : u
      )
    );

    return { success: true };
  };

  const handleResetPassword = async (userId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const tempPassword = Math.random().toString(36).slice(-12) + "A1!";
    
    return { success: true, temporaryPassword: tempPassword };
  };

  const handleDeleteUser = async (userId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setUsers(users.filter((u) => u.id !== userId));
    
    return { success: true };
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setStatusFilter("");
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split("@");
    if (local.length <= 3) return email;
    return `${local.slice(0, 3)}***@${domain}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/overview")} className="mr-2">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="bg-primary/10 p-2 rounded-lg">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                <p className="text-sm text-muted-foreground">Manage administrators, teachers, and office staff accounts</p>
              </div>
            </div>
            <Button onClick={() => navigate("/overview")}>
              Back to Overview
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <div className="flex items-center gap-4">
              <div className="bg-success/10 p-3 rounded-lg">
                <Users className="w-8 h-8 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                <p className="text-3xl font-bold text-foreground">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <div className="flex items-center gap-4">
              <div className="bg-destructive/10 p-3 rounded-lg">
                <ShieldCheck className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Administrators</p>
                <p className="text-3xl font-bold text-foreground">{stats.admins}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Teachers</p>
                <p className="text-3xl font-bold text-foreground">{stats.teachers}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <div className="flex items-center gap-4">
              <div className="bg-secondary/50 p-3 rounded-lg">
                <Users className="w-8 h-8 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Office Staff</p>
                <p className="text-3xl font-bold text-foreground">{stats.staff}</p>
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
                  placeholder="Search name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <select
              className="px-3 py-2 rounded-md border border-input bg-background text-sm h-10"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
            >
              <option value="">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="teacher">Teachers</option>
              <option value="office">Office</option>
            </select>

            <select
              className="px-3 py-2 rounded-md border border-input bg-background text-sm h-10"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus | "")}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            {(searchTerm || roleFilter || statusFilter) && (
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}

            <div className="ml-auto">
              <Button onClick={() => setIsAddModalOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:bg-muted/70"
                    onClick={() => handleSort("lastName")}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:bg-muted/70"
                    onClick={() => handleSort("username")}
                  >
                    <div className="flex items-center gap-1">
                      Username
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:bg-muted/70"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center gap-1">
                      Role
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:bg-muted/70"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Last Login</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-12 h-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No users found</p>
                        {(searchTerm || roleFilter || statusFilter) && (
                          <Button variant="outline" size="sm" onClick={handleClearFilters}>
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-border hover:bg-muted/50 ${
                        index % 2 === 0 ? "bg-card" : "bg-muted/20"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-primary font-mono">
                        {user.username}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono text-xs">
                        {maskEmail(user.email)}
                      </td>
                      <td className="px-4 py-3">
                      <Badge variant={
                        user.role === "admin" ? "destructive" : 
                        user.role === "teacher" ? "default" : 
                        "secondary"
                      }>
                        {user.role === "admin" ? "Administrator" : 
                         user.role === "teacher" ? "Teacher" : 
                         "Office"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                        <Badge
                          variant={
                            user.status === "active"
                              ? "default"
                              : user.status === "inactive"
                              ? "destructive"
                              : "secondary"
                          }
                          className={
                            user.status === "active"
                              ? "bg-success"
                              : user.status === "pending"
                              ? "bg-warning"
                              : ""
                          }
                        >
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {user.lastLogin ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}
                          </div>
                        ) : (
                          <span className="text-xs">Never</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="z-50 bg-card">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteModalOpen(true);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
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
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddUser}
      />

      {selectedUser && (
        <>
          <EditUserModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            onUpdate={handleUpdateUser}
            onResetPassword={handleResetPassword}
          />

          <DeleteUserConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            onDelete={handleDeleteUser}
            currentUserId={currentUserId}
          />
        </>
      )}
    </div>
  );
};

export default UserManagement;
