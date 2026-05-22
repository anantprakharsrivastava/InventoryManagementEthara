import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Users, Kanban, Orbit } from 'lucide-react';
import Button from '../components/ui/Button';
import Logo from '../components/brand/Logo';

const features = [
  { icon: Kanban, title: 'Velocity Boards', desc: 'Drag tasks through cinematic columns — not a clone of Trello.', accent: '#ff5e3a' },
  { icon: BarChart3, title: 'Signal Analytics', desc: 'Read team momentum like a cockpit, not a spreadsheet.', accent: '#f4d35e' },
  { icon: Users, title: 'Crew Sync', desc: 'Real-time pulse chat and alerts built for makers.', accent: '#3dffa8' },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="app-mesh" />
      <div className="app-grid fixed inset-0 opacity-30 pointer-events-none" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-14">
        <Logo size="md" showTagline />
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-[var(--color-muted)] hover:text-white transition-colors">
            Enter
          </Link>
          <Link to="/register">
            <Button icon={ArrowRight}>Launch Workspace</Button>
          </Link>
        </div>
      </nav>

      <section className="relative z-10 grid lg:grid-cols-2 gap-12 px-6 pt-12 pb-24 lg:px-14 lg:pt-20 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <span className="pill-tag inline-flex items-center gap-2 mb-8">
            <Orbit className="h-3 w-3" /> Not another purple SaaS
          </span>
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] text-white lg:text-7xl">
            Command your
            <br />
            <span className="gradient-text">work universe</span>
          </h1>
          <p className="mt-8 max-w-lg text-lg text-[var(--color-muted)] leading-relaxed">
            Ethara is a dark, editorial project OS — built for teams who refuse to look like everyone else on LinkedIn.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/register">
              <Button size="lg" icon={ArrowRight}>Start Free</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">Sign In</Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative"
        >
          <div className="eth-card-glow p-8 lg:p-10">
            <div className="grid grid-cols-2 gap-4">
              {[
                { v: '24', l: 'Active Ops', c: '#ff5e3a' },
                { v: '156', l: 'Tasks in flight', c: '#3dffa8' },
                { v: '89%', l: 'Ship rate', c: '#f4d35e' },
                { v: '0', l: 'Boring UI', c: '#fff' },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-2xl border border-white/[0.06] p-5"
                  style={{ background: `linear-gradient(145deg, ${s.c}12, transparent)` }}
                >
                  <p className="font-display text-3xl font-bold" style={{ color: s.c }}>{s.v}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-[var(--color-muted)]">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <div
            className="absolute -z-10 -inset-8 rounded-full blur-3xl opacity-40"
            style={{ background: 'radial-gradient(circle, #ff5e3a, transparent 70%)' }}
          />
        </motion.div>
      </section>

      <section className="relative z-10 px-6 pb-24 lg:px-14">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-muted)] mb-10">
          Why teams switch
        </p>
        <div className="mx-auto max-w-6xl grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, accent }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="eth-card-hover p-8"
            >
              <div
                className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border"
                style={{ borderColor: `${accent}40`, background: `${accent}15` }}
              >
                <Icon className="h-7 w-7" style={{ color: accent }} />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] py-8 text-center text-xs text-[var(--color-muted)]">
        © 2026 Ethara — Designed to stand apart.
      </footer>
    </div>
  );
}
