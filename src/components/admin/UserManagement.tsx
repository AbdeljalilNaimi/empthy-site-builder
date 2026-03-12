import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  User,
  Shield,
  MoreHorizontal,
  Search,
  UserPlus,
  Ban,
  CheckCircle,
  Trash2,
  Edit,
  Mail,
  Stethoscope,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  getAllCitizens,
  getAllAdmins,
  updateCitizenStatus,
  createAdmin,
  updateAdminRole,
  deleteAdmin,
  type CitizenUser,
  type AdminUser,
} from '@/services/userManagementService';
import { useAllProviders } from '@/hooks/useProviders';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  moderator: 'Modérateur',
  support: 'Support',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'card-status-error',
  moderator: 'card-status-info',
  support: 'card-status-success',
};

const VERIFICATION_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-amber-100 text-amber-800' },
  verified: { label: 'Vérifié', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejeté', className: 'bg-red-100 text-red-800' },
};

export function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [citizens, setCitizens] = useState<CitizenUser[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'moderator' | 'support'>('moderator');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; id: string; data?: any } | null>(null);

  const { data: providers = [], isLoading: loadingProviders } = useAllProviders();

  const currentAdminRole = admins.find(a => a.id === user?.uid)?.role;
  const isSuperAdmin = currentAdminRole === 'super_admin';

  const loadData = async () => {
    setLoading(true);
    try {
      const [citizenData, adminData] = await Promise.all([
        getAllCitizens(),
        getAllAdmins(),
      ]);
      setCitizens(citizenData);
      setAdmins(adminData);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les utilisateurs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredCitizens = citizens.filter(c =>
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdmins = admins.filter(a =>
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleCitizenStatus = async (citizen: CitizenUser) => {
    const newStatus = citizen.status === 'active' ? 'suspended' : 'active';
    try {
      await updateCitizenStatus(citizen.id, newStatus, user?.uid || '', user?.email || '');
      setCitizens(prev => prev.map(c => c.id === citizen.id ? { ...c, status: newStatus } : c));
      toast({ title: 'Statut mis à jour', description: `L'utilisateur a été ${newStatus === 'active' ? 'activé' : 'suspendu'}` });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut', variant: 'destructive' });
    }
  };

  const handleInviteAdmin = async () => {
    if (!newAdminEmail) return;
    try {
      await createAdmin(newAdminEmail, newAdminRole, { id: user?.uid || '', email: user?.email || '' });
      toast({ title: 'Admin invité', description: `Une invitation a été envoyée à ${newAdminEmail}` });
      setInviteDialogOpen(false);
      setNewAdminEmail('');
      loadData();
    } catch {
      toast({ title: 'Erreur', description: 'Impossible d\'inviter l\'admin', variant: 'destructive' });
    }
  };

  const handleUpdateAdminRole = async (adminId: string, newRole: 'super_admin' | 'moderator' | 'support') => {
    if (!isSuperAdmin) {
      toast({ title: 'Accès refusé', description: 'Seul un super-admin peut modifier les rôles.', variant: 'destructive' });
      return;
    }
    try {
      await updateAdminRole(adminId, newRole, { id: user?.uid || '', email: user?.email || '' });
      setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, role: newRole } : a));
      toast({ title: 'Rôle mis à jour', description: 'Le rôle de l\'admin a été modifié' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de modifier le rôle', variant: 'destructive' });
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!isSuperAdmin) {
      toast({ title: 'Accès refusé', description: 'Seul un super-admin peut supprimer un admin.', variant: 'destructive' });
      setConfirmDialogOpen(false);
      setPendingAction(null);
      return;
    }
    try {
      await deleteAdmin(adminId, { id: user?.uid || '', email: user?.email || '' });
      setAdmins(prev => prev.filter(a => a.id !== adminId));
      toast({ title: 'Admin supprimé', description: 'Le compte admin a été supprimé' });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Impossible de supprimer l\'admin', variant: 'destructive' });
    }
    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

  if (loading || loadingProviders) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="citizens">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="citizens" className="gap-2">
              <User className="h-4 w-4" />
              Citoyens ({citizens.length})
            </TabsTrigger>
            <TabsTrigger value="providers" className="gap-2">
              <Stethoscope className="h-4 w-4" />
              Prestataires ({providers.length})
            </TabsTrigger>
            <TabsTrigger value="admins" className="gap-2">
              <Shield className="h-4 w-4" />
              Admins ({admins.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={() => setInviteDialogOpen(true)} disabled={!isSuperAdmin} title={!isSuperAdmin ? 'Réservé aux super-admins' : ''}>
              <UserPlus className="h-4 w-4 mr-2" />
              Inviter Admin
            </Button>
          </div>
        </div>

        {/* Citizens Tab */}
        <TabsContent value="citizens">
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs Citoyens</CardTitle>
              <CardDescription>Gérez les comptes des utilisateurs de la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>RDV</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCitizens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucun utilisateur trouvé</TableCell>
                    </TableRow>
                  ) : (
                    filteredCitizens.map((citizen) => (
                      <TableRow key={citizen.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={citizen.avatarUrl} />
                              <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{citizen.fullName || 'Sans nom'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{citizen.email}</TableCell>
                        <TableCell>
                          {citizen.createdAt?.toDate ? format(citizen.createdAt.toDate(), 'dd MMM yyyy', { locale: fr }) : '-'}
                        </TableCell>
                        <TableCell>{citizen.appointmentsCount}</TableCell>
                        <TableCell>
                          <Badge variant={citizen.status === 'active' ? 'default' : 'destructive'}>
                            {citizen.status === 'active' ? 'Actif' : 'Suspendu'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem><Mail className="h-4 w-4 mr-2" />Envoyer un email</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleCitizenStatus(citizen)}>
                                {citizen.status === 'active' ? (<><Ban className="h-4 w-4 mr-2" />Suspendre</>) : (<><CheckCircle className="h-4 w-4 mr-2" />Activer</>)}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <CardTitle>Prestataires de santé</CardTitle>
              <CardDescription>Liste de tous les prestataires inscrits sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prestataire</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProviders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Aucun prestataire trouvé</TableCell>
                    </TableRow>
                  ) : (
                    filteredProviders.map((provider) => {
                      const status = provider.verificationStatus || 'pending';
                      const badge = VERIFICATION_BADGE[status] || VERIFICATION_BADGE.pending;
                      return (
                        <TableRow key={provider.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={provider.image} />
                                <AvatarFallback><Stethoscope className="h-4 w-4" /></AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium">{provider.name}</span>
                                {provider.specialty && <p className="text-xs text-muted-foreground">{provider.specialty}</p>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline">{provider.type}</Badge></TableCell>
                          <TableCell>{provider.city || '—'}</TableCell>
                          <TableCell>{provider.phone || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={badge.className}>{badge.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admins Tab */}
        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Administrateurs</CardTitle>
              <CardDescription>Gérez les comptes administrateurs et leurs rôles</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Aucun admin trouvé</TableCell>
                    </TableRow>
                  ) : (
                    filteredAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={admin.avatarUrl} />
                              <AvatarFallback><Shield className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{admin.fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <Badge className={ROLE_COLORS[admin.role]}>{ROLE_LABELS[admin.role]}</Badge>
                        </TableCell>
                        <TableCell>
                          {admin.lastLoginAt?.toDate ? format(admin.lastLoginAt.toDate(), 'dd MMM yyyy HH:mm', { locale: fr }) : 'Jamais'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleUpdateAdminRole(admin.id, 'super_admin')} disabled={admin.role === 'super_admin' || !isSuperAdmin}>
                                <Shield className="h-4 w-4 mr-2" />Définir comme Super Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateAdminRole(admin.id, 'moderator')} disabled={admin.role === 'moderator' || !isSuperAdmin}>
                                <Edit className="h-4 w-4 mr-2" />Définir comme Modérateur
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateAdminRole(admin.id, 'support')} disabled={admin.role === 'support' || !isSuperAdmin}>
                                <Edit className="h-4 w-4 mr-2" />Définir comme Support
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => { setPendingAction({ type: 'delete_admin', id: admin.id }); setConfirmDialogOpen(true); }}
                                disabled={admin.id === user?.uid || !isSuperAdmin}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Admin Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter un Administrateur</DialogTitle>
            <DialogDescription>Ajoutez un nouveau membre à l'équipe d'administration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" placeholder="admin@example.com" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-role">Rôle</Label>
              <Select value={newAdminRole} onValueChange={(v) => setNewAdminRole(v as 'moderator' | 'support')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="moderator">Modérateur</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleInviteAdmin} disabled={!newAdminEmail}>Inviter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'action</DialogTitle>
            <DialogDescription>
              {pendingAction?.type === 'delete_admin' ? 'Êtes-vous sûr de vouloir supprimer cet administrateur ? Cette action est irréversible.' : 'Confirmer cette action ?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setConfirmDialogOpen(false); setPendingAction(null); }}>Annuler</Button>
            <Button variant="destructive" onClick={() => { if (pendingAction?.type === 'delete_admin') handleDeleteAdmin(pendingAction.id); }}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
