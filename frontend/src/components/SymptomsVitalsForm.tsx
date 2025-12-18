import { useState } from 'react';
import { ALL_SYMPTOMS, IntakePayload } from '@/types/intake';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, Thermometer, Heart, Activity } from 'lucide-react';

interface SymptomsVitalsFormProps {
  symptoms: string[];
  vitals: IntakePayload['vitals'];
  onUpdateSymptoms: (symptoms: string[]) => void;
  onUpdateVitals: (vitals: IntakePayload['vitals']) => void;
  onContinue: () => void;
  onBack: () => void;
}

const SymptomsVitalsForm = ({
  symptoms,
  vitals,
  onUpdateSymptoms,
  onUpdateVitals,
  onContinue,
  onBack,
}: SymptomsVitalsFormProps) => {
  const [vitalUnknowns, setVitalUnknowns] = useState<Record<string, boolean>>({});

  const toggleSymptom = (symptomId: string) => {
    if (symptoms.includes(symptomId)) {
      onUpdateSymptoms(symptoms.filter(s => s !== symptomId));
    } else {
      onUpdateSymptoms([...symptoms, symptomId]);
    }
  };

  const handleVitalChange = (key: keyof IntakePayload['vitals'], value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    onUpdateVitals({ ...vitals, [key]: numValue });
  };

  const toggleUnknown = (key: string) => {
    setVitalUnknowns(prev => ({ ...prev, [key]: !prev[key] }));
    if (!vitalUnknowns[key]) {
      onUpdateVitals({ ...vitals, [key as keyof IntakePayload['vitals']]: undefined });
    }
  };

  return (
    <div className="animate-slide-in space-y-8">
      {/* Symptoms Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Current Symptoms</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Select all symptoms you're currently experiencing
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALL_SYMPTOMS.map(symptom => (
            <label
              key={symptom.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={symptoms.includes(symptom.id)}
                onCheckedChange={() => toggleSymptom(symptom.id)}
              />
              <span className="text-sm text-foreground">{symptom.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-3 p-3 rounded-lg border border-dashed border-border">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={symptoms.includes('none')}
              onCheckedChange={() => toggleSymptom('none')}
            />
            <span className="text-sm text-muted-foreground">None of the above</span>
          </label>
        </div>
      </div>

      {/* Vitals Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Vital Signs</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          If you have access to measurement devices, please enter your current readings. Toggle "Unknown" if you can't measure.
        </p>

        <div className="space-y-4">
          {/* Temperature */}
          <div className="intake-card p-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="form-label flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                Temperature (°C)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Unknown</span>
                <Switch
                  checked={vitalUnknowns.temperature_c}
                  onCheckedChange={() => toggleUnknown('temperature_c')}
                />
              </div>
            </div>
            <Input
              type="number"
              step="0.1"
              placeholder="e.g., 37.0"
              value={vitals.temperature_c ?? ''}
              onChange={(e) => handleVitalChange('temperature_c', e.target.value)}
              disabled={vitalUnknowns.temperature_c}
              className={vitalUnknowns.temperature_c ? 'opacity-50' : ''}
            />
          </div>

          {/* Blood Pressure */}
          <div className="intake-card p-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="form-label">Blood Pressure (mmHg)</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Unknown</span>
                <Switch
                  checked={vitalUnknowns.bp}
                  onCheckedChange={() => toggleUnknown('bp')}
                />
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Systolic"
                value={vitals.bp_systolic ?? ''}
                onChange={(e) => handleVitalChange('bp_systolic', e.target.value)}
                disabled={vitalUnknowns.bp}
                className={vitalUnknowns.bp ? 'opacity-50' : ''}
              />
              <span className="text-muted-foreground">/</span>
              <Input
                type="number"
                placeholder="Diastolic"
                value={vitals.bp_diastolic ?? ''}
                onChange={(e) => handleVitalChange('bp_diastolic', e.target.value)}
                disabled={vitalUnknowns.bp}
                className={vitalUnknowns.bp ? 'opacity-50' : ''}
              />
            </div>
          </div>

          {/* Heart Rate */}
          <div className="intake-card p-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="form-label">Heart Rate (bpm)</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Unknown</span>
                <Switch
                  checked={vitalUnknowns.heart_rate}
                  onCheckedChange={() => toggleUnknown('heart_rate')}
                />
              </div>
            </div>
            <Input
              type="number"
              placeholder="e.g., 72"
              value={vitals.heart_rate ?? ''}
              onChange={(e) => handleVitalChange('heart_rate', e.target.value)}
              disabled={vitalUnknowns.heart_rate}
              className={vitalUnknowns.heart_rate ? 'opacity-50' : ''}
            />
          </div>

          {/* SpO2 */}
          <div className="intake-card p-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="form-label">Oxygen Saturation (SpO2 %)</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Unknown</span>
                <Switch
                  checked={vitalUnknowns.spo2}
                  onCheckedChange={() => toggleUnknown('spo2')}
                />
              </div>
            </div>
            <Input
              type="number"
              placeholder="e.g., 98"
              value={vitals.spo2 ?? ''}
              onChange={(e) => handleVitalChange('spo2', e.target.value)}
              disabled={vitalUnknowns.spo2}
              className={vitalUnknowns.spo2 ? 'opacity-50' : ''}
            />
          </div>
        </div>
      </div>

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

export default SymptomsVitalsForm;
