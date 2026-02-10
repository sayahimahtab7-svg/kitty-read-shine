import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const MarkbookTab = ({ classId }: { classId: string }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [membersRes, actsRes] = await Promise.all([
        supabase.from('class_members').select('student_id, profiles!class_members_student_id_fkey(id, name, avatar)').eq('class_id', classId),
        supabase.from('activities').select('*').eq('class_id', classId).order('created_at'),
      ]);

      const studs = (membersRes.data || []).map((m: any) => m.profiles).filter(Boolean);
      const acts = actsRes.data || [];
      setStudents(studs);
      setActivities(acts);

      if (acts.length > 0 && studs.length > 0) {
        const { data: subs } = await supabase.from('submissions')
          .select('*')
          .in('activity_id', acts.map(a => a.id))
          .in('student_id', studs.map((s: any) => s.id));
        setSubmissions(subs || []);
      }
    };
    fetchAll();
  }, [classId]);

  const getScore = (studentId: string, activityId: string) => {
    const sub = submissions.find((s) => s.student_id === studentId && s.activity_id === activityId);
    return sub?.score ?? null;
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="bg-muted text-muted-foreground text-sm font-bold px-4 py-2 rounded-xl">📅 All Time</span>
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 font-bold text-sm text-muted-foreground sticky left-0 bg-card z-10 min-w-[160px]">Student</th>
                {activities.map((activity) => (
                  <th key={activity.id} className="px-3 py-3 text-center min-w-[100px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-sm">📖</div>
                      <span className="text-xs font-bold text-foreground line-clamp-1">{activity.title}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => (
                <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 sticky left-0 bg-card z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {student.avatar || student.name?.[0] || '?'}
                      </div>
                      <span className="font-semibold text-sm text-foreground">{student.name}</span>
                    </div>
                  </td>
                  {activities.map((activity) => {
                    const score = getScore(student.id, activity.id);
                    return (
                      <td key={activity.id} className="px-3 py-3 text-center">
                        {score !== null ? (
                          <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${
                            score >= 90 ? 'bg-success/15 text-success' :
                            score >= 70 ? 'bg-accent/20 text-accent-foreground' :
                            'bg-destructive/10 text-destructive'
                          }`}>{score}%</span>
                        ) : (<span className="text-muted-foreground">—</span>)}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={activities.length + 1} className="text-center py-8 text-muted-foreground font-semibold">No students have joined yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarkbookTab;
