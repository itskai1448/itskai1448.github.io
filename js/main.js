const revealItems = document.querySelectorAll(".reveal");
const puzzleLinks = document.querySelectorAll("[data-puzzle-download]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeStorageKey = "portfolio-theme";
const xpFill = document.querySelector("[data-xp-fill]");
const xpLabel = document.querySelector("[data-xp-label]");
const questItems = document.querySelectorAll("[data-quest]");
const pageKey = document.body.getAttribute("data-page");
const progressKey = "portfolio-progress";
const resetButton = document.querySelector("[data-reset-progress]");
const loadoutItems = document.querySelectorAll("[data-cursor]");
const cursorFollower = document.querySelector(".cursor-follower");
const gameHud = document.querySelector("[data-game-hud]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}


const applyTheme = (theme) => {
  const isDark = theme === "dark";
  document.body.classList.toggle("theme-dark", isDark);
  if (themeToggle) {
    const label = themeToggle.querySelector(".theme-toggle__label");
    if (label) {
      label.textContent = isDark ? "Light mode" : "Dark mode";
    }
    themeToggle.setAttribute("aria-pressed", String(isDark));
  }
};

const getPreferredTheme = () => {
  const stored = window.localStorage.getItem(themeStorageKey);
  if (stored) {
    return stored;
  }
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

if (themeToggle) {
  applyTheme(getPreferredTheme());
  themeToggle.addEventListener("click", () => {
    themeToggle.classList.add("is-pulling");
    window.setTimeout(() => {
      themeToggle.classList.remove("is-pulling");
    }, 650);

    const nextTheme = document.body.classList.contains("theme-dark")
      ? "light"
      : "dark";
    window.localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
    markQuestDone("darkmode");
    playSound("toggle");
  });
}

const isInternalLink = (link) => {
  const href = link.getAttribute("href") || "";
  if (
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#") ||
    link.hasAttribute("download") ||
    link.getAttribute("target") === "_blank"
  ) {
    return false;
  }
  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin;
  } catch (error) {
    return false;
  }
};

const loadProgress = () => {
  try {
    return JSON.parse(window.localStorage.getItem(progressKey)) || {
      visited: [],
      quests: {},
    };
  } catch (error) {
    return { visited: [], quests: {} };
  }
};

const saveProgress = (progress) => {
  window.localStorage.setItem(progressKey, JSON.stringify(progress));
};

const updateProgressUI = (progress) => {
  if (!xpFill || !xpLabel) {
    return;
  }
  const totalPages = 3;
  const totalQuests = 5;
  const visitedCount = progress.visited.length;
  const questCount = Object.values(progress.quests || {}).filter(Boolean).length;
  const totalSteps = totalPages + totalQuests;
  const percentage = Math.round(((visitedCount + questCount) / totalSteps) * 100);
  xpFill.style.width = `${percentage}%`;
  xpLabel.textContent = `Level 1 · ${percentage}% to next`;

  questItems.forEach((item) => {
    const key = item.getAttribute("data-quest");
    const isDone =
      (key === "explore" && visitedCount === totalPages) ||
      (key === "projects" && progress.visited.includes("projects")) ||
      (key === "resume" && progress.visited.includes("resume")) ||
      progress.quests[key];

    item.classList.toggle("quest-complete", isDone);
  });
};

const markQuestDone = (key) => {
  const progress = loadProgress();
  if (progress.quests[key]) {
    return;
  }
  progress.quests[key] = true;
  saveProgress(progress);
  updateProgressUI(progress);
  playSound("complete");
};

if (pageKey) {
  const progress = loadProgress();
  if (!progress.visited.includes(pageKey)) {
    progress.visited.push(pageKey);
    saveProgress(progress);
  }
  if (progress.visited.length === 3) {
    markQuestDone("explore");
  }
  if (progress.visited.includes("projects")) {
    markQuestDone("projects");
  }
  if (progress.visited.includes("resume")) {
    markQuestDone("resume");
  }
  updateProgressUI(progress);
}

if (resetButton) {
  resetButton.addEventListener("click", () => {
    window.localStorage.removeItem(progressKey);
    updateProgressUI({ visited: [], quests: {} });
    playSound("reset");
  });
}

let activeCursor = "";

if (loadoutItems.length > 0 && cursorFollower) {
  loadoutItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      const icon = item.textContent.trim();
      if (activeCursor === icon) {
        return;
      }
      activeCursor = icon;
      document.body.classList.add("cursor-mode");
      cursorFollower.textContent = icon;
      if (gameHud) {
        gameHud.textContent = "Cursor equipped · Switch tool to change";
        gameHud.classList.add("visible");
      }
    });
  });
}

