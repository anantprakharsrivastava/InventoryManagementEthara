import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Users, AtSign } from 'lucide-react';
import { projectAPI, chatAPI } from '../services/api';
import { getSocket, joinProject, leaveProject } from '../services/socket';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const MENTION_DIRECTORY = [
  { name: 'Mahanaryaman Rao Scindia', role: 'CEO' },
  { name: 'Maharyaman Scindia', role: 'CEO' },
  { name: 'Suryansh Rana', role: 'CEO' },
  { name: 'Shubham Garg', role: 'CFO' },
  { name: 'Shubham Goryam', role: 'Manage-Growth' },
  { name: 'Vanshikha Juneja', role: 'Project Lead' },
  { name: 'Pujita Bhuyan', role: 'HR' },
  { name: 'Usha Pandey', role: 'HR' },
];

export default function Chat() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [mention, setMention] = useState({ open: false, query: '', start: -1, highlight: 0 });
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  const filteredMentions = mention.open
    ? MENTION_DIRECTORY.filter((m) => {
        if (!mention.query) return true;
        const q = mention.query.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q)
        );
      })
    : [];

  const activeProject = projects.find((p) => p._id === selectedProject);

  useEffect(() => {
    projectAPI.getAll({ limit: 50 }).then((res) => {
      const list = res.data.data || [];
      setProjects(list);

      if (list.length === 0) {
        setSelectedProject('');
        return;
      }

      setSelectedProject((current) => {
        if (current && list.some((p) => p._id === current)) return current;
        return list[0]._id;
      });
    });
  }, []);

  const fetchMessages = async (projectId) => {
    setLoading(true);
    try {
      const { data } = await chatAPI.getMessages(projectId);
      setMessages(data.data);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedProject) return;
    fetchMessages(selectedProject);
    joinProject(selectedProject);

    const socket = getSocket();
    socket?.on('chat:message', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      leaveProject(selectedProject);
      socket?.off('chat:message');
    };
  }, [selectedProject]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const closeMentions = () => setMention({ open: false, query: '', start: -1, highlight: 0 });

  const handleContentChange = (e) => {
    const value = e.target.value;
    const caret = e.target.selectionStart || value.length;
    setContent(value);

    const before = value.slice(0, caret);
    const atIdx = before.lastIndexOf('@');

    if (atIdx === -1) {
      closeMentions();
      return;
    }

    const charBefore = atIdx > 0 ? before[atIdx - 1] : '';
    const validTrigger = atIdx === 0 || /\s/.test(charBefore);
    const query = before.slice(atIdx + 1);

    if (!validTrigger || /\s/.test(query)) {
      closeMentions();
      return;
    }

    setMention({ open: true, query, start: atIdx, highlight: 0 });
  };

  const insertMention = (person) => {
    if (mention.start < 0) {
      closeMentions();
      return;
    }
    const caret = inputRef.current?.selectionStart ?? content.length;
    const before = content.slice(0, mention.start);
    const after = content.slice(caret);
    const tag = `@${person.name.replace(/\s+/g, '_')} `;
    const next = `${before}${tag}${after}`;
    setContent(next);
    closeMentions();

    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        const pos = before.length + tag.length;
        el.focus();
        el.setSelectionRange(pos, pos);
      }
    });
  };

  const handleInputKeyDown = (e) => {
    if (!mention.open || filteredMentions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMention((m) => ({ ...m, highlight: (m.highlight + 1) % filteredMentions.length }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMention((m) => ({
        ...m,
        highlight: (m.highlight - 1 + filteredMentions.length) % filteredMentions.length,
      }));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertMention(filteredMentions[mention.highlight]);
    } else if (e.key === 'Escape') {
      closeMentions();
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (mention.open) {
      if (filteredMentions[mention.highlight]) {
        insertMention(filteredMentions[mention.highlight]);
      }
      return;
    }
    if (!content.trim() || !selectedProject) return;

    try {
      const { data } = await chatAPI.sendMessage(selectedProject, content.trim());
      setMessages((prev) => {
        if (prev.some((m) => m._id === data.data._id)) return prev;
        return [...prev, data.data];
      });
      setContent('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="space-y-5 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <span className="pill-tag mb-2 inline-block">04 — Crew</span>
        <h1 className="font-display text-3xl font-extrabold text-white">Team Chat</h1>
        <p className="text-[var(--color-muted)] mt-1">Real-time messaging per project</p>
      </div>

      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        className="input-eth max-w-md text-sm"
      >
        {projects.length === 0 ? (
          <option value="" className="bg-slate-900">No projects yet</option>
        ) : (
          projects.map((p) => (
            <option key={p._id} value={p._id} className="bg-slate-900">{p.title}</option>
          ))
        )}
      </select>

      {!selectedProject ? (
        <EmptyState
          icon={MessageSquare}
          title="Select a project"
          description="Choose a project to start chatting with your team"
        />
      ) : (
        <div className="flex flex-1 flex-col eth-card-glow rounded-2xl overflow-hidden min-h-0 border border-white/[0.08]">
          {/* Chat box header — marked area */}
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-5 py-4 bg-gradient-to-r from-[#8b5cf6]/12 via-[#050508] to-[#06b6d4]/12">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#8b5cf6]/30"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(6,182,212,0.15))',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)',
                }}
              >
                <MessageSquare className="h-5 w-5 text-[#a78bfa]" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold tracking-tight text-white">Chat</h2>
                <p className="truncate text-xs text-[var(--color-muted)]">
                  {activeProject?.title || 'Project room'}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                <Users className="h-3.5 w-3.5" />
                {activeProject?.members?.length || 1} online
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-[#3dffa8]/30 bg-[#3dffa8]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3dffa8]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3dffa8] animate-pulse" />
                Live
              </span>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-5 space-y-4 min-h-0"
            style={{
              background:
                'radial-gradient(ellipse at top, rgba(139,92,246,0.06) 0%, transparent 50%), #050508',
            }}
          >
            {loading && (
              <div className="flex justify-center py-8">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#8b5cf6]/30 border-t-[#8b5cf6]" />
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8b5cf6]/15 border border-[#8b5cf6]/25">
                  <MessageSquare className="h-7 w-7 text-[#a78bfa]" />
                </div>
                <p className="font-display font-semibold text-white">No messages yet</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">Say hi to your team below</p>
              </div>
            )}

            {messages.map((msg, i) => {
              const isOwn = msg.sender?._id === user?._id;
              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  {!isOwn && (
                    <Avatar src={msg.sender?.avatar} name={msg.sender?.name} size="sm" className="mt-1 shrink-0" />
                  )}
                  <div className={`max-w-[75%] sm:max-w-[65%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`flex items-center gap-2 mb-1 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs font-semibold text-white/90">{msg.sender?.name}</span>
                      <span className="text-[10px] text-[var(--color-muted)]">{formatDate(msg.createdAt)}</span>
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-lg ${
                        isOwn
                          ? 'rounded-br-md text-[#050508] font-medium'
                          : 'rounded-bl-md border border-white/[0.08] text-slate-100 bg-white/[0.06]'
                      }`}
                      style={
                        isOwn
                          ? {
                              background: 'linear-gradient(135deg, #f4d35e 0%, #ff8a65 50%, #ff5e3a 100%)',
                              boxShadow: '0 4px 20px rgba(255, 94, 58, 0.25)',
                            }
                          : undefined
                      }
                    >
                      {msg.content}
                    </div>
                  </div>
                  {isOwn && (
                    <Avatar src={msg.sender?.avatar} name={msg.sender?.name} size="sm" className="mt-1 shrink-0" />
                  )}
                </motion.div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Compose */}
          <form
            onSubmit={handleSend}
            className="relative border-t border-white/[0.08] p-4 bg-black/40 backdrop-blur-sm"
          >
            <AnimatePresence>
              {mention.open && filteredMentions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-full left-4 right-4 mb-2 z-30 max-h-72 overflow-y-auto rounded-2xl border border-[#8b5cf6]/25 bg-[#0a0a14]/98 backdrop-blur-xl shadow-2xl"
                  style={{ boxShadow: '0 20px 60px -10px rgba(139, 92, 246, 0.4)' }}
                >
                  <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
                    <AtSign className="h-3.5 w-3.5 text-[#a78bfa]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                      Mention a person
                    </span>
                  </div>
                  <ul className="py-1">
                    {filteredMentions.map((person, idx) => {
                      const isActive = idx === mention.highlight;
                      return (
                        <li key={`${person.name}-${idx}`}>
                          <button
                            type="button"
                            onMouseEnter={() => setMention((m) => ({ ...m, highlight: idx }))}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              insertMention(person);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isActive ? 'bg-[#8b5cf6]/15' : 'hover:bg-white/[0.04]'
                            }`}
                          >
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white"
                              style={{
                                background:
                                  'linear-gradient(135deg, rgba(139,92,246,0.5), rgba(6,182,212,0.5))',
                              }}
                            >
                              {person.name
                                .split(' ')
                                .map((p) => p[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-white">{person.name}</p>
                              <p className="truncate text-[11px] text-[var(--color-muted)]">{person.role}</p>
                            </div>
                            <span className="hidden sm:block text-[10px] text-[var(--color-muted)] font-mono">
                              @{person.name.split(' ')[0].toLowerCase()}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="border-t border-white/[0.06] px-4 py-2 text-[10px] text-[var(--color-muted)]">
                    ↑↓ navigate · Enter to insert · Esc to close
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 items-end">
              <div className="flex-1 rounded-2xl border border-white/[0.1] bg-white/[0.04] focus-within:border-[#8b5cf6]/40 focus-within:ring-2 focus-within:ring-[#8b5cf6]/15 transition-all">
                <input
                  ref={inputRef}
                  value={content}
                  onChange={handleContentChange}
                  onKeyDown={handleInputKeyDown}
                  onBlur={() => setTimeout(closeMentions, 120)}
                  placeholder="Type a message... ( @ to mention )"
                  className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--color-muted)]"
                />
              </div>
              <Button
                type="submit"
                icon={Send}
                disabled={!content.trim()}
                className="shrink-0 h-[46px] w-[46px] !p-0 rounded-2xl"
                aria-label="Send message"
              />
            </div>
            <p className="mt-2 text-center text-[10px] text-[var(--color-muted)]">
              Press Enter to send · Type @ to mention team
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
