import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, Copy, Zap } from 'lucide-react';
import type { WeeklySchedule, DaySchedule } from '@/data/providers';

interface ScheduleEditorProps {
  value: WeeklySchedule | null;
  onChange: (schedule: WeeklySchedule) => void;
  isEmergency?: boolean;
}

const DAYS = [
  { key: 'lundi', label: 'Lundi', labelAr: 'الإثنين' },
  { key: 'mardi', label: 'Mardi', labelAr: 'الثلاثاء' },
  { key: 'mercredi', label: 'Mercredi', labelAr: 'الأربعاء' },
  { key: 'jeudi', label: 'Jeudi', labelAr: 'الخميس' },
  { key: 'vendredi', label: 'Vendredi', labelAr: 'الجمعة' },
  { key: 'samedi', label: 'Samedi', labelAr: 'السبت' },
  { key: 'dimanche', label: 'Dimanche', labelAr: 'الأحد' },
] as const;

type DayKey = typeof DAYS[number]['key'];

// Generate time options (every 30 minutes)
const generateTimeOptions = (start: number, end: number) => {
  const options: string[] = [];
  for (let hour = start; hour <= end; hour++) {
    options.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < end) {
      options.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return options;
};

const OPEN_TIMES = generateTimeOptions(6, 14);
const CLOSE_TIMES = generateTimeOptions(12, 23);

const PRESETS = {
  cabinet: {
    label: 'Cabinet médical',
    schedule: {
      lundi: { open: '08:00', close: '17:00' },
      mardi: { open: '08:00', close: '17:00' },
      mercredi: { open: '08:00', close: '17:00' },
      jeudi: { open: '08:00', close: '17:00' },
      vendredi: { open: '08:00', close: '12:00' },
      samedi: { open: '09:00', close: '12:00', closed: true },
      dimanche: { open: '09:00', close: '12:00', closed: true },
    },
  },
  pharmacy: {
    label: 'Pharmacie',
    schedule: {
      lundi: { open: '08:00', close: '20:00' },
      mardi: { open: '08:00', close: '20:00' },
      mercredi: { open: '08:00', close: '20:00' },
      jeudi: { open: '08:00', close: '20:00' },
      vendredi: { open: '08:00', close: '12:00' },
      samedi: { open: '09:00', close: '18:00' },
      dimanche: { open: '09:00', close: '12:00', closed: true },
    },
  },
  hospital: {
    label: 'Hôpital 24/7',
    schedule: {
      lundi: { open: '00:00', close: '23:30' },
      mardi: { open: '00:00', close: '23:30' },
      mercredi: { open: '00:00', close: '23:30' },
      jeudi: { open: '00:00', close: '23:30' },
      vendredi: { open: '00:00', close: '23:30' },
      samedi: { open: '00:00', close: '23:30' },
      dimanche: { open: '00:00', close: '23:30' },
    },
  },
};

const DEFAULT_SCHEDULE: WeeklySchedule = {
  lundi: { open: '08:00', close: '17:00' },
  mardi: { open: '08:00', close: '17:00' },
  mercredi: { open: '08:00', close: '17:00' },
  jeudi: { open: '08:00', close: '17:00' },
  vendredi: { open: '08:00', close: '17:00' },
  samedi: { open: '09:00', close: '12:00', closed: true },
  dimanche: { open: '09:00', close: '12:00', closed: true },
};

export function ScheduleEditor({ value, onChange, isEmergency }: ScheduleEditorProps) {
  const schedule = value || DEFAULT_SCHEDULE;

  const updateDay = (day: DayKey, updates: Partial<DaySchedule>) => {
    const currentDay = schedule[day] || { open: '08:00', close: '17:00' };
    onChange({
      ...schedule,
      [day]: { ...currentDay, ...updates },
    });
  };

  const copyMondayToAll = () => {
    const monday = schedule.lundi || { open: '08:00', close: '17:00' };
    const newSchedule: WeeklySchedule = {};
    DAYS.forEach((day) => {
      newSchedule[day.key] = { ...monday };
    });
    onChange(newSchedule);
  };

  const applyPreset = (presetKey: keyof typeof PRESETS) => {
    onChange(PRESETS[presetKey].schedule as WeeklySchedule);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Horaires d'ouverture
          </CardTitle>
          {isEmergency && (
            <Badge variant="destructive" className="gap-1">
              <Zap className="h-3 w-3" />
              24/7
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          <Label className="w-full text-xs text-muted-foreground mb-1">
            Presets rapides
          </Label>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <Button
              key={key}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset(key as keyof typeof PRESETS)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Days grid */}
        <div className="space-y-2">
          {DAYS.map((day) => {
            const daySchedule = schedule[day.key] || { open: '08:00', close: '17:00' };
            const isClosed = daySchedule.closed === true;

            return (
              <div
                key={day.key}
                className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                  isClosed ? 'bg-muted/50 opacity-60' : 'bg-background'
                }`}
              >
                {/* Day name */}
                <div className="w-24 font-medium text-sm">
                  {day.label}
                </div>

                {/* Open switch */}
                <Switch
                  checked={!isClosed}
                  onCheckedChange={(checked) => updateDay(day.key, { closed: !checked })}
                  aria-label={`${day.label} ouvert`}
                />

                {/* Time selectors */}
                {!isClosed ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Select
                      value={daySchedule.open}
                      onValueChange={(val) => updateDay(day.key, { open: val })}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPEN_TIMES.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-muted-foreground">-</span>

                    <Select
                      value={daySchedule.close}
                      onValueChange={(val) => updateDay(day.key, { close: val })}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CLOSE_TIMES.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">
                    Fermé
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Copy button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={copyMondayToAll}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copier les horaires du lundi à tous les jours
        </Button>
      </CardContent>
    </Card>
  );
}