document.addEventListener("mousemove", (event) => {
  if (!cursorFollower) {
    return;
  }
  cursorFollower.style.transform = `translate(${event.clientX + 12}px, ${
    event.clientY + 12
  }px)`;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    activeCursor = "";
    document.body.classList.remove("cursor-mode");
    if (cursorFollower) {
      cursorFollower.textContent = "";
    }
    if (gameHud) {
      gameHud.classList.remove("visible");
    }
  }
});

const playSound = (type) => {
  if (!window.AudioContext && !window.webkitAudioContext) {
    return;
  }
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioCtx();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = "triangle";

  const settings = {
    toggle: { freq: 520, duration: 0.08 },
    complete: { freq: 720, duration: 0.12 },
    reset: { freq: 260, duration: 0.1 },
  };

  const { freq, duration } = settings[type] || settings.toggle;
  oscillator.frequency.value = freq;
  gainNode.gain.value = 0.06;

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
  oscillator.onended = () => audioContext.close();
};

const triviaQuestions = [
  {
    question: "What does CPU stand for?",
    answers: ["central processing unit"],
  },
  {
    question: "HTTP stands for what?",
    answers: ["hypertext transfer protocol"],
  },
  {
    question: "What does CSS stand for?",
    answers: ["cascading style sheets"],
  },
  {
    question: "What does RAM stand for?",
    answers: ["random access memory"],
  },
  {
    question: "What does API stand for?",
    answers: ["application programming interface"],
  },
  {
    question: "Git uses which command to create a new branch?",
    answers: ["git branch", "git checkout -b", "git switch -c"],
  },
  {
    question: "What does URL stand for?",
    answers: ["uniform resource locator"],
  },
];

const normalizeAnswer = (value) => value.trim().toLowerCase();

const promptTrivia = (count) => {
  const pool = [...triviaQuestions];
  let correct = 0;

  for (let i = 0; i < count; i += 1) {
    const pickIndex = Math.floor(Math.random() * pool.length);
    const [picked] = pool.splice(pickIndex, 1);
    const response = window.prompt(`${picked.question}\n\nAnswer (${i + 1}/${count}):`);

    if (!response) {
      return false;
    }

    const normalized = normalizeAnswer(response);
    const isCorrect = picked.answers.some(
      (answer) => normalized === normalizeAnswer(answer)
    );

    if (isCorrect) {
      correct += 1;
    } else {
      window.alert("Not quite. Try again.");
      return false;
    }
  }

  return correct === count;
};

const triggerDownload = (link) => {
  const filename = link.getAttribute("data-puzzle-filename") || "";
  const tempLink = document.createElement("a");
  tempLink.href = link.href;
  if (filename) {
    tempLink.download = filename;
  }
  tempLink.rel = "noopener";
  document.body.appendChild(tempLink);
  tempLink.click();
  tempLink.remove();
  markQuestDone("resume-download");
};

if (puzzleLinks.length > 0) {
  puzzleLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const puzzleType = link.getAttribute("data-puzzle-type") || "single";

      if (puzzleType === "trivia") {
        const solved = promptTrivia(3);
        if (solved) {
          triggerDownload(link);
        }
        return;
      }

      const question =
        link.getAttribute("data-puzzle-question") ||
        "Answer this question to continue:";
      const expected = (link.getAttribute("data-puzzle-answer") || "")
        .trim()
        .toLowerCase();

      const response = window.prompt(question);
      if (!response) {
        return;
      }

      if (normalizeAnswer(response) === expected) {
        triggerDownload(link);
      } else {
        window.alert("Not quite. Try again by checking the page details.");
      }
    });
  });
}
