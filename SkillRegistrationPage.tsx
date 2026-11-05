import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Award,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Student, StudentSkill, SkillLevel } from '../types';
import { StorageService } from '../services/storageService';

interface SkillRegistrationPageProps {
  currentStudent: Student;
  onNavigate: (tab: string) => void;
}

const COMMON_SUBJECTS = [
  'Python',
  'Java',
  'C Programming',
  'C++',
  'DBMS & SQL',
  'Data Structures & Algorithms',
  'Mathematics & Linear Algebra',
  'Machine Learning',
  'Web Development (React & Node)',
  'Operating Systems',
  'Computer Networks',
  'Spring Boot',
];

export const SkillRegistrationPage: React.FC<SkillRegistrationPageProps> = ({
  currentStudent,
  onNavigate,
}) => {
  const [skills, setSkills] = useState<StudentSkill[]>(
    StorageService.getSkillsByStudent(currentStudent.id)
  );

  const [isAdding, setIsAdding] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  // Form states
  const [skillName, setSkillName] = useState(COMMON_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [category, setCategory] = useState('Computer Science Core');
  const [level, setLevel] = useState<SkillLevel>('Intermediate');
  const [pricePerSession, setPricePerSession] = useState<number>(150);
  const [description, setDescription] = useState('');
  const [yearsExperience, setYearsExperience] = useState('1 year peer mentoring');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSubject = skillName === 'Other' ? customSubject.trim() : skillName;

    if (!finalSubject) {
      alert('Please specify a subject name.');
      return;
    }

    if (!description.trim()) {
      alert('Please provide a short description of what you will teach.');
      return;
    }

    if (editingSkillId) {
      const existing = skills.find((s) => s.id === editingSkillId);
      if (existing) {
        const updated = StorageService.updateSkill({
          ...existing,
          skillName: finalSubject,
          category,
          level,
          pricePerSession,
          description: description.trim(),
          yearsExperience,
        });
        setSkills(StorageService.getSkillsByStudent(currentStudent.id));
        setMessage(`Skill "${finalSubject}" updated successfully!`);
      }
      setEditingSkillId(null);
    } else {
      StorageService.addSkill({
        studentId: currentStudent.id,
        skillName: finalSubject,
        category,
        level,
        pricePerSession,
        description: description.trim(),
        yearsExperience,
      });
      setSkills(StorageService.getSkillsByStudent(currentStudent.id));
      setMessage(`Skill "${finalSubject}" added to your mentor teaching catalog!`);
    }

    // Reset form
    setIsAdding(false);
    setDescription('');
    setCustomSubject('');
  };

  const handleEdit = (skill: StudentSkill) => {
    setEditingSkillId(skill.id);
    if (COMMON_SUBJECTS.includes(skill.skillName)) {
      setSkillName(skill.skillName);
    } else {
      setSkillName('Other');
      setCustomSubject(skill.skillName);
    }
    setCategory(skill.category);
    setLevel(skill.level);
    setPricePerSession(skill.pricePerSession);
    setDescription(skill.description);
    setYearsExperience(skill.yearsExperience);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this teaching skill?')) {
      StorageService.deleteSkill(id);
      setSkills(StorageService.getSkillsByStudent(currentStudent.id));
      setMessage('Skill removed from your profile.');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            <BookOpen className="w-4 h-4" />
            <span>Skill Registration Module (Requirement 5)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Manage Teaching Skills & Pricing
          </h1>
          <p className="text-xs text-slate-500">
            Register subjects you can teach, set your hourly rate in INR (₹), and describe your approach.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => {
              setEditingSkillId(null);
              setDescription('');
              setIsAdding(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Teaching Skill</span>
          </button>
        )}
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Add / Edit Form Modal / Box */}
      {isAdding && (
        <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              {editingSkillId ? 'Edit Teaching Skill' : 'Register a New Skill to Teach'}
            </h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject / Topic *
                </label>
                <select
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {COMMON_SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                  <option value="Other">Other Subject (Custom)</option>
                </select>

                {skillName === 'Other' && (
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter custom subject name..."
                    className="mt-2 w-full text-xs p-2.5 rounded-lg border border-slate-300"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option>Computer Science Core</option>
                  <option>Programming & Languages</option>
                  <option>Web & Full Stack Development</option>
                  <option>AI, ML & Data Science</option>
                  <option>Engineering Mathematics</option>
                  <option>Electronics & Hardware</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proficiency Level *
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as SkillLevel)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Beginner">Beginner (Fundamentals)</option>
                  <option value="Intermediate">Intermediate (Problem Solving)</option>
                  <option value="Advanced">Advanced (Projects & Viva)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teaching Price Per Session (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    min={50}
                    max={2000}
                    step={10}
                    value={pricePerSession}
                    onChange={(e) => setPricePerSession(Number(e.target.value))}
                    className="w-full text-xs pl-7 pr-3 py-2.5 rounded-lg border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Experience / Credential
                </label>
                <input
                  type="text"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  placeholder="e.g. A+ in Subject, LeetCode 300+"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description of What You Will Cover *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Master Binary Search Trees, traversal orders, and recursion. I will provide curated LeetCode problems and step-by-step whiteboard drawings."
                rows={3}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                {editingSkillId ? 'Update Skill' : 'Add Skill to Catalog'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Registered Skills List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Your Registered Teaching Skills ({skills.length})
        </h3>

        {skills.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">No Teaching Skills Registered</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You haven't listed any skills yet. Adding your proficient subjects allows other college
              students to find you and request paid tutoring sessions.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl transition"
            >
              Add Your First Skill
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                        {skill.category}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        {skill.skillName}
                      </h4>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold font-mono text-emerald-700">
                        ₹{skill.pricePerSession}
                      </div>
                      <div className="text-[10px] text-slate-400">per 1hr session</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                      Level: {skill.level}
                    </span>
                    <span>·</span>
                    <span>{skill.yearsExperience}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{skill.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEdit(skill)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit Skill"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Skill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
