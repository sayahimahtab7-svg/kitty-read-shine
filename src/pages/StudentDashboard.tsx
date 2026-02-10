import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import catMascot from '@/assets/cat-mascot.png';
import { BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState('');
  const [joinedClasses, setJoinedClasses] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    // Get joined classes
    const { data: memberships } = await supabase
      .from('class_members')
      .select('class_id, classes(*)')
      .eq('student_id', user.id);

    const cls = (memberships || []).map((m: any) => m.classes).filter(Boolean);
    setJoinedClasses(cls);

    // Get activities for joined classes
    if (cls.length > 0) {
      const classIds = cls.map((c: any) => c.id);
      const { data: acts } = await supabase
        .from('activities')
        .select('*')
        .in('class_id', classIds)
        .order('created_at', { ascending: false });
      setActivities(acts || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleJoin = async () => {
    if (!classCode.trim() || !user) return;
    // Find class by code
    const { data: cls } = await supabase
      .from('classes')
      .select('id')
      .ilike('code', classCode.trim())
      .maybeSingle();

    if (!cls) { setError('Class not found! Check your code 🤔'); return; }

    const { error: joinError } = await supabase.from('class_members').insert({
      class_id: cls.id,
      student_id: user.id,
    });

    if (joinError) {
      if (joinError.code === '23505') setError('You already joined this class!');
      else setError(joinError.message);
      return;
    }
    setClassCode('');
    setError('');
    toast({ title: 'Joined class! 🎉' });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-primary px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={catMascot} alt="" className="w-10 h-10" />
          <div>
            <h1 className="text-lg font-black text-primary-foreground">Hi, {profile?.name}! 👋</h1>
            <p className="text-xs text-primary-foreground/70 font-semibold">
              {joinedClasses.length > 0 ? `${joinedClasses.length} class${joinedClasses.length > 1 ? 'es' : ''}` : 'No classes yet'}
            </p>
          </div>
        </div>
        <button onClick={async () => { await signOut(); navigate('/'); }} className="text-primary-foreground/80 font-semibold text-sm">
          Sign Out
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Join class */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border mb-6">
          <h3 className="font-bold text-foreground mb-3">Join a Class</h3>
          <div className="flex gap-3">
            <Input placeholder="Class Code" value={classCode} onChange={(e) => setClassCode(e.target.value)}
              className="rounded-xl text-lg py-5 flex-1" />
            <Button onClick={handleJoin} className="rounded-xl px-6 gradient-primary text-primary-foreground font-bold shadow-button">
              Join
            </Button>
          </div>
          {error && <p className="text-destructive font-bold text-sm mt-2">{error}</p>}
        </div>

        <h2 className="text-2xl font-black text-foreground mb-6">My Activities 📚</h2>

        {loading ? (
          <p className="text-center text-muted-foreground font-bold py-16">Loading...</p>
        ) : activities.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-5xl mb-3">🎒</p>
            <p className="font-bold">No activities yet!</p>
            <p className="text-sm">Join a class and your teacher will add some soon 😊</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, i) => (
              <motion.div key={activity.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/student/activity/${activity.id}`)}
                className="bg-card rounded-2xl p-5 shadow-card border border-border cursor-pointer hover:shadow-playful transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{activity.title}</h3>
                    <p className="text-sm text-muted-foreground font-semibold">Reading Fluency · Tap to start!</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
