import React, { useState } from 'react';
import {
  Star,
  MessageSquare,
  CheckCircle2,
  Clock,
  Award,
} from 'lucide-react';
import { Student, LearningSession } from '../types';
import { StorageService } from '../services/storageService';

interface FeedbackPageProps {
  currentStudent: Student;
  onOpenFeedbackModal: (session: LearningSession) => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({
  currentStudent,
  onOpenFeedbackModal,
}) => {
  const [tab, setTab] = useState<'pending' | 'received'>('pending');

  const allSessions = StorageService.getSessions();
  const allFeedback = StorageService.getFeedback();

  // Completed sessions attended by currentStudent as learner
  const completedAsLearner = allSessions.filter(
    (s) => s.learnerId === currentStudent.id && s.status === 'Completed'
  );

  // Sessions needing feedback
  const pendingReview = completedAsLearner.filter(
    (s) => !allFeedback.some((f) => f.sessionId === s.id)
  );

  // Feedback received by current student as mentor
  const receivedFeedback = allFeedback.filter((f) => f.mentorId === currentStudent.id);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
          <Star className="w-4 h-4 fill-amber-400" />
          <span>Evaluation & Quality Assurance (Requirement 11)</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          Feedback & Teaching Ratings
        </h1>
        <p className="text-xs text-slate-500">
          Rate completed learning sessions and review feedback received on your peer teaching.
        </p>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setTab('pending')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
            tab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Sessions Awaiting Your Review ({pendingReview.length})
        </button>
        <button
          onClick={() => setTab('received')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
            tab === 'received'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Reviews Received by You ({receivedFeedback.length})
        </button>
      </div>

      {tab === 'pending' ? (
        pendingReview.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
            No completed sessions waiting for your review. You are all caught up!
          </div>
        ) : (
          <div className="space-y-4">
            {pendingReview.map((sess) => (
              <div
                key={sess.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{sess.subject}</h4>
                  <p className="text-slate-500">
                    Mentor: {sess.mentorName} · Completed: {sess.completedAt || 'Recently'}
                  </p>
                  <p className="text-slate-600 mt-1">{sess.topic}</p>
                </div>

                <button
                  onClick={() => onOpenFeedbackModal(sess)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-xl flex items-center gap-1.5 transition whitespace-nowrap"
                >
                  <Star className="w-3.5 h-3.5 fill-slate-900" />
                  <span>Rate Mentor</span>
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        receivedFeedback.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
            No reviews received from learners yet.
          </div>
        ) : (
          <div className="space-y-4">
            {receivedFeedback.map((fb) => (
              <div
                key={fb.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{fb.learnerName}</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="text-sm">{fb.rating} / 5</span>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed italic">"{fb.comment}"</p>

                <div className="flex gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Communication: {fb.communicationRating}/5</span>
                  <span>Subject Knowledge: {fb.knowledgeRating}/5</span>
                  <span>Teaching Clarity: {fb.clarityRating}/5</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
