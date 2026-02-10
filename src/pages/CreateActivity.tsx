import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Mic, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import catMascot from '@/assets/cat-mascot.png';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CreateActivity = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [saving, setSaving] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast({ variant: 'destructive', title: 'Microphone access denied' });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleCreate = async () => {
    if (!title.trim() || !text.trim() || !user || !classId) return;
    setSaving(true);

    let audio_url: string | null = null;
    if (audioBlob) {
      const path = `${user.id}/activity-${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage.from('audio').upload(path, audioBlob);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('audio').getPublicUrl(path);
        audio_url = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from('activities').insert({
      title,
      text,
      class_id: classId,
      created_by: user.id,
      audio_url,
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      navigate(`/teacher/class/${classId}`);
    }
    setSaving(false);
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
          <Input placeholder="e.g. The Little Red Hen" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl text-lg py-6" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground">Reading Text</label>
          <textarea placeholder="Paste or write the reading passage here..." value={text} onChange={(e) => setText(e.target.value)} rows={6}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-base" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground">Record Audio (Read the text aloud)</label>
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-lg shadow-button transition-all ${
                isRecording ? 'bg-destructive text-destructive-foreground animate-pulse' : 'gradient-primary text-primary-foreground'
              }`}>
              {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </motion.button>
            {audioBlob && <span className="text-success font-bold text-sm">✅ Audio recorded!</span>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button onClick={handleCreate} disabled={!title.trim() || !text.trim() || saving}
            className="w-full rounded-xl py-6 text-lg font-bold gradient-primary text-primary-foreground shadow-button disabled:opacity-50">
            {saving ? 'Saving...' : 'Assign to Class 🚀'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateActivity;
