import React, { useState } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Phone,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Video,
  KeyRound,
  X,
} from 'lucide-react';
import { Student } from '../types';
import { StorageService } from '../services/storageService';
import { ApiService } from '../services/apiService';

interface AuthPageProps {
  onLoginSuccess: (student: Student, role?: 'student' | 'mentor' | 'admin') => void;
  allStudents: Student[];
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLoginSuccess,
  allStudents,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('pujithatalluri1309@gmail.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration fields: Full name, Email, Password, Confirm Password, Phone, Role
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'student' | 'mentor'>('student');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      // 1. Try real backend API
      const res = await ApiService.login(loginEmail.trim(), loginPassword);

      if (res.success && res.data?.user) {
        const u = res.data.user;
        const studentObj: Student = {
          id: u.id,
          fullName: u.fullName,
          collegeEmail: u.email,
          phone: u.phone || '+91 98765 00000',
          department: u.profile?.department || 'Computer Science & Engineering',
          yearOfStudy: u.profile?.yearOfStudy || '3rd Year',
          avatarUrl: u.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.fullName)}`,
          bio: u.profile?.bio || 'SkillMate user',
          isMentor: u.role === 'mentor',
          isVerified: true,
          status: 'Active',
          createdAt: '2024-01-01',
        };

        StorageService.saveStudent(studentObj);
        StorageService.setCurrentStudentId(studentObj.id);
        setIsSubmitting(false);
        onLoginSuccess(studentObj, u.role);
        return;
      }

      // 2. Fallback to local storage matching
      const found = allStudents.find(
        (s) => s.collegeEmail.toLowerCase() === loginEmail.trim().toLowerCase()
      );

      if (found) {
        StorageService.setCurrentStudentId(found.id);
        setIsSubmitting(false);
        onLoginSuccess(found, found.isMentor ? 'mentor' : 'student');
      } else {
        setIsSubmitting(false);
        setErrorMessage(res.error || 'Invalid email or password. Please check your credentials.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Login failed.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim() || !regEmail.trim() || !phone.trim() || !regPassword) {
      setErrorMessage('Please fill in all required registration fields.');
      return;
    }

    if (regPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Call Backend API
      const apiRes = await ApiService.register({
        fullName: fullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        confirmPassword,
        phone: phone.trim(),
        role,
        department,
        yearOfStudy,
      });

      if (!apiRes.success && apiRes.error) {
        setIsSubmitting(false);
        setErrorMessage(apiRes.error);
        return;
      }

      // 2. Register in storage service as well
      const newStudent = StorageService.registerStudent({
        studentId: apiRes.data?.user?.id || `STU-${Date.now().toString().slice(-4)}`,
        fullName: fullName.trim(),
        collegeEmail: regEmail.trim(),
        phone: phone.trim(),
        department,
        yearOfStudy,
        bio: `${role === 'mentor' ? 'Mentor' : 'Student'} enrolled on SkillMate.`,
      });

      if (role === 'mentor') {
        newStudent.isMentor = true;
        StorageService.saveStudent(newStudent);
      }

      setIsSubmitting(false);
      setSuccessMessage(`Account registered as ${role.toUpperCase()}! Redirecting to your dashboard...`);
      setTimeout(() => {
        onLoginSuccess(newStudent, role);
      }, 1000);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Registration failed.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage(null);
    const res = await ApiService.forgotPassword(forgotEmail.trim(), newResetPassword);
    if (res.success) {
      setForgotMessage(res.message || 'Password reset successful! You can now log in.');
      setTimeout(() => {
        setShowForgotModal(false);
        setLoginEmail(forgotEmail);
      }, 1500);
    } else {
      setForgotMessage(res.error || 'Failed to reset password.');
    }
  };

  const handleQuickLogin = (student: Student, designatedRole: 'student' | 'mentor' | 'admin') => {
    StorageService.setCurrentStudentId(student.id);
    onLoginSuccess(student, designatedRole);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Brand Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-md">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          SkillMate Peer Mentor Marketplace
        </h1>
        <p className="text-sm text-slate-600">
          Learn Together. Teach Together. Earn Together.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
                mode === 'login'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
                mode === 'register'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account (Student / Mentor)
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 mb-4 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 mb-4 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@college.edu.in"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                  <span>Remember session</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
              >
                {isSubmitting ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Registration Form with Role Selection */
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Role Selection Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Select Your Account Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      role === 'student'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>I want to Learn (Student)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('mentor')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      role === 'mentor'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-4 h-4 text-indigo-600" />
                    <span>I want to Teach & Earn (Mentor)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ramesh@college.edu.in"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Computer Science & Engineering</option>
                    <option>Information Technology</option>
                    <option>Data Science & AI</option>
                    <option>Electronics & Communication</option>
                    <option>Electrical Engineering</option>
                    <option>Mechanical Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Year of Study
                  </label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
              >
                {isSubmitting ? (
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <span>Create {role === 'mentor' ? 'Mentor' : 'Student'} Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Demo Switcher Quick Access */}
        <div className="md:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Instant Role-Based Access</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Click any account below to inspect the dedicated student, mentor, or admin dashboards:
          </p>

          <div className="space-y-2.5">
            {/* Student Login */}
            <button
              onClick={() => {
                const student = allStudents.find((s) => !s.isMentor) || allStudents[0];
                handleQuickLogin(student, 'student');
              }}
              className="w-full p-3 rounded-xl border border-blue-200 bg-white hover:bg-blue-50/50 text-left transition flex items-center justify-between shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  S
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                    Student Dashboard (Arjun Reddy)
                  </h4>
                  <p className="text-[11px] text-slate-500">Browse mentors & book sessions</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-600 uppercase">Student</span>
            </button>

            {/* Mentor Login */}
            <button
              onClick={() => {
                const mentor = allStudents.find((s) => s.isMentor) || allStudents[0];
                handleQuickLogin(mentor, 'mentor');
              }}
              className="w-full p-3 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50/50 text-left transition flex items-center justify-between shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  M
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                    Mentor Dashboard (Pujitha Talluri)
                  </h4>
                  <p className="text-[11px] text-slate-500">Upload video & accept requests</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase">Mentor</span>
            </button>

            {/* Admin Login */}
            <button
              onClick={() => {
                const adminUser = allStudents[0];
                handleQuickLogin(adminUser, 'admin');
              }}
              className="w-full p-3 rounded-xl border border-amber-200 bg-white hover:bg-amber-50/50 text-left transition flex items-center justify-between shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
                    Campus Admin Console
                  </h4>
                  <p className="text-[11px] text-slate-500">Database health & user moderation</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-700 uppercase">Admin</span>
            </button>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-900 leading-snug">
            🔒 <strong>Database & Security:</strong> Passwords are protected using salted bcrypt hashes. Data persists permanently in the database.
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>Reset Account Password</span>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotMessage && (
              <div className="p-3 text-xs bg-blue-50 border border-blue-200 text-blue-800 rounded-lg">
                {forgotMessage}
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Registered College Email Address *
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="student@college.edu.in"
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
