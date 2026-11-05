import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  Video,
  Star,
  Users,
  AlertCircle,
} from 'lucide-react';
import { Student, LearningSession } from '../types';
import { StorageService } from '../services/storageService';

interface SessionSchedulePageProps {
  currentStudent: Student;
  onStartClassroom: (session: LearningSession) => void;
  onOpenFeedback: (session: LearningSession) => void;
}

export const SessionSchedulePage: React.FC<SessionSchedulePageProps> = ({
  currentStudent,
  onStartClassroom,
  onOpenFeedback,
}) => {
  const [filter, setFilter] = useState<'All' | 'Scheduled' | 'Completed'>('All');
  const allSessions = StorageService.getSessions();
  const feedbackList = StorageService.getFeedback();

  const studentSessions = allSessions.filter(
    (s) => s.learnerId === currentStudent.id || s.mentorId === currentStudent.id
  );

  const filtered = studentSessions.filter((s) => {
    if (filter === 'All') return true;
    return s.status === filter;
  });

  const hasFeedback = (sessionId: string) => {
    return feedbackList.some((f) => f.sessionId === sessionId);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            <Calendar className="w-4 h-4" />
            <span>Learning Session Management (Requirement 9)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Scheduled Learning Sessions
          </h1>
          <p className="text-xs text-slate-500">
            Join live peer classrooms with interactive whiteboards and code runners.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          {(['All', 'Scheduled', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Session Cards */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No {filter !== 'All' ? filter : ''} Sessions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Book a session with a mentor from the marketplace or accept incoming student requests.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((sess) => {
            const isMentor = sess.mentorId === currentStudent.id;
            const peerName = isMentor ? sess.learnerName : sess.mentorName;
            const alreadyReviewed = hasFeedback(sess.id);

            return (
              <div
                key={sess.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isMentor ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {isMentor ? 'Teaching' : 'Learning'}
                      </span>
                      <span className="text-xs font-bold text-slate-500">ID: {sess.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sess.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {sess.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{sess.subject}</h3>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold font-mono text-emerald-700">
                      ₹{sess.price}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {sess.durationMinutes} mins
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                      {isMentor ? 'Student Learner' : 'Student Mentor'}
                    </span>
                    <span className="font-bold text-slate-900">{peerName}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                      Scheduled Date & Time
                    </span>
                    <span className="font-mono font-semibold text-slate-800">
                      📅 {sess.scheduledDate} at {sess.scheduledTime}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                      Topic & Goals
                    </span>
                    <span className="text-slate-700 line-clamp-1">{sess.topic}</span>
                  </div>
                </div>

                {/* Session Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    {sess.completedAt ? (
                      <span>Completed on {sess.completedAt}</span>
                    ) : (
                      <span>Status: Waiting for live classroom start</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {sess.status === 'Scheduled' && (
                      <button
                        onClick={() => onStartClassroom(sess)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Launch Virtual Classroom</span>
                      </button>
                    )}

                    {sess.status === 'Completed' && !isMentor && (
                      alreadyReviewed ? (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Feedback Submitted</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onOpenFeedback(sess)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                        >
                          <Star className="w-3.5 h-3.5 fill-slate-900" />
                          <span>Rate & Review Mentor</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
