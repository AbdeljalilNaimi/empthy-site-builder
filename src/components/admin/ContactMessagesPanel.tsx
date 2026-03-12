import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Search, Mail, Eye, CheckCircle, Clock, Archive, Loader2, MessageSquare, RefreshCw, Save, Phone, MapPin, Settings2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  type: string | null;
  status: string;
  created_at: string;
}

type StatusFilter = 'all' | 'new' | 'read' | 'archived';

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  new: { label: 'Nouveau', className: 'bg-primary/10 text-primary', icon: Clock },
  read: { label: 'Lu', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  archived: { label: 'Archivé', className: 'bg-muted text-muted-foreground', icon: Archive },
};

export function ContactMessagesPanel() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Contact settings state
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact messages:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les messages.', variant: 'destructive' });
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    const { data, error } = await supabase
      .from('contact_settings')
      .select('*');
    if (!error && data) {
      const map: Record<string, string> = {};
      data.forEach((row: any) => { map[row.key] = row.value; });
      setSettings(map);
    }
    setSettingsLoading(false);
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from('contact_settings')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key);
      }
      toast({ title: 'Informations mises à jour', description: 'Les coordonnées de contact ont été sauvegardées.' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder.', variant: 'destructive' });
    }
    setSavingSettings(false);
  };

  useEffect(() => {
    fetchMessages();
    fetchSettings();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut.', variant: 'destructive' });
    } else {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
      if (selectedMessage?.id === id) {
        setSelectedMessage(prev => prev ? { ...prev, status: newStatus } : null);
      }
      toast({ title: 'Statut mis à jour' });
    }
  };

  const handleOpenMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'new') {
      updateStatus(msg.id, 'read');
    }
  };

  const filtered = messages.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    archived: messages.filter(m => m.status === 'archived').length,
  };

  return (
    <div className="space-y-6">
      {/* Contact Info Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="h-5 w-5 text-primary" />
            Informations de contact (affichées sur la page)
          </CardTitle>
          <CardDescription>
            Modifiez les coordonnées affichées publiquement sur la page Contact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settingsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Téléphone
                  </Label>
                  <Input
                    value={settings.phone || ''}
                    onChange={(e) => setSettings(s => ({ ...s, phone: e.target.value }))}
                    placeholder="+213 48 XX XX XX"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Horaires téléphone</Label>
                  <Input
                    value={settings.phone_hours || ''}
                    onChange={(e) => setSettings(s => ({ ...s, phone_hours: e.target.value }))}
                    placeholder="Disponible 8h-20h"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    value={settings.email || ''}
                    onChange={(e) => setSettings(s => ({ ...s, email: e.target.value }))}
                    placeholder="contact@cityhealth-sba.dz"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Délai de réponse</Label>
                  <Input
                    value={settings.email_response || ''}
                    onChange={(e) => setSettings(s => ({ ...s, email_response: e.target.value }))}
                    placeholder="Réponse sous 24h"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    Adresse
                  </Label>
                  <Input
                    value={settings.address || ''}
                    onChange={(e) => setSettings(s => ({ ...s, address: e.target.value }))}
                    placeholder="Sidi Bel Abbès, Algérie"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Ville / Wilaya</Label>
                  <Input
                    value={settings.address_city || ''}
                    onChange={(e) => setSettings(s => ({ ...s, address_city: e.target.value }))}
                    placeholder="Wilaya de Sidi Bel Abbès"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    Horaires (semaine)
                  </Label>
                  <Input
                    value={settings.working_hours || ''}
                    onChange={(e) => setSettings(s => ({ ...s, working_hours: e.target.value }))}
                    placeholder="Dim - Jeu: 8h - 17h"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Horaires (samedi)</Label>
                  <Input
                    value={settings.saturday_hours || ''}
                    onChange={(e) => setSettings(s => ({ ...s, saturday_hours: e.target.value }))}
                    placeholder="Sam: 8h - 12h"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveSettings} disabled={savingSettings}>
                  {savingSettings ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                  Sauvegarder
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Messages de contact
              </CardTitle>
              <CardDescription>
                {counts.all} messages au total — {counts.new} nouveau{counts.new > 1 ? 'x' : ''}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchMessages} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)} className="mt-3">
            <TabsList>
              <TabsTrigger value="all">Tous ({counts.all})</TabsTrigger>
              <TabsTrigger value="new">Nouveaux ({counts.new})</TabsTrigger>
              <TabsTrigger value="read">Lus ({counts.read})</TabsTrigger>
              <TabsTrigger value="archived">Archivés ({counts.archived})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Aucun message trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expéditeur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((msg) => {
                  const config = STATUS_CONFIG[msg.status] || STATUS_CONFIG.new;
                  return (
                    <TableRow
                      key={msg.id}
                      className={msg.status === 'new' ? 'bg-primary/[0.02] font-medium' : ''}
                    >
                      <TableCell>
                        <div>
                          <p className="text-sm">{msg.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {msg.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {msg.type ? (
                          <Badge variant="outline" className="text-xs">{msg.type}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">
                        {msg.subject || <span className="text-muted-foreground italic">Sans sujet</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(msg.created_at), 'dd MMM yyyy, HH:mm', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={config.className}>
                          <config.icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenMessage(msg)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {msg.status !== 'archived' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateStatus(msg.id, 'archived')}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Message de {selectedMessage.name}
                </DialogTitle>
                <DialogDescription>
                  Reçu le {format(new Date(selectedMessage.created_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Email</p>
                    <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Type</p>
                    <p>{selectedMessage.type || 'Non spécifié'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs mb-0.5">Sujet</p>
                    <p>{selectedMessage.subject || 'Sans sujet'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Message</p>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Badge variant="secondary" className={STATUS_CONFIG[selectedMessage.status]?.className}>
                    {STATUS_CONFIG[selectedMessage.status]?.label || selectedMessage.status}
                  </Badge>
                  <div className="flex gap-2">
                    {selectedMessage.status === 'archived' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(selectedMessage.id, 'read')}>
                        Restaurer
                      </Button>
                    )}
                    {selectedMessage.status !== 'archived' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(selectedMessage.id, 'archived')}>
                        <Archive className="h-3.5 w-3.5 mr-1.5" />
                        Archiver
                      </Button>
                    )}
                    <Button size="sm" asChild>
                      <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Votre message CityHealth'}`}>
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                        Répondre
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
