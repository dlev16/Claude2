import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (field: string, value: string) => void;
  selectedCount: number;
}

const BulkActionModal = ({ isOpen, onClose, onApply, selectedCount }: BulkActionModalProps) => {
  const [field, setField] = useState("");
  const [value, setValue] = useState("");

  const handleApply = () => {
    if (!field || !value) {
      alert("Please select both field and value");
      return;
    }
    onApply(field, value);
    onClose();
    setField("");
    setValue("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Bulk Update</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <p className="text-muted-foreground mb-6">
            Update {selectedCount} selected students
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Field to Update
              </label>
              <select
                value={field}
                onChange={(e) => {
                  setField(e.target.value);
                  setValue("");
                }}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              >
                <option value="">Select field...</option>
                <option value="instructor">Instructor</option>
                <option value="termStatus">Term Status</option>
                <option value="payment">Payment</option>
                <option value="tuitionStatus">Tuition Status</option>
              </select>
            </div>

            {field && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  New Value
                </label>
                {field === "instructor" && (
                  <select
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  >
                    <option value="">Select instructor...</option>
                    <option value="Prof. James Wilson">Prof. James Wilson</option>
                    <option value="Dr. Lisa Anderson">Dr. Lisa Anderson</option>
                    <option value="Dr. Maria Rodriguez">Dr. Maria Rodriguez</option>
                    <option value="Dr. Sarah Mitchell">Dr. Sarah Mitchell</option>
                  </select>
                )}
                {field === "termStatus" && (
                  <select
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  >
                    <option value="">Select status...</option>
                    <option value="TERM ACTIVE/BMCC">TERM ACTIVE/BMCC</option>
                    <option value="TERM ACTIVE/NOT BMCC">TERM ACTIVE/NOT BMCC</option>
                    <option value="TERM NOT ACTIVE">TERM NOT ACTIVE</option>
                  </select>
                )}
                {field === "payment" && (
                  <select
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  >
                    <option value="">Select payment...</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                )}
                {field === "tuitionStatus" && (
                  <select
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  >
                    <option value="">Select tuition...</option>
                    <option value="$180 In-State">$180 In-State</option>
                    <option value="$450 Out-of-State">$450 Out-of-State</option>
                    <option value="$75 Summer">$75 Summer</option>
                    <option value="$45 Reduced">$45 Reduced</option>
                  </select>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply}>Apply Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionModal;
