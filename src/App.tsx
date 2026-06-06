import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import githubLogo from './assets/github.svg';
import linkedinLogo from './assets/linkedin.svg';
import { posts, type Post } from './posts';
import { workProjects, type WorkProject } from './workProjects';
import './projects/App.css';

/* ── Content ─────────────────────────────────────────────────────────── */
const CONTENT = {
  nav: { about: 'About', posts: 'Posts', experience: 'Experience', side: 'Side Projects', education: 'Education', contact: 'Contact' },
  blog: { title: 'Posts', readMore: 'Read →', minRead: 'min read', back: '← Back to posts' },
  hero: { cta1: 'Learn more', cta2: 'My projects' },
  about: {
    title: 'About me',
    p1: <p>I'm a <strong>Computer Engineer</strong> specialising in <strong>cloud architecture</strong>, <strong>generative AI</strong>, and solution design. I build complex systems — from multi-tenant SaaS platforms to AI pipelines for enterprise clients.</p>,
    p2: <p>I work at the intersection of cloud engineering, LLMs, and software architecture. I enjoy turning emerging technologies into tangible products: systems that scale, integrate, and deliver real business value.</p>,
    p3: <p>I hold a Master's in Computer Engineering with a focus on <strong>Cybersecurity</strong> from Politecnico di Torino. I currently lead innovation initiatives and define the technical direction for AI and cloud projects.</p>,
    tags: ['Solution Architecture', 'Cloud & Azure', 'AI / LLM', 'Data Engineering'],
  },
  projects: {
    sideTitle: 'Side Projects', linkLabel: 'View on GitHub →',
    items: [
      { title: 'cleanux', description: 'AI-driven Linux server monitor and cleanup tool. Analyses system state and intelligently suggests optimisation actions.', tags: ['Shell', 'AI', 'Linux'], link: 'https://github.com/marcobarca/cleanux' },
      { title: 'AttackModeler', description: "Framework to model and analyse attacker behaviour using GPT. Extracts patterns from CTF reports to build a structured representation of attacks. Built for my Master's thesis.", tags: ['Python', 'AI', 'Cybersecurity'], link: 'https://github.com/marcobarca/AttackModeler' },
      { title: 'microhttp', description: 'Minimalist HTTP server written in pure C with no external dependencies. Educational project to understand how web servers work at a low level.', tags: ['C', 'Systems', 'Networking'], link: 'https://github.com/marcobarca/microhttp' },
      { title: 'Algorand Crowdfunding', description: 'Decentralised crowdfunding platform on Algorand Blockchain. Built during the Encode x Algorand Hackathon — 2nd place winner.', tags: ['JavaScript', 'Blockchain', 'Algorand'], link: 'https://github.com/marcobarca/Algorand_Crowdfunding_platform' },
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
      { role: 'Solution Architect & Tech Advisor', company: 'V3 Advisory', period: 'Jan 2026 — Present', type: 'work' as const, description: <ul><li>Designing end-to-end architecture of a B2C SaaS platform for live online language lessons — modular monolith (Spring Boot), DDD-light, Azure AD B2C, Stripe, Azure Blob Storage</li><li>Technical governance: bounded context design, API definition, RBAC security model, and incremental MVP delivery plan</li></ul> },
      { role: 'Cloud Solutions Engineer', company: 'NPO Torino s.r.l.', period: 'Feb 2024 — Present', type: 'work' as const, description: <ul><li>Led the Innovation Team driving AI, cloud, and data engineering initiatives from pre-sales and opportunity assessment through architecture, PoC delivery, and production rollout</li><li>Built an end-to-end ML pipeline for IT ticket intelligence at a global manufacturing enterprise: ServiceNow ingestion, semantic embeddings, UMAP, HDBSCAN, and Azure AI Foundry LLM orchestration for automated topic labelling and knowledge base generation</li><li>Designed and productised a multi-tenant SaaS platform automating telephone survey workflows: Azure Functions, Azure Speech, LangChain, RAG (Azure Cognitive Search), multilingual support (Azure Translator + neural TTS), Entra ID isolation, Azure Pipelines CI/CD</li><li>Delivered data pipeline and lakehouse architectures: Medallion on PostgreSQL, PySpark & Microsoft Fabric, ERP integrations (Zucchetti REST API, OAuth2)</li></ul> },
      { role: '2nd Place @ Encode x Algorand Hackathon', company: 'Encode Club', period: 'Jul 2022', type: 'award' as const, description: <ul><li>4-week hackathon focused on Algorand Blockchain</li><li>Developed a decentralised crowdfunding platform with my team</li></ul> },
    ],
  },
  education: {
    title: 'Education',
    degreesLabel: 'Degrees & Credentials',
    certsLabel: 'Certifications',
    degrees: [
      { title: "Master's Degree — Computer Engineering, Cybersecurity", institution: 'Politecnico di Torino', period: 'Jan 2020 — Dec 2023', description: 'Master Thesis: "Modelling and Analysis of Attacker Behaviour through Graph Construction".' },
      { title: "Bachelor's Degree — Computer Engineering", institution: 'Università degli Studi di Salerno', period: '2017 — 2020', description: "Bachelor's Thesis: \"Caratterizzazione sperimentale di un sistema per il riconoscimento di etnia in presenza di occlusioni\"." },
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

/* ── Section wrapper ───────────────────────────────────────────────── */
function Section({ id, className = '', children }: { id: string; className?: string; children: React.ReactNode }) {
  const { ref, visible } = useFadeIn();
  return (
    <section id={id} className={`section ${className} ${visible ? 'visible' : ''}`}>
      <div ref={ref} className="section-inner">{children}</div>
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-title-wrapper">
      <h2 className="section-title">{children}</h2>
      <div className="section-title-line" />
    </div>
  );
}

/* ── Work Project Modal ────────────────────────────────────────────── */
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

function WorkProjectModal({ project, backLabel, onClose }: { project: WorkProject; backLabel: string; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
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
          <div className="modal-meta">
            <span className="timeline-period" style={{ fontFamily: 'var(--mono, monospace)' }}>{project.period}</span>
            <div className="post-tags">
              {project.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>
          <h1 className="modal-title">{project.title}</h1>
          {project.company && <p className="timeline-company" style={{ marginBottom: '1.5rem' }}>{project.company}</p>}
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

  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedPost = selectedSlug ? posts.find(p => p.slug === selectedSlug) ?? null : null;

  const [selectedWorkSlug, setSelectedWorkSlug] = useState<string | null>(null);
  const selectedWorkProject = selectedWorkSlug ? workProjects.find(p => p.slug === selectedWorkSlug) ?? null : null;

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
      const ids = ['hero', 'about', 'experience', 'side', 'education', 'posts', 'contact'];
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
    { id: 'posts',      label: c.nav.posts },
    { id: 'contact',    label: c.nav.contact },
  ];

  const badgeLabel = (type: 'work' | 'edu' | 'award') =>
    type === 'work' ? c.experience.badgeWork
    : type === 'award' ? c.experience.badgeAward
    : c.experience.badgeEdu;

  return (
    <div className="app">

      {/* ── Navbar ── */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">

          {/* Left spacer (mobile: hamburger) */}
          <div className="nav-left">
            <button
              className={`nav-hamburger ${mobileOpen ? 'open' : ''}`}
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Menu"
            >
              <span /><span /><span />
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
            <div className="hero-social">
              <a href="https://github.com/marcobarca" target="_blank" rel="noreferrer" className="hero-social-link" aria-label="GitHub">
                <img src={githubLogo} alt="GitHub" />
              </a>
              <a href="https://www.linkedin.com/in/marco-barca-9a6b49a5/" target="_blank" rel="noreferrer" className="hero-social-link" aria-label="LinkedIn">
                <img src={linkedinLogo} alt="LinkedIn" />
              </a>
            </div>

            <h1 className="hero-name">Marco Barca</h1>
            <p className="hero-subtitle">Computer Engineer</p>

            <div className="hero-cta">
              <a className="btn-outline" href="/CV-Marco-Barca.pdf" download aria-label="Download CV">Download CV</a>
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
                        <span className="t-tags">[{post.tags.join(', ')}]</span>
                        <span className="t-time">{post.readTime} min</span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="terminal-line t-cursor-line">
                  <span className="t-prompt">$ </span><span className="tw-cursor">▊</span>
                </p>
              </div>
            </div>
          </div>

        </div>

        <button className="scroll-indicator" onClick={() => scrollTo('about')} aria-label="Scroll">
          <span className="scroll-arrow" />
        </button>
      </section>

      {/* ── About ── */}
      <Section id="about">
        <SectionTitle>{c.about.title}</SectionTitle>
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
      <Section id="experience" className="alt-bg">
        <SectionTitle>{c.experience.title}</SectionTitle>
        <div className="exp-split">

          {/* Left: career timeline */}
          <div>
            <p className="exp-col-label">{c.experience.careerLabel}</p>
            <div className="timeline">
              {c.experience.items.map(({ role, company, period, description, type }, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="glass-card timeline-card">
                    <div className="timeline-header">
                      <span className="timeline-period">{period}</span>
                      <span className={`timeline-badge ${type}`}>{badgeLabel(type)}</span>
                    </div>
                    <h3 className="timeline-role">{role}</h3>
                    <p className="timeline-company">{company}</p>
                    <div className="timeline-desc">{description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: work projects timeline */}
          <div>
            <p className="exp-col-label">{c.experience.workProjectsLabel}</p>
            <div className="timeline timeline--project">
              {workProjects.map(({ slug, title, company, period, tags, body }) => (
                <div key={slug} className="timeline-item">
                  <div className="timeline-dot timeline-dot--project" />
                  <button
                    className="glass-card timeline-card timeline-card--project timeline-card--clickable"
                    onClick={() => setSelectedWorkSlug(slug)}
                  >
                    <div className="timeline-header">
                      <span className="timeline-period">{period}</span>
                      <span className="timeline-badge work">{c.experience.badgeWork}</span>
                    </div>
                    <h3 className="timeline-role">{title}</h3>
                    <p className="timeline-company">{company}</p>
                    <p className="timeline-desc">{body}</p>
                    <div className="project-tags" style={{ marginTop: '0.5rem' }}>
                      {tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </Section>

      {/* ── Side Projects ── */}
      <Section id="side">
        <SectionTitle>{c.projects.sideTitle}</SectionTitle>
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
      <Section id="education" className="alt-bg">
        <SectionTitle>{c.education.title}</SectionTitle>

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
        <PostModal
          post={selectedPost}
          backLabel={c.blog.back}
          onClose={() => setSelectedSlug(null)}
        />
      )}

      {selectedWorkProject && (
        <WorkProjectModal
          project={selectedWorkProject}
          backLabel={c.blog.back}
          onClose={() => setSelectedWorkSlug(null)}
        />
      )}

      {/* ── Posts ── */}
      <Section id="posts">
        <SectionTitle>{c.blog.title}</SectionTitle>
        <div className="posts-grid">
          {posts.map(post => (
            <button
              key={post.slug}
              className="glass-card post-card"
              onClick={() => setSelectedSlug(post.slug)}
            >
              <div className="post-card-header">
                <time className="post-card-date">{fmtDate(post.date)}</time>
                <span className="post-card-read-time">{post.readTime} {c.blog.minRead}</span>
              </div>
              <h3 className="post-card-title">{post.title}</h3>
              <div className="post-tags" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                {post.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
              <span className="project-link post-card-link">{c.blog.readMore}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Contact ── */}
      <Section id="contact" className="alt-bg">
        <SectionTitle>{c.contact.title}</SectionTitle>
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
    </div>
  );
}
