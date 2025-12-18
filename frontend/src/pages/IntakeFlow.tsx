import { useState } from 'react';
import { Issue, IntakePayload, IntakeStep, createInitialIntakePayload, TriageResult } from '@/types/intake';
import { submitIntake, getTriageResult } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

import ConsentScreen from '@/components/ConsentScreen';
import RedFlagScreen from '@/components/RedFlagScreen';
import BodyMap from '@/components/BodyMap';
import IssueCard from '@/components/IssueCard';
import SymptomsVitalsForm from '@/components/SymptomsVitalsForm';
import HistoryForm from '@/components/HistoryForm';
import ReviewScreen from '@/components/ReviewScreen';
import IntakeComplete from '@/components/IntakeComplete';

import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Footer from '@/components/Footer';

interface IntakeFlowProps {
  isRemote?: boolean;
}

const STEPS: IntakeStep[] = ['consent', 'red_flags', 'body_map', 'symptoms_vitals', 'history', 'review', 'complete'];

const IntakeFlow = ({ isRemote = false }: IntakeFlowProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<IntakeStep>('consent');
  const [payload, setPayload] = useState<IntakePayload>(createInitialIntakePayload());
  const [intakeId, setIntakeId] = useState<string>('');
  const [triageResult, setTriageResult] = useState<TriageResult | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepIndex = STEPS.indexOf(currentStep);
  const progress = ((stepIndex) / (STEPS.length - 1)) * 100;

  const goToStep = (step: IntakeStep) => setCurrentStep(step);
  const nextStep = () => {
    const next = STEPS[stepIndex + 1];
    if (next) setCurrentStep(next);
  };
  const prevStep = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setCurrentStep(prev);
  };

  // Handle body region click
  const handleRegionClick = (regionId: string, regionName: string) => {
    const existing = payload.issues.find(i => i.body_region_id === regionId);
    
    if (existing) {
      // Remove if already selected
      setPayload(prev => ({
        ...prev,
        issues: prev.issues.filter(i => i.body_region_id !== regionId),
      }));
    } else {
      // Add new issue
      const newIssue: Issue = {
        id: `issue-${Date.now()}`,
        body_region: regionName,
        body_region_id: regionId,
        description: '',
        pain_rating: 5,
        onset: 'today',
        course: 'same',
        tags: [],
      };
      setPayload(prev => ({
        ...prev,
        issues: [...prev.issues, newIssue],
      }));
    }
  };

  const updateIssue = (updatedIssue: Issue) => {
    setPayload(prev => ({
      ...prev,
      issues: prev.issues.map(i => i.id === updatedIssue.id ? updatedIssue : i),
    }));
  };

  const removeIssue = (issueId: string) => {
    setPayload(prev => ({
      ...prev,
      issues: prev.issues.filter(i => i.id !== issueId),
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Submit intake (this will issue questionnaire and submit in one flow)
      const response = await submitIntake(payload);
      setIntakeId(response.intake_id);

      // Get triage result from backend (uses real TriageEngine with Neo4j/Excel)
      const triage = await getTriageResult(response.intake_id);
      setTriageResult(triage);

      toast({
        title: "Intake submitted successfully",
        description: `Session: ${response.intake_id}`,
      });

      setCurrentStep('complete');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Submission failed",
        description: errorMessage || "Please try again or contact staff for assistance.",
        variant: "destructive",
      });
      console.error('Intake submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFromReview = (section: string) => {
    switch (section) {
      case 'red_flags':
        goToStep('red_flags');
        break;
      case 'body_map':
        goToStep('body_map');
        break;
      case 'symptoms_vitals':
        goToStep('symptoms_vitals');
        break;
      case 'history':
        goToStep('history');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with progress */}
      {currentStep !== 'complete' && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Patient Intake</span>
              <span>Step {stepIndex + 1} of {STEPS.length - 1}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="intake-container py-6">
        {currentStep === 'consent' && (
          <ConsentScreen
            accepted={payload.consent.accepted}
            onAccept={(accepted) => setPayload(prev => ({ ...prev, consent: { accepted } }))}
            onContinue={nextStep}
          />
        )}

        {currentStep === 'red_flags' && (
          <RedFlagScreen
            redFlags={payload.red_flags}
            onUpdate={(flags) => setPayload(prev => ({ ...prev, red_flags: flags }))}
            onContinue={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === 'body_map' && (
          <div className="animate-slide-in">
            <h1 className="intake-header text-center">Where does it hurt?</h1>
            <p className="intake-subheader text-center">
              Tap on body areas to add issues
            </p>

            <BodyMap
              selectedRegions={payload.issues.map(i => i.body_region_id)}
              onRegionClick={handleRegionClick}
            />

            {payload.issues.length > 0 && (
              <div className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Selected Issues ({payload.issues.length})
                </h2>
                {payload.issues.map(issue => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onUpdate={updateIssue}
                    onRemove={() => removeIssue(issue.id)}
                  />
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={nextStep} className="flex-1">
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'symptoms_vitals' && (
          <SymptomsVitalsForm
            symptoms={payload.symptoms}
            vitals={payload.vitals}
            onUpdateSymptoms={(symptoms) => setPayload(prev => ({ ...prev, symptoms }))}
            onUpdateVitals={(vitals) => setPayload(prev => ({ ...prev, vitals }))}
            onContinue={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === 'history' && (
          <HistoryForm
            history={payload.history}
            onUpdate={(history) => setPayload(prev => ({ ...prev, history }))}
            onContinue={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === 'review' && (
          <ReviewScreen
            payload={payload}
            onEdit={handleEditFromReview}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 'complete' && (
          <IntakeComplete
            intakeId={intakeId}
            triageResult={triageResult}
            isRemote={isRemote}
          />
        )}
      </main>
      <Footer variant="patient" />
    </div>
  );
};

export default IntakeFlow;
