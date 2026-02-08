import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import catMascot from '@/assets/cat-mascot.png';
import { BookOpen } from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { classes, activities, studentName, setStudentName, joinedClassId, setJoinedClassId, setRole } = useAppStore();
  const [classCode, setClassCode] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');

  const joinedClass = classes.find((c) => c.id === joinedClassId);
  const classActivities = joinedClass ? activities.filter((a) => a.classId === joinedClass.id) : [];

  const handleJoin = () => {
    if (!nameInput.trim()) { setError('Please enter your name!'); return; }
    const found = classes.find((c) => c.code.toLowerCase() === classCode.trim().toLowerCase());
    if (!found) { setError('Class not found! Check your code 🤔'); return; }
    setStudentName(nameInput.trim());
    setJoinedClassId(found.id);
    setError('');
  };

  if (!joinedClass) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-primary p-6">
        <motion.img
          src={catMascot}
          alt=""
          className="w-32 h-32 mb-6 animate-bounce-gentle"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
        />
        <h1 className="text-3xl font-black text-primary-foreground mb-2">Join a Class!</h1>
        <p className="text-primary-foreground/70 font-semibold mb-8">Enter your name and class code</p>

        <div className="w-full max-w-sm space-y-4">
          <Input
            placeholder="Your Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="rounded-xl text-lg py-6 bg-card"
          />
          <Input
            placeholder="Class Code (e.g. SUN123)"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            className="rounded-xl text-lg py-6 bg-card"
          />
          {error && <p className="text-accent font-bold text-sm text-center">{error}</p>}
          <Button onClick={handleJoin} className="w-full rounded-xl py-6 text-lg font-bold bg-card text-foreground shadow-button hover:bg-card/90">
            Join Class 🎉
          </Button>
          <button onClick={() => { setRole(null); navigate('/'); }} className="text-primary-foreground/60 text-sm font-semibold mx-auto block hover:text-primary-foreground">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-primary px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={catMascot} alt="" className="w-10 h-10" />
          <div>
            <h1 className="text-lg font-black text-primary-foreground">Hi, {studentName}! 👋</h1>
            <p className="text-xs text-primary-foreground/70 font-semibold">{joinedClass.icon} {joinedClass.name}</p>
          </div>
        </div>
        <button onClick={() => { setJoinedClassId(null); setRole(null); navigate('/'); }} className="text-primary-foreground/80 font-semibold text-sm">
          Leave
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-black text-foreground mb-6">My Activities 📚</h2>

        {classActivities.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-5xl mb-3">🎒</p>
            <p className="font-bold">No activities yet!</p>
            <p className="text-sm">Your teacher will add some soon 😊</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classActivities.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/student/activity/${activity.id}`)}
                className="bg-card rounded-2xl p-5 shadow-card border border-border cursor-pointer hover:shadow-playful transition-all"
              >
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
