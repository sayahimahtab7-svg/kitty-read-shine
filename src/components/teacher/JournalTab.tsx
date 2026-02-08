import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';

const JournalTab = ({ classId }: { classId: string }) => {
  const { journal, activities, classes } = useAppStore();
  const cls = classes.find((c) => c.id === classId);
  if (!cls) return null;

  const classActivities = activities.filter((a) => a.classId === classId);
  const activityIds = classActivities.map((a) => a.id);
  const entries = journal
    .filter((j) => activityIds.includes(j.activityId))
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

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
      {entries.map((entry, i) => {
        const student = cls.students.find((s) => s.id === entry.studentId);
        const activity = classActivities.find((a) => a.id === entry.activityId);
        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl p-5 shadow-card border border-border"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                {student?.avatar || '?'}
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">{student?.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
              <div className="bg-success/10 text-success font-black text-lg px-3 py-1 rounded-xl">
                {entry.score}%
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-semibold">
              📖 {activity?.title || 'Activity'}
            </p>
            {entry.comment && (
              <div className="mt-3 bg-muted rounded-xl p-3 text-sm">
                <span className="font-bold text-primary">Teacher: </span>{entry.comment}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default JournalTab;
