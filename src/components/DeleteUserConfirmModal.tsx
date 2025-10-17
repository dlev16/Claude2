import { useState } from "react";
import { X, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { User } from "@/types/user";

interface DeleteUserConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onDelete: (userId: string) => Promise<{ success: boolean; error?: string }>;
  currentUserId: string;
}

const DeleteUserConfirmModal = ({ isOpen, onClose, user, onDelete, currentUserId }: DeleteUserConfirmModalProps) => {
  const [confirmText, setConfirmText] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  if (!isOpen) return null;

  const isSelfDelete = user.id === currentUserId;
  const isConfirmed = confirmText === user.email && understood;

  const handleDelete = async () => {
    if (!isConfirmed) {
      toast.error("Please complete all confirmation steps");
      return;
    }

    // Cooling-off period
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          performDelete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const performDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await onDelete(user.id);
      
      if (result.success) {
        toast.success("User deleted successfully");
        handleClose();
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmText("");
    setUnderstood(false);
    setCountdown(0);
    onClose();
  };

  if (isSelfDelete) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-destructive/10 p-2 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Cannot Delete Account</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You cannot delete your own account while logged in. Please contact another administrator to remove your account.
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-destructive/10 p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Delete User</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} disabled={isDeleting || countdown > 0}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning Message */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h3 className="text-sm font-bold text-destructive mb-2">⚠️ This action cannot be undone!</h3>
            <p className="text-sm text-muted-foreground">
              Deleting this user will permanently remove their account and may affect associated data.
            </p>
          </div>

          {/* User Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">You are about to delete:</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Role:</span>
                <span className="text-sm font-medium">
                  {user.role === 'teacher' ? 'Teacher' : 'Office Staff'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className="text-sm font-medium capitalize">{user.status}</span>
              </div>
            </div>
          </div>

          {/* Affected Data Warning */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">This will affect:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              {user.role === 'teacher' && (
                <>
                  <li>All classes assigned to this teacher</li>
                  <li>Student records and grades entered by this teacher</li>
                  <li>Historical attendance records</li>
                </>
              )}
              {user.role === 'office' && (
                <>
                  <li>Student enrollment records created by this staff member</li>
                  <li>Administrative records and notes</li>
                </>
              )}
              <li>Audit logs and activity history</li>
            </ul>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <Checkbox
              id="understood"
              checked={understood}
              onCheckedChange={(checked) => setUnderstood(checked as boolean)}
              disabled={isDeleting || countdown > 0}
            />
            <Label htmlFor="understood" className="text-sm text-foreground cursor-pointer leading-relaxed">
              I understand this action cannot be undone and all associated data will be permanently deleted
            </Label>
          </div>

          {/* Type to Confirm */}
          <div className="space-y-2">
            <Label htmlFor="confirmEmail" className="text-sm font-semibold">
              Type <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{user.email}</code> to confirm:
            </Label>
            <Input
              id="confirmEmail"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={user.email}
              disabled={isDeleting || countdown > 0}
              className={confirmText === user.email ? "border-success" : ""}
            />
            {confirmText === user.email && (
              <div className="flex items-center gap-2 text-xs text-success">
                <Check className="w-3 h-3" />
                <span>Email confirmed</span>
              </div>
            )}
          </div>

          {/* Alternative Suggestion */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-2">💡 Consider deactivating instead</p>
            <p className="text-xs text-muted-foreground mb-3">
              Deactivating the user preserves all data and can be reversed later, while preventing login access.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isDeleting || countdown > 0}
            >
              Cancel and Deactivate Instead
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting || countdown > 0}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!isConfirmed || isDeleting || countdown > 0}
              className="flex-1"
            >
              {countdown > 0 ? `Deleting in ${countdown}...` : isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserConfirmModal;
