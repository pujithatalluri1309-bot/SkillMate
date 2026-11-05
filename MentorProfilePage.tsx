import React from 'react';
import {
  Star,
  Video,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  DollarSign,
  Play,
} from 'lucide-react';
import { Student } from '../types';
import { StorageService } from '../services/storageService';

interface MentorProfilePageProps {
  mentor: Student;
  currentStudent: Student;
  onBack: () => void;
  onBookSession: () => void;
  onWatchVideo: () => void;
}

export const MentorProfilePage: React.FC<MentorProfilePageProps> = ({
  mentor,
  currentStudent,
  onBack,
  onBookSession,
  onWatchVideo,
}) => {
  const skills = StorageService.getSkillsByStudent(mentor.id);
  const stats = StorageService.getMentorStats(mentor.id);
  const video = StorageService.getVideoByStudent(mentor.id);
  const feedbackList = StorageService.getFeedbackForMentor(mentor.id);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Mentor Catalog</span>
      </button>

      {/* Mentor Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={mentor.avatarUrl}
              alt={mentor.fullName}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{mentor.fullName}</h1>
                <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">
                  Verified Mentor
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {mentor.department} · {mentor.yearOfStudy}
              </p>
              <div className="flex items-center gap-3 text-xs pt-1">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{stats.rating}</span>
                  <span className="text-slate-400 font-normal">({stats.reviewCount} reviews)</span>
                </div>
                <span className="text-slate-300">·</span>
                <span className="text-slate-600 font-medium">{stats.totalLearners} learners taught</span>
              </div>
            </div>
          </div>

          <button
            onClick={onBookSession}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            Request Learning Session
          </button>
        </div>

        <p className="text-xs text-slate-700 mt-6 pt-4 border-t border-slate-100 leading-relaxed">
          {mentor.bio}
        </p>
      </div>

      {/* Teaching Demo Video Feature */}
      {video && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-600" />
                Teaching Demonstration Video: {video.subject}
              </h3>
              <p className="text-xs text-slate-500">
                Watch how {mentor.fullName} teaches complex topics before requesting a session.
              </p>
            </div>

            <button
              onClick={onWatchVideo}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Watch Video ({video.durationMinutes}m)</span>
            </button>
          </div>

          <div
            onClick={onWatchVideo}
            className="relative rounded-xl overflow-hidden aspect-video bg-slate-950 cursor-pointer group max-w-xl mx-auto shadow-md"
          >
            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 flex items-center justify-center transition">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                <Play className="w-6 h-6 ml-0.5" />
              </div>
            </div>
            <div className="absolute bottom-3 left-3 text-white text-xs bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded">
              {video.title}
            </div>
          </div>
        </div>
      )}

      {/* Skills Offered with Pricing (₹) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          Subjects & Skills Offered
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skills.map((sk) => (
            <div key={sk.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{sk.skillName}</h4>
                  <div className="text-[11px] text-slate-500">Level: {sk.level}</div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-emerald-700">
                    ₹{sk.pricePerSession}
                  </span>
                  <span className="text-[10px] text-slate-400 block">/ hour</span>
                </div>
              </div>
              <p className="text-xs text-slate-600">{sk.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Learner Reviews */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Learner Reviews & Ratings ({feedbackList.length})
        </h3>

        {feedbackList.length === 0 ? (
          <p className="text-xs text-slate-400">No reviews yet for this mentor.</p>
        ) : (
          <div className="space-y-3">
            {feedbackList.map((fb) => (
              <div key={fb.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">{fb.learnerName}</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{fb.rating} / 5</span>
                  </div>
                </div>
                <p className="text-slate-600 italic">"{fb.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
