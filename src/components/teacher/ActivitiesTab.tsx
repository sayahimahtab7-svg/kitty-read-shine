import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';
import { BookOpen, Calendar } from 'lucide-react';

const ActivitiesTab = ({ classId }: { classId: string }) => {
  const { activities } = useAppStore();
  const classActivities = activities.filter((a) => a.classId === classId);

  if (classActivities.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-5xl mb-3">📝</p>
        <p className="font-bold text-lg">No activities yet</p>
        <p className="text-sm">Tap + to create your first reading activity!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {classActivities.map((activity, i) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border hover:shadow-playful transition-all cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">{activity.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{activity.text}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
              <Calendar className="w-3 h-3" />
              {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ActivitiesTab;
