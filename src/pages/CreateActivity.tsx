import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { ArrowLeft, Mic, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import catMascot from '@/assets/cat-mascot.png';

const CreateActivity = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { addActivity } = useAppStore();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorded, setAudioRecorded] = useState(false);

  const handleCreate = () => {
    if (!title.trim() || !text.trim()) return;
    addActivity({
      id: 'a' + Date.now(),
      title,
      text,
      date: new Date().toISOString().split('T')[0],
      classId: classId!,
      type: 'reading-fluency',
    });
    navigate(`/teacher/class/${classId}`);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setAudioRecorded(true);
    } else {
      setIsRecording(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-primary px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-primary-foreground/80 hover:text-primary-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <img src={catMascot} alt="" className="w-8 h-8" />
        <h1 className="text-lg font-black text-primary-foreground">Create Reading Activity</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground">Activity Title</label>
          <Input
            placeholder="e.g. The Little Red Hen"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl text-lg py-6"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground">Reading Text</label>
          <textarea
            placeholder="Paste or write the reading passage here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-base"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground">Record Audio (Read the text aloud)</label>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleRecording}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-lg shadow-button transition-all ${
                isRecording
                  ? 'bg-destructive text-destructive-foreground animate-pulse'
                  : 'gradient-primary text-primary-foreground'
              }`}
            >
              {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </motion.button>
            {audioRecorded && (
              <span className="text-success font-bold text-sm">✅ Audio recorded!</span>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || !text.trim()}
            className="w-full rounded-xl py-6 text-lg font-bold gradient-primary text-primary-foreground shadow-button disabled:opacity-50"
          >
            Assign to Class 🚀
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateActivity;
