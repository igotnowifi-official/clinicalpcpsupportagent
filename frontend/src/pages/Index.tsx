import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  ClipboardList, 
  QrCode, 
  Laptop,
  ArrowRight,
  Shield,
  Clock,
  Users
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              HIPAA-Compliant Patient Intake
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
              Smarter Patient Triage
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              AI-powered intake system that collects symptoms, triages urgency, 
              and provides clinicians with actionable insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/intake')} className="text-lg px-8">
                <ClipboardList className="w-5 h-5 mr-2" />
                Start Patient Intake
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/clinician')}>
                <Stethoscope className="w-5 h-5 mr-2" />
                Clinician Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-12">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<ClipboardList className="w-6 h-6" />}
            title="Patient Self-Service"
            description="Patients complete intake forms on any device, including body map selection and symptom reporting."
          />
          <FeatureCard
            icon={<Clock className="w-6 h-6" />}
            title="AI-Powered Triage"
            description="Intelligent algorithms flag urgent cases, suggest differentials, and recommend labs and referrals."
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Clinician Review"
            description="Healthcare providers review AI suggestions with full explainability and make final decisions."
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-muted/50 border-y border-border py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Quick Actions
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <ActionCard
              icon={<ClipboardList className="w-8 h-8" />}
              title="In-Clinic Intake"
              description="Start a new intake at the clinic kiosk"
              buttonText="Begin Intake"
              onClick={() => navigate('/intake')}
            />
            <ActionCard
              icon={<Laptop className="w-8 h-8" />}
              title="Remote Intake"
              description="Complete intake from home before your visit"
              buttonText="Start Remote"
              onClick={() => navigate('/intake?remote=true')}
            />
            <ActionCard
              icon={<QrCode className="w-8 h-8" />}
              title="Check In"
              description="Already completed intake? Check in here"
              buttonText="Check In"
              onClick={() => navigate('/checkin')}
            />
            <ActionCard
              icon={<Stethoscope className="w-8 h-8" />}
              title="Clinician Portal"
              description="Access triage dashboard and patient data"
              buttonText="Open Dashboard"
              onClick={() => navigate('/clinician')}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>Disclaimer:</strong> This is a demonstration system. 
            Not intended for actual medical use.
          </p>
          <p>
            Built for hackathon demonstration. Mock triage engine - 
            Neo4j and MemMachine integration pending.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Helper components
const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => (
  <div className="text-center">
    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
      {icon}
    </div>
    <h3 className="font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

const ActionCard = ({ 
  icon, 
  title, 
  description, 
  buttonText, 
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  buttonText: string;
  onClick: () => void;
}) => (
  <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
    <div className="flex items-start gap-4">
      <div className="text-primary flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        <Button variant="outline" size="sm" onClick={onClick}>
          {buttonText}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  </div>
);

export default Index;
