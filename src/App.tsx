import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import githubLogo from './assets/github.svg';
import linkedinLogo from './assets/linkedin.svg';
import { posts, type Post } from './posts';
import { workProjects } from './workProjects';
import './projects/App.css';

/* ── Color palette for timeline accents ──────────────────────────────── */
const ACCENT = {
  purple: {
    beam: 'rgba(139,92,246,0.85)',  trace: 'rgba(139,92,246,0.12)',  shadow: 'rgba(139,92,246,0.6)',
    dot: '#8b5cf6', glow: 'rgba(139,92,246,0.5)',
    cardBg: 'rgba(139,92,246,0.05)', cardBorder: 'rgba(139,92,246,0.15)',
    cardHover: 'rgba(139,92,246,0.45)', cardShadow: 'rgba(139,92,246,0.1)',
    period: 'rgba(139,92,246,0.6)', role: '#c4b5fd',
  },
  cyan: {
    beam: 'rgba(6,182,212,0.85)',   trace: 'rgba(6,182,212,0.12)',   shadow: 'rgba(6,182,212,0.6)',
    dot: '#06b6d4', glow: 'rgba(6,182,212,0.5)',
    cardBg: 'rgba(6,182,212,0.05)', cardBorder: 'rgba(6,182,212,0.15)',
    cardHover: 'rgba(6,182,212,0.45)', cardShadow: 'rgba(6,182,212,0.1)',
    period: 'rgba(6,182,212,0.6)', role: '#a5f3fc',
  },
  green: {
    beam: 'rgba(16,185,129,0.85)',  trace: 'rgba(16,185,129,0.12)',  shadow: 'rgba(16,185,129,0.6)',
    dot: '#10b981', glow: 'rgba(16,185,129,0.5)',
    cardBg: 'rgba(16,185,129,0.05)', cardBorder: 'rgba(16,185,129,0.15)',
    cardHover: 'rgba(16,185,129,0.45)', cardShadow: 'rgba(16,185,129,0.1)',
    period: 'rgba(16,185,129,0.6)', role: '#6ee7b7',
  },
  amber: {
    beam: 'rgba(245,158,11,0.85)',  trace: 'rgba(245,158,11,0.12)',  shadow: 'rgba(245,158,11,0.6)',
    dot: '#f59e0b', glow: 'rgba(245,158,11,0.5)',
    cardBg: '', cardBorder: '', cardHover: '', cardShadow: '', period: '', role: '',
  },
} as const;
type AccentKey = keyof typeof ACCENT;

