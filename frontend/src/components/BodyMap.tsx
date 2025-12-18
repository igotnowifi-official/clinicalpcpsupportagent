import { useState } from 'react';
import { BODY_REGIONS_FRONT, BODY_REGIONS_BACK } from '@/assets/bodyRegions';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface BodyMapProps {
  selectedRegions: string[];
  onRegionClick: (regionId: string, regionName: string) => void;
}

const BodyMap = ({ selectedRegions, onRegionClick }: BodyMapProps) => {
  const [view, setView] = useState<'front' | 'back'>('front');

  const regions = view === 'front' ? BODY_REGIONS_FRONT : BODY_REGIONS_BACK;

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-2 mb-4">
        <Button
          variant={view === 'front' ? 'default' : 'outline'}
          onClick={() => setView('front')}
          size="sm"
        >
          Front
        </Button>
        <Button
          variant={view === 'back' ? 'default' : 'outline'}
          onClick={() => setView('back')}
          size="sm"
        >
          Back
        </Button>
        <Button
          variant="ghost"
          onClick={() => setView(view === 'front' ? 'back' : 'front')}
          size="sm"
          className="ml-2"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative bg-muted/30 rounded-xl p-4 border border-border">
        <svg
          viewBox="0 0 300 750"
          className="w-full max-w-[250px] h-auto"
          style={{ minHeight: '400px' }}
        >
          {/* Body outline */}
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--muted))" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" />
            </linearGradient>
          </defs>

          {regions.map((region) => {
            const isSelected = selectedRegions.includes(region.id);
            return (
              <path
                key={region.id}
                d={region.path}
                className={`body-region ${isSelected ? 'selected' : ''}`}
                onClick={() => onRegionClick(region.id, region.name)}
                style={{
                  fill: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                  stroke: isSelected ? 'hsl(var(--primary-hover))' : 'hsl(var(--border))',
                  strokeWidth: isSelected ? 2 : 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <title>{region.name}</title>
              </path>
            );
          })}

          {/* View label */}
          <text
            x="150"
            y="760"
            textAnchor="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize="14"
            fontWeight="500"
          >
            {view === 'front' ? 'Front View' : 'Back View'}
          </text>
        </svg>
      </div>

      <p className="text-sm text-muted-foreground mt-4 text-center">
        Tap on the body area where you're experiencing an issue
      </p>
    </div>
  );
};

export default BodyMap;
