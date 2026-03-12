import L from 'leaflet';
import { ProviderType } from '@/data/providers';
import { 
  Building2, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  Scan, 
  Droplet,
  AlertTriangle,
  Baby,
  Ambulance
} from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Type colors for each provider type
const TYPE_COLORS: Record<ProviderType | 'emergency', { bg: string; border: string; icon: string }> = {
  hospital: { bg: '#3b82f6', border: '#2563eb', icon: 'white' },
  birth_hospital: { bg: '#ec4899', border: '#db2777', icon: 'white' },
  clinic: { bg: '#22c55e', border: '#16a34a', icon: 'white' },
  doctor: { bg: '#10b981', border: '#059669', icon: 'white' },
  pharmacy: { bg: '#f97316', border: '#ea580c', icon: 'white' },
  lab: { bg: '#8b5cf6', border: '#7c3aed', icon: 'white' },
  blood_cabin: { bg: '#ef4444', border: '#dc2626', icon: 'white' },
  radiology_center: { bg: '#06b6d4', border: '#0891b2', icon: 'white' },
  medical_equipment: { bg: '#6b7280', border: '#4b5563', icon: 'white' },
  emergency: { bg: '#dc2626', border: '#b91c1c', icon: 'white' },
};

// Get icon component for provider type
const getIconSVG = (type: ProviderType | 'emergency', size: number = 16) => {
  const iconProps = { size, color: 'currentColor', strokeWidth: 2 };
  
  switch (type) {
    case 'hospital': return <Building2 {...iconProps} />;
    case 'birth_hospital': return <Baby {...iconProps} />;
    case 'clinic': return <Stethoscope {...iconProps} />;
    case 'doctor': return <Stethoscope {...iconProps} />;
    case 'pharmacy': return <Pill {...iconProps} />;
    case 'lab': return <FlaskConical {...iconProps} />;
    case 'blood_cabin': return <Droplet {...iconProps} />;
    case 'radiology_center': return <Scan {...iconProps} />;
    case 'medical_equipment': return <Ambulance {...iconProps} />;
    case 'emergency': return <AlertTriangle {...iconProps} />;
    default: return <Building2 {...iconProps} />;
  }
};

// Create custom marker icon
export const createMarkerIcon = (
  type: ProviderType,
  isSelected: boolean = false,
  isEmergency: boolean = false
): L.DivIcon => {
  const effectiveType = isEmergency ? 'emergency' : type;
  const colors = TYPE_COLORS[effectiveType] || TYPE_COLORS.hospital;
  const size = isSelected ? 44 : 36;
  const iconSize = isSelected ? 20 : 16;
  
  const iconSVG = renderToStaticMarkup(getIconSVG(effectiveType, iconSize));
  
  const selectedRingColor = colors.bg;
  
  const html = `
    <div class="marker-container ${isSelected ? 'marker-selected' : ''}" style="
      position: relative;
      width: ${size + (isSelected ? 16 : 0)}px;
      height: ${size + (isSelected ? 16 : 0)}px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      ${isSelected ? `
        <div class="selection-ring" style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid ${selectedRingColor};
          animation: selection-pulse 1.5s ease-out infinite;
        "></div>
        <div class="selection-glow" style="
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          background: ${selectedRingColor}20;
          animation: glow-pulse 1.5s ease-out infinite;
        "></div>
      ` : ''}
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${colors.bg};
        border: 3px solid ${isSelected ? 'white' : colors.border};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: ${isSelected 
          ? `0 0 20px ${selectedRingColor}80, 0 4px 12px rgba(0,0,0,0.4)` 
          : '0 4px 12px rgba(0,0,0,0.3)'};
        ${isSelected ? 'animation: marker-bounce 0.6s ease-out;' : ''}
        ${isEmergency ? 'animation: emergency-pulse 1s infinite;' : ''}
        z-index: 1;
      ">
        <div style="
          transform: rotate(45deg);
          color: ${colors.icon};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${iconSVG}
        </div>
      </div>
    </div>
    <style>
      @keyframes selection-pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.3); opacity: 0.5; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      @keyframes glow-pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 0.3; transform: scale(1.1); }
      }
      @keyframes marker-bounce {
        0% { transform: rotate(-45deg) scale(0.8); }
        50% { transform: rotate(-45deg) scale(1.1); }
        100% { transform: rotate(-45deg) scale(1); }
      }
      @keyframes emergency-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
        50% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
      }
    </style>
  `;
  
  return L.divIcon({
    html,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// User location marker
export const createUserLocationMarker = (): L.DivIcon => {
  const html = `
    <div style="
      width: 24px;
      height: 24px;
      background: #3b82f6;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        position: absolute;
        inset: -8px;
        background: rgba(59, 130, 246, 0.2);
        border-radius: 50%;
        animation: location-pulse 2s infinite;
      "></div>
    </div>
    <style>
      @keyframes location-pulse {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
      }
    </style>
  `;
  
  return L.divIcon({
    html,
    className: 'user-location-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Route start marker (animated green pin)
export const createRouteStartMarker = (): L.DivIcon => {
  const html = `
    <div style="
      width: 32px;
      height: 32px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        inset: -4px;
        background: rgba(34, 197, 94, 0.25);
        border-radius: 50%;
        animation: route-start-pulse 1.8s ease-out infinite;
      "></div>
      <div style="
        width: 20px;
        height: 20px;
        background: #22c55e;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 10px rgba(34, 197, 94, 0.5);
        z-index: 1;
        position: relative;
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        width: 6px;
        height: 6px;
        background: white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
      "></div>
    </div>
    <style>
      @keyframes route-start-pulse {
        0% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.8); opacity: 0; }
        100% { transform: scale(1.8); opacity: 0; }
      }
    </style>
  `;
  
  return L.divIcon({
    html,
    className: 'route-start-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};
