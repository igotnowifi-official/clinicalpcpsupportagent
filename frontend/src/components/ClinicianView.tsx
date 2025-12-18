import { useState } from 'react';
import { TriageResult, ExplanationResult, IntakePayload } from '@/types/intake';
import { Finalization, MessageDraft, RecipientRouting, DifferentialDiagnosis, PatientGuide } from '@/types/clinical';
import { getGuidesForCondition, getGuidesForActions } from '@/data/patientGuides';
import { generateMessageDraft, sendMessage } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AssistantActions from '@/components/AssistantActions';
import SuggestedDiagnoses from '@/components/SuggestedDiagnoses';
import ClinicalWrapup from '@/components/ClinicalWrapup';
import EmailComposer from '@/components/EmailComposer';
import { 
  AlertOctagon, 
  CheckCircle2, 
  Activity, 
  FileText, 
  Beaker, 
  Users, 
  ChevronRight,
  Brain,
  Network,
  Pill,
  Heart,
  Dumbbell,
  Moon,
  Monitor,
  Apple,
  Sparkles,
  StickyNote,
  ClipboardList,
  MessageSquare,
  ClipboardCheck
} from 'lucide-react';

interface FollowUp {
  question: string;
  answer: string;
  timestamp: string;
}

interface ClinicianViewProps {
  intakeId: string;
  triage: TriageResult;
  explanation?: ExplanationResult;
  vitals: IntakePayload['vitals'];
  followUps?: FollowUp[];
  onMarkReviewed: () => void;
  onUpdateVitals: (vitals: Partial<IntakePayload['vitals']>) => Promise<void>;
  onAddFollowUp: (question: string, answer: string) => Promise<void>;
  isUpdating: boolean;
}

const createEmptyFinalization = (): Finalization => ({
  final_diagnosis_condition_id: undefined,
  final_diagnosis_free_text: '',
  final_labs: [],
  final_referrals: [],
  final_medication_options: [],
  final_actions: [],
  followup: { timeframe: '2 weeks', instructions: 'Schedule follow-up via clinic front desk' },
  patient_notes: '',
});

