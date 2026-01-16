// src\App.tsx
import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import "./App.css";
import { projects } from "./data/projects";
import type { Project, ProjectLink } from "./data/projects";

const PROFILE = {
  name: "Dias Yuldashbayev",
  email: "id30313161@gmail.com",
};

const NAV_ITEMS = [
  { label: "Проекты", href: "/#projects" },
  { label: "Услуги", href: "/services" },
  { label: "Обо мне", href: "/about" },
];

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
const TOKEN_KEY = "portfolio.token";

const getProjectIdFromPath = () => {
  const match = window.location.pathname.match(/\/project\/([^/]+)/);
  return match ? match[1] : null;
};

const isAboutPage = () => window.location.pathname === "/about";
const isAdminPage = () => window.location.pathname === "/admin";
const isServicesPage = () => window.location.pathname === "/services";

const getToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, token);
};

const clearToken = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(TOKEN_KEY);
};

const createIdFromTitle = (title: string) => {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `project-${Date.now()}`;
};

const IconButton = ({
  label,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  children,
}: {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  children: ReactNode;
}) => (
  <button
    type={type}
    className={`icon-button ${className}`.trim()}
    onClick={onClick}
    aria-label={label}
    title={label}
    disabled={disabled}
  >
    {children}
    <span className="sr-only">{label}</span>
  </button>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 5v14M5 12h14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconEdit = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4 20l4.5-1 9.5-9.5-3.5-3.5L5 15.5 4 20z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.5 6.5l3.5 3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconTrash = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M5 7h14M9 7l1-2h4l1 2M9 10v7M15 10v7M7 7l1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M6 6l12 12M18 6l-12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconExport = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 3v11M8 10l4 4 4-4M4 17h16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M10 7v-2h8v14h-8v-2M14 12H4M8 8l-4 4 4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const uploadFile = async (file: File, token: string | null) => {
  const data = new FormData();
  data.append("file", file);
  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: data,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error("Загрузка не удалась");
  }
  const payload = (await response.json()) as { url?: string };
  if (!payload.url) {
    throw new Error("Ответ сервера без ссылки");
  }
  return payload.url;
};

const apiRequest = async <T,>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> => {
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Запрос не удался");
  }
  if (response.status === 204) {
    return {} as T;
  }
  return (await response.json()) as T;
};

