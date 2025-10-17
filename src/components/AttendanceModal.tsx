import { useState } from "react";
import { X, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Student, AttendanceRecord, AttendanceRule } from "@/pages/Dashboard";

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onUpdate: (student: Student) => void;
  instructorName: string;
}

const AttendanceModal = ({ isOpen, onClose, student, onUpdate, instructorName }: AttendanceModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState<"Present" | "Absent" | "Late">("Present");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const checkAttendanceRules = (attendance: AttendanceRecord[]): AttendanceRule[] => {
    const rules = [...student.attendanceRules];

    const totalRecords = attendance.length;
    const absentCount = attendance.filter(r => r.status === "Absent").length;
    const lateCount = attendance.filter(r => r.status === "Late").length;

    rules.forEach(rule => {
      switch (rule.type) {
        case "absence_threshold":
          rule.isViolated = absentCount >= rule.threshold;
          if (rule.isViolated) {
            rule.violationMessage = `Student has ${absentCount} absences (threshold: ${rule.threshold})`;
          }
          break;

        case "lateness_pattern":
          rule.isViolated = lateCount >= rule.threshold;
          if (rule.isViolated) {
            rule.violationMessage = `Student has been late ${lateCount} times (threshold: ${rule.threshold})`;
          }
          break;

        case "consecutive_absences":
          let maxConsecutive = 0;
          let currentConsecutive = 0;
          const sortedAttendance = [...attendance].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          sortedAttendance.forEach(record => {
            if (record.status === "Absent") {
              currentConsecutive++;
              maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
            } else {
              currentConsecutive = 0;
            }
          });

          rule.isViolated = maxConsecutive >= rule.threshold;
          if (rule.isViolated) {
            rule.violationMessage = `Student has ${maxConsecutive} consecutive absences (threshold: ${rule.threshold})`;
          }
          break;

        case "attendance_percentage":
          if (totalRecords > 0) {
            const presentCount = attendance.filter(r => r.status === "Present").length;
            const percentage = (presentCount / totalRecords) * 100;
            rule.isViolated = percentage < rule.threshold;
            if (rule.isViolated) {
              rule.violationMessage = `Attendance rate is ${percentage.toFixed(1)}% (threshold: ${rule.threshold}%)`;
            }
          }
          break;
      }
    });

    return rules;
  };

  const handleMarkAttendance = () => {
    const existingRecord = student.attendance.find(r => r.date === selectedDate);

    if (existingRecord) {
      toast.error("Attendance already recorded for this date");
      return;
    }

    const newRecord: AttendanceRecord = {
      date: selectedDate,
      status: selectedStatus,
      notes: notes.trim() || undefined,
      recordedBy: instructorName,
      timestamp: new Date().toISOString(),
    };

    const updatedAttendance = [...student.attendance, newRecord];
    const updatedRules = checkAttendanceRules(updatedAttendance);

    const updatedStudent = {
      ...student,
      attendance: updatedAttendance,
      attendanceRules: updatedRules,
      history: [
        ...student.history,
        {
          timestamp: new Date().toISOString(),
          action: `Marked ${selectedStatus} for ${selectedDate}`,
          user: instructorName,
        },
      ],
    };

    onUpdate(updatedStudent);
    toast.success(`Attendance marked as ${selectedStatus}`);

    const violations = updatedRules.filter(r => r.isViolated);
    if (violations.length > 0) {
      violations.forEach(v => {
        toast.warning(v.violationMessage || "Attendance rule violated");
      });
    }

    setNotes("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setSelectedStatus("Present");
  };

  const calculateStats = () => {
    const total = student.attendance.length;
    const present = student.attendance.filter(r => r.status === "Present").length;
    const absent = student.attendance.filter(r => r.status === "Absent").length;
    const late = student.attendance.filter(r => r.status === "Late").length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";

    return { total, present, absent, late, percentage };
  };

  if (!isOpen) return null;

  const stats = calculateStats();
  const violations = student.attendanceRules.filter(r => r.isViolated);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500/10 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Attendance: {student.firstName} {student.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">CUNY ID: {student.cunyId}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Attendance Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
            </div>
          </div>

          {/* Attendance Percentage */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Attendance Rate</span>
              <span className="text-2xl font-bold text-foreground">{stats.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  parseFloat(stats.percentage) >= 80 ? "bg-green-500" :
                  parseFloat(stats.percentage) >= 60 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

          {/* Rule Violations */}
          {violations.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  Attendance Alerts ({violations.length})
                </h3>
              </div>
              <div className="space-y-2">
                {violations.map((violation) => (
                  <div key={violation.id} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-red-600 mt-2" />
                    <div>
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">{violation.name}</p>
                      <p className="text-xs text-red-700 dark:text-red-300">{violation.violationMessage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mark Attendance Section */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Mark Attendance</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date *</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status *</label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedStatus === "Present" ? "default" : "outline"}
                    onClick={() => setSelectedStatus("Present")}
                    className={selectedStatus === "Present" ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Present
                  </Button>
                  <Button
                    variant={selectedStatus === "Absent" ? "default" : "outline"}
                    onClick={() => setSelectedStatus("Absent")}
                    className={selectedStatus === "Absent" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Absent
                  </Button>
                  <Button
                    variant={selectedStatus === "Late" ? "default" : "outline"}
                    onClick={() => setSelectedStatus("Late")}
                    className={selectedStatus === "Late" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Late
                  </Button>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Notes (Optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this attendance record..."
                className="w-full"
                rows={3}
              />
            </div>

            <Button onClick={handleMarkAttendance} className="w-full bg-teal-600 hover:bg-teal-700">
              <Calendar className="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
          </div>

          {/* Attendance History */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Attendance History</h3>
            {student.attendance.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No attendance records yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {[...student.attendance]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          {record.status === "Present" && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {record.status === "Absent" && <XCircle className="w-5 h-5 text-red-600" />}
                          {record.status === "Late" && <Clock className="w-5 h-5 text-yellow-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{new Date(record.date).toLocaleDateString()}</p>
                          {record.notes && <p className="text-xs text-muted-foreground">{record.notes}</p>}
                        </div>
                      </div>
                      <Badge
                        variant={record.status === "Present" ? "default" : "secondary"}
                        className={
                          record.status === "Present" ? "bg-green-500" :
                          record.status === "Absent" ? "bg-red-500" :
                          "bg-yellow-500"
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
