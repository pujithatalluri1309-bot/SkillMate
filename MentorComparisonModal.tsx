import React from 'react';
import { X, Star, Video, CheckCircle2, Award } from 'lucide-react';
import { Student } from '../types';
import { StorageService } from '../services/storageService';

interface MentorComparisonModalProps {
  mentors: Student[];
  onClose: () => void;
  onSelectMentor: (mentor: Student) => void;
  onWatchVideo: (mentor: Student) => void;
}

export const MentorComparisonModal: React.FC<MentorComparisonModalProps> = ({
  mentors,
  onClose,
  onSelectMentor,
  onWatchVideo,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Side-by-Side Peer Mentor Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Compare teaching skills, ratings, demo video evaluations, and pricing before booking.
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
        <div className="p-6 overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mentors.map((m) => {
              const skills = StorageService.getSkillsByStudent(m.id);
              const stats = StorageService.getMentorStats(m.id);
              const video = StorageService.getVideoByStudent(m.id);

              return (
                <div
                  key={m.id}
                  className="rounded-xl border border-slate-200 p-5 bg-white flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div className="space-y-3">
                    {/* Mentor profile */}
                    <div className="flex items-center gap-3">
                      <img
                        src={m.avatarUrl}
                        alt={m.fullName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{m.fullName}</h4>
                        <p className="text-xs text-slate-500">{m.department}</p>
                        <p className="text-[11px] text-blue-600 font-medium">{m.yearOfStudy}</p>
                      </div>
                    </div>

                    {/* Ratings */}
                    <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-slate-500">Learner Rating</span>
                      <div className="flex items-center gap-1 font-bold text-slate-900">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>{stats.rating}</span>
                        <span className="text-slate-400 font-normal">({stats.reviewCount})</span>
                      </div>
                    </div>

                    {/* Teaching Demo Video Rubric Score */}
                    <div className="p-2.5 bg-blue-50/60 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-blue-900 font-medium flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-blue-600" />
                        Teaching Demo
                      </span>
                      {video ? (
                        <button
                          onClick={() => onWatchVideo(m)}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Watch Demo ({video.durationMinutes}m)
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">No video</span>
                      )}
                    </div>

                    {/* Registered Skills & Price */}
                    <div>
                      <span className="text-[11px] font-semibold uppercase text-slate-400">
                        Registered Skills
                      </span>
                      <div className="mt-1.5 space-y-1.5">
                        {skills.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-50 border border-slate-100"
                          >
                            <span className="font-medium text-slate-800 truncate max-w-[130px]">
                              {s.skillName}
                            </span>
                            <span className="font-bold font-mono text-emerald-700">
                              ₹{s.pricePerSession}/hr
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-600 line-clamp-3 italic">"{m.bio}"</p>
                  </div>

                  {/* Choose Mentor button */}
                  <button
                    onClick={() => {
                      onClose();
                      onSelectMentor(m);
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    Choose {m.fullName.split(' ')[0]}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
