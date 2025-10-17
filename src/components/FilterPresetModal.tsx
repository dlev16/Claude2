import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FilterPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const FilterPresetModal = ({ isOpen, onClose, onSave }: FilterPresetModalProps) => {
  const [name, setName] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a preset name");
      return;
    }
    onSave(name);
    onClose();
    setName("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Save Filter Preset</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Preset Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Active BMCC Students"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Preset</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPresetModal;
