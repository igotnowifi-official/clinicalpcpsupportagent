import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';

interface ConsentScreenProps {
  accepted: boolean;
  onAccept: (accepted: boolean) => void;
  onContinue: () => void;
}

const ConsentScreen = ({ accepted, onAccept, onContinue }: ConsentScreenProps) => {
  return (
    <div className="animate-slide-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="intake-header">Welcome to Patient Intake</h1>
        <p className="intake-subheader">
          Please review and accept the following before continuing
        </p>
      </div>

      <div className="intake-card mb-6">
        <div className="flex items-start gap-4 p-4 bg-warning-soft rounded-lg border border-warning/30 mb-6">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">Important Notice</p>
            <p className="text-muted-foreground">
              This intake form collects information to help your healthcare provider. 
              It is <strong>not a diagnostic tool</strong> and does not replace professional medical evaluation.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Before you begin:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Answer all questions as accurately as possible</li>
            <li>Take your time — there's no rush</li>
            <li>If you experience a medical emergency, call 911 immediately</li>
            <li>A clinician will review your information</li>
          </ul>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={accepted}
              onCheckedChange={(checked) => onAccept(checked as boolean)}
              className="mt-0.5"
            />
            <span className="text-sm text-foreground">
              I understand that this tool is <strong>not a diagnosis</strong> and that a clinician will review my information before any medical decisions are made.
            </span>
          </label>
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={!accepted}
        onClick={onContinue}
      >
        Continue to Intake
      </Button>
    </div>
  );
};

export default ConsentScreen;
