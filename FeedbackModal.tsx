import React, { useState } from 'react';
import { X, Star, CheckCircle2, MessageSquare, ThumbsUp } from 'lucide-react';
import { LearningSession, Student } from '../types';
import { StorageService } from '../services/storageService';

interface FeedbackModalProps {
  session: LearningSession;
  currentStudent: Student;
  onClose: () => void;
  onFeedbackSubmitted: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  session,
  currentStudent,
  onClose,
  onFeedbackSubmitted,
}) => {
  const [overallRating, setOverallRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [knowledgeRating, setKnowledgeRating] = useState(5);
  const [clarityRating, setClarityRating] = useState(5);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!comment.trim()) {
      setErrorMessage('Please write a brief comment describing your experience with the mentor.');
      return;
    }

    try {
      StorageService.submitFeedback({
        sessionId: session.id,
        learnerId: currentStudent.id,
        learnerName: currentStudent.fullName,
        mentorId: session.mentorId,
        rating: overallRating,
        communicationRating,
        knowledgeRating,
        clarityRating,
        comment: comment.trim(),
      });

      setIsSuccess(true);
      onFeedbackSubmitted();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit feedback.');
    }
  };

  const renderStars = (rating: number, setRating: (r: number) => void, title: string) => (
    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
      <span className="text-xs font-semibold text-slate-800">{title}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="p-1 focus:outline-none"
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Session Feedback & Rating</h3>
            <p className="text-[11px] text-slate-500">
              Session with {session.mentorName} on {session.subject}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Feedback Submitted!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Thank you for reviewing {session.mentorName}. Your feedback is now published to their
                public mentor profile and helps peers choose quality mentors.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                  {errorMessage}
                </div>
              )}

              {/* Overall Rating */}
              <div className="text-center p-4 bg-amber-50/50 rounded-xl border border-amber-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Overall Learning Experience
                </span>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setOverallRating(star)}
                      className="p-1.5 text-slate-300 hover:text-amber-400 transition"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= overallRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-xs font-bold text-amber-800 mt-1">
                  {overallRating === 5
                    ? 'Outstanding! Highly Recommended'
                    : overallRating === 4
                    ? 'Very Good Session'
                    : overallRating === 3
                    ? 'Average Session'
                    : 'Needs Improvement'}
                </div>
              </div>

              {/* Detailed criteria */}
              <div className="space-y-2">
                {renderStars(communicationRating, setCommunicationRating, 'Communication & Patience')}
                {renderStars(knowledgeRating, setKnowledgeRating, 'Subject Knowledge & Depth')}
                {renderStars(clarityRating, setClarityRating, 'Teaching & Explanation Clarity')}
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Written Feedback & Review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Excellent mentor! Patiently walked me through SQL JOIN syntax and gave great real-world examples."
                  rows={3}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
