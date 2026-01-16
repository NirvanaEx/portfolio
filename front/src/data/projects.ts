export type ProjectLink = {
  label: string;
  url: string;
  kind: "demo" | "repo" | "case";
};

export type ProjectMetric = {
  label: string;
  value: string;
};

export type ProjectGallery = {
  label: string;
  src?: string;
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  description: string;
  year: string;
  role?: string;
  duration?: string;
  challenge?: string;
  solution?: string;
  highlights?: string[];
  stack: string[];
  tools: string[];
  metrics?: ProjectMetric[];
  links: ProjectLink[];
  cover?: string;
  gallery: ProjectGallery[];
};

export const projects: Project[] = [
  {
    id: "project-alpha",
    title: "Project Alpha",
    summary: "Панель для задач и быстрых отчетов.",
    description:
      "Единое пространство для командных задач, статусов и коротких отчетов.",
    year: "2024",
    role: "Frontend + UI",
    duration: "6 недель",
    challenge:
      "Задачи жили в чатах и табличках, отчеты собирались вручную. Нужен был единый экран, где видно статус и можно быстро собрать отчет.",
    solution:
      "Собрал компактную панель с фильтрами, шаблонами отчетов и аккуратной типографикой. Приоритет — скорость и читаемость.",
    highlights: [
      "Единый экран по статусам",
      "Быстрый экспорт отчетов",
      "Минимум кликов до данных",
    ],
    stack: ["React", "TypeScript", "Vite"],
    tools: ["Figma", "Vite", "Node.js", "PostgreSQL"],
    metrics: [
      { label: "Скорость отчета", value: "-40%" },
      { label: "Время отклика", value: "0.8s" },
      { label: "Команды", value: "8" },
    ],
    links: [
      { label: "Демо", url: "https://projects.example.com/alpha", kind: "demo" },
      { label: "Репозиторий", url: "https://github.com/yourname/alpha", kind: "repo" },
    ],
    gallery: [
      { label: "Главная панель" },
      { label: "Отчеты" },
      { label: "Фильтры" },
    ],
  },
  {
    id: "project-beta",
    title: "Project Beta",
    summary: "Сервис запуска маркетинговых кампаний.",
    description:
      "Собирает кампании и показывает результат в одном интерфейсе.",
    year: "2023",
    role: "Frontend",
    duration: "2 месяца",
    challenge:
      "Кампании запускались вручную, метрики были разрозненны, что мешало быстро принимать решения.",
    solution:
      "Собрал сценарий запуска и единый дашборд для результатов. Сделал акцент на ясных цифрах и визуальной структуре.",
    highlights: [
      "Единый сценарий запуска",
      "Видимые метрики без перегруза",
      "Гибкие настройки кампаний",
    ],
    stack: ["React", "TypeScript", "Node.js"],
    tools: ["React", "Vite", "Redis", "PostgreSQL"],
    metrics: [
      { label: "Конверсия", value: "+18%" },
      { label: "Запуск", value: "-30%" },
      { label: "Кампаний/мес", value: "120+" },
    ],
    links: [
      { label: "Демо", url: "https://projects.example.com/beta", kind: "demo" },
      { label: "Кейс", url: "https://projects.example.com/beta/case", kind: "case" },
    ],
    gallery: [
      { label: "Сценарии" },
      { label: "Редактор" },
    ],
  },
];
