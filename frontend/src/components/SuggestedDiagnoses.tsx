import { useState } from 'react';
import { DifferentialDiagnosis } from '@/types/clinical';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Beaker, 
  Users, 
  Pill, 
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestedDiagnosesProps {
  differential: DifferentialDiagnosis[];
  isOverriddenByRedFlag: boolean;
  overrideReason?: string;
}

const SuggestedDiagnoses = ({ 
  differential, 
  isOverriddenByRedFlag, 
  overrideReason 
}: SuggestedDiagnosesProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low') => {
    const styles = {
      high: 'bg-green-500/10 text-green-600 border-green-500/30',
      medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
      low: 'bg-muted text-muted-foreground border-border',
    };
    return styles[confidence];
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 60) return 'bg-green-500';
    if (probability >= 30) return 'bg-yellow-500';
    return 'bg-muted-foreground';
  };

  return (
    <div className={cn(
      "intake-card",
      isOverriddenByRedFlag && "opacity-60"
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Suggested Diagnoses (Differential)
        </h3>
        {isOverriddenByRedFlag && (
          <Badge variant="destructive" className="text-xs">
            Urgent Override
          </Badge>
        )}
      </div>

      {isOverriddenByRedFlag && (
        <div className="mb-4 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">
                Urgent override: clinician evaluation first.
              </p>
              {overrideReason && (
                <p className="text-xs text-muted-foreground mt-1">{overrideReason}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {differential.slice(0, 5).map((dx, index) => (
          <div 
            key={dx.condition_id}
            className={cn(
              "border rounded-lg transition-all",
              isOverriddenByRedFlag ? "border-border/50" : "border-border hover:border-primary/30"
            )}
          >
            {/* Main Row */}
            <div 
              className="p-3 cursor-pointer"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-medium text-foreground text-sm">
                    {dx.condition_name}
                  </span>
                  <Badge variant="outline" className={cn("text-xs", getConfidenceBadge(dx.confidence))}>
                    {dx.confidence}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    {dx.probability}%
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {dx.evidence_count} evidence
                  </Badge>
                  {expandedIndex === index ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              
              {/* Probability Bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all", getProbabilityColor(dx.probability))}
                  style={{ width: `${dx.probability}%` }}
                />
              </div>
            </div>

            {/* Expanded Content */}
            {expandedIndex === index && (
              <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
                {/* Top Evidence */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Supporting Evidence ({dx.evidence.length})
                  </h4>
                  <div className="space-y-1">
                    {dx.evidence.slice(0, 3).map((ev, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {ev.type}
                        </Badge>
                        <span className="text-foreground">{ev.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Evidence */}
                {dx.missing_evidence.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Missing Key Evidence
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {dx.missing_evidence.map((missing, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-muted/50">
                          {missing}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Actions */}
                <div className="grid grid-cols-2 gap-3">
                  {dx.suggested_labs.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                        <Beaker className="w-3 h-3" />
                        Labs
                      </h4>
                      <ul className="text-xs text-foreground space-y-0.5">
                        {dx.suggested_labs.slice(0, 3).map((lab, i) => (
                          <li key={i}>• {lab}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {dx.suggested_referrals.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Referrals
                      </h4>
                      <ul className="text-xs text-foreground space-y-0.5">
                        {dx.suggested_referrals.slice(0, 3).map((ref, i) => (
                          <li key={i}>• {ref}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {dx.suggested_meds.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                        <Pill className="w-3 h-3" />
                        Medications
                      </h4>
                      <ul className="text-xs text-foreground space-y-0.5">
                        {dx.suggested_meds.slice(0, 3).map((med, i) => (
                          <li key={i}>• {med}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {dx.suggested_actions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Actions
                      </h4>
                      <ul className="text-xs text-foreground space-y-0.5">
                        {dx.suggested_actions.slice(0, 3).map((action, i) => (
                          <li key={i}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        * Probabilities are AI-generated suggestions. Clinical judgment required.
      </p>
    </div>
  );
};

export default SuggestedDiagnoses;
