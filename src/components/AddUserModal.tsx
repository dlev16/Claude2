import { useState } from "react";
import { X, AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { validators, validationMessages } from "@/utils/validation";
import { sanitizers } from "@/utils/sanitization";
import { CreateUserData, UserRole } from "@/types/user";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (userData: CreateUserData) => Promise<{ success: boolean; temporaryPassword?: string; error?: string }>;
}

const AddUserModal = ({ isOpen, onClose, onAdd }: AddUserModalProps) => {
  const [formData, setFormData] = useState<CreateUserData>({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "teacher",
    phone: "",
    employmentStartDate: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateUserData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [passwordCopied, setPasswordCopied] = useState(false);

  if (!isOpen) return null;

  const validateField = (name: keyof CreateUserData, value: string): string | null => {
    switch (name) {
      case "username":
        return validators.username(value) ? null : validationMessages.username;
      case "password":
        return validators.password(value) ? null : validationMessages.password;
      case "firstName":
      case "lastName":
        return validators.name(value) ? null : validationMessages.name;
      case "email":
        return validators.email(value) ? null : validationMessages.email;
      case "phone":
        return value && !validators.phone(value) ? validationMessages.phone : null;
      default:
        return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = name === "email" ? sanitizers.email(value) : 
                          name === "phone" ? sanitizers.phone(value) : 
                          name === "firstName" || name === "lastName" ? sanitizers.name(value) : value;
    
    setFormData({ ...formData, [name]: sanitizedValue });
    
    // Clear error on change
    if (errors[name as keyof CreateUserData]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name as keyof CreateUserData, value);
    if (error) {
      setErrors({ ...errors, [name]: error });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateUserData, string>> = {};

    if (!formData.username) newErrors.username = validationMessages.required;
    else if (!validators.username(formData.username)) newErrors.username = validationMessages.username;

    if (!formData.password) newErrors.password = validationMessages.required;
    else if (!validators.password(formData.password)) newErrors.password = validationMessages.password;

    if (!formData.firstName) newErrors.firstName = validationMessages.required;
    else if (!validators.name(formData.firstName)) newErrors.firstName = validationMessages.name;

    if (!formData.lastName) newErrors.lastName = validationMessages.required;
    else if (!validators.name(formData.lastName)) newErrors.lastName = validationMessages.name;

    if (!formData.email) newErrors.email = validationMessages.required;
    else if (!validators.email(formData.email)) newErrors.email = validationMessages.email;

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

    setIsSubmitting(true);

    try {
      const result = await onAdd(formData);
      
      if (result.success && result.temporaryPassword) {
        setTemporaryPassword(result.temporaryPassword);
        setShowSuccess(true);
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to create user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(temporaryPassword);
    setPasswordCopied(true);
    toast.success("Password copied to clipboard");
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  const handleClose = () => {
    if (showSuccess) {
    setFormData({
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "teacher",
      phone: "",
      employmentStartDate: "",
    });
      setShowSuccess(false);
      setTemporaryPassword("");
      setPasswordCopied(false);
    }
    setErrors({});
    onClose();
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-success/10 p-2 rounded-lg">
                <Check className="w-6 h-6 text-success" />
              </div>
              <h2 className="text-xl font-bold text-foreground">User Created Successfully</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">Temporary Password Generated</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    This password will only be shown once. The user must change it on first login.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background px-3 py-2 rounded border border-border text-sm font-mono">
                      {temporaryPassword}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyPassword}
                      className="flex-shrink-0"
                    >
                      {passwordCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">User Details:</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</p>
                <p><span className="font-medium">Email:</span> {formData.email}</p>
                <p><span className="font-medium">Role:</span> {formData.role === 'teacher' ? 'Teacher' : 'Office Staff'}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Done
              </Button>
              <Button 
                onClick={() => {
                setFormData({
                  username: "",
                  password: "",
                  firstName: "",
                  lastName: "",
                  email: "",
                  role: "teacher",
                  phone: "",
                  employmentStartDate: "",
                });
                  setShowSuccess(false);
                  setTemporaryPassword("");
                  setPasswordCopied(false);
                }} 
                className="flex-1"
              >
                Add Another User
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Add New User</h2>
          <Button variant="ghost" size="icon" onClick={handleClose} disabled={isSubmitting}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  placeholder="john.doe"
                  disabled={isSubmitting}
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
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className={errors.password ? "border-destructive" : ""}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Min 8 characters, uppercase, lowercase, and number required.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
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
                placeholder="John"
                disabled={isSubmitting}
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
                placeholder="Doe"
                disabled={isSubmitting}
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
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="john.doe@institution.edu"
              disabled={isSubmitting}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
            <p className="text-xs text-muted-foreground">
              A welcome email with login instructions will be sent to this address.
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
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="admin">Administrator</option>
              <option value="teacher">Teacher</option>
              <option value="office">Office</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="(555) 123-4567"
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

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• A secure temporary password will be automatically generated</p>
                <p>• The user will be required to change their password on first login</p>
                <p>• An email notification will be sent to the provided email address</p>
              </div>
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
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creating User..." : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
