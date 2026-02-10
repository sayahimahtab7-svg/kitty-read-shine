import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bell, Plus } from 'lucide-react';
import catMascot from '@/assets/cat-mascot.png';
import JournalTab from '@/components/teacher/JournalTab';
import ActivitiesTab from '@/components/teacher/ActivitiesTab';
import MarkbookTab from '@/components/teacher/MarkbookTab';
import NotificationsTab from '@/components/teacher/NotificationsTab';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const ClassView = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('journal');

  useEffect(() => {
    if (!classId) return;
    supabase.from('classes').select('*').eq('id', classId).maybeSingle().then(({ data }) => setCls(data));
  }, [classId]);

  if (!cls) return <div className="p-10 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-primary px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/teacher')} className="text-primary-foreground/80 hover:text-primary-foreground">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <img src={catMascot} alt="" className="w-8 h-8" />
          <div>
            <h1 className="text-lg font-black text-primary-foreground">{cls.icon} {cls.name}</h1>
            <p className="text-xs text-primary-foreground/70 font-semibold">{cls.grade} · Code: {cls.code}</p>
          </div>
        </div>
        <button onClick={() => setActiveTab('notifications')} className="relative text-primary-foreground/80 hover:text-primary-foreground">
          <Bell className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 rounded-2xl bg-muted p-1 h-auto">
            {['journal', 'activities', 'markbook', 'notifications'].map((tab) => (
              <TabsTrigger key={tab} value={tab}
                className="rounded-xl py-3 font-bold capitalize text-sm data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-button">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="journal" className="mt-4"><JournalTab classId={cls.id} /></TabsContent>
          <TabsContent value="activities" className="mt-4"><ActivitiesTab classId={cls.id} /></TabsContent>
          <TabsContent value="markbook" className="mt-4"><MarkbookTab classId={cls.id} /></TabsContent>
          <TabsContent value="notifications" className="mt-4"><NotificationsTab classId={cls.id} /></TabsContent>
        </Tabs>

        {activeTab === 'activities' && (
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/teacher/class/${cls.id}/create-activity`)}
            className="fixed bottom-8 right-8 gradient-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center shadow-button">
            <Plus className="w-8 h-8" />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ClassView;
