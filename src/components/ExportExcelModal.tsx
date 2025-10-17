import { useState } from "react";
import { X, GripVertical, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ExportField {
  key: string;
  label: string;
  selected: boolean;
}

interface ExportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
}

const ExportExcelModal = ({ isOpen, onClose, data }: ExportExcelModalProps) => {
  const [fields, setFields] = useState<ExportField[]>([
    { key: "cunyId", label: "CUNY ID", selected: true },
    { key: "firstName", label: "First Name", selected: true },
    { key: "lastName", label: "Last Name", selected: true },
    { key: "privateEmail", label: "Private Email", selected: true },
    { key: "cunyEmail", label: "CUNY Email", selected: true },
    { key: "phone", label: "Phone", selected: true },
    { key: "currentSemester", label: "Current Semester", selected: true },
    { key: "startSemester", label: "Start Semester", selected: true },
    { key: "instructor", label: "Instructor", selected: true },
    { key: "classTime", label: "Class Time", selected: true },
    { key: "termStatus", label: "Term Status", selected: true },
    { key: "cunyExam", label: "CUNY Exam", selected: true },
    { key: "accuplacerScore", label: "Accuplacer Score", selected: true },
    { key: "essayScore", label: "Essay Score", selected: true },
    { key: "essayLink", label: "Essay Link", selected: false },
    { key: "michiganScore", label: "Michigan Score", selected: true },
    { key: "tuitionStatus", label: "Tuition Status", selected: true },
    { key: "payment", label: "Payment", selected: true },
    { key: "classStatus", label: "Class Status", selected: true },
    { key: "notes", label: "Notes", selected: false },
  ]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const toggleField = (index: number) => {
    setFields((prev) =>
      prev.map((field, i) => (i === index ? { ...field, selected: !field.selected } : field))
    );
  };

  const selectAll = () => {
    setFields((prev) => prev.map((field) => ({ ...field, selected: true })));
  };

  const deselectAll = () => {
    setFields((prev) => prev.map((field) => ({ ...field, selected: false })));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...fields];
    const draggedItem = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedItem);

    setFields(newFields);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleExport = () => {
    const selectedFields = fields.filter((f) => f.selected);
    
    if (selectedFields.length === 0) {
      toast.error("Please select at least one field to export");
      return;
    }

    const exportData = data.map((student) => {
      const row: any = {};
      selectedFields.forEach((field) => {
        row[field.label] = student[field.key];
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, `students_${new Date().toISOString().split("T")[0]}.xlsx`);
    
    toast.success(`Excel file exported successfully with ${selectedFields.length} fields`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Configure Excel Export</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select fields and drag to reorder them
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Field Selection */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-foreground">
              {fields.filter((f) => f.selected).length} of {fields.length} fields selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={field.key}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-3 rounded-md border transition-all cursor-move ${
                  field.selected
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/30 border-border"
                } ${draggedIndex === index ? "opacity-50" : ""}`}
              >
                <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                
                <Checkbox
                  checked={field.selected}
                  onCheckedChange={() => toggleField(index)}
                  className="flex-shrink-0"
                />

                <label
                  className="flex-1 text-sm font-medium text-foreground cursor-pointer"
                  onClick={() => toggleField(index)}
                >
                  {field.label}
                </label>

                {field.selected && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Exporting {data.length} student{data.length !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="bg-success hover:bg-success/90">
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportExcelModal;
