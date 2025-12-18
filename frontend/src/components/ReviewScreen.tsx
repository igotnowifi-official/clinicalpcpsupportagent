import { IntakePayload, ALL_SYMPTOMS, CONDITION_OPTIONS, FAMILY_HISTORY_OPTIONS } from '@/types/intake';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  AlertOctagon, 
  MapPin, 
  Activity, 
  Heart, 
  FileText, 
  Edit2, 
  Send,
  Loader2
} from 'lucide-react';

interface ReviewScreenProps {
  payload: IntakePayload;
  onEdit: (step: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const ReviewScreen = ({ payload, onEdit, onSubmit, isSubmitting }: ReviewScreenProps) => {
  const hasRedFlags = Object.values(payload.red_flags).some(Boolean);

  const getSymptomLabel = (id: string) => {
    const symptom = ALL_SYMPTOMS.find(s => s.id === id);
    return symptom?.label || id;
  };

  const getConditionLabel = (id: string) => {
    const condition = CONDITION_OPTIONS.find(c => c.id === id);
    return condition?.label || id;
  };

  const getFamilyHistoryLabel = (id: string) => {
    const fh = FAMILY_HISTORY_OPTIONS.find(f => f.id === id);
    return fh?.label || id;
  };

  return (
    <div className="animate-slide-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="intake-header">Review Your Information</h1>
        <p className="intake-subheader">
          Please review everything before submitting
        </p>
      </div>

      {hasRedFlags && (
        <div className="urgent-banner mb-6">
          <AlertOctagon className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Urgent symptoms flagged</p>
            <p className="text-sm opacity-90">Your intake will be prioritized for review</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Red Flags Section */}
        <SectionCard
          icon={<AlertOctagon className="w-4 h-4" />}
          title="Urgent Symptoms"
          onEdit={() => onEdit('red_flags')}
        >
          <div className="space-y-2">
            <ReviewItem 
              label="Chest pain" 
              value={payload.red_flags.chest_pain ? 'Yes' : 'No'} 
              highlight={payload.red_flags.chest_pain}
            />
            <ReviewItem 
              label="Severe breathing difficulty" 
              value={payload.red_flags.severe_shortness_of_breath ? 'Yes' : 'No'} 
              highlight={payload.red_flags.severe_shortness_of_breath}
            />
            <ReviewItem 
              label="Fainting/Confusion" 
              value={payload.red_flags.fainting_or_confusion ? 'Yes' : 'No'} 
              highlight={payload.red_flags.fainting_or_confusion}
            />
          </div>
        </SectionCard>

        {/* Body Issues Section */}
        <SectionCard
          icon={<MapPin className="w-4 h-4" />}
          title={`Body Issues (${payload.issues.length})`}
          onEdit={() => onEdit('body_map')}
        >
          {payload.issues.length === 0 ? (
            <p className="text-sm text-muted-foreground">No body regions selected</p>
          ) : (
            <div className="space-y-3">
              {payload.issues.map(issue => (
                <div key={issue.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{issue.body_region}</span>
                    <Badge variant={issue.pain_rating > 6 ? 'destructive' : 'secondary'}>
                      Pain: {issue.pain_rating}/10
                    </Badge>
                  </div>
                  {issue.description && (
                    <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {issue.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Symptoms Section */}
        <SectionCard
          icon={<Activity className="w-4 h-4" />}
          title="Symptoms"
          onEdit={() => onEdit('symptoms_vitals')}
        >
          {payload.symptoms.length === 0 || payload.symptoms.includes('none') ? (
            <p className="text-sm text-muted-foreground">No symptoms selected</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {payload.symptoms.filter(s => s !== 'none').map(s => (
                <Badge key={s} variant="secondary">{getSymptomLabel(s)}</Badge>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Vitals Section */}
        <SectionCard
          icon={<Heart className="w-4 h-4" />}
          title="Vitals"
          onEdit={() => onEdit('symptoms_vitals')}
        >
          <div className="grid grid-cols-2 gap-3">
            <ReviewItem 
              label="Temperature" 
              value={payload.vitals.temperature_c ? `${payload.vitals.temperature_c}°C` : 'Unknown'} 
            />
            <ReviewItem 
              label="Blood Pressure" 
              value={payload.vitals.bp_systolic ? `${payload.vitals.bp_systolic}/${payload.vitals.bp_diastolic || '?'}` : 'Unknown'} 
            />
            <ReviewItem 
              label="Heart Rate" 
              value={payload.vitals.heart_rate ? `${payload.vitals.heart_rate} bpm` : 'Unknown'} 
            />
            <ReviewItem 
              label="SpO2" 
              value={payload.vitals.spo2 ? `${payload.vitals.spo2}%` : 'Unknown'} 
            />
          </div>
        </SectionCard>

        {/* History Section */}
        <SectionCard
          icon={<FileText className="w-4 h-4" />}
          title="Medical History"
          onEdit={() => onEdit('history')}
        >
          <div className="space-y-3">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Conditions</span>
              {payload.history.conditions.length === 0 || payload.history.conditions.includes('none') ? (
                <p className="text-sm text-foreground">None reported</p>
              ) : (
                <div className="flex flex-wrap gap-1 mt-1">
                  {payload.history.conditions.filter(c => c !== 'none').map(c => (
                    <Badge key={c} variant="secondary" className="text-xs">{getConditionLabel(c)}</Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Allergies</span>
              {payload.history.allergies.length === 0 ? (
                <p className="text-sm text-foreground">None reported</p>
              ) : (
                <div className="flex flex-wrap gap-1 mt-1">
                  {payload.history.allergies.map((a, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{a}</Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Medications</span>
              <p className="text-sm text-foreground">
                {payload.history.medications || 'None reported'}
              </p>
            </div>

            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Family History</span>
              {payload.history.family_history.length === 0 || payload.history.family_history.includes('none') ? (
                <p className="text-sm text-foreground">None reported</p>
              ) : (
                <div className="flex flex-wrap gap-1 mt-1">
                  {payload.history.family_history.filter(f => f !== 'none').map(f => (
                    <Badge key={f} variant="secondary" className="text-xs">{getFamilyHistoryLabel(f)}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-8 p-4 bg-primary-soft rounded-lg border border-primary/20">
        <p className="text-sm text-foreground">
          <strong>Clinician Review Required:</strong> Your information will be reviewed by a healthcare provider. 
          This intake is not a diagnosis.
        </p>
      </div>

      <Button 
        className="w-full mt-6" 
        size="lg" 
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit Intake
          </>
        )}
      </Button>
    </div>
  );
};

// Helper components
const SectionCard = ({ 
  icon, 
  title, 
  children, 
  onEdit 
}: { 
  icon: React.ReactNode; 
  title: string; 
  children: React.ReactNode; 
  onEdit: () => void;
}) => (
  <div className="intake-card">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="font-semibold text-foreground">{title}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit}>
        <Edit2 className="w-3 h-3 mr-1" />
        Edit
      </Button>
    </div>
    {children}
  </div>
);

const ReviewItem = ({ 
  label, 
  value, 
  highlight = false 
}: { 
  label: string; 
  value: string; 
  highlight?: boolean;
}) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className={highlight ? 'text-urgent font-medium' : 'text-foreground'}>{value}</span>
  </div>
);

export default ReviewScreen;
