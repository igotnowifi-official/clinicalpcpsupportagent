import { useState } from 'react';
import { Issue, ISSUE_TAGS } from '@/types/intake';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IssueCardProps {
  issue: Issue;
  onUpdate: (issue: Issue) => void;
  onRemove: () => void;
}

const ONSET_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'days', label: 'Few days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
] as const;

const COURSE_OPTIONS = [
  { value: 'better', label: 'Getting better' },
  { value: 'worse', label: 'Getting worse' },
  { value: 'same', label: 'Staying the same' },
] as const;

const IssueCard = ({ issue, onUpdate, onRemove }: IssueCardProps) => {
  const getPainColor = (rating: number) => {
    if (rating <= 3) return 'bg-success';
    if (rating <= 6) return 'bg-warning';
    return 'bg-urgent';
  };

  const handleTagToggle = (tagId: string) => {
    const newTags = issue.tags.includes(tagId)
      ? issue.tags.filter(t => t !== tagId)
      : [...issue.tags, tagId];
    onUpdate({ ...issue, tags: newTags });
  };

  return (
    <div className="intake-card animate-slide-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">{issue.body_region}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-5">
        {/* Description */}
        <div>
          <Label className="form-label">Describe the issue</Label>
          <Textarea
            placeholder="What does it feel like? When did it start? Any triggers?"
            value={issue.description}
            onChange={(e) => onUpdate({ ...issue, description: e.target.value })}
            className="mt-1.5 resize-none"
            rows={3}
          />
        </div>

        {/* Pain Rating */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="form-label">Pain level (0-10)</Label>
            <span className={cn(
              'text-sm font-semibold px-2 py-0.5 rounded',
              issue.pain_rating <= 3 && 'bg-success-soft text-success',
              issue.pain_rating > 3 && issue.pain_rating <= 6 && 'bg-warning-soft text-warning',
              issue.pain_rating > 6 && 'bg-urgent-soft text-urgent'
            )}>
              {issue.pain_rating}
            </span>
          </div>
          <Slider
            value={[issue.pain_rating]}
            onValueChange={([value]) => onUpdate({ ...issue, pain_rating: value })}
            max={10}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>No pain</span>
            <span>Worst pain</span>
          </div>
        </div>

        {/* Onset */}
        <div>
          <Label className="form-label mb-2 block">When did this start?</Label>
          <div className="flex flex-wrap gap-2">
            {ONSET_OPTIONS.map(option => (
              <Button
                key={option.value}
                type="button"
                variant={issue.onset === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdate({ ...issue, onset: option.value })}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Course */}
        <div>
          <Label className="form-label mb-2 block">How is it changing?</Label>
          <div className="flex flex-wrap gap-2">
            {COURSE_OPTIONS.map(option => (
              <Button
                key={option.value}
                type="button"
                variant={issue.course === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdate({ ...issue, course: option.value })}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label className="form-label mb-2 block">Type of issue (select all that apply)</Label>
          <div className="flex flex-wrap gap-2">
            {ISSUE_TAGS.map(tag => (
              <Badge
                key={tag.id}
                variant={issue.tags.includes(tag.id) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-colors',
                  issue.tags.includes(tag.id) 
                    ? 'bg-primary text-primary-foreground hover:bg-primary-hover' 
                    : 'hover:bg-muted'
                )}
                onClick={() => handleTagToggle(tag.id)}
              >
                {tag.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