/* ── Content ─────────────────────────────────────────────────────────── */
const CONTENT = {
  nav: { about: 'About', posts: 'Posts', experience: 'Experience', side: 'Side Projects', education: 'Education', contact: 'Contact' },
  blog: { title: 'Posts', readMore: 'Read →', minRead: 'min read', back: '← Back to posts' },
  hero: { cta1: 'Learn more', cta2: 'My projects' },
  about: {
    title: 'About me',
    p1: <p>I'm a <strong>Computer Engineer</strong> specialising in <strong>cloud architecture</strong>, <strong>generative AI</strong>, and solution design. I build complex systems, from multi-tenant SaaS platforms to AI pipelines for enterprise clients.</p>,
    p2: <p>I work at the intersection of cloud engineering, LLMs, and software architecture. I enjoy turning emerging technologies into tangible products: systems that scale, integrate, and deliver real business value.</p>,
    p3: <p>I hold a Master's in Computer Engineering with a focus on <strong>Cybersecurity</strong> from Politecnico di Torino. I currently lead innovation initiatives and define the technical direction for AI and cloud projects. In 2022 I placed <strong>2nd at the Encode × Algorand Hackathon</strong>, building a decentralised crowdfunding platform on the Algorand blockchain.</p>,
    tags: ['Solution Architecture', 'Cloud & Azure', 'AI / LLM', 'Data Engineering'],
  },
  projects: {
    sideTitle: 'Side Projects', linkLabel: 'View on GitHub →',
    items: [
      { title: 'cleanux', description: 'AI-driven Linux server monitor and cleanup tool. Analyses system state and intelligently suggests optimisation actions.', tags: ['Shell', 'AI', 'Linux'], link: 'https://github.com/marcobarca/cleanux' },
      { title: 'AttackModeler', description: "Framework to model and analyse attacker behaviour using GPT. Extracts patterns from CTF reports to build a structured representation of attacks. Built for my Master's thesis.", tags: ['Python', 'AI', 'Cybersecurity'], link: 'https://github.com/marcobarca/AttackModeler' },
      { title: 'microhttp', description: 'Minimalist HTTP server written in pure C with no external dependencies. Educational project to understand how web servers work at a low level.', tags: ['C', 'Systems', 'Networking'], link: 'https://github.com/marcobarca/microhttp' },
      { title: 'Algorand Crowdfunding', description: 'Decentralised crowdfunding platform on Algorand Blockchain. Built during the Encode x Algorand Hackathon (2nd place winner).', tags: ['JavaScript', 'Blockchain', 'Algorand'], link: 'https://github.com/marcobarca/Algorand_Crowdfunding_platform' },
      { title: 'Public Transport System', description: 'Web-based information system for managing ticketing and automatic vehicle access control for a public transport company.', tags: ['Kotlin', 'Web', 'Backend'], link: 'https://github.com/marcobarca/Public-transport-company-web-based-information-system' },
      { title: 'EZShop', description: 'Application for integrated management of sales, inventory, supply orders, and customer accounting.', tags: ['Java'], link: 'https://github.com/marcobarca/EZShop' },
      { title: 'LandTiger ARM Game', description: 'Game developed in C on an LPC1768 LandTiger ARM board. Embedded systems project with direct hardware management.', tags: ['C', 'Embedded', 'ARM'], link: 'https://github.com/marcobarca/LandTiger-ARM-board-game' },
      { title: 'Crucipuzzle', description: 'Online crossword puzzle game built with React. Interactive interface with client-side game logic.', tags: ['JavaScript', 'React'], link: 'https://github.com/marcobarca/Crucipuzzle' },
    ],
  },
  experience: {
    title: 'Experience',
    careerLabel: 'Career', workProjectsLabel: 'Projects',
    badgeWork: 'Work', badgeEdu: 'Education', badgeAward: '🏆 Award',
    items: [
      { role: 'Solution Architect & Tech Advisor', company: 'V3 Advisory', companyUrl: 'https://v3-advisory.com', period: 'Jan 2026 — Present', type: 'work' as const, accent: 'purple' as AccentKey, description: <ul><li>Designing end-to-end architecture of a B2C SaaS platform for live online language lessons for <a href="https://languageboost.it/" target="_blank" rel="noreferrer" className="project-link">LanguageBoost</a>: Spring Boot microservices, Azure Communication Services, Azure AD B2C, Blob Storage and CDN</li><li>Technical governance: API definition, security model, and incremental MVP delivery plan scaling to 100k users and 50 simultaneous live sessions</li></ul> },
      { role: 'Cloud Solutions Engineer', company: 'NPO Torino s.r.l.', companyUrl: undefined as string | undefined, period: 'Feb 2024 — Present', type: 'work' as const, accent: 'green' as AccentKey, description: <ul><li>Led the Innovation Team driving AI, cloud, and data engineering initiatives from pre-sales and opportunity assessment through architecture, PoC delivery, and production rollout</li><li>Built an end-to-end ML pipeline for IT ticket intelligence at a global manufacturing enterprise: ServiceNow ingestion, semantic embeddings, UMAP, HDBSCAN, and Azure AI Foundry LLM orchestration for automated topic labelling and knowledge base generation</li><li>Designed and productised a multi-tenant SaaS platform automating telephone survey workflows: Azure Functions, Azure Speech, LangChain, RAG (Azure Cognitive Search), multilingual support (Azure Translator + neural TTS), Entra ID isolation, Azure Pipelines CI/CD</li><li>Delivered data pipeline and lakehouse architectures: Medallion on PostgreSQL, PySpark & Microsoft Fabric, ERP integrations (Zucchetti REST API, OAuth2)</li></ul> },
    ],
  },
  education: {
    title: 'Education',
    degreesLabel: 'Degrees & Credentials',
    certsLabel: 'Certifications',
    degrees: [
      { title: "MSc — Computer Engineering, Cybersecurity", institution: 'Politecnico di Torino', period: 'Jan 2020 — Dec 2023', description: 'Thesis: "Modelling and Analysis of Attacker Behaviour through Graph Construction".' },
      { title: "BSc — Computer Engineering", institution: 'Università degli Studi di Salerno', period: '2017 — 2020', description: 'Thesis: "Experimental Characterisation of an Ethnicity Recognition System under Partial Occlusion".' },
      { title: 'Master in Blockchain & Digital Assets', institution: 'MasterZ.', period: 'Jan 2022 — Jul 2022', description: 'Scholarship focused on distributed ledger technologies, smart contracts, and digital assets.' },
    ],
    certifications: [] as { name: string; issuer: string; date: string; link?: string }[],
  },
  contact: {
    title: 'Get in touch',
    subtitle: "I'm always open to new opportunities, collaborations, or just a chat.",
    items: [
      { icon: 'email',    label: 'Email',    value: 'marcobarca1995@gmail.com', href: 'mailto:marcobarca1995@gmail.com' },
      { icon: 'phone',    label: 'Phone',    value: '+39 340 644 7085',         href: 'tel:+393406447085' },
      { icon: 'github',   label: 'GitHub',   value: 'github.com/marcobarca',    href: 'https://github.com/marcobarca' },
      { icon: 'linkedin', label: 'LinkedIn', value: 'in/marco-barca',           href: 'https://www.linkedin.com/in/marco-barca-9a6b49a5/' },
    ],
  },
  footer: 'Made with',
  footerBy: 'by',
};

