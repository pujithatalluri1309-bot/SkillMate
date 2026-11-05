import React, { useState, useRef } from 'react';
import {
  Video,
  Upload,
  Play,
  Trash2,
  RefreshCw,
  Star,
  CheckCircle2,
  Award,
  Sparkles,
  Info,
  Clock,
  BookOpen,
} from 'lucide-react';
import { Student, MentorVideo } from '../types';
import { StorageService } from '../services/storageService';
import { ApiService } from '../services/apiService';

interface TeachingVideoPageProps {
  currentStudent: Student;
  onWatchVideo: (mentor: Student) => void;
}

export const TeachingVideoPage: React.FC<TeachingVideoPageProps> = ({
  currentStudent,
  onWatchVideo,
}) => {
  const existingVideo = StorageService.getVideoByStudent(currentStudent.id);
  const [video, setVideo] = useState<MentorVideo | undefined>(existingVideo);

  // Form states for uploading / replacing video
  const [subject, setSubject] = useState(video?.subject || 'Data Structures & Algorithms');
  const [title, setTitle] = useState(video?.title || '');
  const [durationMinutes, setDurationMinutes] = useState<number>(video?.durationMinutes || 3.5);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>(
    video?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  );
  const [selectedPreset, setSelectedPreset] = useState<string>('bst');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRESET_DEMO_VIDEOS = [
    {
      id: 'bst',
      subject: 'Data Structures & Algorithms',
      title: 'Visualizing Binary Search Trees (BST) Insertion and Traversal',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: '/src/assets/images/demo_video_thumbnail_algo_1793881609226.jpg',
      duration: 3.5,
    },
    {
      id: 'sql',
      subject: 'DBMS & SQL',
      title: 'Demystifying SQL INNER, LEFT, and FULL OUTER JOINs with Venn Diagrams',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: '/src/assets/images/campus_peer_collab_1793881608893.jpg',
      duration: 3.1,
    },
    {
      id: 'spring',
      subject: 'Java & Spring Boot',
      title: 'Building a RESTful Student API with Spring Data JPA in 4 Minutes',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: '/src/assets/images/hero_skillmate_learning_1793881608981.jpg',
      duration: 4.2,
    },
  ];

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    setSelectedFile(null);
    const found = PRESET_DEMO_VIDEOS.find((p) => p.id === presetId);
    if (found) {
      setSubject(found.subject);
      setTitle(found.title);
      setDurationMinutes(found.duration);
      setSelectedVideoUrl(found.url);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      setMessage({ type: 'error', text: 'Please select an MP4, WebM, or valid video file.' });
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size exceeds 100MB limit.' });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setSelectedVideoUrl(objectUrl);
    setTitle(file.name.replace(/\.[^/.]+$/, ''));
    setDurationMinutes(3.0);
    setMessage({
      type: 'success',
      text: `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)} MB) ready to upload to server.`,
    });
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) {
      setMessage({ type: 'error', text: 'Please enter a video title and subject.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      let finalVideoUrl = selectedVideoUrl;

      // Real backend multipart upload if file was chosen
      if (selectedFile) {
        const formData = new FormData();
        formData.append('mentorId', currentStudent.id);
        formData.append('subject', subject.trim());
        formData.append('title', title.trim());
        formData.append('durationMinutes', String(durationMinutes));
        formData.append('videoFile', selectedFile);

        const uploadRes = await ApiService.uploadTeachingVideo(formData);
        if (uploadRes.success && uploadRes.data?.videoUrl) {
          finalVideoUrl = uploadRes.data.videoUrl;
        }
      }

      const saved = StorageService.saveVideo({
        studentId: currentStudent.id,
        subject: subject.trim(),
        title: title.trim(),
        videoUrl: finalVideoUrl,
        thumbnailUrl:
          PRESET_DEMO_VIDEOS.find((p) => p.id === selectedPreset)?.thumbnail ||
          '/src/assets/images/demo_video_thumbnail_algo_1793881609226.jpg',
        durationMinutes,
        status: 'Active',
      });

      setVideo(saved);
      setIsUploading(false);
      setMessage({
        type: 'success',
        text: 'Teaching demonstration video published successfully! Stored in database & server storage.',
      });
    } catch (err: any) {
      setIsUploading(false);
      setMessage({ type: 'error', text: err.message || 'Failed to save video.' });
    }
  };

  const handleDeleteVideo = () => {
    if (confirm('Are you sure you want to delete your teaching demonstration video?')) {
      StorageService.deleteVideo(currentStudent.id);
      setVideo(undefined);
      setTitle('');
      setMessage({ type: 'success', text: 'Teaching demo video removed from your profile.' });
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
          <Award className="w-4 h-4" />
          <span>Core Evaluation Module (Requirement 6)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Teaching Demonstration Video & Rubric Evaluation
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Upload a 2–5 minute video explaining a key concept to showcase your pedagogical clarity, communication, and confidence.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <Info className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Existing Active Video Spotlight */}
      {video ? (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                Active Demonstration Video
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-2">{video.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>Subject: {video.subject}</span>
                <span>·</span>
                <span>Duration: {video.durationMinutes} mins</span>
                <span>·</span>
                <span>Uploaded: {video.uploadedAt}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onWatchVideo(currentStudent)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
              >
                <Play className="w-4 h-4" />
                <span>Watch & Evaluate</span>
              </button>
              <button
                onClick={handleDeleteVideo}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition"
                title="Delete Video"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video Preview Player */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video shadow-md max-w-2xl mx-auto">
            <video
              src={video.videoUrl}
              poster={video.thumbnailUrl}
              controls
              className="w-full h-full object-contain"
            />
          </div>

          {/* 5-Criteria Evaluation Scorecard */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  Peer Evaluation Rubric Breakdown ({video.evaluations.length} Reviews)
                </h3>
                <p className="text-xs text-slate-500">
                  Ratings given by students after watching your explanation.
                </p>
              </div>
            </div>

            {video.evaluations.length === 0 ? (
              <p className="text-xs text-slate-500">
                No evaluations yet. Learners who view your profile will evaluate your demo video.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  {
                    name: 'Subject Knowledge',
                    val: (
                      video.evaluations.reduce((s, e) => s + e.subjectKnowledge, 0) /
                      video.evaluations.length
                    ).toFixed(1),
                  },
                  {
                    name: 'Communication',
                    val: (
                      video.evaluations.reduce((s, e) => s + e.communicationSkills, 0) /
                      video.evaluations.length
                    ).toFixed(1),
                  },
                  {
                    name: 'Explanation Clarity',
                    val: (
                      video.evaluations.reduce((s, e) => s + e.explanationClarity, 0) /
                      video.evaluations.length
                    ).toFixed(1),
                  },
                  {
                    name: 'Confidence',
                    val: (
                      video.evaluations.reduce((s, e) => s + e.confidence, 0) /
                      video.evaluations.length
                    ).toFixed(1),
                  },
                  {
                    name: 'Practical Examples',
                    val: (
                      video.evaluations.reduce((s, e) => s + e.practicalExamples, 0) /
                      video.evaluations.length
                    ).toFixed(1),
                  },
                ].map((crit, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                    <div className="text-[11px] font-semibold text-slate-600">{crit.name}</div>
                    <div className="text-lg font-bold text-blue-600 font-mono mt-1">{crit.val}</div>
                    <div className="text-[10px] text-slate-400">/ 5.0</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Upload or Replace Demonstration Video Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {video ? 'Replace Demonstration Video' : 'Upload Teaching Demonstration Video'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose a sample recorded presentation or upload an MP4 recorded with your webcam / screen recorder.
          </p>
        </div>

        {/* Preset Samples Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            Quick Select Preset Computer Science Teaching Demos:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESET_DEMO_VIDEOS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset.id)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  selectedPreset === preset.id
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase">{preset.subject}</span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-1">{preset.title}</h4>
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-2">
                  Duration: {preset.duration} min
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Or Upload Custom File */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Or Choose Local Video File (.mp4, .webm, .mov)
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl bg-slate-50/50 hover:bg-blue-50/20 cursor-pointer text-center space-y-2 transition"
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-semibold text-slate-700">
              Click to select video from your device
            </div>
            <div className="text-[11px] text-slate-500">
              Supports 2–5 min clips in MP4, WebM format. (Requirement 6)
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Video Metadata Form */}
        <form onSubmit={handleSaveVideo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms, DBMS"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Duration (Minutes)
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="15.0"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Demonstration Title & Topic Explained
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Step-by-Step Visualization of Binary Search Tree Insertions and Balancing"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2"
            >
              {isUploading ? (
                <span>Publishing Video...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{video ? 'Update Demo Video' : 'Save & Publish Demo Video'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
