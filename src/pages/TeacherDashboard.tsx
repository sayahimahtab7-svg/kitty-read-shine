import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Plus } from 'lucide-react';
import catMascot from '@/assets/cat-mascot.png';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const classIcons = ['🌞', '⭐', '🌈', '🚀', '🦋', '🎨', '📚', '🌺'];

interface ClassRow {
  id: string;
  name: string;
  grade: string;
  icon: string;
  code: string;
  teacher_id: string;
  member_count?: number;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🌞');
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('*, class_members(count)')
      .order('created_at', { ascending: false });
    if (error) { console.error(error); return; }
    setClasses((data || []).map((c: any) => ({
      ...c,
      member_count: c.class_members?.[0]?.count ?? 0,
    })));
    setLoading(false);
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleCreateClass = async () => {
    if (!newName.trim() || !profile) return;
    const { error } = await supabase.from('classes').insert({
      name: newName,
      grade: newGrade || 'Grade 1',
      icon: selectedIcon,
      teacher_id: profile.id,
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Error creating class', description: error.message });
      return;
    }
    setNewName('');
    setNewGrade('');
    setShowCreate(false);
    fetchClasses();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-primary px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={catMascot} alt="LingoReado" className="w-10 h-10" />
          <h1 className="text-2xl font-black text-primary-foreground">lingoReado</h1>
        </div>
        <button onClick={async () => { await signOut(); navigate('/'); }} className="text-primary-foreground/80 font-semibold text-sm hover:text-primary-foreground">
          Sign Out
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-foreground">My Classes</h2>
            <p className="text-muted-foreground font-semibold">Welcome back, {profile?.name}! 🎉</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowCreate(true)}
            className="gradient-primary text-primary-foreground px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-button">
            <Plus className="w-5 h-5" /> New Class
          </motion.button>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground font-bold py-16">Loading...</p>
        ) : classes.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-5xl mb-3">🏫</p>
            <p className="font-bold text-lg">No classes yet</p>
            <p className="text-sm">Create your first class to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {classes.map((cls, i) => (
              <motion.div key={cls.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => navigate(`/teacher/class/${cls.id}`)}
                className="bg-card rounded-2xl p-6 shadow-card cursor-pointer border border-border hover:shadow-playful transition-all">
                <div className="text-4xl mb-3">{cls.icon}</div>
                <h3 className="text-xl font-bold text-foreground">{cls.name}</h3>
                <p className="text-muted-foreground font-semibold text-sm">{cls.grade}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full font-bold">Code: {cls.code}</span>
                  <span className="text-xs text-muted-foreground font-semibold">{cls.member_count} students</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Create a New Class ✨</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input placeholder="Class Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="rounded-xl text-lg py-6" />
            <Input placeholder="Grade (e.g. Grade 2)" value={newGrade} onChange={(e) => setNewGrade(e.target.value)} className="rounded-xl text-lg py-6" />
            <div>
              <label className="text-sm font-bold text-muted-foreground mb-2 block">Choose an Icon</label>
              <div className="flex gap-2 flex-wrap">
                {classIcons.map((icon) => (
                  <button key={icon} onClick={() => setSelectedIcon(icon)}
                    className={`text-3xl p-2 rounded-xl transition-all ${selectedIcon === icon ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateClass} className="w-full rounded-xl py-6 text-lg font-bold gradient-primary text-primary-foreground shadow-button">
              Create Class 🎉
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
