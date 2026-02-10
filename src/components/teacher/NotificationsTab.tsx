import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const NotificationsTab = ({ classId }: { classId: string }) => {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data: acts } = await supabase.from('activities').select('id, title').eq('class_id', classId);
      if (!acts || acts.length === 0) { setEntries([]); return; }

      const { data: subs } = await supabase
        .from('submissions')
        .select('*, profiles!submissions_student_id_fkey(name)')
        .in('activity_id', acts.map(a => a.id))
        .order('submitted_at', { ascending: false });

      setEntries((subs || []).map((s: any) => ({
        ...s,
        student_name: s.profiles?.name || 'Unknown',
        activity_title: acts.find(a => a.id === s.activity_id)?.title || 'Activity',
      })));
    };
    fetchEntries();
  }, [classId]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-5xl mb-3">🔔</p>
        <p className="font-bold text-lg">No notifications</p>
        <p className="text-sm">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <motion.div key={entry.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-card border border-border">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">{entry.student_name} completed "{entry.activity_title}"</p>
            <p className="text-xs text-muted-foreground">
              {entry.score !== null ? `Score: ${entry.score}% · ` : ''}
              {new Date(entry.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default NotificationsTab;
