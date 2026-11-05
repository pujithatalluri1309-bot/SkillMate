import React, { useState } from 'react';
import {
  History,
  BookOpen,
  Calendar,
  Star,
  Receipt,
  Users,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Student } from '../types';
import { StorageService } from '../services/storageService';

interface LearningHistoryPageProps {
  currentStudent: Student;
}

export const LearningHistoryPage: React.FC<LearningHistoryPageProps> = ({ currentStudent }) => {
  const [activeTab, setActiveTab] = useState<'learned' | 'taught' | 'feedback' | 'payments'>('learned');
  const [search, setSearch] = useState('');

  const allSessions = StorageService.getSessions();
  const learnedSessions = allSessions.filter((s) => s.learnerId === currentStudent.id);
  const taughtSessions = allSessions.filter((s) => s.mentorId === currentStudent.id);

  const feedbackList = StorageService.getFeedback().filter((f) => f.mentorId === currentStudent.id);
  const paymentList = StorageService.getPayments().filter(
    (p) => p.learnerId === currentStudent.id || p.mentorId === currentStudent.id
  );

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
          <History className="w-4 h-4" />
          <span>Audit Log & History (Requirement 12)</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          Complete Learning & Teaching History
        </h1>
        <p className="text-xs text-slate-500">
          Comprehensive records of subjects learned, mentors selected, sessions conducted, reviews received, and payments.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('learned')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === 'learned'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Subjects Learned ({learnedSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('taught')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === 'taught'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Teaching Sessions Conducted ({taughtSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === 'feedback'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Feedback Received ({feedbackList.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition ${
            activeTab === 'payments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Financial Records ({paymentList.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter history records by keyword or subject..."
          className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white"
        />
      </div>

      {/* Content based on active tab */}
      <div className="space-y-3">
        {activeTab === 'learned' && (
          learnedSessions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
              No learning session history recorded yet.
            </div>
          ) : (
            learnedSessions
              .filter((s) => s.subject.toLowerCase().includes(search.toLowerCase()))
              .map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4 text-xs shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{sess.subject}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">Mentor: {sess.mentorName}</span>
                    </div>
                    <p className="text-slate-600 line-clamp-1">{sess.topic}</p>
                    <div className="text-[11px] text-slate-400 font-mono">
                      📅 {sess.scheduledDate} · ₹{sess.price}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      sess.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {sess.status}
                  </span>
                </div>
              ))
          )
        )}

        {activeTab === 'taught' && (
          taughtSessions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
              No teaching sessions conducted yet.
            </div>
          ) : (
            taughtSessions
              .filter((s) => s.subject.toLowerCase().includes(search.toLowerCase()))
              .map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4 text-xs shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{sess.subject}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">Learner: {sess.learnerName}</span>
                    </div>
                    <p className="text-slate-600 line-clamp-1">{sess.topic}</p>
                    <div className="text-[11px] text-slate-400 font-mono">
                      📅 {sess.scheduledDate} · Net Earned: ₹{Math.round(sess.price * 0.9)}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      sess.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {sess.status}
                  </span>
                </div>
              ))
          )
        )}

        {activeTab === 'feedback' && (
          feedbackList.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
              No reviews received yet.
            </div>
          ) : (
            feedbackList.map((fb) => (
              <div
                key={fb.id}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Reviewed by {fb.learnerName}</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{fb.rating} / 5</span>
                  </div>
                </div>
                <p className="text-slate-700 italic">"{fb.comment}"</p>
                <div className="flex gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>Communication: {fb.communicationRating}/5</span>
                  <span>Knowledge: {fb.knowledgeRating}/5</span>
                  <span>Clarity: {fb.clarityRating}/5</span>
                </div>
              </div>
            ))
          )
        )}

        {activeTab === 'payments' && (
          paymentList.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
              No payment transactions yet.
            </div>
          ) : (
            paymentList.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs shadow-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{p.subject}</div>
                  <div className="text-[11px] text-slate-400 font-mono">TXN: {p.transactionId}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900">₹{p.amount}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">{p.status}</div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};
