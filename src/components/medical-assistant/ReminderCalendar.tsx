import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, Plus, Syringe, Stethoscope, 
  Pill, Clock, Bell, CheckCircle2, X
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Reminder {
  id: string;
  title: string;
  type: "vaccination" | "checkup" | "medication" | "appointment";
  date: Date;
  completed: boolean;
}

const REMINDER_TYPES = [
  { value: "vaccination", label: "Vaccination", icon: Syringe, color: "text-blue-500" },
  { value: "checkup", label: "Check-up", icon: Stethoscope, color: "text-green-500" },
  { value: "medication", label: "Médicament", icon: Pill, color: "text-orange-500" },
  { value: "appointment", label: "Rendez-vous", icon: Clock, color: "text-purple-500" },
];

const PRESET_REMINDERS = [
  { title: "Vaccin grippe annuel", type: "vaccination" as const },
  { title: "Contrôle dentaire", type: "checkup" as const },
  { title: "Bilan sanguin", type: "checkup" as const },
  { title: "Vaccin COVID rappel", type: "vaccination" as const },
  { title: "Examen ophtalmologique", type: "checkup" as const },
];

interface ReminderCalendarProps {
  language: string;
  isLoggedIn?: boolean;
}

export function ReminderCalendar({ language, isLoggedIn = false }: ReminderCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: "1", title: "Vaccin grippe", type: "vaccination", date: new Date(2025, 0, 15), completed: false },
    { id: "2", title: "Check-up annuel", type: "checkup", date: new Date(2025, 0, 20), completed: false },
  ]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newReminder, setNewReminder] = useState<{ title: string; type: Reminder["type"] }>({ title: "", type: "checkup" });

  const t = {
    fr: {
      title: "Rappels de santé",
      noReminders: "Aucun rappel pour cette date",
      addReminder: "Ajouter un rappel",
      presets: "Rappels prédéfinis",
      upcoming: "Prochains rappels",
      loginRequired: "Connectez-vous pour gérer vos rappels",
      login: "Se connecter",
      add: "Ajouter",
      cancel: "Annuler",
      reminderTitle: "Titre du rappel",
      reminderType: "Type"
    },
    ar: {
      title: "تذكيرات الصحة",
      noReminders: "لا توجد تذكيرات لهذا التاريخ",
      addReminder: "إضافة تذكير",
      presets: "تذكيرات مسبقة",
      upcoming: "التذكيرات القادمة",
      loginRequired: "قم بتسجيل الدخول لإدارة التذكيرات",
      login: "تسجيل الدخول",
      add: "إضافة",
      cancel: "إلغاء",
      reminderTitle: "عنوان التذكير",
      reminderType: "النوع"
    },
    en: {
      title: "Health Reminders",
      noReminders: "No reminders for this date",
      addReminder: "Add reminder",
      presets: "Preset reminders",
      upcoming: "Upcoming reminders",
      loginRequired: "Log in to manage your reminders",
      login: "Log in",
      add: "Add",
      cancel: "Cancel",
      reminderTitle: "Reminder title",
      reminderType: "Type"
    }
  }[language] || {
    title: "Rappels de santé",
    noReminders: "Aucun rappel pour cette date",
    addReminder: "Ajouter un rappel",
    presets: "Rappels prédéfinis",
    upcoming: "Prochains rappels",
    loginRequired: "Connectez-vous pour gérer vos rappels",
    login: "Se connecter",
    add: "Ajouter",
    cancel: "Annuler",
    reminderTitle: "Titre du rappel",
    reminderType: "Type"
  };

  const getTypeInfo = (type: string) => REMINDER_TYPES.find(t => t.value === type) || REMINDER_TYPES[0];

  const handleAddReminder = () => {
    if (!newReminder.title || !date) return;
    
    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      type: newReminder.type,
      date: date,
      completed: false
    };
    
    setReminders([...reminders, reminder]);
    setNewReminder({ title: "", type: "checkup" });
    setShowAddDialog(false);
  };

  const toggleComplete = (id: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const dateReminders = reminders.filter(r => 
    date && r.date.toDateString() === date.toDateString()
  );

  const upcomingReminders = reminders
    .filter(r => r.date >= new Date() && !r.completed)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  if (!isLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
          <CalendarIcon className="w-10 h-10 text-teal-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{t.loginRequired}</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Créez un compte pour sauvegarder vos rappels de vaccination, check-ups et rendez-vous médicaux.
        </p>
        <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
          <Bell className="w-4 h-4 mr-2" />
          {t.login}
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-1"
      >
        <Card className="border-border/50">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              modifiers={{
                hasReminder: reminders.map(r => r.date)
              }}
              modifiersStyles={{
                hasReminder: { 
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                  fontWeight: "bold"
                }
              }}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Reminders for selected date */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:col-span-2 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            {date?.toLocaleDateString(language === "ar" ? "ar-SA" : language === "en" ? "en-US" : "fr-FR", { 
              weekday: "long", 
              day: "numeric", 
              month: "long" 
            })}
          </h3>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-500">
                <Plus className="w-4 h-4 mr-1" /> {t.addReminder}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.addReminder}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">{t.reminderTitle}</label>
                  <Input
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                    placeholder="Ex: Vaccin grippe"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t.reminderType}</label>
                  <Select
                    value={newReminder.type}
                    onValueChange={(v: any) => setNewReminder({ ...newReminder, type: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REMINDER_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className={cn("w-4 h-4", type.color)} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t.presets}</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_REMINDERS.map(preset => (
                      <Button
                        key={preset.title}
                        variant="outline"
                        size="sm"
                        onClick={() => setNewReminder({ title: preset.title, type: preset.type })}
                        className="text-xs"
                      >
                        {preset.title}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    {t.cancel}
                  </Button>
                  <Button onClick={handleAddReminder} disabled={!newReminder.title}>
                    {t.add}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reminders list */}
        {dateReminders.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-8 text-center text-muted-foreground">
              <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
              {t.noReminders}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {dateReminders.map((reminder, index) => {
              const typeInfo = getTypeInfo(reminder.type);
              return (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "transition-all",
                    reminder.completed && "opacity-60"
                  )}>
                    <CardContent className="py-3 px-4 flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-8 w-8 rounded-full", typeInfo.color)}
                        onClick={() => toggleComplete(reminder.id)}
                      >
                        {reminder.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <typeInfo.icon className="w-5 h-5" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <p className={cn(
                          "font-medium",
                          reminder.completed && "line-through"
                        )}>
                          {reminder.title}
                        </p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {typeInfo.label}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteReminder(reminder.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Upcoming reminders */}
        {upcomingReminders.length > 0 && (
          <Card className="mt-6 border-teal-500/20 bg-teal-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-500" />
                {t.upcoming}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingReminders.map(reminder => {
                  const typeInfo = getTypeInfo(reminder.type);
                  return (
                    <div key={reminder.id} className="flex items-center gap-3 text-sm">
                      <typeInfo.icon className={cn("w-4 h-4", typeInfo.color)} />
                      <span className="flex-1">{reminder.title}</span>
                      <span className="text-muted-foreground">
                        {reminder.date.toLocaleDateString(language === "ar" ? "ar-SA" : "fr-FR", { 
                          day: "numeric", 
                          month: "short" 
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
