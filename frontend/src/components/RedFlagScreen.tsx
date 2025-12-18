import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertOctagon, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RedFlagScreenProps {
  redFlags: {
    chest_pain: boolean;
    severe_shortness_of_breath: boolean;
    fainting_or_confusion: boolean;
  };
  onUpdate: (flags: RedFlagScreenProps['redFlags']) => void;
  onContinue: () => void;
  onBack: () => void;
}

const RED_FLAG_QUESTIONS = [
  {
    id: 'chest_pain',
    question: 'Are you currently experiencing chest pain or pressure?',
    description: 'Including tightness, squeezing, or discomfort in the chest area',
  },
  {
    id: 'severe_shortness_of_breath',
    question: 'Are you having severe difficulty breathing?',
    description: 'Unable to catch your breath or speak in full sentences',
  },
  {
    id: 'fainting_or_confusion',
    question: 'Have you fainted or are you feeling confused?',
    description: 'Sudden loss of consciousness or mental confusion',
  },
] as const;

const RedFlagScreen = ({ redFlags, onUpdate, onContinue, onBack }: RedFlagScreenProps) => {
  const hasAnyRedFlag = Object.values(redFlags).some(Boolean);

  const handleToggle = (id: keyof typeof redFlags, value: boolean) => {
    onUpdate({ ...redFlags, [id]: value });
  };

  return (
    <div className="animate-slide-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-urgent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertOctagon className="w-8 h-8 text-urgent" />
        </div>
        <h1 className="intake-header">Urgent Symptom Check</h1>
        <p className="intake-subheader">
          Please answer these important questions first
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {RED_FLAG_QUESTIONS.map((item) => (
          <div key={item.id} className="intake-card">
            <Label className="text-base font-medium text-foreground mb-2 block">
              {item.question}
            </Label>
            <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant={redFlags[item.id] === true ? 'destructive' : 'outline'}
                className={cn(
                  'flex-1',
                  redFlags[item.id] === true && 'ring-2 ring-urgent ring-offset-2'
                )}
                onClick={() => handleToggle(item.id, true)}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={redFlags[item.id] === false ? 'default' : 'outline'}
                className={cn(
                  'flex-1',
                  redFlags[item.id] === false && 'ring-2 ring-primary ring-offset-2'
                )}
                onClick={() => handleToggle(item.id, false)}
              >
                No
              </Button>
            </div>
          </div>
        ))}
      </div>

      {hasAnyRedFlag && (
        <div className="urgent-banner mb-6 animate-fade-in">
          <AlertOctagon className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Urgent symptoms detected</p>
            <p className="text-sm opacity-90">
              Your intake will be flagged for immediate clinician review. Please continue or seek emergency care if symptoms worsen.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onContinue} className="flex-1">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default RedFlagScreen;