const LinkIcon = ({ kind }: { kind: ProjectLink["kind"] }) => {
  if (kind === "repo") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3c-4.97 0-9 3.88-9 8.67 0 3.83 2.61 7.08 6.23 8.23.46.08.63-.19.63-.43 0-.21-.01-.77-.01-1.52-2.54.53-3.07-1.18-3.07-1.18-.42-1.03-1.04-1.3-1.04-1.3-.84-.55.07-.54.07-.54.93.06 1.42.9 1.42.9.83 1.38 2.18.98 2.72.75.08-.58.33-.98.59-1.2-2.03-.22-4.17-.96-4.17-4.28 0-.95.35-1.73.92-2.34-.09-.22-.4-1.12.09-2.33 0 0 .76-.24 2.49.9.72-.2 1.5-.3 2.27-.3s1.55.1 2.27.3c1.73-1.14 2.49-.9 2.49-.9.49 1.21.18 2.11.09 2.33.57.61.92 1.39.92 2.34 0 3.33-2.14 4.05-4.18 4.27.34.28.63.83.63 1.67 0 1.2-.01 2.17-.01 2.47 0 .24.17.52.64.43 3.62-1.15 6.22-4.4 6.22-8.23C21 6.88 16.97 3 12 3z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14 5h5v5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14L19 5M5 9v10a2 2 0 0 0 2 2h10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const SiteHeader = () => (
  <header className="site-header">
    <div className="shell header-inner">
      <a className="brand" href="/">
        {PROFILE.name}
      </a>
      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  </header>
);

const SiteFooter = () => (
  <footer className="site-footer" id="contact">
    <div className="shell footer-bottom">
      <span>© {new Date().getFullYear()} {PROFILE.name}</span>
    </div>
  </footer>
);

const HomePage = ({ items }: { items: Project[] }) => (
  <main className="shell main">
    <section className="hero">
      <div className="hero__content">
        <p className="eyebrow">Портфолио</p>
        <h1>Проекты, которые решают конкретные задачи.</h1>
        <p className="hero__lead">
          Ниже — подборка проектов с кратким описанием, стеком и ссылками. Нажмите на проект, чтобы увидеть подробности.
        </p>
        <div className="hero__actions">
          <a className="button button--primary" href="#projects">
            Смотреть проекты
          </a>
          <a className="button button--ghost" href={`mailto:${PROFILE.email}`}>
            Связаться
          </a>
        </div>
      </div>
    </section>

    <section className="section" id="projects">
      <div className="section-header">
        <h2>Проекты</h2>
      </div>
      <div className="project-grid">
        {items.map((project) => (
          <a
            key={project.id}
            className="project-card"
            href={`/project/${project.id}`}
          >
            {project.cover ? (
              <img src={project.cover} alt={project.title} />
            ) : (
              <div className="project-placeholder">Скриншот</div>
            )}
            <div className="project-card__body">
              <div className="project-card__top">
                <h3>{project.title}</h3>
                <span className="project-year">{project.year}</span>
              </div>
              <p>{project.summary}</p>
              <div className="tag-row">
                {project.stack.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <span className="project-cta">Подробнее</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  </main>
);

const ContactCard = () => (
  <div className="about-card">
    <h3 className="about-card__title">Контакты</h3>
    <a className="about-contact" href="tel:+998909883696">
      <span className="about-contact__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path
            d="M5 5c2.5 5.2 6.8 9.5 12 12l2.5-2.5c.4-.4 1-.5 1.5-.3l2.7 1a1 1 0 0 1 .6 1.2 4 4 0 0 1-4 3.1C9 19.5 4.5 15 3.5 8.7a4 4 0 0 1 3.1-4 1 1 0 0 1 1.2.6l1 2.7c.2.5.1 1.1-.3 1.5L5 5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>+998 90 988 36 96</span>
    </a>
    <a className="about-contact" href="https://t.me/nowitismy" target="_blank" rel="noreferrer">
      <span className="about-contact__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path
            d="M20.5 4.5L3.6 11.3c-.8.3-.8 1.4.1 1.6l3.8 1.1 1.5 4.5c.2.6.9.7 1.3.3l2.2-2.2 4 2.9c.5.4 1.3.1 1.4-.6l2.7-14c.1-.6-.5-1.1-1.1-.9z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>@nowitismy</span>
    </a>
    <a className="about-contact" href="mailto:id30313161@gmail.com">
      <span className="about-contact__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path
            d="M4 6h16v12H4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 7l8 6 8-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>id30313161@gmail.com</span>
    </a>
  </div>
);

const AboutPage = () => (
  <main className="shell main">
    <section className="section about-page">
      <p className="eyebrow">Обо мне</p>
      <h1>Ведущий инженер-программист</h1>
      <div className="about-grid">
        <div className="about-text">
          <p className="about-role">
            Опыт 3+ года на Node.js и React. В разработке с 2018 года, сейчас развиваю
            продуктовые и внутренние системы для Uzeronavigation.
          </p>
          <h2 className="about-subtitle">Опыт и путь</h2>
          <ul className="about-list">
            <li>Начинал с C++, затем JavaScript и PHP + MySQL, позже Laravel.</li>
            <li>Работал преимущественно на фрилансе.</li>
            <li>С 2023 года — Uzeronavigation.</li>
          </ul>
          <h2 className="about-subtitle">Ключевые достижения</h2>
          <ul className="about-list">
            <li>
              Запуск ATM: Safe Sky — первой в Средней Азии системы управления и контроля
              БПЛА; 2 место в 2025 году в конкурсе «Инновации года» от министра транспорта.
            </li>
            <li>
              Запуск внутренней CRM Uzeronavigation для компании с 1500+ сотрудников.
            </li>
          </ul>
          <h2 className="about-subtitle">Текущий фокус</h2>
          <ul className="about-list">
            <li>React + Vite, TypeScript, PostgreSQL, ORM.</li>
            <li>Docker, Linux, разворачивание и CI/CD.</li>
            <li>Изучение архитектур и масштабирование систем.</li>
          </ul>
          <p>Разрабатываю и внедряю системы для внутренних и внешних нужд компании.</p>
        </div>
        <ContactCard />
      </div>
    </section>
  </main>
);

const ServicesPage = () => (
  <main className="shell main">
    <section className="section about-page">
      <p className="eyebrow">Услуги</p>
      <h1>Разработка под ключ</h1>
      <div className="about-grid">
        <div className="about-text">
          <p className="about-role">
            Разрабатываю сайты и онлайн-сервисы под ключ — от идеи до полностью готового и
            работающего результата. Объясняю все простым языком, без сложных терминов.
          </p>
          <div className="about-columns">
            <div>
              <p className="about-subtitle">Если вам нужно</p>
              <ul className="about-list">
                <li>Сделать сайт для бизнеса</li>
                <li>Запустить интернет-магазин</li>
                <li>Создать Telegram-бота</li>
                <li>Автоматизировать рутинные задачи</li>
                <li>Реализовать идею для онлайн-проекта</li>
              </ul>
            </div>
            <div>
              <p className="about-subtitle">Что могу разработать</p>
              <ul className="about-list">
                <li>Сайты и лендинги</li>
                <li>Интернет-магазины</li>
                <li>Telegram-боты</li>
                <li>Сервисы с QR-кодами</li>
                <li>Простые онлайн-сервисы и программы</li>
                <li>Личные кабинеты, формы, онлайн-системы</li>
              </ul>
            </div>
          </div>
          <p className="about-subtitle">Работаю под ключ</p>
          <ul className="about-list">
            <li>Разработка</li>
            <li>Настройка сервера</li>
            <li>Подключение домена</li>
            <li>Запуск проекта в интернете</li>
          </ul>
          <p>Подходит как для бизнеса, так и для личных проектов.</p>
        </div>
        <ContactCard />
      </div>
    </section>
  </main>
);

type ProjectFormLink = {
  label: string;
  url: string;
  kind: ProjectLink["kind"];
};

type ProjectFormGallery = {
  label: string;
  src: string;
};

type ProjectForm = {
  id: string;
  title: string;
  summary: string;
  description: string;
  year: string;
  cover: string;
  stack: string;
  tools: string;
  links: ProjectFormLink[];
  gallery: ProjectFormGallery[];
};

type Toast = {
  id: number;
  message: string;
  kind: "success" | "error";
};

const emptyForm: ProjectForm = {
  id: "",
  title: "",
  summary: "",
  description: "",
  year: "",
  cover: "",
  stack: "",
  tools: "",
  links: [{ label: "", url: "", kind: "demo" }],
  gallery: [{ label: "", src: "" }],
};

const toForm = (project: Project): ProjectForm => ({
  id: project.id,
  title: project.title,
  summary: project.summary,
  description: project.description,
  year: project.year,
  cover: project.cover ?? "",
  stack: project.stack.join("\n"),
  tools: project.tools.join("\n"),
  links: project.links.length
    ? project.links.map((link) => ({
        label: link.label,
        url: link.url,
        kind: link.kind,
      }))
    : [{ label: "", url: "", kind: "demo" }],
  gallery: project.gallery.length
    ? project.gallery.map((screen) => ({
        label: screen.label,
        src: screen.src ?? "",
      }))
    : [{ label: "", src: "" }],
});

const parseList = (value: string) =>
  value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const AdminPage = ({
  items,
  token,
  isLoading,
  onLogin,
  onLogout,
  onCreate,
  onUpdate,
  onDelete,
}: {
  items: Project[];
  token: string | null;
  isLoading: boolean;
  onLogin: (username: string, password: string) => Promise<void>;
  onLogout: () => void;
  onCreate: (payload: Project) => Promise<Project>;
  onUpdate: (id: string, payload: Project) => Promise<Project>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [login, setLogin] = useState("admin");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const isBusy = isSubmitting || uploadingCount > 0;
  const busyLabel = isSubmitting ? "Сохраняем данные..." : "Загрузка файлов...";

  const pushToast = (message: string, kind: Toast["kind"] = "success") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, kind }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3000);
  };

  const handleUpload = async (file: File) => {
    setError(null);
    setUploadingCount((prev) => prev + 1);
    try {
      const url = await uploadFile(file, token);
      return url;
    } catch (err) {
      setError("Не удалось загрузить файл. Проверьте работу API.");
      return null;
    } finally {
      setUploadingCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setForm(toForm(project));
    setError(null);
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await onDelete(id);
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      pushToast("Проект удален");
    } catch (err) {
      setError("Не удалось удалить проект.");
      pushToast("Не удалось удалить проект", "error");
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleExport = () => {
    const data = JSON.stringify(items, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "projects.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!form.title.trim()) {
      setError("Укажите название проекта.");
      setIsSubmitting(false);
      return;
    }
    if (!form.summary.trim()) {
      setError("Укажите краткое описание.");
      setIsSubmitting(false);
      return;
    }
    if (!form.description.trim()) {
      setError("Укажите описание проекта.");
      setIsSubmitting(false);
      return;
    }
    if (!form.year.trim()) {
      setError("Укажите год проекта.");
      setIsSubmitting(false);
      return;
    }

    const id = form.id.trim() || createIdFromTitle(form.title);
    const exists = items.some((item) => item.id === id && item.id !== editingId);
    if (exists) {
      setError("Проект с таким ID уже существует.");
      setIsSubmitting(false);
      return;
    }

    const links = form.links
      .map((link) => ({
        label: link.label.trim(),
        url: link.url.trim(),
        kind: link.kind,
      }))
      .filter((link) => link.label && link.url);

    const gallery = form.gallery
      .map((screen) => ({
        label: screen.label.trim(),
        src: screen.src.trim() || undefined,
      }))
      .filter((screen) => screen.label || screen.src);

    const nextProject: Project = {
      id,
      title: form.title.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      year: form.year.trim(),
      cover: form.cover.trim() || undefined,
      stack: parseList(form.stack),
      tools: parseList(form.tools),
      links,
      gallery,
    };

    try {
      const saved = editingId
        ? await onUpdate(editingId, nextProject)
        : await onCreate(nextProject);
      setEditingId(saved.id);
      setForm(toForm(saved));
      pushToast(editingId ? "Изменения сохранены" : "Проект добавлен");
    } catch (err) {
      setError("Не удалось сохранить проект.");
      pushToast("Не удалось сохранить проект", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLink = (index: number, field: keyof ProjectFormLink, value: string) => {
    setForm((prev) => {
      const next = [...prev.links];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, links: next };
    });
  };

  const updateGallery = (index: number, field: keyof ProjectFormGallery, value: string) => {
    setForm((prev) => {
      const next = [...prev.gallery];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, gallery: next };
    });
  };

  const addLink = () =>
    setForm((prev) => ({
      ...prev,
      links: [...prev.links, { label: "", url: "", kind: "demo" }],
    }));

  const addGallery = () =>
    setForm((prev) => ({
      ...prev,
      gallery: [...prev.gallery, { label: "", src: "" }],
    }));

  if (!token) {
    return (
      <main className="shell main">
        <section className="admin-header">
          <div>
            <p className="eyebrow">Админка</p>
            <h1>Вход</h1>
            <p className="admin-note">Введите логин и пароль администратора.</p>
          </div>
        </section>
        <form
          className="admin-form admin-form--login admin-card"
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);
            try {
              await onLogin(login, password);
            } catch (err) {
              setError("Неверный логин или пароль.");
            }
          }}
        >
          <div className="admin-field">
            <label className="admin-label">Логин</label>
            <input
              className="admin-input"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Пароль</label>
            <input
              className="admin-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="button button--primary">
            Войти
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="shell main">
      <section className="admin-header">
        <div>
          <p className="eyebrow">Админка</p>
          <h1>Проекты</h1>
          <p className="admin-note">
            Данные сохраняются в базе данных. Загрузка файлов работает через API.
          </p>
          <div className="admin-stats">
            {isLoading ? (
              <span className="admin-pill admin-pill--skeleton admin-skeleton" />
            ) : (
              <span className="admin-pill">Проектов: {items.length}</span>
            )}
          </div>
        </div>
        <div className="admin-actions">
          <IconButton label="Экспорт JSON" onClick={handleExport}>
            <IconExport />
          </IconButton>
          <IconButton label="Выйти" onClick={onLogout}>
            <IconLogout />
          </IconButton>
        </div>
      </section>

      <section className="admin-grid">
        <form className="admin-form admin-card" onSubmit={handleSubmit} aria-busy={isBusy}>
          <div className="admin-inline">
            <div className="admin-field">
              <label className="admin-label">ID</label>
              <input
                className="admin-input"
                value={form.id}
                onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
                placeholder="project-alpha"
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Год</label>
              <input
                className="admin-input"
                value={form.year}
                onChange={(event) => setForm((prev) => ({ ...prev, year: event.target.value }))}
                placeholder="2024"
              />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-label">Название</label>
            <input
              className="admin-input"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Project Alpha"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Краткое описание</label>
            <textarea
              className="admin-textarea"
              value={form.summary}
              onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Описание проекта</label>
            <textarea
              className="admin-textarea"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Обложка (URL или файл)</label>
            <input
              className="admin-input"
              value={form.cover}
              onChange={(event) => setForm((prev) => ({ ...prev, cover: event.target.value }))}
              placeholder="/screens/alpha-cover.jpg"
            />
            <p className="admin-hint">Можно загрузить файл или вставить прямую ссылку.</p>
            <div className="admin-media">
              {form.cover ? (
                <img className="admin-media__img" src={form.cover} alt="Обложка" />
              ) : (
                <div className="admin-media__placeholder">Превью обложки</div>
              )}
            </div>
            <div className="admin-inline">
              <input
                className="admin-file"
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    const src = await handleUpload(file);
                    if (src) {
                      setForm((prev) => ({ ...prev, cover: src }));
                    }
                  }
                }}
              />
              <IconButton label="Очистить" onClick={() => setForm((prev) => ({ ...prev, cover: "" }))}>
                <IconClose />
              </IconButton>
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-label">Технологии (каждая с новой строки)</label>
            <textarea
              className="admin-textarea admin-textarea--compact"
              value={form.stack}
              onChange={(event) => setForm((prev) => ({ ...prev, stack: event.target.value }))}
              placeholder={"React\nTypeScript\nVite"}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Инструменты (каждая с новой строки)</label>
            <textarea
              className="admin-textarea admin-textarea--compact"
              value={form.tools}
              onChange={(event) => setForm((prev) => ({ ...prev, tools: event.target.value }))}
              placeholder={"Figma\nNode.js"}
            />
          </div>

          <div className="admin-section">
            <div className="admin-section__header">
              <span className="admin-label">Ссылки</span>
              <IconButton label="Добавить ссылку" onClick={addLink}>
                <IconPlus />
              </IconButton>
            </div>
            {form.links.map((link, index) => (
              <div key={index} className="admin-row">
                <div className="admin-inline">
                  <input
                    className="admin-input"
                    value={link.label}
                    placeholder="Название"
                    onChange={(event) => updateLink(index, "label", event.target.value)}
                  />
                  <select
                    className="admin-select"
                    value={link.kind}
                    onChange={(event) =>
                      updateLink(index, "kind", event.target.value as ProjectLink["kind"])
                    }
                  >
                    <option value="demo">Демо</option>
                    <option value="repo">Репозиторий</option>
                    <option value="case">Кейс</option>
                  </select>
                </div>
                <input
                  className="admin-input"
                  value={link.url}
                  placeholder="https://example.com"
                  onChange={(event) => updateLink(index, "url", event.target.value)}
                />
                <IconButton
                  label="Удалить ссылку"
                  className="icon-button--danger"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      links: prev.links.filter((_, linkIndex) => linkIndex !== index),
                    }))
                  }
                >
                  <IconTrash />
                </IconButton>
              </div>
            ))}
          </div>

          <div className="admin-section">
            <div className="admin-section__header">
              <span className="admin-label">Дополнительные скрины</span>
              <IconButton label="Добавить скрин" onClick={addGallery}>
                <IconPlus />
              </IconButton>
            </div>
            <p className="admin-hint">Добавьте подпись и загрузите изображение проекта.</p>
            {form.gallery.map((screen, index) => (
              <div key={index} className="admin-row admin-row--gallery">
                <div className="admin-row__media">
                  {screen.src ? (
                    <img className="admin-media__img" src={screen.src} alt={screen.label} />
                  ) : (
                    <div className="admin-media__placeholder">Скрин</div>
                  )}
                </div>
                <div className="admin-row__fields">
                  <input
                    className="admin-input"
                    value={screen.label}
                    placeholder="Подпись"
                    onChange={(event) => updateGallery(index, "label", event.target.value)}
                  />
                  <input
                    className="admin-input"
                    value={screen.src}
                    placeholder="/screens/alpha-1.jpg"
                    onChange={(event) => updateGallery(index, "src", event.target.value)}
                  />
                  <div className="admin-inline">
                    <input
                      className="admin-file"
                      type="file"
                      accept="image/*"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          const src = await handleUpload(file);
                          if (src) {
                            updateGallery(index, "src", src);
                          }
                        }
                      }}
                    />
                    <IconButton label="Очистить" onClick={() => updateGallery(index, "src", "")}>
                      <IconClose />
                    </IconButton>
                    <IconButton
                      label="Удалить скрин"
                      className="icon-button--danger"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          gallery: prev.gallery.filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                    >
                      <IconTrash />
                    </IconButton>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="button button--primary" disabled={isSubmitting}>
            {isSubmitting ? "Сохранение..." : editingId ? "Сохранить изменения" : "Добавить проект"}
          </button>
        </form>

        <div className="admin-list admin-card">
          <div className="admin-list__header">
            <h2>Список</h2>
            <IconButton label="Новый проект" onClick={handleNew}>
              <IconPlus />
            </IconButton>
          </div>
          {isLoading ? (
            <div className="admin-skeleton-list">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="admin-list__item admin-skeleton">
                  <div className="admin-thumb admin-skeleton" />
                  <div className="admin-skeleton-lines">
                    <div className="admin-skeleton admin-skeleton--line" />
                    <div className="admin-skeleton admin-skeleton--line short" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="admin-empty">Пока нет проектов. Добавьте первый.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`admin-list__item${editingId === item.id ? " is-active" : ""}`}
              >
                <div className="admin-thumb">
                  {item.cover ? (
                    <img src={item.cover} alt={item.title} />
                  ) : (
                    <span>Нет</span>
                  )}
                </div>
                <div className="admin-list__meta">
                  <strong>{item.title}</strong>
                  <span className="admin-list__summary">{item.summary}</span>
                  <span className="muted">{item.year}</span>
                </div>
                <div className="admin-list__actions">
                  <IconButton label="Редактировать" onClick={() => handleEdit(item)}>
                    <IconEdit />
                  </IconButton>
                  <IconButton
                    label="Удалить"
                    className="icon-button--danger"
                    onClick={() => handleDelete(item.id)}
                  >
                    <IconTrash />
                  </IconButton>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {isBusy && (
        <div className="admin-overlay" role="status" aria-live="polite">
          <div className="admin-overlay__card">
            <span className="admin-spinner" />
            <span>{busyLabel}</span>
          </div>
        </div>
      )}

      {toasts.length > 0 && (
        <div className="toast-stack" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast--${toast.kind}`}>
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

type LightboxItem = {
  src?: string;
  label: string;
};

const ProjectPage = ({
  project,
  isLoading,
}: {
  project: Project | null;
  isLoading: boolean;
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [lightbox, setLightbox] = useState<{
    items: LightboxItem[];
    index: number;
  } | null>(null);

  const lightboxItem = lightbox ? lightbox.items[lightbox.index] : null;

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }
    const handleReInit = () => {
      setSnapCount(emblaApi.scrollSnapList().length);
      onSelect();
    };
    setSnapCount(emblaApi.scrollSnapList().length);
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", handleReInit);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", handleReInit);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!lightbox) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightbox(null);
      }
      if (event.key === "ArrowRight") {
        setLightbox((prev) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            index: Math.min(prev.index + 1, prev.items.length - 1),
          };
        });
      }
      if (event.key === "ArrowLeft") {
        setLightbox((prev) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            index: Math.max(prev.index - 1, 0),
          };
        });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightbox]);

  if (!project) {
    if (isLoading) {
      return (
        <main className="shell main">
          <section className="section">
            <h1>Загрузка...</h1>
          </section>
        </main>
      );
    }
    return (
      <main className="shell main">
        <section className="section">
          <h1>Проект не найден</h1>
          <a className="button button--ghost" href="/">
            Вернуться к списку
          </a>
        </section>
      </main>
    );
  }

  const coverItems: LightboxItem[] = [
    {
      src: project.cover ?? undefined,
      label: project.title || "Обложка проекта",
    },
  ];

  return (
    <main className="shell main">
      <section className="project-header">
        <a className="back-link" href="/">
          ← Все проекты
        </a>
        <h1>{project.title}</h1>
      </section>

      <section className="project-layout">
        <div className="project-main">
          <button
            type="button"
            className="project-cover"
            onClick={() => setLightbox({ items: coverItems, index: 0 })}
            aria-label="Открыть обложку"
          >
            {project.cover ? (
              <img src={project.cover} alt={project.title} />
            ) : (
              <div className="project-cover__placeholder">Обложка проекта</div>
            )}
          </button>
          <div className="project-text">
            <h2>Краткое описание</h2>
            <p className="project-summary">{project.summary}</p>
          </div>
          <div className="project-text">
            <h2>Описание проекта</h2>
            <p className="project-description">{project.description}</p>
          </div>
          <div className="project-gallery">
            <h2>Дополнительные скрины</h2>
            <div className="carousel">
              <button
                type="button"
                className="carousel__button"
                aria-label="Назад"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
              >
                ←
              </button>
              <div className="embla" ref={emblaRef}>
                <div className="embla__container">
                  {project.gallery.map((screen, index) => (
                    <button
                      key={`${screen.label}-${index}`}
                      type="button"
                      className="embla__slide"
                      onClick={() =>
                        setLightbox({
                          items: project.gallery.map((item) => ({
                            src: item.src ?? undefined,
                            label: item.label || project.title,
                          })),
                          index,
                        })
                      }
                    >
                      <div className="gallery-item">
                        {screen.src ? (
                          <img src={screen.src} alt={screen.label} />
                        ) : (
                          <div className="gallery-placeholder">{screen.label}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="carousel__button"
                aria-label="Вперёд"
                onClick={scrollNext}
                disabled={!canScrollNext}
              >
                →
              </button>
            </div>
            {snapCount > 1 && (
              <div className="carousel-dots" role="tablist" aria-label="Слайды">
                {Array.from({ length: snapCount }).map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    type="button"
                    className={`carousel-dot${index === selectedIndex ? " is-active" : ""}`}
                    onClick={() => emblaApi?.scrollTo(index)}
                    aria-label={`Слайд ${index + 1}`}
                    aria-current={index === selectedIndex}
                    role="tab"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <aside className="project-aside">
          <div className="facts-card">
            <div className="facts-section">
              <span className="facts-label">Технологии</span>
              <div className="tag-row">
                {project.stack.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
            <div className="facts-section">
              <span className="facts-label">Инструменты</span>
              <div className="tag-row">
                {project.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            </div>
            <div className="facts-section">
              <span className="facts-label">Ссылки</span>
              <div className="link-list">
                {project.links.map((link) => (
                  <a key={link.url} href={link.url} className="link-item">
                    <LinkIcon kind={link.kind} />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </section>

      {lightboxItem && (
        <div className="lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <div className="lightbox__content" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="lightbox__close"
              onClick={() => setLightbox(null)}
              aria-label="Закрыть"
            >
              ×
            </button>
            {lightboxItem.src ? (
              <img src={lightboxItem.src} alt={lightboxItem.label} />
            ) : (
              <div className="lightbox__placeholder">{lightboxItem.label}</div>
            )}
            <span className="lightbox__caption">{lightboxItem.label}</span>
          </div>
        </div>
      )}
    </main>
  );
};

function App() {
  const [projectData, setProjectData] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(getToken());
  const [loadError, setLoadError] = useState<string | null>(null);

  const projectId = getProjectIdFromPath();
  const activeProject = projectId
    ? projectData.find((project) => project.id === projectId) ?? null
    : null;
  const showAbout = isAboutPage();
  const showServices = isServicesPage();
  const showAdmin = isAdminPage();

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<Project[]>("/projects");
      setProjectData(data);
      setLoadError(null);
    } catch (err) {
      setProjectData(projects);
      setLoadError("Не удалось загрузить проекты.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleLogin = async (username: string, password: string) => {
    const payload = await apiRequest<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setAuthToken(payload.accessToken);
    setToken(payload.accessToken);
  };

  const handleLogout = () => {
    clearToken();
    setAuthToken(null);
  };

  const handleCreate = async (payload: Project) => {
    const created = await apiRequest<Project>(
      "/projects",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      authToken,
    );
    setProjectData((prev) => [...prev, created]);
    return created;
  };

  const handleUpdate = async (id: string, payload: Project) => {
    const updated = await apiRequest<Project>(
      `/projects/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      authToken,
    );
    setProjectData((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  };

  const handleDelete = async (id: string) => {
    await apiRequest<void>(`/projects/${id}`, { method: "DELETE" }, authToken);
    setProjectData((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="page">
      <SiteHeader />
      {showAdmin ? (
        <AdminPage
          items={projectData}
          token={authToken}
          isLoading={isLoading}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ) : projectId ? (
        <ProjectPage project={activeProject} isLoading={isLoading} />
      ) : showAbout ? (
        <AboutPage />
      ) : showServices ? (
        <ServicesPage />
      ) : (
        <HomePage items={projectData} />
      )}
      {loadError && !showAdmin && (
        <div className="shell">
          <p className="admin-error">{loadError}</p>
        </div>
      )}
      <SiteFooter />
    </div>
  );
}

export default App;
