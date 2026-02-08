import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { ArrowLeft, Play, Pause, Mic, Square, CheckCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import catMascot from '@/assets/cat-mascot.png';

type Step = 'read-along' | 'record' | 'results';

const StudentActivity = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { activities, studentName } = useAppStore();
  const activity = activities.find((a) => a.id === activityId);

  const [step, setStep] = useState<Step>('read-along');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDone, setRecordingDone] = useState(false);
  const [score, setScore] = useState(0);
  const [incorrectWords, setIncorrectWords] = useState<number[]>([]);

  const words = activity?.text.split(/\s+/) || [];

  // Simulated word-by-word highlighting
  useEffect(() => {
    if (!isPlaying || step !== 'read-along') return;
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => {
        if (prev >= words.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [isPlaying, step, words.length]);

  const togglePlayback = () => {
    if (!isPlaying) {
      if (currentWordIndex >= words.length - 1) setCurrentWordIndex(-1);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingDone(true);
    // Simulate auto-mark
    setTimeout(() => {
      const simulatedScore = Math.floor(80 + Math.random() * 20);
      const numIncorrect = Math.floor((100 - simulatedScore) / 10);
      const wrongIndices: number[] = [];
      while (wrongIndices.length < numIncorrect && wrongIndices.length < words.length) {
        const idx = Math.floor(Math.random() * words.length);
        if (!wrongIndices.includes(idx)) wrongIndices.push(idx);
      }
      setScore(simulatedScore);
      setIncorrectWords(wrongIndices);
      setStep('results');
    }, 1500);
  };

  if (!activity) return <div className="p-10 text-center text-muted-foreground">Activity not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-primary px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/student')} className="text-primary-foreground/80 hover:text-primary-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <img src={catMascot} alt="" className="w-8 h-8" />
        <h1 className="text-lg font-black text-primary-foreground">{activity.title}</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['read-along', 'record', 'results'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step === s ? 'gradient-primary text-primary-foreground shadow-button' :
                (['read-along', 'record', 'results'].indexOf(step) > i) ? 'bg-success text-success-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              {i < 2 && <div className={`w-8 h-1 rounded-full ${(['read-along', 'record', 'results'].indexOf(step) > i) ? 'bg-success' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'read-along' && (
            <motion.div
              key="read-along"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-black text-foreground mb-1">Listen & Follow Along 🎧</h2>
                <p className="text-muted-foreground font-semibold text-sm">Tap play and follow the highlighted words</p>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card border border-border min-h-[200px]">
                <p className="text-xl leading-relaxed font-semibold">
                  {words.map((word, i) => (
                    <span
                      key={i}
                      className={`inline-block mr-1 px-1 rounded transition-all duration-200 ${
                        i === currentWordIndex
                          ? 'bg-accent text-accent-foreground scale-110 font-bold'
                          : i < currentWordIndex
                          ? 'text-muted-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {word}
                    </span>
                  ))}
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlayback}
                  className="gradient-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center shadow-button"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </motion.button>
              </div>

              {currentWordIndex >= words.length - 1 && !isPlaying && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <button
                    onClick={() => setStep('record')}
                    className="gradient-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold text-lg shadow-button"
                  >
                    Now It's Your Turn! 🎤
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 'record' && (
            <motion.div
              key="record"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-black text-foreground mb-1">Your Turn to Read! 🎤</h2>
                <p className="text-muted-foreground font-semibold text-sm">Read the text aloud as best you can</p>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card border border-border min-h-[200px]">
                <p className="text-xl leading-relaxed font-semibold text-foreground">{activity.text}</p>
              </div>

              <div className="flex flex-col items-center gap-4">
                {!recordingDone ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-button transition-all ${
                      isRecording ? 'bg-destructive text-destructive-foreground animate-pulse' : 'gradient-primary text-primary-foreground'
                    }`}
                  >
                    {isRecording ? <Square className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full" />
                    <span className="text-muted-foreground font-bold">Checking your reading... ✨</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground font-semibold">
                  {isRecording ? 'Recording... Tap to stop' : recordingDone ? '' : 'Tap the microphone to start'}
                </p>
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  <img src={catMascot} alt="" className="w-24 h-24 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-3xl font-black text-foreground mb-1">
                  {score >= 90 ? 'Amazing Job! 🌟' : score >= 80 ? 'Great Work! 🎉' : 'Good Try! 💪'}
                </h2>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.4 }}
                  className="inline-block bg-success/15 text-success font-black text-5xl px-8 py-4 rounded-2xl mt-2"
                >
                  {score}%
                </motion.div>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <h3 className="font-bold text-foreground mb-3">Your Reading:</h3>
                <p className="text-lg leading-relaxed font-semibold">
                  {words.map((word, i) => (
                    <span
                      key={i}
                      className={`inline-block mr-1 px-1 rounded ${
                        incorrectWords.includes(i)
                          ? 'bg-destructive/15 text-destructive line-through decoration-2'
                          : 'text-success'
                      }`}
                    >
                      {word}
                    </span>
                  ))}
                </p>
              </div>

              {incorrectWords.length > 0 && (
                <div className="bg-accent/10 rounded-2xl p-5 border border-accent/20">
                  <h3 className="font-bold text-foreground mb-2">Words to Practice:</h3>
                  <div className="flex flex-wrap gap-2">
                    {incorrectWords.map((idx) => (
                      <span key={idx} className="bg-card px-3 py-1 rounded-xl font-bold text-sm text-foreground shadow-sm">
                        {words[idx]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('read-along'); setCurrentWordIndex(-1); setRecordingDone(false); setIncorrectWords([]); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground px-6 py-4 rounded-2xl font-bold shadow-card"
                >
                  <RotateCcw className="w-5 h-5" /> Try Again
                </button>
                <button
                  onClick={() => navigate('/student')}
                  className="flex-1 flex items-center justify-center gap-2 gradient-primary text-primary-foreground px-6 py-4 rounded-2xl font-bold shadow-button"
                >
                  <CheckCircle className="w-5 h-5" /> Done!
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentActivity;
