import { useState } from 'react';
import { IntakePayload, CONDITION_OPTIONS, FAMILY_HISTORY_OPTIONS } from '@/types/intake';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, FileText, Users, Pill, AlertCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface HistoryFormProps {
  history: IntakePayload['history'];
  onUpdate: (history: IntakePayload['history']) => void;
  onContinue: () => void;
  onBack: () => void;
}

const HistoryForm = ({ history, onUpdate, onContinue, onBack }: HistoryFormProps) => {
  const [drugAllergies, setDrugAllergies] = useState('');
  const [otherAllergies, setOtherAllergies] = useState('');

  const toggleCondition = (conditionId: string) => {
    const newConditions = history.conditions.includes(conditionId)
      ? history.conditions.filter(c => c !== conditionId)
      : [...history.conditions, conditionId];
    onUpdate({ ...history, conditions: newConditions });
  };

  const toggleFamilyHistory = (historyId: string) => {
    const newFH = history.family_history.includes(historyId)
      ? history.family_history.filter(h => h !== historyId)
      : [...history.family_history, historyId];
    onUpdate({ ...history, family_history: newFH });
  };

  const handleAllergiesBlur = () => {
    const allAllergies: string[] = [];
    
    // Parse drug allergies (comma or space separated)
    if (drugAllergies.trim()) {
      const drugs = drugAllergies.split(/[,\s]+/).filter(a => a.trim());
      drugs.forEach(d => allAllergies.push(`Drug: ${d.trim()}`));
    }
    
    // Parse other allergies
    if (otherAllergies.trim()) {
      const others = otherAllergies.split(/[,\s]+/).filter(a => a.trim());
      others.forEach(o => allAllergies.push(o.trim()));
    }
    
    onUpdate({ ...history, allergies: allAllergies });
  };

  const handleSocialChange = (key: string, value: string) => {
    onUpdate({
      ...history,
      social: { ...history.social, [key]: value },
    });
  };

  return (
    <div className="animate-slide-in space-y-8">
      {/* Medical Conditions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Medical Conditions</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Select any conditions you have been diagnosed with
        </p>

        <div className="space-y-3">
          {CONDITION_OPTIONS.map(condition => (
            <label
              key={condition.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={history.conditions.includes(condition.id)}
                onCheckedChange={() => toggleCondition(condition.id)}
              />
              <span className="text-sm text-foreground">{condition.label}</span>
            </label>
          ))}
          <label className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border cursor-pointer">
            <Checkbox
              checked={history.conditions.includes('none')}
              onCheckedChange={() => toggleCondition('none')}
            />
            <span className="text-sm text-muted-foreground">None of the above</span>
          </label>
        </div>
      </div>

      {/* Allergies */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Allergies</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="form-label">Drug Allergies</Label>
            <Input
              placeholder="e.g., Penicillin, Sulfa (separate with commas or spaces)"
              value={drugAllergies}
              onChange={(e) => setDrugAllergies(e.target.value)}
              onBlur={handleAllergiesBlur}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="form-label">Other Allergies</Label>
            <Input
              placeholder="e.g., Peanuts, Latex, Pollen (separate with commas or spaces)"
              value={otherAllergies}
              onChange={(e) => setOtherAllergies(e.target.value)}
              onBlur={handleAllergiesBlur}
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      {/* Medications */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Pill className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Current Medications</h2>
        </div>
        <Textarea
          placeholder="List any medications you're currently taking, including dosages if known"
          value={history.medications}
          onChange={(e) => onUpdate({ ...history, medications: e.target.value })}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Family History */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Family History</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Select conditions that run in your immediate family
        </p>

        <div className="grid grid-cols-2 gap-3">
          {FAMILY_HISTORY_OPTIONS.map(option => (
            <label
              key={option.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={history.family_history.includes(option.id)}
                onCheckedChange={() => toggleFamilyHistory(option.id)}
              />
              <span className="text-sm text-foreground">{option.label}</span>
            </label>
          ))}
        </div>
        <label className="flex items-center gap-3 p-3 mt-3 rounded-lg border border-dashed border-border cursor-pointer">
          <Checkbox
            checked={history.family_history.includes('none')}
            onCheckedChange={() => toggleFamilyHistory('none')}
          />
          <span className="text-sm text-muted-foreground">None / Unknown</span>
        </label>
      </div>

      {/* Social History */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Social History</h2>
        
        <div className="space-y-4">
          {/* Smoking */}
          <div className="intake-card p-4">
            <Label className="form-label mb-3 block">Do you smoke?</Label>
            <RadioGroup
              value={history.social.smoking || ''}
              onValueChange={(value) => handleSocialChange('smoking', value)}
              className="flex flex-wrap gap-3"
            >
              {['Never', 'Former', 'Current', 'Prefer not to say'].map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value={option.toLowerCase().replace(/ /g, '_')} />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Recent Travel */}
          <div className="intake-card p-4">
            <Label className="form-label mb-3 block">Recent travel (past 2 weeks)?</Label>
            <RadioGroup
              value={history.social.recent_travel || ''}
              onValueChange={(value) => handleSocialChange('recent_travel', value)}
              className="flex flex-wrap gap-3"
            >
              {['None', 'Domestic', 'International'].map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value={option.toLowerCase()} />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Sick Contacts */}
          <div className="intake-card p-4">
            <Label className="form-label mb-3 block">Contact with sick individuals?</Label>
            <RadioGroup
              value={history.social.sick_contacts || ''}
              onValueChange={(value) => handleSocialChange('sick_contacts', value)}
              className="flex flex-wrap gap-3"
            >
              {['No', 'Yes - household', 'Yes - workplace', 'Yes - other'].map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value={option.toLowerCase().replace(/ - /g, '_').replace(/ /g, '_')} />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onContinue} className="flex-1">
          Review Summary
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default HistoryForm;
