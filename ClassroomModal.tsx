import React, { useState, useEffect } from 'react';
import {
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  MessageSquare,
  CheckCircle,
  Clock,
  Send,
  Code,
  FileText,
  User,
} from 'lucide-react';
import { LearningSession, Student } from '../types';
import { StorageService } from '../services/storageService';

interface ClassroomModalProps {
  session: LearningSession;
  currentStudent: Student;
  onClose: () => void;
  onSessionCompleted: () => void;
}

export const ClassroomModal: React.FC<ClassroomModalProps> = ({
  session,
  currentStudent,
  onClose,
  onSessionCompleted,
}) => {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [activeTool, setActiveTool] = useState<'editor' | 'notes'>('editor');
  const [codeContent, setCodeContent] = useState<string>(
    `// Topic: ${session.topic}\n// Subject: ${session.subject}\n\nfunction solveBinaryTree(root) {\n  if (!root) return null;\n  console.log("Visiting Node:", root.val);\n  return solveBinaryTree(root.left) + solveBinaryTree(root.right);\n}`
  );
  const [notesContent, setNotesContent] = useState<string>(
    `# Peer Learning Notes - ${session.subject}\n- Mentor: ${session.mentorName}\n- Learner: ${session.learnerName}\n- Key Questions:\n  1. Reviewing BST node insertion and balancing\n  2. Handling edge cases for duplicate values\n  3. Time complexity: O(log N) average, O(N) worst-case`
  );

  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: session.mentorName,
      text: `Hello ${session.learnerName}! Let's start with your questions on ${session.subject}.`,
      time: '17:01',
    },
    {
      sender: session.learnerName,
      text: `Hi ${session.mentorName}! Yes, I brought the problem code we can walk through.`,
      time: '17:02',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [secondsElapsed, setSecondsElapsed] = useState(140);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setChatMessages([
      ...chatMessages,
      {
        sender: currentStudent.fullName,
        text: inputMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputMessage('');
  };

  const handleCompleteSession = () => {
    if (confirm('Mark this peer session as completed? Net earnings will be credited to mentor wallet and feedback will be unlocked.')) {
      StorageService.completeSession(session.id);
      onSessionCompleted();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full h-[94vh] flex flex-col overflow-hidden border border-slate-800 text-white animate-in fade-in duration-150">
        {/* Top bar */}
        <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              LIVE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Virtual Peer Classroom
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {formatTime(secondsElapsed)} / 60:00
                </span>
              </div>
              <h3 className="text-sm font-bold text-white truncate max-w-lg">
                {session.subject}: {session.topic}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCompleteSession}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 transition"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Session & Credit</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left: Video Streams (4 cols) */}
          <div className="lg:col-span-4 border-r border-slate-800 p-4 flex flex-col gap-4 bg-slate-950/60 overflow-y-auto">
            {/* Mentor Cam Frame */}
            <div className="relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 aspect-video flex items-center justify-center">
              {camOn ? (
                <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                    alt="Mentor feed"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
              ) : (
                <div className="text-center p-4">
                  <User className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Camera turned off</p>
                </div>
              )}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[11px] font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {session.mentorName} (Mentor)
              </div>
            </div>

            {/* Learner Cam Frame */}
            <div className="relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 aspect-video flex items-center justify-center">
              <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80"
                  alt="Learner feed"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[11px] font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {session.learnerName} (Learner)
              </div>
            </div>

            {/* In-Call Controls */}
            <div className="flex items-center justify-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-2.5 rounded-lg transition ${
                  micOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
                title={micOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setCamOn(!camOn)}
                className={`p-2.5 rounded-lg transition ${
                  camOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
                title={camOn ? 'Stop Camera' : 'Start Camera'}
              >
                {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setScreenShare(!screenShare)}
                className={`p-2.5 rounded-lg transition ${
                  screenShare ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
                title="Screen Share Simulation"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Box in Sidebar */}
            <div className="flex-1 flex flex-col min-h-[160px] bg-slate-900 rounded-xl border border-slate-800 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                Classroom Live Chat
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs mb-2">
                {chatMessages.map((msg, i) => (
                  <div key={i} className="p-2 rounded bg-slate-800/80">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                      <span className="font-semibold text-blue-300">{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="text-slate-200">{msg.text}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-1.5">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg text-xs px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Right: Collaborative Stage (8 cols) */}
          <div className="lg:col-span-8 flex flex-col bg-slate-900">
            {/* Stage Tabs */}
            <div className="px-6 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTool('editor')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                    activeTool === 'editor'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  Shared Code Workspace
                </button>
                <button
                  onClick={() => setActiveTool('notes')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                    activeTool === 'notes'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Whiteboard & Notes
                </button>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Synced Peer Canvas</span>
              </div>
            </div>

            {/* Stage Canvas */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
              {activeTool === 'editor' ? (
                <div className="flex-1 flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
                    <span>solution.js · Live Code Editor</span>
                    <button
                      onClick={() => alert('Code syntax verified! Simulation output logged.')}
                      className="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white font-sans text-xs rounded font-medium"
                    >
                      Run Code
                    </button>
                  </div>
                  <textarea
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    className="flex-1 p-4 bg-slate-950 text-emerald-400 resize-none focus:outline-none font-mono text-xs leading-relaxed"
                    spellCheck={false}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-xs">
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Classroom Notes & Explanations</span>
                    <span>Auto-Saved to Student Learning History</span>
                  </div>
                  <textarea
                    value={notesContent}
                    onChange={(e) => setNotesContent(e.target.value)}
                    className="flex-1 p-4 bg-slate-950 text-slate-200 resize-none focus:outline-none font-mono text-xs leading-relaxed"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
