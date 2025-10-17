import { useState, useEffect } from "react";
import { X, AlertCircle, Clock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { validators, validationMessages } from "@/utils/validation";
import { sanitizers } from "@/utils/sanitization";
import { User, UpdateUserData, UserStatus } from "@/types/user";
import { formatDistanceToNow } from "date-fns";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (userId: string, updates: UpdateUserData) => Promise<{ success: boolean; error?: string }>;
  onResetPassword: (userId: string) => Promise<{ success: boolean; temporaryPassword?: string; error?: string }>;
}

const EditUserModal = ({ isOpen, onClose, user, onUpdate, onResetPassword }: EditUserModalProps) => {
  const [formData, setFormData] = useState<UpdateUserData>({
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    status: user.status,
    phone: user.phone || "",
    employmentStartDate: user.employmentStartDate || "",
    newPassword: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UpdateUserData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone || "",
        employmentStartDate: user.employmentStartDate || "",
        newPassword: "",
      });
      setHasChanges(false);
      setErrors({});
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const validateField = (name: keyof UpdateUserData, value: string): string | null => {
    switch (name) {
      case "username":
        return value && !validators.username(value) ? validationMessages.username : null;
      case "newPassword":
        return value && !validators.password(value) ? validationMessages.password : null;
      case "firstName":
      case "lastName":
        return validators.name(value) ? null : validationMessages.name;
      case "phone":
        return value && !validators.phone(value) ? validationMessages.phone : null;
      default:
        return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = name === "phone" ? sanitizers.phone(value) : 
                          name === "firstName" || name === "lastName" ? sanitizers.name(value) : value;
    
    setFormData({ ...formData, [name]: sanitizedValue });
    setHasChanges(true);
    
    if (errors[name as keyof UpdateUserData]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name as keyof UpdateUserData, value);
    if (error) {
      setErrors({ ...errors, [name]: error });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateUserData, string>> = {};

    // Username is required
    if (!formData.username || formData.username.trim() === "") {
      newErrors.username = "Username is required";
    } else if (!validators.username(formData.username)) {
      newErrors.username = validationMessages.username;
    }

    // New password is optional but must be valid if provided
    if (formData.newPassword && !validators.password(formData.newPassword)) {
      newErrors.newPassword = validationMessages.password;
    }

    // First name is required
    if (!formData.firstName || formData.firstName.trim() === "") {
      newErrors.firstName = "First name is required";
    } else if (!validators.name(formData.firstName)) {
      newErrors.firstName = validationMessages.name;
    }

    // Last name is required
    if (!formData.lastName || formData.lastName.trim() === "") {
      newErrors.lastName = "Last name is required";
    } else if (!validators.name(formData.lastName)) {
      newErrors.lastName = validationMessages.name;
    }

    // Email is required (though it's disabled, still validate)
    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = "Email is required";
    }

    // Role is required
    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    // Phone is optional but must be valid if provided
    if (formData.phone && !validators.phone(formData.phone)) {
      newErrors.phone = validationMessages.phone;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    if (!hasChanges) {
      toast.info("No changes to save");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onUpdate(user.id, formData);
      
      if (result.success) {
        toast.success("User updated successfully");
        onClose();
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to update user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!confirm(`Are you sure you want to reset the password for ${user.firstName} ${user.lastName}? A temporary password will be generated and sent to their email.`)) {
      return;
    }

    setIsResettingPassword(true);

    try {
      const result = await onResetPassword(user.id);
      
      if (result.success && result.temporaryPassword) {
        toast.success("Password reset successfully. Temporary password has been sent to the user's email.", {
          duration: 5000,
        });
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleClose = () => {
    if (hasChanges && !confirm("You have unsaved changes. Are you sure you want to close?")) {
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Edit User</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {user.firstName} {user.lastName}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} disabled={isSubmitting}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Audit Information */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created by:</span>
              <span className="font-medium">{user.createdBy}</span>
              <span className="text-muted-foreground">•</span>
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
              </span>
            </div>
            {user.lastModifiedAt && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground ml-6">Last modified by:</span>
                <span className="font-medium">{user.lastModifiedBy}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(user.lastModifiedAt), { addSuffix: true })}
                </span>
              </div>
            )}
            {user.lastLogin && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground ml-6">Last login:</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>

          {/* Status Toggle */}
          <div className="space-y-2">
            <Label htmlFor="status">Account Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            {formData.status === 'inactive' && (
              <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded p-3">
                <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Inactive users cannot log in to the system but their data is preserved.
                </p>
              </div>
            )}
          </div>

          {/* Login Credentials Section */}
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Login Credentials
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  required
                  className={errors.username ? "border-destructive" : ""}
                  autoComplete="off"
                />
                {errors.username && (
                  <p className="text-xs text-destructive">{errors.username}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Used for login. 3-30 characters, letters/numbers/underscore/hyphen only.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  New Password (optional)
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Leave blank to keep current"
                  disabled={isSubmitting}
                  className={errors.newPassword ? "border-destructive" : ""}
                  autoComplete="new-password"
                />
                {errors.newPassword && (
                  <p className="text-xs text-destructive">{errors.newPassword}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Min 8 characters, uppercase, lowercase, and number required.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
                required
                className={errors.firstName ? "border-destructive" : ""}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
                required
                className={errors.lastName ? "border-destructive" : ""}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              disabled={true}
              required
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Email addresses cannot be changed for security reasons.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-destructive">*</span>
            </Label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="admin">Administrator</option>
              <option value="teacher">Teacher</option>
              <option value="office">Office</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employmentStartDate">Employment Start Date</Label>
            <Input
              id="employmentStartDate"
              name="employmentStartDate"
              type="date"
              value={formData.employmentStartDate}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          {/* Password Reset Section */}
          <div className="border-t border-border pt-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Password Management</h3>
                <p className="text-xs text-muted-foreground">
                  Reset the user's password and send them a temporary password via email.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetPassword}
                disabled={isResettingPassword || isSubmitting}
              >
                {isResettingPassword ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !hasChanges} 
              className="flex-1"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
