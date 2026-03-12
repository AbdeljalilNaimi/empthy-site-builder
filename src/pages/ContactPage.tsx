import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Code2, Shield, CheckCircle2, Linkedin, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import ToastContainer from '@/components/ToastContainer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const ContactPage = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [contactSettings, setContactSettings] = useState<Record<string, string>>({});

  const { toasts, addToast } = useToastNotifications();

  const contactTypes = [
    t('contact', 'technicalSupport'),
    t('contact', 'generalQuestion'),
    t('contact', 'partnership'),
    t('contact', 'providerRegistration'),
    t('contact', 'report'),
    t('contact', 'other'),
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('contact_settings').select('*');
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((row: any) => { map[row.key] = row.value; });
        setContactSettings(map);
      }
    };
    fetchSettings();
  }, []);

  const contactInfo = [
    { icon: Phone, title: t('contact', 'phone'), details: contactSettings.phone || t('contact', 'phoneNumber'), description: contactSettings.phone_hours || t('contact', 'phoneHours'), iconBg: 'bg-primary/10', iconColor: 'text-primary' },
    { icon: Mail, title: t('contact', 'emailLabel'), details: contactSettings.email || t('contact', 'emailAddress'), description: contactSettings.email_response || t('contact', 'emailResponse'), iconBg: 'bg-secondary/10', iconColor: 'text-secondary' },
    { icon: MapPin, title: t('contact', 'address'), details: contactSettings.address || t('contact', 'addressDetails'), description: contactSettings.address_city || t('contact', 'addressCity'), iconBg: 'bg-destructive/10', iconColor: 'text-destructive' },
    { icon: Clock, title: t('contact', 'hours'), details: contactSettings.working_hours || t('contact', 'workingHours'), description: contactSettings.saturday_hours || t('contact', 'saturdayHours'), iconBg: 'bg-accent', iconColor: 'text-accent-foreground' },
  ];

  const faqItems = [
    { question: t('contact', 'faq1Q'), answer: t('contact', 'faq1A') },
    { question: t('contact', 'faq2Q'), answer: t('contact', 'faq2A') },
    { question: t('contact', 'faq3Q'), answer: t('contact', 'faq3A') },
    { question: t('contact', 'faq4Q'), answer: t('contact', 'faq4A') },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      addToast({
        type: 'warning',
        title: t('contact', 'requiredFields'),
        message: t('contact', 'requiredFieldsDesc'),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: formData,
      });

      if (error) throw error;

      setIsSuccess(true);
      addToast({
        type: 'success',
        title: t('contact', 'messageSent'),
        message: t('contact', 'messageSentDesc'),
      });
      setFormData({ name: '', email: '', subject: '', message: '', type: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      console.error('Contact form error:', err);
      addToast({
        type: 'error',
        title: t('contact', 'errorTitle'),
        message: t('contact', 'errorDesc'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ToastContainer toasts={toasts} />

      {/* Decorative blobs */}
      <div className="absolute top-20 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 -right-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 text-center relative">
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <MessageSquare size={14} />
            {t('contact', 'support247')}
          </span>
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute w-20 h-20 rounded-full bg-primary/10 animate-ping opacity-20" />
          <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center ring-4 ring-primary/10">
            <MessageSquare className="text-primary" size={28} />
          </div>
        </motion.div>

        <motion.h1 initial="hidden" animate="visible" custom={2} variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {t('contact', 'title')}
        </motion.h1>
        <motion.p initial="hidden" animate="visible" custom={3} variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('contact', 'subtitle')}
        </motion.p>
      </section>

      {/* Contact info 2x2 grid */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactInfo.map((info, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-5 text-center">
                  <div className={`w-12 h-12 rounded-xl ${info.iconBg} flex items-center justify-center mx-auto mb-3`}>
                    <info.icon size={22} className={info.iconColor} />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{info.title}</h4>
                  <p className="text-sm text-foreground font-medium">{info.details}</p>
                  <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main content: Form + Sidebar */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div
            className="lg:col-span-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
          >
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Send className="text-primary" size={22} />
                  {t('contact', 'sendMessage')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSuccess ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                      <CheckCircle2 className="text-emerald-500" size={40} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t('contact', 'messageSent')}</h3>
                    <p className="text-muted-foreground max-w-sm">{t('contact', 'messageSentDesc')}</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('contact', 'fullName')} *</label>
                        <Input name="name" value={formData.name} onChange={handleInputChange} placeholder={t('contact', 'fullName')} required className="focus:ring-primary/30 transition-shadow focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('contact', 'email')} *</label>
                        <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t('contact', 'emailPlaceholder')} required className="focus:ring-primary/30 transition-shadow focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('contact', 'requestType')}</label>
                        <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('contact', 'choosePlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {contactTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('contact', 'subject')}</label>
                        <Input name="subject" value={formData.subject} onChange={handleInputChange} placeholder={t('contact', 'subjectPlaceholder')} className="focus:ring-primary/30 transition-shadow focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('contact', 'message')} *</label>
                      <Textarea name="message" value={formData.message} onChange={handleInputChange} placeholder={t('contact', 'messagePlaceholder')} rows={6} required className="focus:ring-primary/30 transition-shadow focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]" />
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Send className="mr-2" size={18} />
                          {t('contact', 'send')}
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* FAQ Accordion */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}>
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">{t('contact', 'faq')}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, i) => (
                      <AccordionItem key={i} value={`faq-${i}`}>
                        <AccordionTrigger className="text-sm text-left">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>

            {/* Emergency */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp}>
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-5 text-center">
                  <Phone className="mx-auto mb-2 text-destructive" size={24} />
                  <h4 className="font-semibold text-destructive mb-1">{t('contact', 'emergencyTitle')}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{t('contact', 'emergencyDesc')}</p>
                  <Button variant="destructive" className="w-full">
                    <Phone className="mr-2" size={16} />
                    {t('contact', 'callEmergency')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Team section */}
      <section className="pb-20 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">{t('contact', 'teamTitle')}</h2>
          <p className="text-muted-foreground">{t('contact', 'teamSubtitle')}</p>
          <div className="mt-3 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-primary to-secondary" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            { name: 'Naimi Abdeldjalil', initials: 'NA', role: t('contact', 'coFounderDev'), desc: t('contact', 'descNaimi'), icon: Code2 },
            { name: 'Belyagoubi Abdelilah', initials: 'BA', role: t('contact', 'coFounderCTO'), desc: t('contact', 'descAbdelilah'), icon: Shield },
          ].map((member, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i + 1}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card className="border-border/50 hover:border-primary/30 transition-all group">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 ring-2 ring-primary/10 group-hover:ring-primary/30 flex items-center justify-center mx-auto transition-all">
                    <member.icon className="text-primary" size={32} />
                  </div>
                  <h3 className="text-lg font-bold mt-4">{member.name}</h3>
                  <span className="inline-flex mt-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                    {member.role}
                  </span>
                  <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto">{member.desc}</p>
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <a href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                      <Linkedin size={14} className="text-muted-foreground" />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                      <Github size={14} className="text-muted-foreground" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
