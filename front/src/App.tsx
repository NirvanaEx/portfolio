// src\App.tsx
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import "./App.css";
import { projects } from "./data/projects";
import type { Project, ProjectLink } from "./data/projects";

const PROFILE = {
  name: "Dias",
  email: "id30313161@gmail.com",
};

const NAV_ITEMS = [
  { label: "Проекты", href: "/#projects" },
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
              <span className="project-cta">Открыть кейс</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  </main>
);

const AboutPage = () => (
  <main className="shell main">
    <section className="section about-page">
      <p className="eyebrow">Обо мне</p>
      <h1>Делаю продуктовые интерфейсы и быстрые веб‑приложения.</h1>
      <div className="about-grid">
        <div className="about-text">
          <p>
            Работаю с задачами, где важны ясность интерфейса и быстрый путь пользователя к
            результату. Люблю минимальные, но выразительные решения.
          </p>
          <p>
            В проектах беру на себя структуру интерфейса, визуальную систему и аккуратную
            реализацию.
          </p>
        </div>
        <div className="about-card">
          <div className="about-item">
            <span className="about-label">Фокус</span>
            <span>Интерфейсы · Продукты</span>
          </div>
          <div className="about-item">
            <span className="about-label">Формат</span>
            <span>Веб‑приложения</span>
          </div>
          <div className="about-item">
            <span className="about-label">Стек</span>
            <span>React · TypeScript · Vite</span>
          </div>
        </div>
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
  stack: project.stack.join(", "),
  tools: project.tools.join(", "),
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
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const AdminPage = ({
  items,
  token,
  onLogin,
  onLogout,
  onCreate,
  onUpdate,
  onDelete,
}: {
  items: Project[];
  token: string | null;
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

  const handleUpload = async (file: File) => {
    setError(null);
    try {
      const url = await uploadFile(file, token);
      return url;
    } catch (err) {
      setError("Не удалось загрузить файл. Проверьте работу API.");
      return null;
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
    } catch (err) {
      setError("Не удалось удалить проект.");
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
    } catch (err) {
      setError("Не удалось сохранить проект.");
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
          </div>
        </section>
        <form
          className="admin-form"
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
        </div>
        <div className="admin-actions">
          <button type="button" className="button button--outline" onClick={handleExport}>
            Экспорт JSON
          </button>
          <button type="button" className="button button--ghost" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </section>

      <section className="admin-grid">
        <div className="admin-list">
          <div className="admin-list__header">
            <h2>Список</h2>
            <button type="button" className="button button--ghost" onClick={handleNew}>
              Новый проект
            </button>
          </div>
          {items.map((item) => (
            <div key={item.id} className="admin-list__item">
              <div className="admin-list__meta">
                <strong>{item.title}</strong>
                <span className="muted">{item.year}</span>
              </div>
              <div className="admin-list__actions">
                <button type="button" className="button button--ghost" onClick={() => handleEdit(item)}>
                  Редактировать
                </button>
                <button type="button" className="button button--ghost" onClick={() => handleDelete(item.id)}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
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
            <div className="admin-inline">
              <input
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
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setForm((prev) => ({ ...prev, cover: "" }))}
              >
                Очистить
              </button>
            </div>
            {form.cover && <img className="admin-preview" src={form.cover} alt="Обложка" />}
          </div>

          <div className="admin-inline">
            <div className="admin-field">
              <label className="admin-label">Технологии (через запятую)</label>
              <input
                className="admin-input"
                value={form.stack}
                onChange={(event) => setForm((prev) => ({ ...prev, stack: event.target.value }))}
                placeholder="React, TypeScript, Vite"
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Инструменты (через запятую)</label>
              <input
                className="admin-input"
                value={form.tools}
                onChange={(event) => setForm((prev) => ({ ...prev, tools: event.target.value }))}
                placeholder="Figma, Node.js"
              />
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-section__header">
              <span className="admin-label">Ссылки</span>
              <button type="button" className="button button--ghost" onClick={addLink}>
                Добавить
              </button>
            </div>
            {form.links.map((link, index) => (
              <div key={`${link.label}-${index}`} className="admin-row">
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
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      links: prev.links.filter((_, linkIndex) => linkIndex !== index),
                    }))
                  }
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>

          <div className="admin-section">
            <div className="admin-section__header">
              <span className="admin-label">Дополнительные скрины</span>
              <button type="button" className="button button--ghost" onClick={addGallery}>
                Добавить
              </button>
            </div>
            {form.gallery.map((screen, index) => (
              <div key={`${screen.label}-${index}`} className="admin-row">
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
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => updateGallery(index, "src", "")}
                  >
                    Очистить
                  </button>
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        gallery: prev.gallery.filter((_, itemIndex) => itemIndex !== index),
                      }))
                    }
                  >
                    Удалить
                  </button>
                </div>
                {screen.src && <img className="admin-preview" src={screen.src} alt={screen.label} />}
              </div>
            ))}
          </div>

          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="button button--primary">
            {isSubmitting ? "Сохранение..." : editingId ? "Сохранить изменения" : "Добавить проект"}
          </button>
        </form>
      </section>
    </main>
  );
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
  const [activeSlide, setActiveSlide] = useState<number | null>(null);

  const galleryLength = project?.gallery.length ?? 0;
  const activeItem =
    project && activeSlide !== null ? project.gallery[activeSlide] : null;

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!project) {
      return;
    }
    if (activeSlide === null) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveSlide(null);
      }
      if (event.key === "ArrowRight") {
        setActiveSlide((prev) =>
          prev === null ? prev : Math.min(prev + 1, project.gallery.length - 1),
        );
      }
      if (event.key === "ArrowLeft") {
        setActiveSlide((prev) => (prev === null ? prev : Math.max(prev - 1, 0)));
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSlide, galleryLength, project]);

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
          <div className="project-cover">
            {project.cover ? (
              <img src={project.cover} alt={project.title} />
            ) : (
              <div className="project-cover__placeholder">Обложка проекта</div>
            )}
          </div>
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
                      onClick={() => setActiveSlide(index)}
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

      {activeItem && (
        <div className="lightbox" onClick={() => setActiveSlide(null)} role="dialog" aria-modal="true">
          <div className="lightbox__content" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="lightbox__close"
              onClick={() => setActiveSlide(null)}
              aria-label="Закрыть"
            >
              ×
            </button>
            {activeItem.src ? (
              <img src={activeItem.src} alt={activeItem.label} />
            ) : (
              <div className="lightbox__placeholder">{activeItem.label}</div>
            )}
            <span className="lightbox__caption">{activeItem.label}</span>
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
