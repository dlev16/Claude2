import { useState } from "react";
import { X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/pages/Dashboard";

interface InstructorStudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onUpdate: (student: Student) => void;
}

const InstructorStudentDetailModal = ({ isOpen, onClose, student, onUpdate }: InstructorStudentDetailModalProps) => {
  const [activeTab, setActiveTab] = useState<"info" | "notes" | "contact">("info");
  const [notes, setNotes] = useState(student.instructorNotes);
  const [contactType, setContactType] = useState("Email");
  const [contactNotes, setContactNotes] = useState("");

  const handleSaveNotes = () => {
    onUpdate({
      ...student,
      instructorNotes: notes,
      history: [
        ...student.history,
        {
          timestamp: new Date().toISOString(),
          action: "Updated instructor notes",
          user: student.instructor,
        },
      ],
    });
  };

  const handleAddContactLog = () => {
    if (!contactNotes.trim()) return;

    const newContactEntry = {
      date: new Date().toISOString().split("T")[0],
      type: contactType,
      notes: contactNotes,
    };

    onUpdate({
      ...student,
      contactLog: [newContactEntry, ...student.contactLog],
      history: [
        ...student.history,
        {
          timestamp: new Date().toISOString(),
          action: `Added contact log: ${contactType}`,
          user: student.instructor,
        },
      ],
    });

    setContactNotes("");
  };

  const handleSendEmail = () => {
    window.location.href = `mailto:${student.privateEmail}`;
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
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Information
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-6 py-3 font-medium ${
              activeTab === "notes"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`px-6 py-3 font-medium ${
              activeTab === "contact"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Contact Log
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "info" && (
            <div className="space-y-4">
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
                      student.cunyEmail.endsWith("@stu.bmcc.cuny.edu") ? "text-green-600" : "text-red-600"
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
                  <p className="text-sm text-muted-foreground mb-1">Class Time</p>
                  <p className="text-foreground font-medium">{student.classTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Class Status</p>
                  <Badge className={student.classStatus === "Enrolled" ? "bg-green-500" : "bg-red-500"}>
                    {student.classStatus}
                  </Badge>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</p>
                <div className="flex gap-3">
                  <Button onClick={handleSendEmail} className="bg-teal-600 hover:bg-teal-700">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Add personal notes about this student. These notes are only visible to you.
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground min-h-[300px]"
                placeholder="Add your notes about this student..."
              />
              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveNotes} className="bg-teal-600 hover:bg-teal-700">
                  Save Notes
                </Button>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Log your communications with this student to track interactions.
              </p>

              {/* Add Contact Log Entry */}
              <div className="bg-muted/50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-foreground mb-3">Add New Contact Entry</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Date</label>
                    <input
                      type="text"
                      value={new Date().toISOString().split("T")[0]}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-muted text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Type</label>
                    <select
                      value={contactType}
                      onChange={(e) => setContactType(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                    >
                      <option value="Email">Email</option>
                      <option value="Phone Call">Phone Call</option>
                      <option value="In Person">In Person</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Notes</label>
                    <textarea
                      value={contactNotes}
                      onChange={(e) => setContactNotes(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-background text-foreground min-h-[100px]"
                      placeholder="Describe the communication..."
                    />
                  </div>
                  <Button onClick={handleAddContactLog} className="bg-teal-600 hover:bg-teal-700">
                    Add Contact Log
                  </Button>
                </div>
              </div>

              {/* Contact Log Entries */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground mb-2">Contact History</h3>
                {student.contactLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No contact logs yet.</p>
                ) : (
                  student.contactLog.map((entry, index) => (
                    <div key={index} className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{entry.type}</Badge>
                        <p className="text-sm text-muted-foreground">{entry.date}</p>
                      </div>
                      <p className="text-sm text-foreground">{entry.notes}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorStudentDetailModal;
