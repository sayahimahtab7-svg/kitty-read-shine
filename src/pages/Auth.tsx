import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import catMascot from '@/assets/cat-mascot.png';
import { GraduationCap, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('teacher');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ variant: 'destructive', title: 'Login failed', description: error });
      }
    } else {
      if (!name.trim()) {
        toast({ variant: 'destructive', title: 'Name required' });
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, name, role);
      if (error) {
        toast({ variant: 'destructive', title: 'Sign up failed', description: error });
      } else {
        toast({ title: 'Check your email! 📧', description: 'Please verify your email to sign in.' });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-primary p-6">
      <motion.img
        src={catMascot}
        alt="LingoReado"
        className="w-28 h-28 mb-4 animate-bounce-gentle"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' }}
      />
      <h1 className="text-4xl font-black text-primary-foreground mb-1">lingoReado</h1>
      <p className="text-primary-foreground/70 font-semibold mb-8">
        {isLogin ? 'Welcome back! 📚' : 'Join the adventure! 🚀'}
      </p>

      <div className="w-full max-w-sm space-y-4">
        {!isLogin && (
          <>
            <Input
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl text-lg py-6 bg-card"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRole('teacher')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all ${
                  role === 'teacher' ? 'bg-card text-foreground shadow-playful ring-2 ring-accent' : 'bg-card/50 text-foreground/60'
                }`}
              >
                <GraduationCap className="w-6 h-6" /> Teacher
              </button>
              <button
                onClick={() => setRole('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all ${
                  role === 'student' ? 'bg-card text-foreground shadow-playful ring-2 ring-accent' : 'bg-card/50 text-foreground/60'
                }`}
              >
                <BookOpen className="w-6 h-6" /> Student
              </button>
            </div>
          </>
        )}

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl text-lg py-6 bg-card"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl text-lg py-6 bg-card"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl py-6 text-lg font-bold bg-card text-foreground shadow-button hover:bg-card/90"
        >
          {loading ? '...' : isLogin ? 'Sign In 🎉' : 'Sign Up 🚀'}
        </Button>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-primary-foreground/60 text-sm font-semibold mx-auto block hover:text-primary-foreground"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
