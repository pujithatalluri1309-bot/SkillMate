import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Award,
  CheckCircle2,
  Calendar,
  Save,
} from 'lucide-react';
import { Student } from '../types';
import { StorageService } from '../services/storageService';

interface StudentProfilePageProps {
  currentStudent: Student;
  onStudentUpdated: (student: Student) => void;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({
  currentStudent,
  onStudentUpdated,
}) => {
  const [fullName, setFullName] = useState(currentStudent.fullName);
  const [phone, setPhone] = useState(currentStudent.phone);
  const [department, setDepartment] = useState(currentStudent.department);
  const [yearOfStudy, setYearOfStudy] = useState(currentStudent.yearOfStudy);
  const [bio, setBio] = useState(currentStudent.bio);
  const [isSaved, setIsSaved] = useState(false);

  const skills = StorageService.getSkillsByStudent(currentStudent.id);
  const stats = StorageService.getMentorStats(currentStudent.id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Student = {
      ...currentStudent,
      fullName: fullName.trim(),
      phone: phone.trim(),
      department,
      yearOfStudy,
      bio: bio.trim(),
    };

    StorageService.saveStudent(updated);
    onStudentUpdated(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Student Profile
        </h1>
        <p className="text-xs text-slate-500">
          Manage your student credentials, college details, and academic bio.
        </p>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center space-y-4">
          <img
            src={currentStudent.avatarUrl}
            alt={currentStudent.fullName}
            referrerPolicy="no-referrer"
            className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 mx-auto"
          />

          <div>
            <h3 className="text-base font-bold text-slate-900">{currentStudent.fullName}</h3>
            <p className="text-xs text-slate-500">{currentStudent.department}</p>
            <p className="text-[11px] font-mono text-blue-600 mt-0.5">ID: {currentStudent.id}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Account Status:</span>
              <span className="font-bold text-emerald-700">{currentStudent.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Role:</span>
              <span className="font-semibold text-slate-800">
                {currentStudent.isMentor ? 'Mentor & Learner' : 'Learner'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Rating:</span>
              <span className="font-bold text-amber-600 font-mono">{stats.rating} ★</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Registered Skills:</span>
              <span className="font-bold text-slate-900">{skills.length}</span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Edit Personal Information
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student ID (Read-only)</label>
                <input
                  type="text"
                  value={currentStudent.id}
                  disabled
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">College Email</label>
                <input
                  type="email"
                  value={currentStudent.collegeEmail}
                  disabled
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option>Computer Science & Engineering</option>
                  <option>Information Technology</option>
                  <option>Data Science & AI</option>
                  <option>Electronics & Communication</option>
                  <option>Mechanical Engineering</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Year of Study</label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
