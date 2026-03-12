import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, CheckCircle, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const securityFeatures = [
  {
    icon: Shield,
    title: 'Protection des Données',
    description: 'Vos informations médicales sont cryptées selon les normes RGPD les plus strictes.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Lock,
    title: 'Connexion Sécurisée',
    description: 'Authentification à deux facteurs et protocole SSL pour protéger votre compte.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Eye,
    title: 'Confidentialité Garantie',
    description: 'Vos recherches et rendez-vous restent strictement confidentiels et privés.',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    icon: Database,
    title: 'Stockage Sécurisé',
    description: 'Données hébergées dans des centres de données certifiés SOC 2 Type II.',
    gradient: 'from-orange-500 to-amber-500',
  },
];

const certifications = [
  { name: 'RGPD Conforme', icon: Shield },
  { name: 'Hébergement HDS', icon: Database },
  { name: 'ISO 27001', icon: Award },
  { name: 'SOC 2 Type II', icon: CheckCircle },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const SecuritySection = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl mb-6 shadow-xl shadow-primary/20"
          >
            <Shield className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Votre Sécurité, Notre Priorité
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            CityHealth utilise les technologies de sécurité les plus avancées pour protéger vos données de santé
          </p>
        </motion.div>

        {/* Security Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {securityFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="group h-full bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <IconComponent className="h-8 w-8 text-white" />
                    </motion.div>

                    <h3 className="font-bold text-lg mb-3 text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-8 text-center text-foreground">
                Certifications & Conformité
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {certifications.map((cert, index) => {
                  const IconComponent = cert.icon;
                  return (
                    <motion.div
                      key={cert.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/30 hover:border-primary/30 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{cert.name}</span>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
