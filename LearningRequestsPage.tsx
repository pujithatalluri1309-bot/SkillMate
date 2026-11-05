import React, { useState } from 'react';
import {
  Inbox,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import { Student, LearningRequest } from '../types';
import { StorageService } from '../services/storageService';

interface LearningRequestsPageProps {
  currentStudent: Student;
  onNavigate: (tab: string) => void;
  onPayForSession: (request: LearningRequest) => void;
}

export const LearningRequestsPage: React.FC<LearningRequestsPageProps> = ({
  currentStudent,
  onNavigate,
  onPayForSession,
}) => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'sent'>('incoming');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const allRequests = StorageService.getRequests();
  const incomingRequests = allRequests.filter((r) => r.mentorId === currentStudent.id);
  const sentRequests = allRequests.filter((r) => r.learnerId === currentStudent.id);

  const handleAccept = (requestId: string) => {
    try {
      StorageService.updateRequestStatus(requestId, 'Accepted');
      alert('Request accepted! A scheduled learning session has been automatically created.');
    } catch (err: any) {
      alert(err.message || 'Failed to accept request.');
    }
  };

  const handleReject = (requestId: string) => {
    try {
      StorageService.updateRequestStatus(requestId, 'Rejected', rejectionReason.trim());
      setRejectingId(null);
      setRejectionReason('');
    } catch (err: any) {
      alert(err.message || 'Failed to reject request.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
          <Inbox className="w-4 h-4" />
          <span>Learning Requests Hub (Requirement 8)</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          Peer Learning Requests
        </h1>
        <p className="text-xs text-slate-500">
          Manage incoming requests from students wanting to learn from you, and track your sent requests.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'incoming'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Incoming Requests to You ({incomingRequests.length})</span>
          {incomingRequests.filter((r) => r.status === 'Pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'sent'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Sent Requests by You ({sentRequests.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'incoming' ? (
          /* Incoming Requests to Me as Mentor */
          incomingRequests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No Incoming Requests Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once other college students discover your skills and teaching demo video, booking requests will appear here.
              </p>
            </div>
          ) : (
            incomingRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                      Request ID: {req.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{req.subject}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>
                    <span className="text-base font-extrabold font-mono text-emerald-700">
                      ₹{req.price}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">Student Learner:</span>
                    <span>{req.learnerName}</span>
                    <span className="text-slate-400">({req.learnerEmail})</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600">
                    <span className="font-semibold text-slate-800 block mb-0.5">Topic Requirements:</span>
                    {req.topicRequirements}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-slate-500 font-mono text-[11px] pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      Proposed Date: {req.preferredDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Time: {req.preferredTime}
                    </span>
                  </div>
                </div>

                {/* Reject note box */}
                {rejectingId === req.id && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
                    <label className="block text-xs font-semibold text-rose-900">
                      Reason for Declining (Optional note to student)
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Schedule clash with college lab exam..."
                      className="w-full text-xs p-2 rounded-lg border border-rose-300 bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition"
                      >
                        Confirm Decline
                      </button>
                    </div>
                  </div>
                )}

                {/* Mentor Actions */}
                {req.status === 'Pending' && rejectingId !== req.id && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setRejectingId(req.id)}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept Request & Schedule</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )
        ) : sentRequests.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Send className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No Sent Requests</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Explore the peer mentor catalog to find tutors and request help with tough subjects!
            </p>
            <button
              onClick={() => onNavigate('find-mentors')}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Find Mentors
            </button>
          </div>
        ) : (
          sentRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    Request to Mentor: {req.mentorName}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{req.subject}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(
                      req.status
                    )}`}
                  >
                    {req.status}
                  </span>
                  <span className="text-base font-extrabold font-mono text-emerald-700">
                    ₹{req.price}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                <span className="font-semibold text-slate-800 block mb-0.5">Your Requirements:</span>
                {req.topicRequirements}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 font-mono text-[11px]">
                  📅 {req.preferredDate} at {req.preferredTime}
                </span>

                {req.status === 'Accepted' && (
                  <button
                    onClick={() => onPayForSession(req)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Proceed to Payment & Confirm</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
