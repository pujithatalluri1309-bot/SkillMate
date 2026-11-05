import React, { useState } from 'react';
import {
  FileCode,
  Terminal,
  HelpCircle,
  Server,
  Database,
  CheckCircle2,
  Copy,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export const ApiDocsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'localrun' | 'viva'>('endpoints');
  const [copied, setCopied] = useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const API_ENDPOINTS = [
    {
      method: 'POST',
      path: '/api/v1/auth/register',
      desc: 'Registers a new student account (Student ID, name, email, department, year, phone, password).',
      requestBody: `{
  "studentId": "21CS042",
  "fullName": "Pujitha Talluri",
  "collegeEmail": "pujithatalluri1309@gmail.com",
  "phone": "+91 98765 43210",
  "department": "Computer Science & Engineering",
  "yearOfStudy": "3rd Year",
  "password": "SecurePassword123!"
}`,
      responseBody: `{
  "status": "success",
  "studentId": "21CS042",
  "message": "Student registered successfully."
}`,
    },
    {
      method: 'POST',
      path: '/api/v1/skills',
      desc: 'Registers a skill the student can teach with proficiency level and price per session (₹).',
      requestBody: `{
  "studentId": "21CS042",
  "skillName": "Data Structures & Algorithms",
  "category": "Computer Science Core",
  "level": "Advanced",
  "pricePerSession": 200.00,
  "description": "Master Binary Search Trees, recursion, and dynamic programming."
}`,
      responseBody: `{
  "skillId": "SKILL-89102",
  "status": "created"
}`,
    },
    {
      method: 'POST',
      path: '/api/v1/videos/upload',
      desc: 'Stores teaching demonstration video path in MySQL and binds to mentor profile.',
      requestBody: `{
  "studentId": "21CS042",
  "subject": "DBMS & SQL",
  "title": "Visualizing SQL JOINs and Normalization",
  "videoPath": "/uploads/videos/21cs042_dbms_demo.mp4",
  "durationMinutes": 3.5
}`,
      responseBody: `{
  "videoId": 104,
  "status": "Active"
}`,
    },
    {
      method: 'POST',
      path: '/api/v1/videos/evaluate',
      desc: 'Submits 5-criteria rubric evaluation (knowledge, communication, clarity, confidence, examples).',
      requestBody: `{
  "videoId": 104,
  "evaluatorStudentId": "21CS099",
  "subjectKnowledge": 5,
  "communicationSkills": 5,
  "explanationClarity": 5,
  "confidence": 4,
  "practicalExamples": 5,
  "comment": "Crystal clear explanation of BCNF decomposition!"
}`,
      responseBody: `{
  "evaluationId": 502,
  "status": "Recorded"
}`,
    },
    {
      method: 'POST',
      path: '/api/v1/sessions/complete',
      desc: 'Executes ACID transaction procedure: marks session completed & credits mentor wallet in ₹.',
      requestBody: `{
  "sessionId": "SESS-201"
}`,
      responseBody: `{
  "status": "SUCCESS",
  "mentorEarningsCredited": 180.00,
  "platformFeeRetained": 20.00
}`,
    },
    {
      method: 'POST',
      path: '/api/v1/payouts/request',
      desc: 'Requests withdrawal of available mentor wallet balance to UPI ID or Bank Account.',
      requestBody: `{
  "mentorId": "21CS042",
  "amount": 500.00,
  "payoutMethod": "UPI",
  "payoutDetails": "pujitha@okhdfcbank"
}`,
      responseBody: `{
  "payoutId": "PO-301",
  "status": "Pending"
}`,
    },
  ];

  const VIVA_QUESTIONS = [
    {
      q: 'Why does SkillMate require a 2–5 minute teaching demonstration video?',
      a: 'In a peer learning system, high grades in an exam do not necessarily guarantee the ability to teach. The demonstration video allows prospective student learners to evaluate mentors across 5 objective pedagogical dimensions (Subject Knowledge, Communication, Explanation Clarity, Confidence, and Practical Examples) before spending money on a session.',
    },
    {
      q: 'How does the student earning and commission calculation work?',
      a: 'Mentors set their own price per session (e.g. ₹100). When a learner books a session, payment is recorded in Payments table. Upon session completion, the sp_complete_session_and_credit_earnings stored procedure calculates the configurable platform commission (e.g. 10% = ₹10) and credits the net amount (₹90) directly to the mentor’s wallet balance in Mentor_Earnings table.',
    },
    {
      q: 'What normalization level does the MySQL schema adhere to?',
      a: 'The database is in Third Normal Form (3NF) and Boyce-Codd Normal Form (BCNF). All attributes are atomic (1NF), all non-key attributes are fully functionally dependent on primary keys with no partial dependencies (2NF), and there are no transitive dependencies (3NF). Junction tables like Student_Skills handle Many-to-Many relationships.',
    },
    {
      q: 'How does the platform ensure transaction integrity and ACID compliance?',
      a: 'Financial operations such as session completion and payout withdrawals are wrapped inside MySQL InnoDB transactions (START TRANSACTION ... COMMIT / ROLLBACK) using stored procedures and exit handlers. If any step fails (e.g. updating wallet balance), all changes are rolled back to prevent inconsistent wallet states.',
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
          <FileCode className="w-4 h-4" />
          <span>Documentation & Viva Preparation (Requirement 19)</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          REST API Docs & Local Setup Guide
        </h1>
        <p className="text-xs text-slate-500">
          Complete API specifications, Java Spring Boot & Node.js execution instructions, and viva defense Q&A.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('endpoints')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition ${
            activeTab === 'endpoints'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          REST API Endpoints ({API_ENDPOINTS.length})
        </button>
        <button
          onClick={() => setActiveTab('localrun')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition ${
            activeTab === 'localrun'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Local Run & Deployment Guide
        </button>
        <button
          onClick={() => setActiveTab('viva')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition ${
            activeTab === 'viva'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          College DBMS Viva Q&A Guide
        </button>
      </div>

      {/* Tab 1: API Endpoints */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          {API_ENDPOINTS.map((ep, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded font-mono ${
                    ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-xs font-bold text-slate-900">{ep.path}</span>
              </div>
              <p className="text-xs text-slate-600">{ep.desc}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
                <div className="p-3 bg-slate-950 text-slate-200 rounded-xl overflow-x-auto">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Request Payload</div>
                  <pre>{ep.requestBody}</pre>
                </div>
                <div className="p-3 bg-slate-950 text-emerald-400 rounded-xl overflow-x-auto">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Response JSON</div>
                  <pre>{ep.responseBody}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Local Run Guide */}
      {activeTab === 'localrun' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs text-slate-700">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">1. MySQL Database Initialization</h3>
            <p className="text-slate-600">
              Open MySQL Workbench or your terminal and execute the complete schema script:
            </p>
            <div className="p-3 bg-slate-950 text-emerald-400 rounded-xl font-mono text-xs">
              mysql -u root -p &lt; skillmate_mysql_schema.sql
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">2. Java Spring Boot Backend Setup (Optional Backend)</h3>
            <p className="text-slate-600">
              Configure <code>application.properties</code> with your MySQL credentials:
            </p>
            <div className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px]">
              spring.datasource.url=jdbc:mysql://localhost:3306/skillmate_db?useSSL=false&amp;serverTimezone=UTC<br />
              spring.datasource.username=root<br />
              spring.datasource.password=your_mysql_password<br />
              spring.jpa.hibernate.ddl-auto=update<br />
              spring.jpa.show-sql=true
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">3. Running the React Web Application</h3>
            <div className="p-3 bg-slate-950 text-emerald-400 rounded-xl font-mono text-xs">
              npm install<br />
              npm run dev
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Viva Questions */}
      {activeTab === 'viva' && (
        <div className="space-y-4">
          {VIVA_QUESTIONS.map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-blue-900 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] shrink-0 font-bold">
                  Q{idx + 1}
                </span>
                <span>{item.q}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-7">{item.a}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