/* ── Typewriter hook ───────────────────────────────────────────────── */
function useTyped(text: string, start: boolean, speed = 32) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    const id = setInterval(() => {
      setN(i => {
        if (i >= text.length) { clearInterval(id); return i; }
        return i + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [start, text, speed]);
  return text.slice(0, n);
}

/* ── Boot screen ───────────────────────────────────────────────────── */
const BOOT_LINES = [
  'marcOS v3.0 — bootloader',
  '> init system ............. OK',
  '> mount /dev/career ........ OK',
  '> load modules: azure ai ... OK',
  '> fetch marco.profile ...... OK',
  '> startx --session portfolio',
];

function BootScreen({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(1);
  const [fading, setFading] = useState(false);
  const finish = useRef(onDone);
  finish.current = onDone;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const id = setInterval(() => {
      setShown(n => {
        if (n >= BOOT_LINES.length) { clearInterval(id); return n; }
        return n + 1;
      });
    }, 240);
    return () => { document.body.style.overflow = ''; clearInterval(id); };
  }, []);

  useEffect(() => {
    if (shown < BOOT_LINES.length || fading) return;
    const t = setTimeout(() => setFading(true), 550);
    return () => clearTimeout(t);
  }, [shown, fading]);

  useEffect(() => {
    if (!fading) return;
    const t = setTimeout(() => finish.current(), 450);
    return () => clearTimeout(t);
  }, [fading]);

  useEffect(() => {
    const skip = () => setFading(true);
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => { window.removeEventListener('keydown', skip); window.removeEventListener('pointerdown', skip); };
  }, []);

  return (
    <div className={`boot-screen ${fading ? 'boot-fade' : ''}`}>
      <div className="boot-inner">
        {BOOT_LINES.slice(0, shown).map((line, i) => (
          <p key={i} className="boot-line">
            {line}
            {i === shown - 1 && <span className="tw-cursor">▊</span>}
          </p>
        ))}
      </div>
      <p className="boot-skip">press any key to skip</p>
    </div>
  );
}

/* ── Fade-in hook ──────────────────────────────────────────────────── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

/* ── Section wrapper — each section is a window of the "OS" ────────── */
function Section({ id, className = '', file, children }: { id: string; className?: string; file: string; children: React.ReactNode }) {
  const { ref, visible } = useFadeIn();
  return (
    <section id={id} className={`section ${className} ${visible ? 'visible' : ''}`}>
      <div ref={ref} className="section-inner">
        <div className="section-window">
          <div className="section-window-bar">
            <span className="terminal-dot dot-red" />
            <span className="terminal-dot dot-yellow" />
            <span className="terminal-dot dot-green" />
            <span className="terminal-wintitle">marco@portfolio: ~/{file}</span>
            <span className="win-controls" aria-hidden>─ ◻ ✕</span>
          </div>
          <div className="section-window-body">{children}</div>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ num, cmd, children }: { num?: string; cmd?: string; children: React.ReactNode }) {
  const { ref, visible } = useFadeIn();
  const typed = useTyped(cmd ?? '', visible);
  const done = !cmd || typed.length === cmd.length;
  return (
    <div ref={ref} className="section-title-wrapper">
      {cmd && (
        <p className="section-cmd">
          <span className="t-prompt">$ </span>{typed}
          {!done && <span className="tw-cursor">▊</span>}
        </p>
      )}
      <h2 className={`section-title ${done ? 'shown' : ''}`}>
        {num && <span className="section-num">{num}.</span>}
        {children}
      </h2>
      <div className={`section-title-line ${done ? 'shown' : ''}`} />
    </div>
  );
}

/* ── Work Project Modal ────────────────────────────────────────────── */
function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  delay = 0,
  duration = 2.5,
  beamId,
  accentColor = 'cyan',
  suppressGlow = false,
  recalcDep,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  fromRef: React.RefObject<HTMLElement>;
  toRef: React.RefObject<HTMLElement>;
  delay?: number;
  duration?: number;
  beamId: string;
  accentColor?: AccentKey;
  suppressGlow?: boolean;
  recalcDep?: unknown;
}) {
  const [pathD, setPathD] = useState('');
  const [totalLen, setTotalLen] = useState(0);
  const [cardRect, setCardRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const measureRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const calc = () => {
      const c = containerRef.current;
      const f = fromRef.current;
      const t = toRef.current;
      if (!c || !f || !t) return;
      const cR = c.getBoundingClientRect();
      const fR = f.getBoundingClientRect();
      const tR = t.getBoundingClientRect();
      const x1 = fR.right - cR.left;
      const y1 = fR.top + fR.height * 0.5 - cR.top;
      const x2 = tR.left - cR.left;
      const y2 = tR.top + tR.height * 0.5 - cR.top;
      const cx = (x1 + x2) / 2;
      setPathD(`M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`);
      setCardRect({ x: tR.left - cR.left, y: tR.top - cR.top, w: tR.width, h: tR.height });
    };
    calc();
    window.addEventListener('resize', calc);
    const ro = new ResizeObserver(calc);
    if (containerRef.current) ro.observe(containerRef.current);
    if (fromRef.current) ro.observe(fromRef.current);
    if (toRef.current) ro.observe(toRef.current);
    return () => { window.removeEventListener('resize', calc); ro.disconnect(); };
  }, [containerRef, fromRef, toRef, recalcDep]);

  useLayoutEffect(() => {
    if (measureRef.current && pathD) {
      setTotalLen(measureRef.current.getTotalLength());
    }
  }, [pathD]);

  if (!pathD) return null;

  const { beam, trace, shadow } = ACCENT[accentColor];
  const BEAM = 70;
  const DUR = duration;
  const kf = `bm${beamId}`;
  const rgKf = `rg${beamId}`;

  // Fraction of the cycle when the beam front reaches the card
  // Beam front arrives at card at arrFrac; tail leaves at 100% (end of cycle)
  const arrFrac = totalLen > 0 ? totalLen / (BEAM + totalLen) : 0;
  const a0 = (arrFrac * 100).toFixed(2);
  const a1 = Math.min(100, arrFrac * 100 + 2).toFixed(2);

  return (
    <svg
      aria-hidden
      className="beam-svg"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: 1 }}
    >
      <path ref={measureRef} d={pathD} fill="none" stroke="none" visibility="hidden" />
      <path d={pathD} stroke={trace} strokeWidth="1.5" fill="none" />
      {totalLen > 0 && (
        <>
          <path
            d={pathD}
            stroke={beam}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${BEAM} ${totalLen}`}
            style={{
              filter: `drop-shadow(0 0 5px ${shadow}) drop-shadow(0 0 10px ${shadow})`,
              animation: `${kf} ${DUR}s linear infinite`,
              animationDelay: `${delay}s`,
            }}
          />
          {cardRect && (
            <rect
              x={cardRect.x} y={cardRect.y}
              width={cardRect.w} height={cardRect.h}
              rx="14" ry="14"
              fill="none"
              stroke={beam}
              strokeWidth="1.5"
              style={{
                // visibility (not unmount/display) keeps the CSS animation
                // clock running, so the glow stays in phase with the beam
                visibility: suppressGlow ? 'hidden' : 'visible',
                filter: `drop-shadow(0 0 6px ${shadow}) drop-shadow(0 0 14px ${shadow})`,
                animation: `${rgKf} ${DUR}s linear infinite`,
                animationDelay: `${delay}s`,
              }}
            />
          )}
          <style>{`
            @keyframes ${kf}{from{stroke-dashoffset:${BEAM}}to{stroke-dashoffset:${-totalLen}}}
            @keyframes ${rgKf}{0%,${a0}%{opacity:0}${a1}%,97%{opacity:1}100%{opacity:0}}
          `}</style>
        </>
      )}
    </svg>
  );
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/* ── Work Project Card ─────────────────────────────────────────────── */
function WorkProjectCard({
  slug, title, company, client, period, tags,
  accent, badgeLabel,
  forwardRef,
  onClick, onMouseEnter, onMouseLeave,
}: {
  slug: string; title: string; company: string; client?: string; period: string; tags: string[];
  accent: AccentKey; badgeLabel: string;
  forwardRef?: React.Ref<HTMLButtonElement>;
  onClick: () => void; onMouseEnter: () => void; onMouseLeave: () => void;
}) {
  const a = ACCENT[accent];
  return (
    <button
      key={slug}
      ref={forwardRef}
      className="glass-card timeline-card timeline-card--project timeline-card--clickable"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ '--card-bg': a.cardBg, '--card-border': a.cardBorder, '--card-hover': a.cardHover, '--card-shadow': a.cardShadow, '--period-color': a.period, '--role-color': a.role } as React.CSSProperties}
    >
      <div className="timeline-header">
        <span className="timeline-period">{period}</span>
        <span className="timeline-badge work">{badgeLabel}</span>
      </div>
      <h3 className="timeline-role">{title}</h3>
      <p className="timeline-company">{company}</p>
      {client && <p className="timeline-client">Customer: {client}</p>}
      <div className="project-tags" style={{ marginTop: '0.6rem' }}>
        {tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
      </div>
    </button>
  );
}

/* ── Work Project Modal ────────────────────────────────────────────── */
function WorkProjectModal({ project, backLabel, onClose }: { project: import('./workProjects').WorkProject; backLabel: string; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet terminal-window" onClick={e => e.stopPropagation()}>
        <div className="terminal-titlebar">
          <span className="terminal-dot dot-red" />
          <span className="terminal-dot dot-yellow" />
          <span className="terminal-dot dot-green" />
          <span className="terminal-wintitle">marco@portfolio: ~/work/{project.slug}.md</span>
          <button className="modal-back" onClick={onClose}>{backLabel}</button>
        </div>
        <div className="modal-body">
          <p className="terminal-line" style={{ marginBottom: '1.5rem' }}>
            <span className="t-prompt">$ </span>cat {project.slug}.md
          </p>
          <h1 className="modal-title">{project.title}</h1>
          <dl className="modal-kv">
            {project.client && (
              <>
                <dt>Customer:</dt>
                <dd>{project.clientUrl
                  ? <a href={project.clientUrl} target="_blank" rel="noreferrer" className="project-link">{project.client} ↗</a>
                  : project.client}</dd>
              </>
            )}
            {project.company && (
              <>
                <dt>Company:</dt>
                <dd>{project.companyUrl
                  ? <a href={project.companyUrl} target="_blank" rel="noreferrer" className="project-link">{project.company} ↗</a>
                  : project.company}</dd>
              </>
            )}
            {project.period && (
              <>
                <dt>Period:</dt>
                <dd>{project.period}</dd>
              </>
            )}
            {project.tags.length > 0 && (
              <>
                <dt>Tags:</dt>
                <dd><div className="post-tags">{project.tags.map(t => <span key={t} className="tag">{t}</span>)}</div></dd>
              </>
            )}
          </dl>
          <div className="post-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.body}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Post Modal ────────────────────────────────────────────────────── */
function PostModal({ post, backLabel, onClose }: { post: Post; backLabel: string; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const fmt = fmtDate;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet terminal-window" onClick={e => e.stopPropagation()}>
        {/* Terminal title bar */}
        <div className="terminal-titlebar">
          <span className="terminal-dot dot-red" />
          <span className="terminal-dot dot-yellow" />
          <span className="terminal-dot dot-green" />
          <span className="terminal-wintitle">marco@portfolio: ~/posts/{post.slug}.md</span>
          <button className="modal-back" onClick={onClose}>{backLabel}</button>
        </div>
        {/* Terminal body */}
        <div className="modal-body">
          <p className="terminal-line" style={{ marginBottom: '1.5rem' }}>
            <span className="t-prompt">$ </span>cat {post.slug}.md
          </p>
          <div className="modal-meta">
            <time className="post-date">{fmt(post.date)}</time>
            <div className="post-tags">
              {post.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>
          <h1 className="modal-title">{post.title}</h1>
          <div className="post-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── App ───────────────────────────────────────────────────────────── */
export default function App() {
  const c = CONTENT;

  const [booting, setBooting] = useState(() => {
    try { return !sessionStorage.getItem('mb-booted'); } catch { return false; }
  });
  const bootDone = () => {
    try { sessionStorage.setItem('mb-booted', '1'); } catch { /* private mode */ }
    setBooting(false);
  };

  const HERO_NAME = 'Marco Barca';
  const heroTyped = useTyped(HERO_NAME, !booting, 75);
  const heroDone = heroTyped.length === HERO_NAME.length;

  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedPost = selectedSlug ? posts.find(p => p.slug === selectedSlug) ?? null : null;

  const [hoveredProj, setHoveredProj] = useState<number | null>(null);
  const [selectedWorkSlug, setSelectedWorkSlug] = useState<string | null>(null);
  const selectedWorkProject = selectedWorkSlug ? workProjects.find(p => p.slug === selectedWorkSlug) ?? null : null;
  const [projOffsets, setProjOffsets] = useState({ paddingTop: 0, npoMarginTop: 0 });

  useEffect(() => {
    const calc = () => {
      const c   = expContainerRef.current;
      const v3  = v3CardRef.current;
      const npo = npoCardRef.current;
      const p0  = proj0Ref.current;
      const grp = npoGroupRef.current;
      if (!c || !v3 || !npo || !p0 || !grp) return;
      const cR  = c.getBoundingClientRect();
      const v3CenterY  = v3.getBoundingClientRect().top  + v3.getBoundingClientRect().height  / 2 - cR.top;
      const npoCenterY = npo.getBoundingClientRect().top + npo.getBoundingClientRect().height / 2 - cR.top;
      const h0   = p0.getBoundingClientRect().height;
      const hNpo = grp.getBoundingClientRect().height;
      const p0Top = p0.getBoundingClientRect().top - cR.top;
      setProjOffsets(prev => {
        const p0Natural = p0Top - prev.paddingTop;
        const paddingTop    = Math.max(0, v3CenterY  - p0Natural - h0   / 2);
        const npoMarginTop  = Math.max(0, npoCenterY - v3CenterY - h0   / 2 - hNpo / 2);
        if (prev.paddingTop === paddingTop && prev.npoMarginTop === npoMarginTop) return prev;
        return { paddingTop, npoMarginTop };
      });
    };
    calc();
    window.addEventListener('resize', calc);
    const ro = new ResizeObserver(calc);
    if (expContainerRef.current) ro.observe(expContainerRef.current);
    return () => { window.removeEventListener('resize', calc); ro.disconnect(); };
  }, []);

  const expContainerRef = useRef<HTMLDivElement>(null);
  const v3CardRef  = useRef<HTMLDivElement>(null);
  const npoCardRef = useRef<HTMLDivElement>(null);
  const npoGroupRef = useRef<HTMLDivElement>(null);
  const proj0Ref = useRef<HTMLButtonElement>(null);
  const proj1Ref = useRef<HTMLButtonElement>(null);
  const proj2Ref = useRef<HTMLButtonElement>(null);
  const proj3Ref = useRef<HTMLButtonElement>(null);

  const [visibleCount, setVisibleCount] = useState(() => window.innerWidth <= 700 ? 1 : 3);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselTotal = c.projects.items.length;
  const carouselPrev = () => setCarouselIdx(i => Math.max(0, i - 1));
  const carouselNext = () => setCarouselIdx(i => Math.min(carouselTotal - visibleCount, i + 1));

  useEffect(() => {
    const onResize = () => {
      const next = window.innerWidth <= 700 ? 1 : 3;
      setVisibleCount(prev => {
        if (prev !== next) setCarouselIdx(0);
        return next;
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const ids = ['hero', 'about', 'experience', 'side', 'education', 'contact'];
      for (const id of [...ids].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const navLinks = [
    { id: 'about',      label: c.nav.about },
    { id: 'experience', label: c.nav.experience },
    { id: 'side',       label: c.nav.side },
    { id: 'education',  label: c.nav.education },
    { id: 'contact',    label: c.nav.contact },
  ];

  const badgeLabel = (type: 'work' | 'edu' | 'award') =>
    type === 'work' ? c.experience.badgeWork
    : type === 'award' ? c.experience.badgeAward
    : c.experience.badgeEdu;

  // Mouse-tracking spotlight on glass cards (sets --mx/--my consumed by CSS)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest?.('.glass-card') as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className="app">

      {booting && <BootScreen onDone={bootDone} />}

      {/* ── Navbar ── */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">

          {/* Left: logo (mobile: hamburger) */}
          <div className="nav-left">
            <button
              className={`nav-hamburger ${mobileOpen ? 'open' : ''}`}
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
            <button className="nav-logo" onClick={() => scrollTo('hero')} aria-label="Home">
              mb<span className="logo-cursor">_</span>
            </button>
          </div>

          {/* Center: nav links */}
          <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
            {navLinks.map(({ id, label }) => (
              <button
                key={id}
                className={`nav-link ${activeSection === id ? 'active' : ''}`}
                onClick={() => scrollTo(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right spacer */}
          <div className="nav-right" />

        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="hero" className="hero">
        <div className="hero-bg" />
        <div className="hero-layout">

          {/* Left: identity */}
          <div className="hero-content">
            <p className="hero-eyebrow"><span className="t-prompt">~$ </span>whoami</p>

            <h1 className="hero-name">{heroTyped}<span className="hero-cursor" /></h1>
            <p className={`hero-subtitle hero-reveal ${heroDone ? 'shown' : ''}`}>Computer Engineer · Cloud & AI Solution Architect</p>

            <div className={`hero-badge hero-reveal ${heroDone ? 'shown' : ''}`}>
              <span className="hero-badge-dot" />
              Open to collaborations
            </div>

            <div className={`hero-cta hero-reveal ${heroDone ? 'shown' : ''}`}>
              <a className="btn-primary" href="/CV-Marco-Barca.pdf" download aria-label="Download CV">Download CV</a>
              <div className="hero-social">
                <a href="https://github.com/marcobarca" target="_blank" rel="noreferrer" className="hero-social-link" aria-label="GitHub">
                  <img src={githubLogo} alt="GitHub" />
                </a>
                <a href="https://www.linkedin.com/in/marco-barca-9a6b49a5/" target="_blank" rel="noreferrer" className="hero-social-link" aria-label="LinkedIn">
                  <img src={linkedinLogo} alt="LinkedIn" />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Posts terminal */}
          <div className="hero-posts">
            <p className="hero-posts-label">{c.blog.title}</p>
            <div className="terminal-window">
              <div className="terminal-titlebar">
                <span className="terminal-dot dot-red" />
                <span className="terminal-dot dot-yellow" />
                <span className="terminal-dot dot-green" />
                <span className="terminal-wintitle">marco@portfolio: ~/posts</span>
              </div>
              <div className="terminal-body">
                <p className="terminal-line"><span className="t-prompt">$ </span>ls -lt</p>
                <div className="terminal-posts">
                  {posts.map(post => (
                    <button key={post.slug} className="t-post-row" onClick={() => setSelectedSlug(post.slug)}>
                      <span className="t-title">{post.title}</span>
                      <div className="t-meta">
                        <span className="t-date">{post.date}</span>
                        <span className="t-tags">[{post.tags.length > 3 ? post.tags.slice(0, 3).join(', ') + ', ...' : post.tags.join(', ')}]</span>
                        <span className="t-time">{post.readTime} min</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        <button className="scroll-indicator" onClick={() => scrollTo('about')} aria-label="Scroll">
          <span className="scroll-arrow" />
        </button>
      </section>

      {/* ── About ── */}
      <Section id="about" file="about.md">
        <SectionTitle num="01" cmd="cat about.md">{c.about.title}</SectionTitle>
        <div className="about-text">
          {c.about.p1}
          {c.about.p2}
          {c.about.p3}
          <div className="about-tags">
            {c.about.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
          </div>
        </div>
      </Section>

      {/* ── Experience + Work Projects ── */}
      <Section id="experience" className="alt-bg" file="experience.log">
        <SectionTitle num="02" cmd="tail -f experience.log">{c.experience.title}</SectionTitle>
        <div ref={expContainerRef} className="exp-split" style={{ position: 'relative' }}>

          {/* Left: career timeline */}
          <div>
            <p className="exp-col-label">{c.experience.careerLabel}</p>
            <div className="timeline">
              {c.experience.items.map(({ role, company, companyUrl, period, description, type, accent }, i) => (
                <div key={i} className="timeline-item" style={{ '--dot-color': ACCENT[accent].dot, '--dot-glow': ACCENT[accent].glow } as React.CSSProperties}>
                  <div className="timeline-dot" />
                  <div ref={i === 0 ? v3CardRef : i === 1 ? npoCardRef : undefined} className="glass-card timeline-card">
                    <div className="timeline-header">
                      <span className="timeline-period">{period}</span>
                      <span className={`timeline-badge ${type}`}>{badgeLabel(type)}</span>
                    </div>
                    <h3 className="timeline-role">{role}</h3>
                    <p className="timeline-company">
                      {companyUrl
                        ? <a href={companyUrl} target="_blank" rel="noreferrer" className="project-link">{company} ↗</a>
                        : company}
                    </p>
                    <div className="timeline-desc">{description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Beams: V3 card → V3 project (blue) */}
          <AnimatedBeam containerRef={expContainerRef} fromRef={v3CardRef  as React.RefObject<HTMLElement>} toRef={proj0Ref as React.RefObject<HTMLElement>} delay={0}    beamId="v0" accentColor="purple" suppressGlow={hoveredProj === 0} recalcDep={projOffsets} />
          {/* Beams: NPO card → 3 NPO projects */}
          <AnimatedBeam containerRef={expContainerRef} fromRef={npoCardRef as React.RefObject<HTMLElement>} toRef={proj1Ref as React.RefObject<HTMLElement>} delay={0}    beamId="n1" accentColor="green" suppressGlow={hoveredProj === 1} recalcDep={projOffsets} />
          <AnimatedBeam containerRef={expContainerRef} fromRef={npoCardRef as React.RefObject<HTMLElement>} toRef={proj2Ref as React.RefObject<HTMLElement>} delay={0.83} duration={3.5} beamId="n2" accentColor="green" suppressGlow={hoveredProj === 2} recalcDep={projOffsets} />
          <AnimatedBeam containerRef={expContainerRef} fromRef={npoCardRef as React.RefObject<HTMLElement>} toRef={proj3Ref as React.RefObject<HTMLElement>} delay={1.66} duration={4.5} beamId="n3" accentColor="green" suppressGlow={hoveredProj === 3} recalcDep={projOffsets} />

          {/* Right: work projects */}
          <div>
            <p className="exp-col-label exp-col-label--mobile-only">{c.experience.workProjectsLabel}</p>
            <div style={{ paddingTop: projOffsets.paddingTop }}>
              {/* V3 project group */}
              {workProjects.filter(p => p.company === 'V3 Advisory').map(({ slug, title, company, client, period, tags }) => {
                const idx = workProjects.findIndex(p => p.slug === slug);
                return (
                  <WorkProjectCard key={slug} slug={slug} title={title} company={company} client={client} period={period} tags={tags}
                    accent="purple" badgeLabel={c.experience.badgeWork}
                    forwardRef={[proj0Ref, proj1Ref, proj2Ref, proj3Ref][idx] as React.Ref<HTMLButtonElement>}
                    onClick={() => setSelectedWorkSlug(slug)}
                    onMouseEnter={() => setHoveredProj(idx)} onMouseLeave={() => setHoveredProj(null)}
                  />
                );
              })}
              {/* NPO project group */}
              <div ref={npoGroupRef} className="npo-proj-group" style={{ marginTop: projOffsets.npoMarginTop, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {workProjects.filter(p => p.company !== 'V3 Advisory').map(({ slug, title, company, client, period, tags }) => {
                  const idx = workProjects.findIndex(p => p.slug === slug);
                  return (
                    <WorkProjectCard key={slug} slug={slug} title={title} company={company} client={client} period={period} tags={tags}
                      accent="green" badgeLabel={c.experience.badgeWork}
                      forwardRef={[proj0Ref, proj1Ref, proj2Ref, proj3Ref][idx] as React.Ref<HTMLButtonElement>}
                      onClick={() => setSelectedWorkSlug(slug)}
                      onMouseEnter={() => setHoveredProj(idx)} onMouseLeave={() => setHoveredProj(null)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </Section>

      {/* ── Side Projects ── */}
      <Section id="side" file="side-projects">
        <SectionTitle num="03" cmd="ls ~/side-projects">{c.projects.sideTitle}</SectionTitle>
        <div className="carousel-wrapper">
          <button
            className="carousel-btn"
            onClick={carouselPrev}
            disabled={carouselIdx === 0}
            aria-label="Previous"
          >
            &#8592;
          </button>
          <div className="carousel-viewport">
            <div className="carousel-track" key={carouselIdx}>
              {c.projects.items.slice(carouselIdx, carouselIdx + visibleCount).map(({ title, description, tags, link }) => (
                <div key={title} className="glass-card side-project-card">
                  <div className="project-card-body">
                    <div className="project-card-top">
                      <img src={githubLogo} alt="" className="project-card-icon-img" />
                    </div>
                    <h3 className="project-title">{title}</h3>
                    <p className="project-desc project-desc--clamped">{description}</p>
                    <div className="project-tags">
                      {tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                  </div>
                  {link && (
                    <a href={link} target="_blank" rel="noreferrer" className="project-link">
                      {c.projects.linkLabel}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            className="carousel-btn"
            onClick={carouselNext}
            disabled={carouselIdx + visibleCount >= carouselTotal}
            aria-label="Next"
          >
            &#8594;
          </button>
        </div>
        <div className="carousel-dots">
          {Array.from({ length: carouselTotal - visibleCount + 1 }).map((_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === carouselIdx ? 'active' : ''}`}
              onClick={() => setCarouselIdx(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </Section>

      {/* ── Education ── */}
      <Section id="education" className="alt-bg" file="education.md">
        <SectionTitle num="04" cmd="cat education.md">{c.education.title}</SectionTitle>

        <p className="exp-col-label" style={{ marginBottom: '1.25rem' }}>{c.education.degreesLabel}</p>
        <div className="edu-degrees-grid">
          {c.education.degrees.map(({ title, institution, period, description }, i) => (
            <div key={i} className="glass-card degree-card">
              <p className="degree-institution">{institution}</p>
              <h3 className="degree-title">{title}</h3>
              <p className="degree-period">{period}</p>
              {description && <p className="degree-desc">{description}</p>}
            </div>
          ))}
        </div>

        {c.education.certifications.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <p className="exp-col-label" style={{ marginBottom: '1.25rem' }}>{c.education.certsLabel}</p>
            <div className="cert-grid">
              {c.education.certifications.map(({ name, issuer, date, link }, i) => (
                <div key={i} className="glass-card cert-card">
                  <span className="cert-icon">🏅</span>
                  <div className="cert-info">
                    <p className="cert-name">{name}</p>
                    <p className="cert-issuer">{issuer}</p>
                    <p className="cert-date">{date}</p>
                  </div>
                  {link && <a href={link} target="_blank" rel="noreferrer" className="project-link cert-verify">Verifica →</a>}
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {selectedPost && (
        <PostModal post={selectedPost} backLabel={c.blog.back} onClose={() => setSelectedSlug(null)} />
      )}
      {selectedWorkProject && (
        <WorkProjectModal project={selectedWorkProject} backLabel={c.blog.back} onClose={() => setSelectedWorkSlug(null)} />
      )}

      {/* ── Contact ── */}
      <Section id="contact" file="contact.sh">
        <SectionTitle num="05" cmd="./contact.sh">{c.contact.title}</SectionTitle>
        <p className="contact-subtitle">{c.contact.subtitle}</p>
        <div className="contact-grid">
          {c.contact.items.map(({ icon, label, value, href }) => (
            <a key={icon} href={href} target={icon === 'github' || icon === 'linkedin' ? '_blank' : undefined} rel="noreferrer" className="glass-card contact-card">
              <span className="contact-card-icon">
                {icon === 'email'    && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
                {icon === 'phone'    && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 1.4h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>}
                {icon === 'github'   && <img src={githubLogo}   alt="" style={{ width: 22, height: 22, filter: 'invert(1) brightness(0.75)' }} />}
                {icon === 'linkedin' && <img src={linkedinLogo} alt="" style={{ width: 22, height: 22, filter: 'invert(1) brightness(0.75)' }} />}
              </span>
              <span className="contact-card-label">{label}</span>
              <span className="contact-card-value">{value}</span>
            </a>
          ))}
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <p>{c.footer} <span className="heart">♥</span> {c.footerBy} <strong>Marco Barca</strong></p>
          <div className="footer-social">
            <a href="https://github.com/marcobarca" target="_blank" rel="noreferrer" aria-label="GitHub">
              <img src={githubLogo} alt="GitHub" />
            </a>
            <a href="https://www.linkedin.com/in/marco-barca-9a6b49a5/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <img src={linkedinLogo} alt="LinkedIn" />
            </a>
          </div>
        </div>
      </footer>

      {/* ── tmux-style status bar ── */}
      <div className="status-bar" aria-hidden>
        <span className="sb-session">[marcOS] 0:portfolio*</span>
        <span className="sb-path">~/{activeSection === 'hero' ? '' : activeSection}</span>
        <span className="sb-time">{clock.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
}
