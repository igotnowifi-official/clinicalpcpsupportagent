import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { checkExistingIntake } from '@/services/api';
import { 
  CheckCircle2, 
  QrCode, 
  Search, 
  Loader2, 
  UserCheck,
  ArrowRight,
  Home
} from 'lucide-react';

const CheckIn = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [referenceId, setReferenceId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [checkInComplete, setCheckInComplete] = useState(false);
  const [patientName, setPatientName] = useState('');

  const handleCheckIn = async () => {
    if (!referenceId.trim()) {
      toast({
        title: "Reference number required",
        description: "Please enter your intake reference number",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      // Simulate checking the reference
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, this would verify against the backend
      // For now, accept any INT- prefixed reference
      if (referenceId.startsWith('INT-')) {
        setCheckInComplete(true);
        toast({
          title: "Check-in successful!",
          description: "Please proceed to the waiting area.",
        });
      } else {
        toast({
          title: "Reference not found",
          description: "Please verify your reference number or complete a new intake.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Check-in failed",
        description: "Please try again or ask staff for assistance.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  if (checkInComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-slide-in">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCheck className="w-10 h-10 text-success" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            You're Checked In!
          </h1>
          <p className="text-muted-foreground mb-6">
            Reference: <code className="font-mono bg-muted px-2 py-1 rounded">{referenceId}</code>
          </p>

          <div className="intake-card text-left mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">What's Next</h3>
                <p className="text-sm text-muted-foreground">
                  Please have a seat in the waiting area. A clinician will call your name 
                  when it's your turn. Keep your ID ready for verification.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary-soft rounded-lg border border-primary/20 mb-6">
            <p className="text-sm text-foreground">
              <strong>Reminder:</strong> If your symptoms worsen while waiting, 
              please notify staff immediately.
            </p>
          </div>

          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => navigate('/')}
          >
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-slide-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Patient Check-In
          </h1>
          <p className="text-muted-foreground">
            Already completed your intake from home? Check in here.
          </p>
        </div>

        <div className="intake-card mb-6">
          <Label className="form-label">Reference Number</Label>
          <p className="text-xs text-muted-foreground mb-3">
            Enter the reference number you received after completing your intake
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="INT-XXXXX-XXXXX"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value.toUpperCase())}
              className="font-mono"
            />
            <Button onClick={handleCheckIn} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Don't have a reference number?
          </p>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/intake')}
          >
            Start New Intake
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <Button 
          variant="ghost" 
          className="w-full mt-4"
          onClick={() => navigate('/')}
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default CheckIn;
