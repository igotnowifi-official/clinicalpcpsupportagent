import { TriageResult } from '@/types/intake';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertTriangle, Home, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IntakeCompleteProps {
  intakeId: string;
  triageResult?: TriageResult;
  isRemote: boolean;
}

const IntakeComplete = ({ intakeId, triageResult, isRemote }: IntakeCompleteProps) => {
  const navigate = useNavigate();
  const isUrgent = triageResult?.status === 'urgent';

  return (
    <div className="animate-slide-in text-center">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
        isUrgent ? 'bg-urgent/10' : 'bg-success/10'
      }`}>
        {isUrgent ? (
          <AlertTriangle className="w-10 h-10 text-urgent" />
        ) : (
          <CheckCircle2 className="w-10 h-10 text-success" />
        )}
      </div>

      <h1 className="intake-header mb-2">Intake Complete</h1>
      
      <div className="mb-6">
        <p className="text-muted-foreground mb-2">Your reference number:</p>
        <code className="text-lg font-mono bg-muted px-4 py-2 rounded-lg text-foreground">
          {intakeId}
        </code>
      </div>

      {isUrgent && (
        <div className="urgent-banner mb-6 text-left">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Urgent attention required</p>
            <p className="text-sm opacity-90">
              Based on your responses, a clinician will see you as soon as possible.
            </p>
          </div>
        </div>
      )}

      {triageResult && (
        <div className="intake-card text-left mb-6">
          <h3 className="font-semibold text-foreground mb-3">Triage Summary</h3>
          
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={isUrgent ? 'destructive' : 'secondary'}>
              {isUrgent ? 'Urgent' : 'Non-Urgent'}
            </Badge>
            {triageResult.red_flags_triggered.length > 0 && (
              <Badge variant="outline" className="text-urgent border-urgent">
                {triageResult.red_flags_triggered.length} flag(s)
              </Badge>
            )}
          </div>

          {triageResult.differentials && triageResult.differentials.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Possible conditions (for clinician review)
              </p>
              <div className="space-y-1">
                {triageResult.differentials.map(d => (
                  <div key={d.condition} className="flex justify-between text-sm">
                    <span className="text-foreground">{d.condition}</span>
                    <span className="text-muted-foreground">{Math.round(d.probability * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {triageResult.lab_suggestions.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Suggested labs
              </p>
              <div className="flex flex-wrap gap-1">
                {triageResult.lab_suggestions.map(lab => (
                  <Badge key={lab} variant="outline" className="text-xs">{lab}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="intake-card text-left mb-6">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            {isRemote ? (
              <>
                <h3 className="font-semibold text-foreground mb-1">Next Steps</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Please arrive at the clinic <strong>15 minutes early</strong> for final check-in. 
                  Bring your reference number and a valid ID.
                </p>
                <p className="text-sm text-muted-foreground">
                  Your information has been saved. When you arrive, use the Check-In kiosk 
                  or tell the receptionist your reference number.
                </p>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-foreground mb-1">Please Wait</h3>
                <p className="text-sm text-muted-foreground">
                  A clinician will call your name shortly. Please remain in the waiting area.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg border border-border mb-6">
        <p className="text-xs text-muted-foreground">
          <strong>Reminder:</strong> This intake does not constitute a diagnosis. 
          All information will be reviewed by a licensed healthcare provider.
        </p>
      </div>

      <div className="space-y-3">
        {isRemote && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/checkin')}
          >
            <QrCode className="w-4 h-4 mr-2" />
            Go to Check-In
          </Button>
        )}
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={() => navigate('/')}
        >
          <Home className="w-4 h-4 mr-2" />
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default IntakeComplete;
