import { useNavigate } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface DoctorProfileCardProps {
  id: string;
  name: string;
  specialty?: string;
  city: string;
  language: string;
  image?: string | null;
  onFlyTo?: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(w => w.length > 1 && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map(w => w[0])
    .join("");
}

export function DoctorProfileCard({ id, name, specialty, city, language, image, onFlyTo }: DoctorProfileCardProps) {
  const navigate = useNavigate();

  const t = {
    fr: { viewProfile: "Voir le profil", seeOnMap: "Sur la carte" },
    ar: { viewProfile: "عرض الملف الشخصي", seeOnMap: "على الخريطة" },
    en: { viewProfile: "View profile", seeOnMap: "On map" },
  }[language] || { viewProfile: "Voir le profil", seeOnMap: "Sur la carte" };

  const hasImage = image && image !== "/placeholder.svg" && image !== "";

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-card shadow-sm hover:shadow-md transition-all">
      <Avatar className="h-10 w-10 shrink-0">
        {hasImage && <AvatarImage src={image} alt={name} className="object-cover" />}
        <AvatarFallback className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-sm font-semibold">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{name}</p>
        {specialty && <p className="text-xs text-muted-foreground">{specialty}</p>}
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3" /> {city}
        </p>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        {onFlyTo && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/30 h-7 px-2"
            onClick={onFlyTo}
          >
            <MapPin className="w-3 h-3" />
            {t.seeOnMap}
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="gap-1 text-xs border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-900/30 h-7 px-2"
          onClick={() => navigate(`/provider/${id}`)}
        >
          {t.viewProfile}
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
