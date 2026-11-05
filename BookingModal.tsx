import React, { useState } from 'react';
import { X, Calendar, Clock, BookOpen, Send, CheckCircle2 } from 'lucide-react';
import { Student, StudentSkill } from '../types';
import { StorageService } from '../services/storageService';

interface BookingModalProps {
  mentor: Student;
  currentStudent: Student;
  onClose: () => void;
  onRequestCreated: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  mentor,
  currentStudent,
  onClose,
  onRequestCreated,
}) => {
  const mentorSkills = StorageService.getSkillsByStudent(mentor.id);
  const [selectedSkillId, setSelectedSkillId] = useState<string>(mentorSkills[0]?.id || '');
  const [topicRequirements, setTopicRequirements] = useState('');
  const [preferredDate, setPreferredDate] = useState('2026-11-09');
  const [preferredTime, setPreferredTime] = useState('17:00');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedSkill = mentorSkills.find((s) => s.id === selectedSkillId) || mentorSkills[0];
  const price = selectedSkill ? selectedSkill.pricePerSession : 150;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (currentStudent.id === mentor.id) {
      setErrorMessage('You cannot book a learning session with yourself.');
      return;
    }

    if (!topicRequirements.trim()) {
      setErrorMessage('Please describe what topics or questions you need help with.');
      return;
    }

    try {
      StorageService.createLearningRequest({
        mentorId: mentor.id,
        subject: selectedSkill ? selectedSkill.skillName : 'Peer Tutoring',
        topicRequirements: topicRequirements.trim(),
        preferredDate,
        preferredTime,
        price,
      });

      setIsSuccess(true);
      onRequestCreated();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit booking request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <img
              src={mentor.avatarUrl}
              alt={mentor.fullName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Request Session with {mentor.fullName}</h3>
              <p className="text-[11px] text-slate-500">
                {mentor.department} · {mentor.yearOfStudy}
              </p>
            </div>
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
              <h4 className="text-base font-bold text-slate-900">Learning Request Sent!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Your request has been delivered to {mentor.fullName}. You will be notified once they
                accept your proposed slot.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition"
              >
                Close & View Requests
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                  {errorMessage}
                </div>
              )}

              {/* Subject selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Select Subject / Skill
                </label>
                {mentorSkills.length === 0 ? (
                  <p className="text-xs text-amber-600">This mentor has not registered skills yet.</p>
                ) : (
                  <select
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {mentorSkills.map((sk) => (
                      <option key={sk.id} value={sk.id}>
                        {sk.skillName} ({sk.level}) – ₹{sk.pricePerSession}/hr
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Topic details */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  What specific topics or problems do you need help with?
                </label>
                <textarea
                  value={topicRequirements}
                  onChange={(e) => setTopicRequirements(e.target.value)}
                  placeholder="e.g. Need help implementing BST deletion algorithm and understanding balance factor calculations for viva exam."
                  rows={3}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Fee notice */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-blue-900">Session Rate</span>
                  <div className="text-[11px] text-blue-700">60-minute interactive 1-on-1 peer session</div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-blue-800">₹{price}</span>
                  <div className="text-[10px] text-blue-600">Pay only after mentor accepts</div>
                </div>
              </div>

              {/* Action buttons */}
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
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-2 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Learning Request</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
