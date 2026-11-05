/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { FindMentorsPage } from './pages/FindMentorsPage';
import { MentorProfilePage } from './pages/MentorProfilePage';
import { SkillRegistrationPage } from './pages/SkillRegistrationPage';
import { TeachingVideoPage } from './pages/TeachingVideoPage';
import { LearningRequestsPage } from './pages/LearningRequestsPage';
import { SessionSchedulePage } from './pages/SessionSchedulePage';
import { EarningsDashboardPage } from './pages/EarningsDashboardPage';
import { PaymentHistoryPage } from './pages/PaymentHistoryPage';
import { LearningHistoryPage } from './pages/LearningHistoryPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { DatabaseStudioPage } from './pages/DatabaseStudioPage';
import { ApiDocsPage } from './pages/ApiDocsPage';

import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PaymentModal } from './components/PaymentModal';
import { ClassroomModal } from './components/ClassroomModal';
import { BookingModal } from './components/BookingModal';
import { FeedbackModal } from './components/FeedbackModal';
import { MentorComparisonModal } from './components/MentorComparisonModal';

import { Student, LearningSession, LearningRequest, MentorVideo } from './types';
import { StorageService } from './services/storageService';

export default function App() {
  const [currentStudentId, setCurrentStudentId] = useState<string>(
    StorageService.getCurrentStudentId()
  );
  const [currentStudent, setCurrentStudent] = useState<Student>(
    StorageService.getCurrentStudent()
  );
  const [allStudents, setAllStudents] = useState<Student[]>(StorageService.getStudents());
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Modals state
  const [videoModalData, setVideoModalData] = useState<{ video: MentorVideo; mentor: Student } | null>(null);
  const [paymentSession, setPaymentSession] = useState<LearningSession | null>(null);
  const [classroomSession, setClassroomSession] = useState<LearningSession | null>(null);
  const [bookingMentor, setBookingMentor] = useState<Student | null>(null);
  const [feedbackSession, setFeedbackSession] = useState<LearningSession | null>(null);
  const [comparisonMentors, setComparisonMentors] = useState<Student[] | null>(null);
  const [selectedMentorProfile, setSelectedMentorProfile] = useState<Student | null>(null);

  const [currentRole, setCurrentRole] = useState<'student' | 'mentor' | 'admin'>('student');

  // Synchronize student data
  useEffect(() => {
    const student = StorageService.getStudentById(currentStudentId) || StorageService.getStudents()[0];
    setCurrentStudent(student);
    setAllStudents(StorageService.getStudents());
    if (student?.isMentor) {
      setCurrentRole('mentor');
    } else {
      setCurrentRole('student');
    }
  }, [currentStudentId]);

  const handleSelectStudent = (id: string) => {
    StorageService.setCurrentStudentId(id);
    setCurrentStudentId(id);
  };

  const handleResetData = () => {
    StorageService.resetAllData();
    setCurrentStudentId('STU-2024-001');
    setAllStudents(StorageService.getStudents());
    setActiveTab('home');
  };

  const handleOpenVideo = (mentor: Student) => {
    const video = StorageService.getVideoByStudent(mentor.id);
    if (video) {
      setVideoModalData({ video, mentor });
    } else {
      alert(`${mentor.fullName} has not uploaded a teaching demonstration video yet.`);
    }
  };

  const handlePayForRequest = (req: LearningRequest) => {
    // Look up or create session for this request
    const sessions = StorageService.getSessions();
    let session = sessions.find((s) => s.requestId === req.id);
    if (!session) {
      session = StorageService.createSessionFromRequest(req);
    }
    setPaymentSession(session);
  };

  const handleSelectMentorForBooking = (mentor: Student) => {
    setSelectedMentorProfile(mentor);
    setBookingMentor(mentor);
  };

  const showSidebar = activeTab !== 'home' && activeTab !== 'login' && activeTab !== 'register';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentStudent={currentStudent}
        allStudents={allStudents}
        onSelectStudent={handleSelectStudent}
        activeTab={activeTab}
        onNavigate={(tab) => {
          if (tab === 'admin') {
            setIsAdmin(true);
          }
          setActiveTab(tab);
        }}
        isAdmin={isAdmin}
        onToggleAdmin={() => {
          setIsAdmin(!isAdmin);
          if (!isAdmin) setActiveTab('admin');
          else setActiveTab('dashboard');
        }}
        onResetData={handleResetData}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex w-full">
        {/* Sidebar Navigation */}
        {showSidebar && (
          <div className="hidden md:block">
            <Sidebar
              currentStudent={currentStudent}
              activeTab={activeTab}
              onNavigate={(tab) => setActiveTab(tab)}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {/* Dynamic Page Views */}
        <main className={`flex-1 ${showSidebar ? 'p-4 sm:p-6 lg:p-8' : ''}`}>
          {activeTab === 'home' && (
            <HomePage
              currentStudent={currentStudent}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectMentor={(m) => {
                setSelectedMentorProfile(m);
                setActiveTab('mentor-profile');
              }}
              onWatchVideo={handleOpenVideo}
            />
          )}

          {(activeTab === 'login' || activeTab === 'register') && (
            <AuthPage
              initialMode={activeTab as 'login' | 'register'}
              allStudents={allStudents}
              onLoginSuccess={(stu, role) => {
                setCurrentStudentId(stu.id);
                setCurrentStudent(stu);
                if (role === 'admin') {
                  setIsAdmin(true);
                  setActiveTab('admin');
                } else {
                  setCurrentRole(role || (stu.isMentor ? 'mentor' : 'student'));
                  setActiveTab('dashboard');
                }
              }}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardPage
              currentStudent={currentStudent}
              currentRole={currentRole}
              onNavigate={(tab) => {
                if (tab === 'admin') setIsAdmin(true);
                setActiveTab(tab);
              }}
              onSelectMentor={(m) => {
                setSelectedMentorProfile(m);
                setActiveTab('mentor-profile');
              }}
              onWatchVideo={handleOpenVideo}
              onStartSession={(sess) => setClassroomSession(sess)}
              onSwitchRole={(role) => setCurrentRole(role)}
            />
          )}

          {activeTab === 'profile' && (
            <StudentProfilePage
              currentStudent={currentStudent}
              onStudentUpdated={(stu) => setCurrentStudent(stu)}
            />
          )}

          {activeTab === 'find-mentors' && (
            <FindMentorsPage
              currentStudent={currentStudent}
              onSelectMentor={(m) => {
                setSelectedMentorProfile(m);
                setActiveTab('mentor-profile');
              }}
              onWatchVideo={handleOpenVideo}
              onCompareMentors={(mentors) => setComparisonMentors(mentors)}
            />
          )}

          {activeTab === 'mentor-profile' && selectedMentorProfile && (
            <MentorProfilePage
              mentor={selectedMentorProfile}
              currentStudent={currentStudent}
              onBack={() => setActiveTab('find-mentors')}
              onBookSession={() => setBookingMentor(selectedMentorProfile)}
              onWatchVideo={() => handleOpenVideo(selectedMentorProfile)}
            />
          )}

          {activeTab === 'skills' && (
            <SkillRegistrationPage
              currentStudent={currentStudent}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'teaching-video' && (
            <TeachingVideoPage
              currentStudent={currentStudent}
              onWatchVideo={handleOpenVideo}
            />
          )}

          {activeTab === 'requests' && (
            <LearningRequestsPage
              currentStudent={currentStudent}
              onNavigate={(tab) => setActiveTab(tab)}
              onPayForSession={handlePayForRequest}
            />
          )}

          {activeTab === 'sessions' && (
            <SessionSchedulePage
              currentStudent={currentStudent}
              onStartClassroom={(sess) => setClassroomSession(sess)}
              onOpenFeedback={(sess) => setFeedbackSession(sess)}
            />
          )}

          {activeTab === 'earnings' && (
            <EarningsDashboardPage
              currentStudent={currentStudent}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentHistoryPage currentStudent={currentStudent} />
          )}

          {activeTab === 'history' && (
            <LearningHistoryPage currentStudent={currentStudent} />
          )}

          {activeTab === 'feedback' && (
            <FeedbackPage
              currentStudent={currentStudent}
              onOpenFeedbackModal={(sess) => setFeedbackSession(sess)}
            />
          )}

          {activeTab === 'admin' && <AdminDashboardPage />}

          {activeTab === 'database-studio' && <DatabaseStudioPage />}

          {activeTab === 'api-docs' && <ApiDocsPage />}
        </main>
      </div>

      {/* Global Interactive Modals */}

      {/* 1. Teaching Demonstration Video & 5-Criteria Rubric Modal */}
      {videoModalData && (
        <VideoPlayerModal
          video={videoModalData.video}
          mentor={videoModalData.mentor}
          currentStudent={currentStudent}
          onClose={() => setVideoModalData(null)}
          onBookMentor={() => {
            setBookingMentor(videoModalData.mentor);
            setVideoModalData(null);
          }}
        />
      )}

      {/* 2. Sandbox Payment Gateway Modal (in ₹) */}
      {paymentSession && (
        <PaymentModal
          session={paymentSession}
          onClose={() => setPaymentSession(null)}
          onPaymentSuccess={() => {
            setActiveTab('sessions');
          }}
        />
      )}

      {/* 3. Live 1-on-1 Virtual Peer Classroom */}
      {classroomSession && (
        <ClassroomModal
          session={classroomSession}
          currentStudent={currentStudent}
          onClose={() => setClassroomSession(null)}
          onSessionCompleted={() => {
            setClassroomSession(null);
            setFeedbackSession(classroomSession);
          }}
        />
      )}

      {/* 4. Booking Request Modal */}
      {bookingMentor && (
        <BookingModal
          mentor={bookingMentor}
          currentStudent={currentStudent}
          onClose={() => setBookingMentor(null)}
          onRequestCreated={() => {
            setActiveTab('requests');
          }}
        />
      )}

      {/* 5. Session Feedback & Rating Modal */}
      {feedbackSession && (
        <FeedbackModal
          session={feedbackSession}
          currentStudent={currentStudent}
          onClose={() => setFeedbackSession(null)}
          onFeedbackSubmitted={() => {
            setActiveTab('feedback');
          }}
        />
      )}

      {/* 6. Side-by-Side Mentor Comparison Modal */}
      {comparisonMentors && (
        <MentorComparisonModal
          mentors={comparisonMentors}
          onClose={() => setComparisonMentors(null)}
          onSelectMentor={(m) => {
            setComparisonMentors(null);
            setSelectedMentorProfile(m);
            setBookingMentor(m);
          }}
          onWatchVideo={(m) => {
            setComparisonMentors(null);
            handleOpenVideo(m);
          }}
        />
      )}
    </div>
  );
}
