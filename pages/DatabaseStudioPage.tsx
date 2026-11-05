import React, { useState } from 'react';
import {
  Database,
  Copy,
  Download,
  CheckCircle2,
  Table as TableIcon,
  Layers,
  Code,
  Play,
  Key,
  ShieldCheck,
} from 'lucide-react';
import { MYSQL_SCHEMA_SQL, ER_DIAGRAM_TABLES } from '../data/mysqlSchema';

export const DatabaseStudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'script' | 'er' | 'queries'>('script');
  const [copied, setCopied] = useState(false);
  const [activeQueryIndex, setActiveQueryIndex] = useState(0);

  const handleCopy = () => {
    navigator.clipboard.writeText(MYSQL_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([MYSQL_SCHEMA_SQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skillmate_mysql_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const DEMO_QUERIES = [
    {
      title: '1. Multi-Table JOIN with WHERE & ORDER BY',
      concept: 'INNER JOIN, LEFT JOIN, Aggregation, and Sorting',
      sql: `SELECT 
    s.student_id,
    s.full_name AS mentor_name,
    s.department,
    sk.skill_name,
    ssk.skill_level,
    ssk.price_per_session,
    COALESCE(ROUND(AVG(f.overall_rating), 1), 5.0) AS avg_rating
FROM Students s
JOIN Student_Skills ssk ON s.student_id = ssk.student_id
JOIN Skills sk ON ssk.skill_id = sk.skill_id
LEFT JOIN Feedback f ON s.student_id = f.mentor_id
WHERE sk.skill_name LIKE '%DBMS%' AND ssk.price_per_session <= 200
GROUP BY s.student_id, s.full_name, s.department, sk.skill_name, ssk.skill_level, ssk.price_per_session
ORDER BY avg_rating DESC, ssk.price_per_session ASC;`,
      resultCols: ['student_id', 'mentor_name', 'department', 'skill_name', 'skill_level', 'price_per_session', 'avg_rating'],
      resultRows: [
        ['STU-2024-001', 'Pujitha Talluri', 'Computer Science', 'DBMS & SQL', 'Advanced', '₹180.00', '5.0 ★'],
        ['STU-2024-003', 'Ananya Verma', 'Computer Science', 'MySQL & Query Optimization', 'Advanced', '₹150.00', '5.0 ★'],
      ],
      explanation: 'Finds top-rated mentors offering DBMS-related courses priced at or under ₹200/session, joined across Students, Student_Skills, Skills and Feedback tables.',
    },
    {
      title: '2. GROUP BY with HAVING & Aggregate Functions',
      concept: 'GROUP BY, HAVING Filter, SUM(), COUNT()',
      sql: `SELECT 
    p.mentor_id,
    s.full_name AS mentor_name,
    COUNT(p.payment_id) AS total_paid_sessions,
    SUM(p.amount) AS total_gross_revenue,
    SUM(p.platform_fee) AS platform_fees_collected,
    SUM(p.mentor_earnings) AS mentor_net_payout
FROM Payments p
JOIN Students s ON p.mentor_id = s.student_id
WHERE p.payment_status = 'Success'
GROUP BY p.mentor_id, s.full_name
HAVING COUNT(p.payment_id) >= 1 AND SUM(p.mentor_earnings) >= 150
ORDER BY mentor_net_payout DESC;`,
      resultCols: ['mentor_id', 'mentor_name', 'total_paid_sessions', 'total_gross_revenue', 'platform_fees', 'mentor_net_payout'],
      resultRows: [
        ['STU-2024-001', 'Pujitha Talluri', '2', '₹380.00', '₹38.00', '₹342.00'],
        ['STU-2024-002', 'Rahul Sharma', '1', '₹250.00', '₹25.00', '₹225.00'],
      ],
      explanation: 'Demonstrates SQL aggregation and HAVING clause filtering to compute mentor revenue metrics across all successful paid learning sessions.',
    },
    {
      title: '3. Correlated Subquery & Rubric Comparison',
      concept: 'Correlated Subqueries & Nested SELECT in WHERE',
      sql: `SELECT 
    v.video_id,
    v.title AS video_title,
    s.full_name AS mentor_name,
    (SELECT ROUND(AVG(ve.subject_knowledge + ve.explanation_clarity)/2, 2)
     FROM Video_Evaluations ve WHERE ve.video_id = v.video_id) AS rubric_score
FROM Mentor_Videos v
JOIN Students s ON v.student_id = s.student_id
WHERE (SELECT AVG(subject_knowledge) FROM Video_Evaluations WHERE video_id = v.video_id) >= (
    SELECT AVG(subject_knowledge) FROM Video_Evaluations
);`,
      resultCols: ['video_id', 'video_title', 'mentor_name', 'rubric_score'],
      resultRows: [
        ['1', 'Visualizing Binary Search Trees (BST)', 'Pujitha Talluri', '5.00 / 5.0'],
        ['2', 'Building RESTful Student API in Spring Boot', 'Rahul Sharma', '5.00 / 5.0'],
      ],
      explanation: 'Demonstrates advanced correlated subqueries that identify mentors whose demo video teaching evaluation score exceeds the campus-wide average.',
    },
    {
      title: '4. ACID Transaction Stored Procedure',
      concept: 'START TRANSACTION, COMMIT, ROLLBACK, Stored Procedure',
      sql: `CALL sp_complete_session_and_credit_earnings(201, @status_message);
SELECT @status_message;`,
      resultCols: ['@status_message'],
      resultRows: [
        ['SUCCESS: Session completed and earnings credited.'],
      ],
      explanation: 'Demonstrates atomic multi-table updates ensuring that session status updates and mentor wallet balance credits succeed together or roll back cleanly.',
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <Database className="w-4 h-4" />
            <span>Database Systems Presentation Suite (Requirement 14)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            MySQL Schema, ER Diagram & Queries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Official relational database deliverable with 12 normalized tables, foreign keys, stored procedures, and triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied SQL!' : 'Copy Script'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Download .sql Script</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('script')}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'script'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Full MySQL DDL Script</span>
        </button>

        <button
          onClick={() => setActiveTab('er')}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'er'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Interactive ER Diagram & Tables (12 Entities)</span>
        </button>

        <button
          onClick={() => setActiveTab('queries')}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'queries'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>DBMS Query Demonstrations (JOIN, GROUP BY, Subqueries)</span>
        </button>
      </div>

      {/* Tab 1: MySQL Schema Script */}
      {activeTab === 'script' && (
        <div className="bg-slate-950 rounded-2xl p-4 sm:p-6 text-slate-100 font-mono text-xs overflow-hidden shadow-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
            <span>skillmate_db.sql (MySQL 8.0+ Dialect)</span>
            <span>UTF-8 · InnoDB Engine · ACID Compliant</span>
          </div>
          <pre className="overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed text-blue-200">
            {MYSQL_SCHEMA_SQL}
          </pre>
        </div>
      )}

      {/* Tab 2: ER Diagram */}
      {activeTab === 'er' && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <span>
              <strong>Relational Architecture:</strong> 3NF Normalized schema with Primary Keys (PK), Foreign Keys (FK), and Check Constraints mapping 1-to-Many and Many-to-Many student learning relationships.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ER_DIAGRAM_TABLES.map((tbl) => (
              <div
                key={tbl.name}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-blue-400 transition"
              >
                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-xs font-mono">{tbl.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">PK: {tbl.primaryKey}</span>
                </div>

                <div className="p-3 text-[11px] text-slate-500 border-b border-slate-100 italic">
                  {tbl.description}
                </div>

                <div className="p-3 space-y-1.5 text-xs">
                  {tbl.columns.map((col: any) => (
                    <div
                      key={col.name}
                      className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-1.5 font-mono">
                        {col.isPk ? (
                          <Key className="w-3 h-3 text-amber-500" />
                        ) : col.isFk ? (
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1 rounded">FK</span>
                        ) : null}
                        <span className={col.isPk ? 'font-bold text-slate-900' : 'text-slate-700'}>
                          {col.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{col.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Demo Queries */}
      {activeTab === 'queries' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {DEMO_QUERIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setActiveQueryIndex(idx)}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                  activeQueryIndex === idx
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                {q.title}
              </button>
            ))}
          </div>

          {/* Active Query Display */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider">
                Concept: {DEMO_QUERIES[activeQueryIndex].concept}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {DEMO_QUERIES[activeQueryIndex].title}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {DEMO_QUERIES[activeQueryIndex].explanation}
              </p>
            </div>

            {/* SQL Code Box */}
            <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
              <pre>{DEMO_QUERIES[activeQueryIndex].sql}</pre>
            </div>

            {/* Output Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Query Result Set (Live Preview):
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                    <tr>
                      {DEMO_QUERIES[activeQueryIndex].resultCols.map((col) => (
                        <th key={col} className="px-3.5 py-2.5 font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {DEMO_QUERIES[activeQueryIndex].resultRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        {row.map((val, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-2 text-slate-800">
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
