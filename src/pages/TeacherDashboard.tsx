import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Plus } from 'lucide-react';
import catMascot from '@/assets/cat-mascot.png';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const classIcons = ['🌞', '⭐', '🌈', '🚀', '🦋', '🎨', '📚', '🌺'];

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { classes, addClass, setCurrentClassId, setRole } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🌞');

  const handleCreateClass = () => {
    if (!newName.trim()) return;
    const code = newName.slice(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 900);
    addClass({
      id: 'c' + Date.now(),
      name: newName,
      grade: newGrade || 'Grade 1',
      icon: selectedIcon,
      code,
      students: [],
    });
    setNewName('');
    setNewGrade('');
    setShowCreate(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={catMascot} alt="LingoReado" className="w-10 h-10" />
          <h1 className="text-2xl font-black text-primary-foreground">lingoReado</h1>
        </div>
        <button onClick={() => { setRole(null); navigate('/'); }} className="text-primary-foreground/80 font-semibold text-sm hover:text-primary-foreground">
          Sign Out
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-foreground">My Classes</h2>
            <p className="text-muted-foreground font-semibold">Welcome back, Teacher! 🎉</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(true)}
            className="gradient-primary text-primary-foreground px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-button"
          >
            <Plus className="w-5 h-5" /> New Class
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {classes.map((cls, i) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => { setCurrentClassId(cls.id); navigate(`/teacher/class/${cls.id}`); }}
              className="bg-card rounded-2xl p-6 shadow-card cursor-pointer border border-border hover:shadow-playful transition-all"
            >
              <div className="text-4xl mb-3">{cls.icon}</div>
              <h3 className="text-xl font-bold text-foreground">{cls.name}</h3>
              <p className="text-muted-foreground font-semibold text-sm">{cls.grade}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full font-bold">
                  Code: {cls.code}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  {cls.students.length} students
                </span>
              </div>
            </motion.div>
          ))}
        </div>
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
                  <button
                    key={icon}
                    onClick={() => setSelectedIcon(icon)}
                    className={`text-3xl p-2 rounded-xl transition-all ${selectedIcon === icon ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'}`}
                  >
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
