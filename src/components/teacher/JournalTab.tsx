import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const JournalTab = ({ classId }: { classId: string }) => {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data: acts } = await supabase.from('activities').select('id, title').eq('class_id', classId);
      if (!acts || acts.length === 0) { setEntries([]); return; }
      const actIds = acts.map(a => a.id);

      const { data: subs } = await supabase
        .from('submissions')
        .select('*, profiles!submissions_student_id_fkey(name, avatar)')
        .in('activity_id', actIds)
        .order('submitted_at', { ascending: false });

      setEntries((subs || []).map((s: any) => ({
        ...s,
        student_name: s.profiles?.name || 'Unknown',
        student_avatar: s.profiles?.avatar || s.profiles?.name?.[0] || '?',
        activity_title: acts.find(a => a.id === s.activity_id)?.title || 'Activity',
      })));
    };
    fetchEntries();
  }, [classId]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-5xl mb-3">📖</p>
        <p className="font-bold text-lg">No submissions yet</p>
        <p className="text-sm">Student work will appear here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
              {entry.student_avatar}
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">{entry.student_name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(entry.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
            {entry.score !== null && (
              <div className="bg-success/10 text-success font-black text-lg px-3 py-1 rounded-xl">{entry.score}%</div>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-semibold">📖 {entry.activity_title}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default JournalTab;
