import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/pages/Dashboard";
import { validators, validationMessages } from "@/utils/validation";
import { sanitizers } from "@/utils/sanitization";
import ConfirmDialog from "./ConfirmDialog";
import { toast } from "sonner";

interface InstructorEditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onEdit: (student: Student) => void;
}

const InstructorEditStudentModal = ({ isOpen, onClose, student, onEdit }: InstructorEditStudentModalProps) => {
  const [privateEmail, setPrivateEmail] = useState(student.privateEmail);
  const [classStatus, setClassStatus] = useState<"Enrolled" | "Dropped">(student.classStatus);
  const [showDropConfirm, setShowDropConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPrivateEmail(student.privateEmail);
    setClassStatus(student.classStatus);
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize and validate email
    const sanitizedEmail = sanitizers.email(privateEmail);
    
    if (!validators.email(sanitizedEmail)) {
      toast.error(validationMessages.email);
      return;
    }

    // Check if changing to dropped
    if (classStatus === "Dropped" && student.classStatus === "Enrolled") {
      setShowDropConfirm(true);
      return;
    }

    performUpdate(sanitizedEmail);
  };

  const performUpdate = (email: string) => {
    setIsSubmitting(true);

    const updatedStudent = {
      ...student,
      privateEmail: email,
      classStatus,
      history: [
        ...student.history,
        {
          timestamp: new Date().toISOString(),
          action: `Updated Private Email to ${email}, Class Status to ${classStatus}`,
          user: student.instructor,
        },
      ],
    };

    onEdit(updatedStudent);
    toast.success("Student information updated successfully");
    setIsSubmitting(false);
    onClose();
  };

  const handleDropConfirm = () => {
    const sanitizedEmail = sanitizers.email(privateEmail);
    performUpdate(sanitizedEmail);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Update Student Information</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <AlertCircle className="w-4 h-4 text-teal-600" />
              You can update Private Email and Enrollment Status
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* CUNY ID - Read Only */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                CUNY ID <span className="text-xs">(Read Only)</span>
              </label>
              <div className="px-3 py-2 rounded-md bg-muted text-foreground text-sm">
                {student.cunyId}
              </div>
            </div>

            {/* First Name - Read Only */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                First Name <span className="text-xs">(Read Only)</span>
              </label>
              <div className="px-3 py-2 rounded-md bg-muted text-foreground text-sm">
                {student.firstName}
              </div>
            </div>

            {/* Last Name - Read Only */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Last Name <span className="text-xs">(Read Only)</span>
              </label>
              <div className="px-3 py-2 rounded-md bg-muted text-foreground text-sm">
                {student.lastName}
              </div>
            </div>

            {/* Private Email - EDITABLE */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Private Email <span className="text-red-500">*</span>
                <Badge className="ml-2 bg-teal-500/10 text-teal-700 border-teal-300">Editable</Badge>
              </label>
              <Input
                type="email"
                value={privateEmail}
                onChange={(e) => setPrivateEmail(e.target.value)}
                className="border-teal-500 focus:border-teal-600 focus:ring-teal-500"
                required
              />
            </div>

            {/* Class Status - EDITABLE */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Class Status <span className="text-red-500">*</span>
                <Badge className="ml-2 bg-teal-500/10 text-teal-700 border-teal-300">Editable</Badge>
              </label>
              <select
                value={classStatus}
                onChange={(e) => setClassStatus(e.target.value as "Enrolled" | "Dropped")}
                className="w-full px-3 py-2 rounded-md border border-teal-500 focus:border-teal-600 focus:ring-teal-500 bg-background text-foreground"
              >
                <option value="Enrolled">Enrolled</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>

            {/* CUNY Email - Read Only */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                CUNY Email <span className="text-xs">(Read Only)</span>
              </label>
              <div className="px-3 py-2 rounded-md bg-muted text-foreground text-sm">
                {student.cunyEmail}
              </div>
            </div>

            {/* Phone - Read Only */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Phone <span className="text-xs">(Read Only)</span>
              </label>
              <div className="px-3 py-2 rounded-md bg-muted text-foreground text-sm">
                {student.phone}
              </div>
            </div>

            {/* Start Semester - Read Only */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Start Semester <span className="text-xs">(Read Only)</span>
              </label>
              <div className="px-3 py-2 rounded-md bg-muted text-foreground text-sm">
                {student.startSemester}
              </div>
            </div>

            {/* Instructor - Read Only */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Instructor <span className="text-xs">(Read Only)</span>
              </label>
              <div className="px-3 py-2 rounded-md bg-muted text-foreground text-sm">
                {student.instructor}
              </div>
            </div>

            {/* Class Time - Read Only */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Class Time <span className="text-xs">(Read Only)</span>
              </label>
              <div className="px-3 py-2 rounded-md bg-muted text-foreground text-sm">
                {student.classTime}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Student"}
            </Button>
          </div>
        </form>
      </div>

      {/* Drop Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDropConfirm}
        onClose={() => setShowDropConfirm(false)}
        onConfirm={handleDropConfirm}
        title="Confirm Drop Status"
        message={`Are you sure ${student.firstName} ${student.lastName} has dropped your class? You can change this back if needed.`}
        confirmText="Mark as Dropped"
        variant="danger"
      />
    </div>
  );
};

export default InstructorEditStudentModal;
