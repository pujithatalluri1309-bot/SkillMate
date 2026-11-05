import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Star,
  Video,
  Users,
  Award,
  BookOpen,
  ArrowUpDown,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { Student } from '../types';
import { StorageService } from '../services/storageService';

interface FindMentorsPageProps {
  currentStudent: Student;
  onSelectMentor: (mentor: Student) => void;
  onWatchVideo: (mentor: Student) => void;
  onCompareMentors: (mentors: Student[]) => void;
}

export const FindMentorsPage: React.FC<FindMentorsPageProps> = ({
  currentStudent,
  onSelectMentor,
  onWatchVideo,
  onCompareMentors,
}) => {
  const allStudents = StorageService.getStudents();
  const mentors = allStudents.filter((s) => s.isMentor && s.status === 'Active');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  // Collect unique subjects
  const allSkills = StorageService.getSkills();
  const uniqueSubjects = ['All', ...Array.from(new Set(allSkills.map((s) => s.skillName)))];

  const filteredMentors = mentors.filter((m) => {
    const skills = StorageService.getSkillsByStudent(m.id);
    const stats = StorageService.getMentorStats(m.id);

    // Search query matches name or skill
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skills.some((s) => s.skillName.toLowerCase().includes(searchQuery.toLowerCase()));

    // Subject match
    const matchesSubject =
      selectedSubject === 'All' || skills.some((s) => s.skillName === selectedSubject);

    // Price match: at least one skill within max price
    const lowestPrice =
      skills.length > 0 ? Math.min(...skills.map((s) => s.pricePerSession)) : 100;
    const matchesPrice = lowestPrice <= maxPrice;

    // Rating match
    const matchesRating = stats.rating >= minRating;

    return matchesSearch && matchesSubject && matchesPrice && matchesRating;
  });

  const toggleComparison = (mentorId: string) => {
    if (selectedForComparison.includes(mentorId)) {
      setSelectedForComparison(selectedForComparison.filter((id) => id !== mentorId));
    } else {
      if (selectedForComparison.length >= 3) {
        alert('You can compare a maximum of 3 mentors at a time.');
        return;
      }
      setSelectedForComparison([...selectedForComparison, mentorId]);
    }
  };

  const handleLaunchComparison = () => {
    const selectedList = mentors.filter((m) => selectedForComparison.includes(m.id));
    if (selectedList.length < 2) {
      alert('Please select at least 2 mentors to compare side-by-side.');
      return;
    }
    onCompareMentors(selectedList);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Peer Mentor Marketplace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search verified college students, watch 2-5 min teaching demo videos, and book 1-on-1 sessions.
          </p>
        </div>

        {selectedForComparison.length > 0 && (
          <button
            onClick={handleLaunchComparison}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition"
          >
            <Award className="w-4 h-4" />
            <span>Compare Selected ({selectedForComparison.length}/3)</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by mentor name, skill (e.g. Python, DBMS, Java)..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Subject Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {uniqueSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj === 'All' ? 'All Subjects' : subj}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="md:col-span-2">
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>All Ratings</option>
              <option value={4.5}>4.5+ Stars</option>
              <option value={4.0}>4.0+ Stars</option>
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="md:col-span-2 flex flex-col justify-center">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Max Price</span>
              <span className="font-mono font-bold text-slate-900">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min={100}
              max={500}
              step={20}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Mentors Grid */}
      {filteredMentors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No mentors match your search criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your price slider or clearing your search term to see more peer tutors.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSubject('All');
              setMaxPrice(500);
              setMinRating(0);
            }}
            className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((m) => {
            const skills = StorageService.getSkillsByStudent(m.id);
            const stats = StorageService.getMentorStats(m.id);
            const video = StorageService.getVideoByStudent(m.id);
            const primarySkill = skills[0];
            const isCompared = selectedForComparison.includes(m.id);

            return (
              <div
                key={m.id}
                className={`bg-white rounded-2xl border p-5 transition flex flex-col justify-between space-y-4 shadow-xs relative ${
                  isCompared ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* Card Top */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.avatarUrl}
                        alt={m.fullName}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {m.fullName}
                        </h3>
                        <p className="text-xs text-slate-500">{m.department}</p>
                        <p className="text-[11px] text-blue-600 font-medium">{m.yearOfStudy}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{stats.rating}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {stats.reviewCount} reviews
                      </div>
                    </div>
                  </div>

                  {/* Registered Skills & Price */}
                  <div className="space-y-1.5">
                    {skills.slice(0, 2).map((sk) => (
                      <div
                        key={sk.id}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div className="truncate max-w-[170px]">
                          <span className="font-semibold text-slate-800">{sk.skillName}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">({sk.level})</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-700">
                          ₹{sk.pricePerSession}/hr
                        </span>
                      </div>
                    ))}
                    {skills.length > 2 && (
                      <div className="text-[11px] text-blue-600 text-right">
                        +{skills.length - 2} more skills
                      </div>
                    )}
                  </div>

                  {/* Teaching Demo Video Preview Button (Requirement 6 & 7) */}
                  {video ? (
                    <button
                      onClick={() => onWatchVideo(m)}
                      className="w-full py-2 px-3 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-between transition border border-blue-100"
                    >
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-blue-600" />
                        <span className="truncate">Watch Demo: {video.subject}</span>
                      </div>
                      <span className="text-[11px] font-mono text-blue-600 shrink-0">
                        {video.durationMinutes}m
                      </span>
                    </button>
                  ) : (
                    <div className="py-2 px-3 rounded-xl bg-slate-50 text-slate-400 text-xs text-center border border-slate-100">
                      No demo video submitted yet
                    </div>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-2 italic leading-relaxed">
                    "{m.bio}"
                  </p>
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{stats.totalLearners} learners taught</span>
                    <button
                      type="button"
                      onClick={() => toggleComparison(m.id)}
                      className={`text-[11px] font-semibold transition ${
                        isCompared ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {isCompared ? '✓ Selected for Compare' : '+ Compare'}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectMentor(m)}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                    >
                      Choose Mentor
                    </button>
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
