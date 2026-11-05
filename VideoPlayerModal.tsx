import React, { useState, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Star,
  CheckCircle,
  MessageSquare,
  Sparkles,
  BookOpen,
  Award,
} from 'lucide-react';
import { MentorVideo, Student } from '../types';
import { StorageService } from '../services/storageService';

interface VideoPlayerModalProps {
  video: MentorVideo;
  mentor: Student;
  currentStudent: Student;
  onClose: () => void;
  onEvaluated?: () => void;
  onBookMentor?: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  mentor,
  currentStudent,
  onClose,
  onEvaluated,
  onBookMentor,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'watch' | 'evaluate'>('watch');

  // 5 criteria evaluation states
  const [subjectKnowledge, setSubjectKnowledge] = useState(5);
  const [communicationSkills, setCommunicationSkills] = useState(5);
  const [explanationClarity, setExplanationClarity] = useState(5);
  const [confidence, setConfidence] = useState(5);
  const [practicalExamples, setPracticalExamples] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const calculateAverageCriteria = () => {
    if (video.evaluations.length === 0) {
      return {
        overall: 5.0,
        knowledge: 5.0,
        comm: 5.0,
        clarity: 5.0,
        conf: 5.0,
        examples: 5.0,
        count: 0,
      };
    }
    const count = video.evaluations.length;
    const knowledge = video.evaluations.reduce((sum, e) => sum + e.subjectKnowledge, 0) / count;
    const comm = video.evaluations.reduce((sum, e) => sum + e.communicationSkills, 0) / count;
    const clarity = video.evaluations.reduce((sum, e) => sum + e.explanationClarity, 0) / count;
    const conf = video.evaluations.reduce((sum, e) => sum + e.confidence, 0) / count;
    const examples = video.evaluations.reduce((sum, e) => sum + e.practicalExamples, 0) / count;
    const overall = (knowledge + comm + clarity + conf + examples) / 5;

    return {
      overall: Number(overall.toFixed(1)),
      knowledge: Number(knowledge.toFixed(1)),
      comm: Number(comm.toFixed(1)),
      clarity: Number(clarity.toFixed(1)),
      conf: Number(conf.toFixed(1)),
      examples: Number(examples.toFixed(1)),
      count,
    };
  };

  const avgScores = calculateAverageCriteria();

  const handleEvaluationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (currentStudent.id === mentor.id) {
      setErrorMessage('You cannot evaluate your own teaching demo video.');
      return;
    }

    if (!comment.trim()) {
      setErrorMessage('Please provide a brief constructive feedback comment.');
      return;
    }

