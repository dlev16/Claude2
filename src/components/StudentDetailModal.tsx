import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/pages/Dashboard";

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onUpdateNotes: (notes: string) => void;
}

const StudentDetailModal = ({ isOpen, onClose, student, onUpdateNotes }: StudentDetailModalProps) => {
  const [activeTab, setActiveTab] = useState<"info" | "notes" | "history">("info");
  const [notes, setNotes] = useState(student.notes);

  const handleSaveNotes = () => {
    onUpdateNotes(notes);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">
            {student.firstName} {student.lastName}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-6 py-3 font-medium ${
              activeTab === "info"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Information
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-6 py-3 font-medium ${
              activeTab === "notes"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 font-medium ${
              activeTab === "history"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            History
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "info" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">CUNY ID</p>
                <p className="text-foreground font-medium">{student.cunyId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Name</p>
                <p className="text-foreground font-medium">
                  {student.firstName} {student.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Private Email</p>
                <p className="text-foreground font-medium">{student.privateEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">CUNY Email</p>
                <p
                  className={`font-medium ${
                    student.cunyEmail.endsWith("@stu.bmcc.cuny.edu") ? "text-success" : "text-destructive"
                  }`}
                >
                  {student.cunyEmail}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <p className="text-foreground font-medium">{student.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Start Semester</p>
                <p className="text-foreground font-medium">{student.startSemester}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Instructor</p>
                <p className="text-foreground font-medium">{student.instructor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Class Time</p>
                <p className="text-foreground font-medium">{student.classTime}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Term Status</p>
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
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">CUNY Exam</p>
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
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Accuplacer Score</p>
                <p className="text-foreground font-medium">{student.accuplacerScore}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Essay Score</p>
                {student.essayLink ? (
                  <a
                    href={student.essayLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline"
                  >
                    {student.essayScore}
                  </a>
                ) : (
                  <p className="text-foreground font-medium">{student.essayScore}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Michigan Score</p>
                <p className="text-foreground font-medium">{student.michiganScore}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tuition Status</p>
                <p className="text-foreground font-medium">{student.tuitionStatus}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment</p>
                <p
                  className={`font-medium ${
                    student.payment === "Paid" ? "text-success" : "text-destructive"
                  }`}
                >
                  {student.payment}
                </p>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground min-h-[300px]"
                placeholder="Add notes about this student..."
              />
              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveNotes}>Save Notes</Button>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              {student.history.map((entry, index) => (
                <div key={index} className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground">{entry.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">By: {entry.user}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
