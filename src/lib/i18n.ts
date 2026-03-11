import { useState, useEffect } from "react";

export type Locale = "zh" | "en" | "es";

const translations = {
  zh: {
    appTitle: "✨ BINGO TIME",
    selectGridSize: "选择棋盘大小",
    inputTask: "输入一个任务...",
    randomFill: "随机填充剩余",
    tasksAdded: "已添加",
    tasksUnit: "个任务",
    startBingo: "开始 BINGO!",
    board: "Bingo",
    calendar: "日历",
    hasBingo: "有 Bingo",
    noRecord: "无记录",
    weekDays: ["日", "一", "二", "三", "四", "五", "六"],
    monthLabel: (y: number, m: number) => `${y}年${m}月`,
    empty: "空",
    // Landing page
    signIn: "登录",
    heroDesc: "专为 ADHD 人群设计的任务游戏化工具。\n把待办事项变成 Bingo 棋盘，用点击代替思考，用连线奖励完成。",
    painPoints: [
      { title: "决策疲劳？", desc: "ADHD 最大的敌人不是懒，而是不知道从哪开始。Bingo 随机排列任务，帮你跳过「选择」这一步。" },
      { title: "拖延循环？", desc: "每个格子都是一个小任务，点一下就完成。不需要完美，只需要开始。" },
      { title: "缺乏反馈？", desc: "连线触发 🎊 彩带 + 音效！即时多巴胺奖励，让大脑爱上完成任务。" },
    ],
    demoTitle: "看看它长什么样 👇",
    demoDesc: "输入任务 → 生成 Bingo 棋盘 → 点击完成 → 连线得分！",
    tryItTitle: "🎮 先玩一下试试！",
    tryItDesc: "直接体验完整流程，无需登录",
    saveHint: "💡 登录 Gmail 即可保存你的进度和历史记录",
    choosePlan: "选择你的版本",
    free: "免费",
    perMonth: "/月",
    recommended: "推荐",
    freeStart: "免费开始",
    comingSoon: "即将推出",
    basicFeatures: [
      "3×3 / 4×4 / 5×5 棋盘",
      "手动输入任务",
      "随机填充任务库",
      "连线动画 + 音效 🎶",
      "日历查看历史记录",
      "多语言支持",
    ],
    proFeatures: [
      "Basic 全部功能",
      "🤖 AI 智能拆解任务",
      "输入大目标，自动拆分成 5-10 分钟小任务",
      "个性化任务推荐",
      "数据统计与趋势分析",
      "优先客服支持",
    ],
    footerCta: "🧠 不需要意志力，只需要点一下。",
    aiBreakdown: "🤖 AI 拆解任务",
    aiPlaceholder: "输入一个大目标，如「准备期末考试」...",
    aiGenerating: "AI 正在拆解...",
    aiError: "AI 拆解失败，请重试",
    aiUseAll: "使用全部",
    sampleTasks: [
      "喝8杯水 💧", "走10000步 🚶", "读书30分钟 📖", "冥想10分钟 🧘",
      "整理房间 🧹", "写日记 ✍️", "学习新单词 📝", "做俯卧撑20个 💪",
      "早起7点前 ⏰", "不吃零食 🍎", "联系一个朋友 📱", "画一幅画 🎨",
      "听一首新歌 🎵", "做一道新菜 🍳", "拍一张照片 📸", "写代码1小时 💻",
      "跑步30分钟 🏃", "练瑜伽 🧘‍♀️", "看纪录片 🎬", "写感恩清单 🙏",
      "减少屏幕时间 📵", "喝一杯绿茶 🍵", "整理桌面 🗂️", "做深呼吸 🌬️",
      "学一个新技能 🎯",
    ],
  },
  en: {
    appTitle: "✨ BINGO TIME",
    selectGridSize: "Select Grid Size",
    inputTask: "Enter a task...",
    randomFill: "Random Fill Remaining",
    tasksAdded: "Added",
    tasksUnit: "tasks",
    startBingo: "Start BINGO!",
    board: "Bingo",
    calendar: "Calendar",
    hasBingo: "Has Bingo",
    noRecord: "No Record",
    weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    monthLabel: (y: number, m: number) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[m - 1]} ${y}`;
    },
    empty: "Empty",
    // Landing page
    signIn: "Sign in",
    heroDesc: "A gamified task tool designed for ADHD brains.\nTurn your to-do list into a Bingo board — click instead of thinking, get rewarded for every line.",
    painPoints: [
      { title: "Decision fatigue?", desc: "The hardest part of ADHD isn't laziness — it's not knowing where to start. Bingo randomizes your tasks so you skip the choosing." },
      { title: "Procrastination loop?", desc: "Each cell is a small task. One click to complete. No perfection needed — just start." },
      { title: "No feedback?", desc: "Complete a line and get 🎊 confetti + sound effects! Instant dopamine rewards that make your brain love finishing tasks." },
    ],
    demoTitle: "See how it works 👇",
    demoDesc: "Enter tasks → Generate Bingo board → Click to complete → Score lines!",
    tryItTitle: "🎮 Try it out!",
    tryItDesc: "Experience the full flow, no login required",
    saveHint: "💡 Sign in with Gmail to save your progress and history",
    choosePlan: "Choose Your Plan",
    free: "Free",
    perMonth: "/mo",
    recommended: "Recommended",
    freeStart: "Start Free",
    comingSoon: "Coming Soon",
    basicFeatures: [
      "3×3 / 4×4 / 5×5 boards",
      "Manual task entry",
      "Random fill from task library",
      "Line animations + sound effects 🎶",
      "Calendar history view",
      "Multi-language support",
    ],
    proFeatures: [
      "All Basic features",
      "🤖 AI-powered task breakdown",
      "Enter a big goal, auto-split into 5-10 min tasks",
      "Personalized task suggestions",
      "Stats & trend analysis",
      "Priority support",
    ],
    footerCta: "🧠 No willpower needed — just one click.",
    aiBreakdown: "🤖 AI Task Breakdown",
    aiPlaceholder: "Enter a big goal, e.g. 'Prepare for finals'...",
    aiGenerating: "AI is breaking it down...",
    aiError: "AI breakdown failed, please retry",
    aiUseAll: "Use All",
    sampleTasks: [
      "Drink 8 cups of water 💧", "Walk 10000 steps 🚶", "Read for 30 min 📖", "Meditate 10 min 🧘",
      "Clean the room 🧹", "Write a journal ✍️", "Learn new words 📝", "Do 20 push-ups 💪",
      "Wake up before 7am ⏰", "No snacks 🍎", "Call a friend 📱", "Draw a picture 🎨",
      "Listen to a new song 🎵", "Cook a new dish 🍳", "Take a photo 📸", "Code for 1 hour 💻",
      "Run for 30 min 🏃", "Practice yoga 🧘‍♀️", "Watch a documentary 🎬", "Write gratitude list 🙏",
      "Reduce screen time 📵", "Drink green tea 🍵", "Organize desk 🗂️", "Deep breathing 🌬️",
      "Learn a new skill 🎯",
    ],
  },
  es: {
    appTitle: "✨ BINGO TIME",
    selectGridSize: "Tamaño del Tablero",
    inputTask: "Ingresa una tarea...",
    randomFill: "Rellenar Aleatorio",
    tasksAdded: "Añadidas",
    tasksUnit: "tareas",
    startBingo: "¡Iniciar BINGO!",
    board: "Bingo",
    calendar: "Calendario",
    hasBingo: "Tiene Bingo",
    noRecord: "Sin Registro",
    weekDays: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    monthLabel: (y: number, m: number) => {
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      return `${months[m - 1]} ${y}`;
    },
    empty: "Vacío",
    // Landing page
    signIn: "Iniciar sesión",
    heroDesc: "Una herramienta gamificada de tareas diseñada para cerebros con TDAH.\nConvierte tu lista de pendientes en un tablero de Bingo — haz clic en vez de pensar, recibe recompensas por cada línea.",
    painPoints: [
      { title: "¿Fatiga de decisión?", desc: "El mayor enemigo del TDAH no es la pereza — es no saber por dónde empezar. Bingo ordena tus tareas al azar para que te saltes la elección." },
      { title: "¿Ciclo de procrastinación?", desc: "Cada celda es una tarea pequeña. Un clic para completar. No necesitas perfección — solo empieza." },
      { title: "¿Sin retroalimentación?", desc: "¡Completa una línea y obtén 🎊 confeti + efectos de sonido! Recompensas instantáneas de dopamina que hacen que tu cerebro ame terminar tareas." },
    ],
    demoTitle: "Mira cómo funciona 👇",
    demoDesc: "Ingresa tareas → Genera tablero Bingo → Clic para completar → ¡Líneas = puntos!",
    tryItTitle: "🎮 ¡Pruébalo!",
    tryItDesc: "Experimenta el flujo completo, sin necesidad de iniciar sesión",
    saveHint: "💡 Inicia sesión con Gmail para guardar tu progreso e historial",
    choosePlan: "Elige Tu Plan",
    free: "Gratis",
    perMonth: "/mes",
    recommended: "Recomendado",
    freeStart: "Empezar Gratis",
    comingSoon: "Próximamente",
    basicFeatures: [
      "Tableros 3×3 / 4×4 / 5×5",
      "Entrada manual de tareas",
      "Rellenar con tareas aleatorias",
      "Animaciones + efectos de sonido 🎶",
      "Vista de calendario histórico",
      "Soporte multiidioma",
    ],
    proFeatures: [
      "Todas las funciones Basic",
      "🤖 Desglose de tareas con IA",
      "Ingresa una meta grande, se divide en tareas de 5-10 min",
      "Sugerencias personalizadas",
      "Estadísticas y análisis de tendencias",
      "Soporte prioritario",
    ],
    footerCta: "🧠 No necesitas fuerza de voluntad — solo un clic.",
    aiBreakdown: "🤖 IA Desglose de Tareas",
    aiPlaceholder: "Ingresa una meta grande, ej. 'Preparar exámenes finales'...",
    aiGenerating: "La IA está desglosando...",
    aiError: "Error en el desglose, reintenta",
    aiUseAll: "Usar Todas",
    sampleTasks: [
      "Beber 8 vasos de agua 💧", "Caminar 10000 pasos 🚶", "Leer 30 min 📖", "Meditar 10 min 🧘",
      "Limpiar la habitación 🧹", "Escribir un diario ✍️", "Aprender palabras nuevas 📝", "Hacer 20 flexiones 💪",
      "Despertar antes de las 7 ⏰", "Sin snacks 🍎", "Llamar a un amigo 📱", "Dibujar algo 🎨",
      "Escuchar una canción nueva 🎵", "Cocinar algo nuevo 🍳", "Tomar una foto 📸", "Programar 1 hora 💻",
      "Correr 30 min 🏃", "Practicar yoga 🧘‍♀️", "Ver un documental 🎬", "Lista de gratitud 🙏",
      "Menos pantalla 📵", "Beber té verde 🍵", "Organizar escritorio 🗂️", "Respiración profunda 🌬️",
      "Aprender algo nuevo 🎯",
    ],
  },
} as const;

export type Translations = (typeof translations)[Locale];

const LOCALE_KEY = "bingo-locale";

export function getStoredLocale(): Locale {
  return (localStorage.getItem(LOCALE_KEY) as Locale) || "zh";
}

export function setStoredLocale(locale: Locale) {
  localStorage.setItem(LOCALE_KEY, locale);
}

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale);

  const setLocale = (l: Locale) => {
    setStoredLocale(l);
    setLocaleState(l);
  };

  const t = getTranslations(locale);

  return { locale, setLocale, t };
}