    try {
      StorageService.addVideoEvaluation(video.id, {
        studentId: currentStudent.id,
        studentName: currentStudent.fullName,
        subjectKnowledge,
        communicationSkills,
        explanationClarity,
        confidence,
        practicalExamples,
        comment: comment.trim(),
      });

      setIsSubmitted(true);
      if (onEvaluated) onEvaluated();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit evaluation.');
    }
  };

  const renderStarSelector = (
    label: string,
    value: number,
    setValue: (val: number) => void,
    description: string
  ) => (
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold text-slate-800">{label}</label>
        <span className="text-xs font-bold text-blue-600">{value} / 5</span>
      </div>
      <p className="text-[11px] text-slate-500 mb-2">{description}</p>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue(star)}
            className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Teaching Demonstration Video
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">{video.durationMinutes} minutes</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-tight truncate max-w-xl">
                {video.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('watch')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'watch'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Watch Demo & Evaluations ({video.evaluations.length})
          </button>
          <button
            onClick={() => setActiveTab('evaluate')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'evaluate'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Submit Rubric Evaluation
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'watch' ? (
            <div className="space-y-6">
              {/* Video Player Container */}
              <div className="relative rounded-xl overflow-hidden bg-slate-950 shadow-md aspect-video group">
                <video
                  ref={videoRef}
                  src={video.videoUrl}
                  poster={video.thumbnailUrl}
                  className="w-full h-full object-contain"
                  controls={false}
                  onEnded={() => setIsPlaying(false)}
                />

                {/* Video Overlay Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-between p-4">
                  <div className="flex items-center justify-between text-white text-xs">
                    <span className="font-semibold bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded">
                      Subject: {video.subject}
                    </span>
                    <span className="bg-blue-600/90 text-white font-medium px-2 py-0.5 rounded text-[11px]">
                      Peer Teaching Evaluation
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-white/90 text-slate-900 hover:bg-white flex items-center justify-center shadow-lg transition"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>

                    <span className="text-white text-xs font-mono tabular-nums bg-black/40 px-2 py-1 rounded">
                      {isPlaying ? 'Playing Demo' : 'Paused'} · {video.durationMinutes} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Mentor Bio Strip */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={mentor.avatarUrl}
                    alt={mentor.fullName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{mentor.fullName}</h4>
                    <p className="text-xs text-slate-600">
                      {mentor.department} · {mentor.yearOfStudy}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{mentor.bio}</p>
                  </div>
                </div>

                {onBookMentor && (
                  <button
                    onClick={() => {
                      onClose();
                      onBookMentor();
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs whitespace-nowrap transition"
                  >
                    Request Learning Session
                  </button>
                )}
              </div>

              {/* Teaching Evaluation Scorecard Breakdown (5 Criteria) */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      Teaching Evaluation Rubric Breakdown
                    </h4>
                    <p className="text-xs text-slate-500">
                      Evaluated by peer learners across 5 structured pedagogical dimensions.
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-500 justify-end">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="text-lg font-bold text-slate-900">{avgScores.overall}</span>
                      <span className="text-xs text-slate-400">/ 5.0</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Based on {avgScores.count} learner evaluations
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <div className="text-xs font-semibold text-slate-700">Subject Knowledge</div>
                    <div className="text-base font-bold text-blue-600 mt-1">{avgScores.knowledge}</div>
                    <div className="text-[10px] text-slate-400">Concept depth & accuracy</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <div className="text-xs font-semibold text-slate-700">Communication</div>
                    <div className="text-base font-bold text-blue-600 mt-1">{avgScores.comm}</div>
                    <div className="text-[10px] text-slate-400">Pace, tone & articulation</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <div className="text-xs font-semibold text-slate-700">Explanation Clarity</div>
                    <div className="text-base font-bold text-blue-600 mt-1">{avgScores.clarity}</div>
                    <div className="text-[10px] text-slate-400">Step-by-step simplification</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <div className="text-xs font-semibold text-slate-700">Confidence</div>
                    <div className="text-base font-bold text-blue-600 mt-1">{avgScores.conf}</div>
                    <div className="text-[10px] text-slate-400">Command of topic</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <div className="text-xs font-semibold text-slate-700">Practical Examples</div>
                    <div className="text-base font-bold text-blue-600 mt-1">{avgScores.examples}</div>
                    <div className="text-[10px] text-slate-400">Code/diagram demos</div>
                  </div>
                </div>
              </div>

              {/* Learner Feedback Comments */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Learner Feedback Reviews ({video.evaluations.length})
                </h4>
                {video.evaluations.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3">
                    No evaluations submitted yet. Be the first learner to evaluate this teaching demo!
                  </p>
                ) : (
                  video.evaluations.map((ev) => (
                    <div key={ev.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{ev.studentName}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">{ev.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>
                            {(
                              (ev.subjectKnowledge +
                                ev.communicationSkills +
                                ev.explanationClarity +
                                ev.confidence +
                                ev.practicalExamples) /
                              5
                            ).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{ev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Rubric Evaluation Submission Form */
            <form onSubmit={handleEvaluationSubmit} className="space-y-4 max-w-2xl mx-auto">
              <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Teaching Evaluation Framework
                </h4>
                <p className="text-xs text-blue-800 mt-1">
                  Evaluate {mentor.fullName}'s teaching video on <strong>{video.subject}</strong> across
                  all five required dimensions. Your rating helps fellow students choose the best mentor!
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                  {errorMessage}
                </div>
              )}

              {isSubmitted ? (
                <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-900">Evaluation Submitted Successfully!</h4>
                  <p className="text-xs text-emerald-700">
                    Thank you for your constructive peer assessment. The scores have been updated in the
                    database.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('watch')}
                    className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition"
                  >
                    View Updated Rubric
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {renderStarSelector(
                      '1. Subject Knowledge',
                      subjectKnowledge,
                      setSubjectKnowledge,
                      'Accurate conceptual explanations and depth'
                    )}
                    {renderStarSelector(
                      '2. Communication Skills',
                      communicationSkills,
                      setCommunicationSkills,
                      'Tone, audio clarity, and pacing'
                    )}
                    {renderStarSelector(
                      '3. Explanation Clarity',
                      explanationClarity,
                      setExplanationClarity,
                      'Simplification of complex formulas/algorithms'
                    )}
                    {renderStarSelector(
                      '4. Confidence',
                      confidence,
                      setConfidence,
                      'Comfortable delivery and authoritative grasp'
                    )}
                  </div>

                  {renderStarSelector(
                    '5. Practical Examples',
                    practicalExamples,
                    setPracticalExamples,
                    'Whiteboard drawings, code snippets, or real-world problem mapping'
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Constructive Feedback & Suggestions (Required)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="e.g. Excellent explanation of binary tree rotation. I especially liked the step-by-step trace of node balances..."
                      rows={3}
                      className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('watch')}
                      className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
                    >
                      Submit Teaching Rubric
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
