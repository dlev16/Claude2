import { useState } from "react";
import { X, Mail, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Student } from "@/pages/Dashboard";

interface EmailComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipients: Student[];
  instructorName?: string;
}

const EmailComposeModal = ({ isOpen, onClose, recipients, instructorName }: EmailComposeModalProps) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please provide both subject and message");
      return;
    }

    if (recipients.length === 0) {
      toast.error("No recipients selected");
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      const emailAddresses = recipients
        .map(r => r.privateEmail || r.cunyEmail)
        .filter(email => email)
        .join(", ");

      const emailBody = encodeURIComponent(message);
      const emailSubject = encodeURIComponent(subject);

      window.location.href = `mailto:${emailAddresses}?subject=${emailSubject}&body=${emailBody}`;

      toast.success(`Email prepared for ${recipients.length} student${recipients.length > 1 ? 's' : ''}`);

      setSubject("");
      setMessage("");
      setIsSending(false);
      onClose();
    }, 500);
  };

  const handleCancel = () => {
    setSubject("");
    setMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Compose Email</h2>
              <p className="text-sm text-muted-foreground">
                Sending to {recipients.length} student{recipients.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Recipients Section */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Recipients ({recipients.length})
            </label>
            <div className="max-h-32 overflow-y-auto bg-muted/50 rounded-md p-3 space-y-1">
              {recipients.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No students selected</p>
              ) : (
                recipients.map((student) => (
                  <div key={student.cunyId} className="flex items-center justify-between py-1">
                    <span className="text-sm text-foreground">
                      {student.firstName} {student.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {student.privateEmail || student.cunyEmail || "No email"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Subject *
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="w-full"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Message *
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full min-h-[200px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {message.length} characters
            </p>
          </div>

          {/* Info Badge */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> This will open your default email client with the message pre-filled.
              You can review and modify the email before sending.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2">
            {instructorName && (
              <Badge variant="outline">From: {instructorName}</Badge>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel} disabled={isSending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isSending || recipients.length === 0}>
              <Send className="w-4 h-4 mr-2" />
              {isSending ? "Preparing..." : "Send Email"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailComposeModal;
