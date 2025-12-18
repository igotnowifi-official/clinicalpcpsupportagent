import { useState } from 'react';
import { 
  Finalization, 
  ALL_CONDITIONS, 
  LAB_OPTIONS, 
  SPECIALIST_OPTIONS,
  MEDICATION_OPTIONS,
  ACTION_OPTIONS 
} from '@/types/clinical';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ClipboardCheck, 
  Plus, 
  X, 
  Beaker, 
  Users, 
  Pill, 
  Activity,
  Calendar,
  FileText,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClinicalWrapupProps {
  finalization: Finalization;
  onUpdate: (finalization: Finalization) => void;
  onGenerateEmail: () => void;
  isGenerating?: boolean;
}

interface EditableListProps {
  title: string;
  icon: React.ReactNode;
  options: readonly { id: string; name: string; category?: string }[];
  items: { id: string; notes: string }[];
  onAdd: (id: string) => void;
  onRemove: (index: number) => void;
  onUpdateNotes: (index: number, notes: string) => void;
  idKey: string;
}

const EditableList = ({ 
  title, 
  icon, 
  options, 
  items, 
  onAdd, 
  onRemove, 
  onUpdateNotes,
  idKey 
}: EditableListProps) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const availableOptions = options.filter(opt => !items.some(item => item.id === opt.id));

  const getItemName = (id: string) => {
    const option = options.find(opt => opt.id === id);
    return option?.name || id;
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
        {icon}
        {title}
      </h4>
      
      {/* Add new item */}
      <div className="flex gap-2">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="flex-1 bg-background">
            <SelectValue placeholder={`Select ${title.toLowerCase()}...`} />
          </SelectTrigger>
          <SelectContent className="bg-background border-border z-50">
            {availableOptions.map(opt => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => {
            if (selectedId) {
              onAdd(selectedId);
              setSelectedId('');
            }
          }}
          disabled={!selectedId}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* List of items */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={`${item.id}-${index}`} className="p-2 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">
                  {getItemName(item.id)}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => onRemove(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <Input
                placeholder="Add notes (optional)..."
                value={item.notes}
                onChange={(e) => onUpdateNotes(index, e.target.value)}
                className="text-xs h-7 bg-background"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ClinicalWrapup = ({ 
  finalization, 
  onUpdate, 
  onGenerateEmail,
  isGenerating 
}: ClinicalWrapupProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredConditions = ALL_CONDITIONS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConditionName = ALL_CONDITIONS.find(
    c => c.id === finalization.final_diagnosis_condition_id
  )?.name;

  return (
    <div className="intake-card space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-primary" />
          Clinical Wrap-up
        </h3>
        <Badge variant="outline">Finalize & Message Patient</Badge>
      </div>

      {/* Final Diagnosis Selection */}
      <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
        <h4 className="text-sm font-semibold text-foreground">Final Diagnosis</h4>
        
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Select from conditions</Label>
          <Select 
            value={finalization.final_diagnosis_condition_id || ''} 
            onValueChange={(value) => onUpdate({ 
              ...finalization, 
              final_diagnosis_condition_id: value,
              final_diagnosis_free_text: '' 
            })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Search and select diagnosis..." />
            </SelectTrigger>
            <SelectContent className="bg-background border-border z-50 max-h-[300px]">
              <div className="p-2 border-b border-border">
                <Input
                  placeholder="Search conditions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8"
                />
              </div>
              {filteredConditions.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Or enter custom diagnosis</Label>
          <Input
            placeholder="Custom diagnosis (free text)..."
            value={finalization.final_diagnosis_free_text || ''}
            onChange={(e) => onUpdate({ 
              ...finalization, 
              final_diagnosis_free_text: e.target.value,
              final_diagnosis_condition_id: undefined 
            })}
            className="bg-background"
          />
        </div>

        {(selectedConditionName || finalization.final_diagnosis_free_text) && (
          <div className="p-2 bg-primary/10 rounded border border-primary/20">
            <p className="text-sm text-foreground">
              <span className="font-medium">Selected: </span>
              {selectedConditionName || finalization.final_diagnosis_free_text}
            </p>
          </div>
        )}
      </div>

      {/* Final Plan Editor */}
      <div className="grid md:grid-cols-2 gap-4">
        <EditableList
          title="Labs to Order"
          icon={<Beaker className="w-4 h-4 text-primary" />}
          options={LAB_OPTIONS}
          items={finalization.final_labs.map(l => ({ id: l.lab_id, notes: l.notes }))}
          idKey="lab_id"
          onAdd={(id) => onUpdate({
            ...finalization,
            final_labs: [...finalization.final_labs, { lab_id: id, notes: '' }]
          })}
          onRemove={(index) => onUpdate({
            ...finalization,
            final_labs: finalization.final_labs.filter((_, i) => i !== index)
          })}
          onUpdateNotes={(index, notes) => onUpdate({
            ...finalization,
            final_labs: finalization.final_labs.map((item, i) => 
              i === index ? { ...item, notes } : item
            )
          })}
        />

        <EditableList
          title="Referrals"
          icon={<Users className="w-4 h-4 text-primary" />}
          options={SPECIALIST_OPTIONS}
          items={finalization.final_referrals.map(r => ({ id: r.specialist_id, notes: r.notes }))}
          idKey="specialist_id"
          onAdd={(id) => onUpdate({
            ...finalization,
            final_referrals: [...finalization.final_referrals, { specialist_id: id, notes: '' }]
          })}
          onRemove={(index) => onUpdate({
            ...finalization,
            final_referrals: finalization.final_referrals.filter((_, i) => i !== index)
          })}
          onUpdateNotes={(index, notes) => onUpdate({
            ...finalization,
            final_referrals: finalization.final_referrals.map((item, i) => 
              i === index ? { ...item, notes } : item
            )
          })}
        />

        <EditableList
          title="Medications (OTC)"
          icon={<Pill className="w-4 h-4 text-primary" />}
          options={MEDICATION_OPTIONS}
          items={finalization.final_medication_options.map(m => ({ id: m.med_id, notes: m.notes }))}
          idKey="med_id"
          onAdd={(id) => onUpdate({
            ...finalization,
            final_medication_options: [...finalization.final_medication_options, { med_id: id, notes: '' }]
          })}
          onRemove={(index) => onUpdate({
            ...finalization,
            final_medication_options: finalization.final_medication_options.filter((_, i) => i !== index)
          })}
          onUpdateNotes={(index, notes) => onUpdate({
            ...finalization,
            final_medication_options: finalization.final_medication_options.map((item, i) => 
              i === index ? { ...item, notes } : item
            )
          })}
        />

        <EditableList
          title="Lifestyle Actions"
          icon={<Activity className="w-4 h-4 text-primary" />}
          options={ACTION_OPTIONS}
          items={finalization.final_actions.map(a => ({ id: a.action_id, notes: a.notes }))}
          idKey="action_id"
          onAdd={(id) => onUpdate({
            ...finalization,
            final_actions: [...finalization.final_actions, { action_id: id, notes: '' }]
          })}
          onRemove={(index) => onUpdate({
            ...finalization,
            final_actions: finalization.final_actions.filter((_, i) => i !== index)
          })}
          onUpdateNotes={(index, notes) => onUpdate({
            ...finalization,
            final_actions: finalization.final_actions.map((item, i) => 
              i === index ? { ...item, notes } : item
            )
          })}
        />
      </div>

      {/* Follow-up Instructions */}
      <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Follow-up Instructions
        </h4>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Timeframe</Label>
            <Select 
              value={finalization.followup.timeframe} 
              onValueChange={(value) => onUpdate({
                ...finalization,
                followup: { ...finalization.followup, timeframe: value }
              })}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select timeframe..." />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="1 week">1 week</SelectItem>
                <SelectItem value="2 weeks">2 weeks</SelectItem>
                <SelectItem value="1 month">1 month</SelectItem>
                <SelectItem value="3 months">3 months</SelectItem>
                <SelectItem value="as needed">As needed</SelectItem>
                <SelectItem value="if symptoms worsen">If symptoms worsen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Scheduling Instructions</Label>
            <Input
              placeholder="e.g., Schedule via clinic front desk..."
              value={finalization.followup.instructions}
              onChange={(e) => onUpdate({
                ...finalization,
                followup: { ...finalization.followup, instructions: e.target.value }
              })}
              className="bg-background"
            />
          </div>
        </div>
      </div>

      {/* Patient Notes */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Additional Notes for Patient
        </h4>
        <Textarea
          placeholder="Enter any additional notes for the patient..."
          value={finalization.patient_notes}
          onChange={(e) => onUpdate({ ...finalization, patient_notes: e.target.value })}
          className="min-h-[100px] bg-background"
        />
      </div>

      {/* Generate Email Button */}
      <div className="pt-4 border-t border-border">
        <Button 
          onClick={onGenerateEmail}
          className="w-full"
          disabled={isGenerating || (!finalization.final_diagnosis_condition_id && !finalization.final_diagnosis_free_text)}
        >
          <Mail className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Draft Email + Packet'}
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          This will create a patient-safe email draft with recommended attachments.
        </p>
      </div>
    </div>
  );
};

export default ClinicalWrapup;
