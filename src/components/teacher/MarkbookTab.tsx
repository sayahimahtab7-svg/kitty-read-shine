import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';

const MarkbookTab = ({ classId }: { classId: string }) => {
  const { classes, activities, submissions } = useAppStore();
  const cls = classes.find((c) => c.id === classId);
  const classActivities = activities.filter((a) => a.classId === classId);

  if (!cls) return null;

  const getScore = (studentId: string, activityId: string) => {
    const sub = submissions.find((s) => s.studentId === studentId && s.activityId === activityId);
    return sub?.score ?? null;
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="bg-muted text-muted-foreground text-sm font-bold px-4 py-2 rounded-xl">
          📅 1–28 Feb
        </span>
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 font-bold text-sm text-muted-foreground sticky left-0 bg-card z-10 min-w-[160px]">
                  Student
                </th>
                {classActivities.map((activity) => (
                  <th key={activity.id} className="px-3 py-3 text-center min-w-[100px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-sm">
                        📖
                      </div>
                      <span className="text-xs font-bold text-foreground line-clamp-1">{activity.title}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cls.students.map((student, i) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 sticky left-0 bg-card z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {student.avatar}
                      </div>
                      <span className="font-semibold text-sm text-foreground">{student.name}</span>
                    </div>
                  </td>
                  {classActivities.map((activity) => {
                    const score = getScore(student.id, activity.id);
                    return (
                      <td key={activity.id} className="px-3 py-3 text-center">
                        {score !== null ? (
                          <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${
                            score >= 90
                              ? 'bg-success/15 text-success'
                              : score >= 70
                              ? 'bg-accent/20 text-accent-foreground'
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {score}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarkbookTab;
