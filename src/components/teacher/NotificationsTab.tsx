import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const NotificationsTab = ({ classId }: { classId: string }) => {
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
        <p className="text-5xl mb-3">🔔</p>
        <p className="font-bold text-lg">No notifications</p>
        <p className="text-sm">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => {
        const student = cls.students.find((s) => s.id === entry.studentId);
        const activity = classActivities.find((a) => a.id === entry.activityId);
        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-card border border-border"
          >
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">
                {student?.name} completed "{activity?.title}"
              </p>
              <p className="text-xs text-muted-foreground">
                Score: {entry.score}% · {new Date(entry.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default NotificationsTab;
