import catMascot from '@/assets/cat-mascot.png';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, GraduationCap } from 'lucide-react';
import { useEffect } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && profile) {
      navigate(profile.role === 'teacher' ? '/teacher' : '/student', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-primary p-6 overflow-hidden relative">
      <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-accent/30 animate-float" />
      <div className="absolute bottom-20 right-16 w-12 h-12 rounded-full bg-secondary/30 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-32 right-20 w-8 h-8 rounded-full bg-accent/20 animate-float" style={{ animationDelay: '0.5s' }} />

      <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="mb-6">
        <img src={catMascot} alt="LingoReado Cat" className="w-40 h-40 drop-shadow-lg animate-bounce-gentle" />
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-5xl font-black text-primary-foreground mb-2 tracking-tight">
        lingoReado
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-primary-foreground/80 text-lg mb-10 font-semibold">
        Reading is an adventure! 📚
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/auth')}
          className="flex items-center gap-3 bg-card text-foreground px-10 py-5 rounded-2xl font-bold text-xl shadow-playful hover:shadow-lg transition-all"
        >
          Get Started 🚀
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Landing;
