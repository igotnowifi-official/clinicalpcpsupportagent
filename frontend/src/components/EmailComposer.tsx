import { useState } from 'react';
import { MessageDraft, RecipientRouting, PatientGuide } from '@/types/clinical';
import { PATIENT_GUIDES } from '@/data/patientGuides';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Paperclip, 
  Send, 
  Users, 
  Plus, 
  X, 
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface EmailComposerProps {
  draft: MessageDraft;
  recommendedGuides: PatientGuide[];
  routing: RecipientRouting;
  onUpdateDraft: (draft: MessageDraft) => void;
  onUpdateRouting: (routing: RecipientRouting) => void;
  onSend: () => Promise<void>;
  onClose: () => void;
}

const EmailComposer = ({
  draft,
  recommendedGuides,
  routing,
  onUpdateDraft,
  onUpdateRouting,
  onSend,
  onClose,
}: EmailComposerProps) => {
  const [isSending, setIsSending] = useState(false);
  const [otherEmailInput, setOtherEmailInput] = useState('');

  const handleSend = async () => {
    setIsSending(true);
    try {
      await onSend();
      toast({
        title: "Message Sent (Demo)",
        description: "Message has been queued for delivery.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const toggleAttachment = (guideId: string, filename: string) => {
    const exists = draft.attachments.some(a => a.attachment_id === guideId);
    if (exists) {
      onUpdateDraft({
        ...draft,
        attachments: draft.attachments.filter(a => a.attachment_id !== guideId),
      });
    } else {
      onUpdateDraft({
        ...draft,
        attachments: [...draft.attachments, { attachment_id: guideId, filename }],
      });
    }
  };

  const addOtherEmail = () => {
    if (otherEmailInput && otherEmailInput.includes('@')) {
      onUpdateRouting({
        ...routing,
        other_emails: [...routing.other_emails, otherEmailInput],
      });
      setOtherEmailInput('');
    }
  };

  const removeOtherEmail = (index: number) => {
    onUpdateRouting({
      ...routing,
      other_emails: routing.other_emails.filter((_, i) => i !== index),
    });
  };

  const getCategoryIcon = (category: PatientGuide['category']) => {
    const icons: Record<string, string> = {
      education: '📚',
      exercise: '🏃',
      ergonomics: '💺',
      followup: '📅',
      safety: '⚠️',
      medication_info: '💊',
    };
    return icons[category] || '📄';
  };

  return (
    <div className="intake-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          Draft Patient Email
        </h3>
        <Badge variant={draft.status === 'sent_mock' ? 'default' : 'outline'}>
          {draft.status}
        </Badge>
      </div>

      {/* Recipients Routing */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Recipients
        </h4>

        <div className="grid md:grid-cols-2 gap-3">
          {/* Patient */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Patient Email (To) *</Label>
            <Input
              type="email"
              placeholder="patient@example.com"
              value={routing.patient_email || ''}
              onChange={(e) => onUpdateRouting({ ...routing, patient_email: e.target.value })}
              className="bg-background"
            />
          </div>

          {/* Admin */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-admin"
                checked={!!routing.admin_email}
                onCheckedChange={(checked) => 
                  onUpdateRouting({ 
                    ...routing, 
                    admin_email: checked ? routing.admin_email || 'admin@clinic.com' : undefined 
                  })
                }
              />
              <Label htmlFor="include-admin" className="text-xs text-muted-foreground">
                CC Admin
              </Label>
            </div>
            {routing.admin_email !== undefined && (
              <Input
                type="email"
                placeholder="admin@clinic.com"
                value={routing.admin_email || ''}
                onChange={(e) => onUpdateRouting({ ...routing, admin_email: e.target.value })}
                className="bg-background"
              />
            )}
          </div>

          {/* Pharmacist */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-pharmacy"
                checked={!!routing.pharmacist_email}
                onCheckedChange={(checked) => 
                  onUpdateRouting({ 
                    ...routing, 
                    pharmacist_email: checked ? routing.pharmacist_email || '' : undefined 
                  })
                }
              />
              <Label htmlFor="include-pharmacy" className="text-xs text-muted-foreground">
                CC Pharmacist
              </Label>
            </div>
            {routing.pharmacist_email !== undefined && (
              <Input
                type="email"
                placeholder="pharmacy@example.com"
                value={routing.pharmacist_email || ''}
                onChange={(e) => onUpdateRouting({ ...routing, pharmacist_email: e.target.value })}
                className="bg-background"
              />
            )}
          </div>

          {/* Lab */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-lab"
                checked={!!routing.lab_email}
                onCheckedChange={(checked) => 
                  onUpdateRouting({ 
                    ...routing, 
                    lab_email: checked ? routing.lab_email || '' : undefined 
                  })
                }
              />
              <Label htmlFor="include-lab" className="text-xs text-muted-foreground">
                CC Lab
              </Label>
            </div>
            {routing.lab_email !== undefined && (
              <Input
                type="email"
                placeholder="lab@example.com"
                value={routing.lab_email || ''}
                onChange={(e) => onUpdateRouting({ ...routing, lab_email: e.target.value })}
                className="bg-background"
              />
            )}
          </div>

          {/* Specialist */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-specialist"
                checked={!!routing.specialist_email}
                onCheckedChange={(checked) => 
                  onUpdateRouting({ 
                    ...routing, 
                    specialist_email: checked ? routing.specialist_email || '' : undefined 
                  })
                }
              />
              <Label htmlFor="include-specialist" className="text-xs text-muted-foreground">
                CC Specialist
              </Label>
            </div>
            {routing.specialist_email !== undefined && (
              <Input
                type="email"
                placeholder="specialist@example.com"
                value={routing.specialist_email || ''}
                onChange={(e) => onUpdateRouting({ ...routing, specialist_email: e.target.value })}
                className="bg-background"
              />
            )}
          </div>

          {/* Other emails */}
          <div className="md:col-span-2 space-y-2">
            <Label className="text-xs text-muted-foreground">Other Recipients</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Add email..."
                value={otherEmailInput}
                onChange={(e) => setOtherEmailInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addOtherEmail()}
                className="bg-background"
              />
              <Button variant="outline" size="icon" onClick={addOtherEmail}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {routing.other_emails.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {routing.other_emails.map((email, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1">
                    {email}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeOtherEmail(i)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Subject</Label>
          <Input
            value={draft.subject}
            onChange={(e) => onUpdateDraft({ ...draft, subject: e.target.value })}
            className="bg-background"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Body</Label>
          <Textarea
            value={draft.body}
            onChange={(e) => onUpdateDraft({ ...draft, body: e.target.value })}
            className="min-h-[300px] bg-background font-mono text-sm"
          />
        </div>
      </div>

      {/* Attachments */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-primary" />
          Attachments
        </h4>

        {/* Recommended guides */}
        {recommendedGuides.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Recommended for this diagnosis:</p>
            <div className="grid md:grid-cols-2 gap-2">
              {recommendedGuides.map(guide => (
                <div 
                  key={guide.guide_id}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all",
                    draft.attachments.some(a => a.attachment_id === guide.guide_id)
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/50"
                  )}
                  onClick={() => toggleAttachment(guide.guide_id, guide.filename)}
                >
                  <Checkbox 
                    checked={draft.attachments.some(a => a.attachment_id === guide.guide_id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span>{getCategoryIcon(guide.category)}</span>
                      <span className="text-sm font-medium text-foreground truncate">
                        {guide.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{guide.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All guides */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">All available guides:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PATIENT_GUIDES.filter(g => !recommendedGuides.some(r => r.guide_id === g.guide_id)).map(guide => (
              <div 
                key={guide.guide_id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded border cursor-pointer transition-all text-sm",
                  draft.attachments.some(a => a.attachment_id === guide.guide_id)
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/50"
                )}
                onClick={() => toggleAttachment(guide.guide_id, guide.filename)}
              >
                <Checkbox 
                  checked={draft.attachments.some(a => a.attachment_id === guide.guide_id)}
                  className="flex-shrink-0"
                />
                <span className="truncate">{guide.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected attachments summary */}
        {draft.attachments.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">
              {draft.attachments.length} attachment(s) selected:
            </p>
            <div className="flex flex-wrap gap-1">
              {draft.attachments.map(a => (
                <Badge key={a.attachment_id} variant="outline" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  {a.filename}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
          <div className="text-xs text-yellow-700">
            <p className="font-medium">Patient Communication Safety</p>
            <ul className="mt-1 space-y-0.5">
              <li>• No numeric probabilities in patient-facing content</li>
              <li>• No specific dosing instructions</li>
              <li>• Always includes return precautions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button 
          onClick={handleSend} 
          disabled={isSending || !routing.patient_email}
          className="flex-1"
        >
          {isSending ? (
            <>Sending...</>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send (Demo)
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        For hackathon MVP: This will simulate sending and store as "sent_mock"
      </p>
    </div>
  );
};

export default EmailComposer;
