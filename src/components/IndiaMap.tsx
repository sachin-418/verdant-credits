import { MapPin } from "lucide-react";
import type { Farmer } from "@/lib/storage";

interface IndiaMapProps {
  farmers: Farmer[];
}

const IndiaMap = ({ farmers }: IndiaMapProps) => {
  // Simple SVG-based India map representation with pinpoints
  // India bounding box approx: lat 8-37, lng 68-97
  const mapWidth = 600;
  const mapHeight = 700;

  const latToY = (lat: number) => mapHeight - ((lat - 6) / 32) * mapHeight;
  const lngToX = (lng: number) => ((lng - 66) / 32) * mapWidth;

  // Group farmers by approximate city (round to 1 decimal)
  const groups = new Map<string, { lat: number; lng: number; count: number; totalCredits: number }>();
  farmers.forEach(f => {
    const key = `${f.lat.toFixed(1)},${f.lng.toFixed(1)}`;
    const existing = groups.get(key);
    if (existing) {
      existing.count++;
      existing.totalCredits += f.carbonCredits;
    } else {
      groups.set(key, { lat: f.lat, lng: f.lng, count: 1, totalCredits: f.carbonCredits });
    }
  });

  return (
    <div className="relative w-full" style={{ paddingBottom: "116%" }}>
      <svg
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        className="absolute inset-0 w-full h-full"
      >
        {/* India outline (simplified) */}
        <path
          d="M300,50 L380,80 L420,120 L440,180 L450,250 L430,300 L440,350 L420,400 L380,430 L350,480 L320,520 L300,560 L280,600 L260,620 L240,600 L220,550 L200,500 L180,450 L160,400 L140,350 L130,300 L140,250 L160,200 L180,160 L200,120 L240,80 L300,50Z"
          fill="hsla(150, 20%, 18%, 0.3)"
          stroke="hsla(150, 60%, 40%, 0.3)"
          strokeWidth="2"
        />

        {/* Pinpoints */}
        {Array.from(groups.entries()).map(([key, group]) => {
          const x = lngToX(group.lng);
          const y = latToY(group.lat);
          const radius = Math.min(8 + group.count * 3, 20);

          return (
            <g key={key}>
              {/* Glow circle */}
              <circle cx={x} cy={y} r={radius + 8} fill="hsla(150, 60%, 40%, 0.15)" />
              <circle cx={x} cy={y} r={radius + 4} fill="hsla(150, 60%, 40%, 0.25)" />
              {/* Main circle */}
              <circle cx={x} cy={y} r={radius} fill="hsl(150, 60%, 40%)" stroke="hsl(45, 90%, 55%)" strokeWidth="2" />
              {/* Credit text */}
              <text x={x} y={y + 4} textAnchor="middle" fill="hsl(160, 30%, 6%)" fontSize="10" fontWeight="bold" fontFamily="Orbitron">
                {group.totalCredits.toFixed(0)}
              </text>
            </g>
          );
        })}
      </svg>

      {farmers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No credits available on the map</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndiaMap;
