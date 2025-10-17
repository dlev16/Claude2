import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Student } from "@/pages/Dashboard";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (student: Student) => void;
}

const AddStudentModal = ({ isOpen, onClose, onAdd }: AddStudentModalProps) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    cunyId: "",
    firstName: "",
    lastName: "",
    privateEmail: "",
    cunyEmail: "",
    phone: "",
    startSemester: 1,
    instructor: "Prof. James Wilson",
    classTime: "",
    termStatus: "TERM ACTIVE/BMCC",
    cunyExam: "NOT TAKEN",
    accuplacerScore: 0,
    essayScore: 0,
    essayLink: "",
    michiganScore: 0,
    tuitionStatus: "$18 Summer Benefit",
    payment: "Not Paid",
    currentSemester: "Spring 2026",
    notes: "",
    classStatus: "Enrolled",
    instructorNotes: "",
    contactLog: [],
    history: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cunyId || !formData.firstName || !formData.lastName || !formData.privateEmail) {
      alert("Please fill in all required fields");
      return;
    }
    const newStudent: Student = {
      ...formData as Student,
      history: [{ timestamp: new Date().toISOString(), action: "Created", user: "admin" }],
    };
    onAdd(newStudent);
    onClose();
    setFormData({
      cunyId: "",
      firstName: "",
      lastName: "",
      privateEmail: "",
      cunyEmail: "",
      phone: "",
      startSemester: 1,
      instructor: "Prof. James Wilson",
      classTime: "",
      termStatus: "TERM ACTIVE/BMCC",
      cunyExam: "NOT TAKEN",
      accuplacerScore: 0,
      essayScore: 0,
      essayLink: "",
      michiganScore: 0,
      tuitionStatus: "$18 Summer Benefit",
      payment: "Not Paid",
      currentSemester: "Spring 2026",
      notes: "",
      classStatus: "Enrolled",
      instructorNotes: "",
      contactLog: [],
      history: [],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Add New Student</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                CUNY ID <span className="text-destructive">*</span>
              </label>
              <Input
                value={formData.cunyId}
                onChange={(e) => setFormData({ ...formData, cunyId: e.target.value })}
                placeholder="8 digits"
                maxLength={8}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                First Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Last Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Private Email <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                value={formData.privateEmail}
                onChange={(e) => setFormData({ ...formData, privateEmail: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">CUNY Email</label>
              <Input
                type="email"
                value={formData.cunyEmail}
                onChange={(e) => setFormData({ ...formData, cunyEmail: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Semester <span className="text-muted-foreground">(Semesters spent in program)</span>
              </label>
              <Input
                type="number"
                min="0"
                max="20"
                value={formData.startSemester}
                onChange={(e) => setFormData({ ...formData, startSemester: parseInt(e.target.value) || 0 })}
                placeholder="e.g., 1, 4, 8"
              />
              {formData.startSemester && formData.startSemester > 3 && (
                <p className="text-sm text-orange-600 mt-1 font-medium">
                  ⚠️ Alert: Student has reached maximum semesters ({formData.startSemester})
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Current Semester</label>
              <select
                value={formData.currentSemester}
                onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              >
                <option value="Spring 2026">Spring 2026</option>
                <option value="Fall 2025">Fall 2025</option>
                <option value="Spring 2025">Spring 2025</option>
                <option value="Fall 2024">Fall 2024</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Instructor</label>
              <select
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              >
                <option value="Prof. James Wilson">Prof. James Wilson</option>
                <option value="Dr. Lisa Anderson">Dr. Lisa Anderson</option>
                <option value="Dr. Maria Rodriguez">Dr. Maria Rodriguez</option>
                <option value="Dr. Sarah Mitchell">Dr. Sarah Mitchell</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Class Time</label>
              <Input
                value={formData.classTime}
                onChange={(e) => setFormData({ ...formData, classTime: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Term Status</label>
              <select
                value={formData.termStatus}
                onChange={(e) => setFormData({ ...formData, termStatus: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              >
                <option value="TERM ACTIVE/BMCC">TERM ACTIVE/BMCC</option>
                <option value="TERM ACTIVE/NOT BMCC">TERM ACTIVE/NOT BMCC</option>
                <option value="TERM NOT ACTIVE">TERM NOT ACTIVE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">CUNY Exam</label>
              <select
                value={formData.cunyExam}
                onChange={(e) => setFormData({ ...formData, cunyExam: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              >
                <option value="NOT TAKEN">NOT TAKEN</option>
                <option value="ACESL-COMP">ACESL-COMP</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Accuplacer Score (0-120)</label>
              <Input
                type="number"
                min="0"
                max="120"
                value={formData.accuplacerScore}
                onChange={(e) => setFormData({ ...formData, accuplacerScore: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Essay Score (0-100)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.essayScore}
                onChange={(e) => setFormData({ ...formData, essayScore: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Essay Link</label>
              <Input
                type="url"
                value={formData.essayLink}
                onChange={(e) => setFormData({ ...formData, essayLink: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Michigan Score (0-100)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.michiganScore}
                onChange={(e) => setFormData({ ...formData, michiganScore: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tuition Status</label>
              <select
                value={formData.tuitionStatus}
                onChange={(e) => setFormData({ ...formData, tuitionStatus: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              >
                <option value="$18 Summer Benefit">$18 Summer Benefit</option>
                <option value="$45 Spring/Fall Benefit">$45 Spring/Fall Benefit</option>
                <option value="$180 In-State">$180 In-State</option>
                <option value="$450 Out-of-State">$450 Out-of-State</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Payment</label>
              <select
                value={formData.payment}
                onChange={(e) => setFormData({ ...formData, payment: e.target.value as "Paid" | "Not Paid" })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              >
                <option value="Paid">Paid</option>
                <option value="Not Paid">Not Paid</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Student</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
