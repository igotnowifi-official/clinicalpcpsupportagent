import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Plus,
  Thermometer,
  Heart,
  Wind,
  Activity,
  MessageSquarePlus,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface MissingVitals {
  temperature: boolean;
  bp: boolean;
  heartRate: boolean;
  spo2: boolean;
}

interface VitalsData {
  temperature_c?: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  heart_rate?: number;
  spo2?: number;
}

interface AssistantActionsProps {
  currentVitals: VitalsData;
  onAddVitals: (vitals: Partial<VitalsData>) => Promise<void>;
  onAddFollowUp: (question: string, answer: string) => Promise<void>;
  isUpdating: boolean;
}

const AssistantActions = ({
  currentVitals,
  onAddVitals,
  onAddFollowUp,
  isUpdating,
}: AssistantActionsProps) => {
  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [newVitals, setNewVitals] = useState<Partial<VitalsData>>({});
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');

  // Detect missing vitals
  const missingVitals: MissingVitals = {
    temperature: currentVitals.temperature_c === undefined,
    bp: currentVitals.bp_systolic === undefined || currentVitals.bp_diastolic === undefined,
    heartRate: currentVitals.heart_rate === undefined,
    spo2: currentVitals.spo2 === undefined,
  };

  const hasMissingVitals = Object.values(missingVitals).some(v => v);
  const missingCount = Object.values(missingVitals).filter(v => v).length;

  const handleAddVitals = async () => {
    await onAddVitals(newVitals);
    setNewVitals({});
    setVitalsDialogOpen(false);
  };

  const handleAddFollowUp = async () => {
    if (followUpQuestion && followUpAnswer) {
      await onAddFollowUp(followUpQuestion, followUpAnswer);
      setFollowUpQuestion('');
      setFollowUpAnswer('');
      setFollowUpDialogOpen(false);
    }
  };

  const suggestedQuestions = [
    'When did symptoms first start?',
    'Have you tried any treatments?',
    'Any recent travel or sick contacts?',
    'Rate your current pain (1-10)',
    'Any changes in appetite or weight?',
    'Do symptoms worsen at specific times?',
  ];

  return (
    <div className="space-y-4">
      {/* Missing Vitals Alert */}
      {hasMissingVitals && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-warning-foreground mb-1">
                Incomplete Vitals ({missingCount} missing)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Some vitals were not collected during intake. Adding them will improve triage accuracy.
              </p>
              <div className="flex flex-wrap gap-2">
                {missingVitals.temperature && (
                  <Badge variant="outline" className="bg-background">
                    <Thermometer className="w-3 h-3 mr-1" />
                    Temperature
                  </Badge>
                )}
                {missingVitals.bp && (
                  <Badge variant="outline" className="bg-background">
                    <Activity className="w-3 h-3 mr-1" />
                    Blood Pressure
                  </Badge>
                )}
                {missingVitals.heartRate && (
                  <Badge variant="outline" className="bg-background">
                    <Heart className="w-3 h-3 mr-1" />
                    Heart Rate
                  </Badge>
                )}
                {missingVitals.spo2 && (
                  <Badge variant="outline" className="bg-background">
                    <Wind className="w-3 h-3 mr-1" />
                    SpO2
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Add Vitals Dialog */}
        <Dialog open={vitalsDialogOpen} onOpenChange={setVitalsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Vitals
              {hasMissingVitals && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {missingCount}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Patient Vitals</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {missingVitals.temperature && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-muted-foreground" />
                    Temperature (°C)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={newVitals.temperature_c || ''}
                    onChange={(e) => setNewVitals(prev => ({
                      ...prev,
                      temperature_c: parseFloat(e.target.value) || undefined
                    }))}
                  />
                </div>
              )}

              {missingVitals.bp && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    Blood Pressure (mmHg)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Systolic (120)"
                      value={newVitals.bp_systolic || ''}
                      onChange={(e) => setNewVitals(prev => ({
                        ...prev,
                        bp_systolic: parseInt(e.target.value) || undefined
                      }))}
                    />
                    <span className="text-muted-foreground self-center">/</span>
                    <Input
                      type="number"
                      placeholder="Diastolic (80)"
                      value={newVitals.bp_diastolic || ''}
                      onChange={(e) => setNewVitals(prev => ({
                        ...prev,
                        bp_diastolic: parseInt(e.target.value) || undefined
                      }))}
                    />
                  </div>
                </div>
              )}

              {missingVitals.heartRate && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    Heart Rate (bpm)
                  </Label>
                  <Input
                    type="number"
                    placeholder="72"
                    value={newVitals.heart_rate || ''}
                    onChange={(e) => setNewVitals(prev => ({
                      ...prev,
                      heart_rate: parseInt(e.target.value) || undefined
                    }))}
                  />
                </div>
              )}

              {missingVitals.spo2 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-muted-foreground" />
                    SpO2 (%)
                  </Label>
                  <Input
                    type="number"
                    placeholder="98"
                    value={newVitals.spo2 || ''}
                    onChange={(e) => setNewVitals(prev => ({
                      ...prev,
                      spo2: parseInt(e.target.value) || undefined
                    }))}
                  />
                </div>
              )}

              {!hasMissingVitals && (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="text-muted-foreground">All vitals have been recorded</p>
                </div>
              )}

              <Button
                onClick={handleAddVitals}
                disabled={isUpdating || Object.keys(newVitals).length === 0}
                className="w-full"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save & Update Triage
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Follow-up Question Dialog */}
        <Dialog open={followUpDialogOpen} onOpenChange={setFollowUpDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquarePlus className="w-4 h-4" />
              Ask Follow-up
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Follow-up Question & Answer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Suggested Questions</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setFollowUpQuestion(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question Asked</Label>
                <Input
                  placeholder="Enter the question you asked the patient..."
                  value={followUpQuestion}
                  onChange={(e) => setFollowUpQuestion(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Patient's Response</Label>
                <Textarea
                  placeholder="Enter the patient's response..."
                  value={followUpAnswer}
                  onChange={(e) => setFollowUpAnswer(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleAddFollowUp}
                disabled={isUpdating || !followUpQuestion || !followUpAnswer}
                className="w-full"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Record & Update
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AssistantActions;
