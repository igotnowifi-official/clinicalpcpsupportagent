import { useState, useEffect } from 'react';
import { TriageResult, ExplanationResult, IntakePayload } from '@/types/intake';
import { getTriageResult, getExplanation, _debugGetStore, updateIntakeVitals, addFollowUp, getIntakeRecord } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import ClinicianView from '@/components/ClinicianView';
import Footer from '@/components/Footer';
import { 
  Stethoscope, 
  Search, 
  RefreshCw, 
  AlertOctagon, 
  Clock,
  CheckCircle2,
  Home,
  Users
} from 'lucide-react';

interface FollowUp {
  question: string;
  answer: string;
  timestamp: string;
}

interface IntakeRecord {
  id: string;
  status: 'urgent' | 'non_urgent';
  reviewed: boolean;
  timestamp: Date;
}

interface SelectedIntakeData {
  vitals: IntakePayload['vitals'];
  followUps: FollowUp[];
}

const ClinicianDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [intakes, setIntakes] = useState<IntakeRecord[]>([]);
  const [selectedIntake, setSelectedIntake] = useState<string | null>(null);
  const [triageData, setTriageData] = useState<TriageResult | null>(null);
  const [explanationData, setExplanationData] = useState<ExplanationResult | null>(null);
  const [intakeData, setIntakeData] = useState<SelectedIntakeData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load intakes from mock store
  const refreshIntakes = async () => {
    setIsLoading(true);
    try {
      const store = _debugGetStore();
      const records: IntakeRecord[] = [];
      
      for (const [id, intake] of store.entries()) {
        const triage = await getTriageResult(id);
        records.push({
          id,
          status: triage.status,
          reviewed: false,
          timestamp: new Date(intake.created_at),
        });
      }
      
      // Sort by urgency then timestamp
      records.sort((a, b) => {
        if (a.status === 'urgent' && b.status !== 'urgent') return -1;
        if (a.status !== 'urgent' && b.status === 'urgent') return 1;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
      
      setIntakes(records);
    } catch (error) {
      console.error('Failed to load intakes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshIntakes();
  }, []);

  const loadIntakeData = async (intakeId: string) => {
    try {
      const [triage, explanation, record] = await Promise.all([
        getTriageResult(intakeId),
        getExplanation(intakeId),
        getIntakeRecord(intakeId)
      ]);
      setTriageData(triage);
      setExplanationData(explanation);
      setIntakeData({
        vitals: record.vitals,
        followUps: record.follow_ups || []
      });
    } catch (error) {
      toast({
        title: "Failed to load intake",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleSelectIntake = async (intakeId: string) => {
    setSelectedIntake(intakeId);
    await loadIntakeData(intakeId);
  };

  const handleUpdateVitals = async (vitals: Partial<IntakePayload['vitals']>) => {
    if (!selectedIntake) return;
    
    setIsUpdating(true);
    try {
      await updateIntakeVitals(selectedIntake, vitals);
      // Reload data to get updated triage
      await loadIntakeData(selectedIntake);
      // Also update the intake list in case urgency changed
      const newTriage = await getTriageResult(selectedIntake);
      setIntakes(prev => prev.map(i => 
        i.id === selectedIntake ? { ...i, status: newTriage.status } : i
      ));
      toast({
        title: "Vitals updated",
        description: "Triage recommendations have been recalculated.",
      });
    } catch (error) {
      toast({
        title: "Failed to update vitals",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddFollowUp = async (question: string, answer: string) => {
    if (!selectedIntake) return;
    
    setIsUpdating(true);
    try {
      await addFollowUp(selectedIntake, question, answer);
      // Reload to get updated follow-ups
      await loadIntakeData(selectedIntake);
      toast({
        title: "Follow-up added",
        description: "Patient record has been updated.",
      });
    } catch (error) {
      toast({
        title: "Failed to add follow-up",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkReviewed = () => {
    setIntakes(prev => prev.map(i => 
      i.id === selectedIntake ? { ...i, reviewed: true } : i
    ));
    toast({
      title: "Intake marked as reviewed",
      description: `${selectedIntake} has been marked as reviewed.`,
    });
    setSelectedIntake(null);
    setTriageData(null);
    setExplanationData(null);
    setIntakeData(null);
  };

  const filteredIntakes = intakes.filter(i => 
    i.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const urgentCount = intakes.filter(i => i.status === 'urgent' && !i.reviewed).length;
  const pendingCount = intakes.filter(i => !i.reviewed).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Clinician Dashboard</h1>
              <p className="text-xs text-muted-foreground">Patient Triage System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button variant="outline" size="sm" onClick={refreshIntakes} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Intake List */}
          <div className="lg:col-span-1">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="intake-card p-4">
                <div className="flex items-center gap-2 text-urgent mb-1">
                  <AlertOctagon className="w-4 h-4" />
                  <span className="text-2xl font-bold">{urgentCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Urgent pending</p>
              </div>
              <div className="intake-card p-4">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-2xl font-bold">{pendingCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Total pending</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Intake List */}
            <div className="space-y-2">
              {filteredIntakes.length === 0 ? (
                <div className="intake-card p-8 text-center">
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No intakes found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submit an intake from the patient flow to see it here
                  </p>
                </div>
              ) : (
                filteredIntakes.map(intake => (
                  <button
                    key={intake.id}
                    onClick={() => handleSelectIntake(intake.id)}
                    className={`w-full intake-card p-4 text-left transition-colors hover:border-primary/50 ${
                      selectedIntake === intake.id ? 'border-primary ring-1 ring-primary' : ''
                    } ${intake.reviewed ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono text-foreground">{intake.id}</code>
                      <div className="flex items-center gap-2">
                        <Badge variant={intake.status === 'urgent' ? 'destructive' : 'secondary'}>
                          {intake.status === 'urgent' ? 'Urgent' : 'Normal'}
                        </Badge>
                        {intake.reviewed && (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {intake.timestamp.toLocaleTimeString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detail View */}
          <div className="lg:col-span-2">
            {selectedIntake && triageData && intakeData ? (
              <div className="intake-card p-6">
                <ClinicianView
                  intakeId={selectedIntake}
                  triage={triageData}
                  explanation={explanationData || undefined}
                  vitals={intakeData.vitals}
                  followUps={intakeData.followUps}
                  onMarkReviewed={handleMarkReviewed}
                  onUpdateVitals={handleUpdateVitals}
                  onAddFollowUp={handleAddFollowUp}
                  isUpdating={isUpdating}
                />
              </div>
            ) : (
              <div className="intake-card p-12 text-center">
                <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Select an Intake
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Click on a patient intake from the list to view triage details, 
                  AI recommendations, and reasoning explanations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer variant="clinician" />
    </div>
  );
};

export default ClinicianDashboard;