const ClinicianView = ({ 
  intakeId, 
  triage, 
  explanation, 
  vitals,
  followUps = [],
  onMarkReviewed,
  onUpdateVitals,
  onAddFollowUp,
  isUpdating
}: ClinicianViewProps) => {
  const isUrgent = triage.status === 'urgent';
  const [practitionerNotes, setPractitionerNotes] = useState('');
  const [finalization, setFinalization] = useState<Finalization>(createEmptyFinalization());
  const [emailDraft, setEmailDraft] = useState<MessageDraft | null>(null);
  const [routing, setRouting] = useState<RecipientRouting>({ other_emails: [], admin_email: 'admin@clinic.com' });
  const [recommendedGuides, setRecommendedGuides] = useState<PatientGuide[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Convert triage differentials to enhanced format
  const differential: DifferentialDiagnosis[] = (triage.differentials || []).map((d, i) => ({
    condition_id: d.condition.toLowerCase().replace(/\s+/g, '_'),
    condition_name: d.condition,
    probability: Math.round(d.probability * 100),
    confidence: d.probability > 0.5 ? 'high' : d.probability > 0.25 ? 'medium' : 'low',
    evidence_count: 2 + i,
    evidence: [
      { description: 'Symptom pattern match', type: 'symptom' as const },
      { description: 'Clinical presentation', type: 'history' as const },
    ],
    missing_evidence: ['Lab confirmation', 'Imaging'],
    suggested_labs: triage.lab_suggestions.slice(0, 2),
    suggested_referrals: triage.referral_suggestions.slice(0, 1),
    suggested_meds: (triage.medication_suggestions || []).slice(0, 2).map(m => m.name),
    suggested_actions: (triage.lifestyle_suggestions || []).slice(0, 2).map(l => l.recommendation),
  }));

  const handleGenerateEmail = async () => {
    setIsGenerating(true);
    try {
      const draft = await generateMessageDraft(intakeId, finalization);
      setEmailDraft(draft);
      const conditionId = finalization.final_diagnosis_condition_id || differential[0]?.condition_id;
      const actionIds = finalization.final_actions.map(a => a.action_id);
      const guides = [
        ...getGuidesForCondition(conditionId || ''),
        ...getGuidesForActions(actionIds),
      ];
      setRecommendedGuides(guides);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (emailDraft) {
      await sendMessage(intakeId, { ...emailDraft, recipients: routing });
      setEmailDraft({ ...emailDraft, status: 'sent_mock' });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exercise': return <Dumbbell className="w-4 h-4" />;
      case 'diet': return <Apple className="w-4 h-4" />;
      case 'sleep': return <Moon className="w-4 h-4" />;
      case 'stress': return <Heart className="w-4 h-4" />;
      case 'screen_time': return <Monitor className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'medium': return 'bg-warning/10 text-warning border-warning/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">{intakeId}</h2>
            <Badge variant={isUrgent ? 'destructive' : 'secondary'}>
              {isUrgent ? 'URGENT' : 'Non-Urgent'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Submitted just now • Pending review
          </p>
        </div>
        <Button onClick={onMarkReviewed}>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Mark Reviewed
        </Button>
      </div>

      {/* Red Flags Alert */}
      {triage.red_flags_triggered.length > 0 && (
        <div className="urgent-banner">
          <AlertOctagon className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Red Flags Detected</p>
            <ul className="text-sm opacity-90 mt-1 list-disc list-inside">
              {triage.red_flags_triggered.map((flag, i) => (
                <li key={i}>{flag}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Assistant Actions Section */}
      <div className="intake-card p-4">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          Assistant Actions
        </h3>
        <AssistantActions
          currentVitals={vitals}
          onAddVitals={onUpdateVitals}
          onAddFollowUp={onAddFollowUp}
          isUpdating={isUpdating}
        />
      </div>

      {/* Follow-ups Section */}
      {followUps.length > 0 && (
        <div className="intake-card p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Follow-up Questions ({followUps.length})
          </h3>
          <div className="space-y-3">
            {followUps.map((fu, i) => (
              <div key={i} className="p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm font-medium text-foreground mb-1">Q: {fu.question}</p>
                <p className="text-sm text-muted-foreground">A: {fu.answer}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Added {new Date(fu.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="triage" className="w-full">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="triage">
            <Activity className="w-4 h-4 mr-2" />
            Triage
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Beaker className="w-4 h-4 mr-2" />
            Recs
          </TabsTrigger>
          <TabsTrigger value="explanation">
            <Brain className="w-4 h-4 mr-2" />
            AI
          </TabsTrigger>
          <TabsTrigger value="wrapup">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Wrap-up
          </TabsTrigger>
          <TabsTrigger value="notes">
            <StickyNote className="w-4 h-4 mr-2" />
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="triage" className="mt-4 space-y-4">
          {/* Enhanced Differential Display */}
          {differential.length > 0 && (
            <SuggestedDiagnoses
              differential={differential}
              isOverriddenByRedFlag={isUrgent}
              overrideReason={triage.red_flags_triggered.join(', ')}
            />
          )}

          {/* Serious Risk Buckets */}
          <div className="intake-card">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Risk Assessment
            </h3>
            <div className="space-y-2">
              <RiskItem 
                label="Hypertension Risk" 
                active={triage.serious_buckets.hypertension_risk}
                description="BP ≥ 160 systolic"
              />
              <RiskItem 
                label="Hyperglycemia Risk" 
                active={triage.serious_buckets.hyperglycemia_risk}
                description="Polyuria + Polydipsia"
              />
              <RiskItem 
                label="Respiratory Risk" 
                active={triage.serious_buckets.respiratory_risk}
                description="SpO2 92-94% or SOB"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4 space-y-4">
          {/* Medication Suggestions */}
          <div className="intake-card">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Pill className="w-4 h-4 text-primary" />
              Suggested Medications
            </h3>
            {triage.medication_suggestions && triage.medication_suggestions.length > 0 ? (
              <div className="space-y-3">
                {triage.medication_suggestions.map((med, i) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-foreground">{med.name}</span>
                      <Badge variant="outline" className="text-xs">{med.dosage}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{med.frequency}</p>
                    {med.notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic border-l-2 border-primary/30 pl-2">
                        {med.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific medications suggested</p>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              * All medications require clinical review and consideration of patient allergies/contraindications.
            </p>
          </div>

          {/* Lifestyle Suggestions */}
          <div className="intake-card">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              Lifestyle Recommendations
            </h3>
            {triage.lifestyle_suggestions && triage.lifestyle_suggestions.length > 0 ? (
              <div className="space-y-3">
                {triage.lifestyle_suggestions.map((sug, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${getPriorityColor(sug.priority)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryIcon(sug.category)}
                      <span className="font-medium capitalize">{sug.category.replace('_', ' ')}</span>
                      <Badge variant="outline" className="text-xs ml-auto capitalize">
                        {sug.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm">{sug.recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific lifestyle changes suggested</p>
            )}
          </div>

          {/* Lab Suggestions */}
          <div className="intake-card">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Beaker className="w-4 h-4 text-primary" />
              Suggested Labs
            </h3>
            {triage.lab_suggestions.length > 0 ? (
              <div className="space-y-2">
                {triage.lab_suggestions.map(lab => (
                  <div key={lab} className="flex items-center gap-2 text-sm">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{lab}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific labs suggested</p>
            )}
          </div>

          {/* Referral Suggestions */}
          <div className="intake-card">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Suggested Referrals
            </h3>
            {triage.referral_suggestions.length > 0 ? (
              <div className="space-y-2">
                {triage.referral_suggestions.map(ref => (
                  <div key={ref} className="flex items-center gap-2 text-sm">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{ref}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific referrals suggested</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="explanation" className="mt-4 space-y-4">
          {/* Evidence */}
          {explanation && (
            <>
              <div className="intake-card">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  Top Evidence
                </h3>
                <div className="space-y-3">
                  {explanation.top_evidence.map((ev, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {ev.type}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{ev.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Relevance: {Math.round(ev.relevance * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graph Paths */}
              <div className="intake-card">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Network className="w-4 h-4 text-primary" />
                  Knowledge Graph Paths
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Reasoning paths from Neo4j knowledge graph (mock data)
                </p>
                <div className="space-y-2">
                  {explanation.graph_paths.map((path, i) => (
                    <div key={i} className="text-sm font-mono text-muted-foreground bg-muted/50 p-2 rounded">
                      {path}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="wrapup" className="mt-4 space-y-4">
          {/* Clinical Wrap-up Section */}
          <ClinicalWrapup
            finalization={finalization}
            onUpdate={setFinalization}
            onGenerateEmail={handleGenerateEmail}
            isGenerating={isGenerating}
          />

          {/* Email Composer */}
          {emailDraft && (
            <EmailComposer
              draft={emailDraft}
              onUpdateDraft={setEmailDraft}
              routing={routing}
              onUpdateRouting={setRouting}
              recommendedGuides={recommendedGuides}
              onSend={handleSendEmail}
              onClose={() => setEmailDraft(null)}
            />
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-4 space-y-4">
          {/* Practitioner Notes */}
          <div className="intake-card">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-primary" />
              Practitioner Notes
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Add clinical observations, treatment decisions, or follow-up instructions.
            </p>
            <Textarea
              placeholder="Enter your clinical notes here...

Examples:
• Patient appears well-hydrated
• Discussed treatment options with patient
• Follow-up in 2 weeks
• Referred to specialist for further evaluation"
              value={practitionerNotes}
              onChange={(e) => setPractitionerNotes(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-muted-foreground">
                {practitionerNotes.length} characters
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  console.log('Saving notes:', practitionerNotes);
                }}
              >
                Save Notes
              </Button>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="intake-card">
            <h3 className="font-semibold text-foreground mb-3">Quick Templates</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Patient counseled on lifestyle modifications.',
                'Medication reconciliation completed.',
                'Follow-up appointment scheduled.',
                'Labs ordered as recommended.',
                'Referral placed to specialist.',
                'Patient to return if symptoms worsen.',
              ].map((template, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setPractitionerNotes(prev => 
                    prev ? `${prev}\n• ${template}` : `• ${template}`
                  )}
                >
                  + {template.slice(0, 25)}...
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-center text-muted-foreground pt-4 border-t border-border">
        All AI-generated suggestions require clinician review and approval.
        This tool does not provide medical diagnoses.
      </p>
    </div>
  );
};

// Helper component
const RiskItem = ({ label, active, description }: { label: string; active: boolean; description: string }) => (
  <div className={`flex items-center justify-between p-3 rounded-lg ${
    active ? 'bg-warning-soft border border-warning/30' : 'bg-muted/50'
  }`}>
    <div>
      <span className={`font-medium ${active ? 'text-warning-foreground' : 'text-foreground'}`}>
        {label}
      </span>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Badge variant={active ? 'default' : 'outline'} className={active ? 'bg-warning text-warning-foreground' : ''}>
      {active ? 'Triggered' : 'Clear'}
    </Badge>
  </div>
);

export default ClinicianView;
