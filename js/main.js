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
const levelUp = document.querySelector("[data-level-up]");
const mapNodes = document.querySelectorAll("[data-map]");
const badges = document.querySelectorAll("[data-badge]");
const lastPercentKey = "portfolio-last-percent";
const rewardClaim = document.querySelector("[data-reward-claim]");
const rewardStatus = document.querySelector("[data-reward-status]");
const eventPop = document.querySelector("[data-event-pop]");
const eventClaim = document.querySelector("[data-event-claim]");
const mascot = document.querySelector("[data-mascot]");
const quizRole = document.querySelector("[data-quiz-role]");
const quizFocus = document.querySelector("[data-quiz-focus]");
const quizSpeed = document.querySelector("[data-quiz-speed]");
const quizRun = document.querySelector("[data-quiz-run]");
const quizResult = document.querySelector("[data-quiz-result]");
const projectCards = document.querySelectorAll("[data-project]");
const skillNodes = document.querySelectorAll("[data-skill]");
const loginKey = "portfolio-login-streak";
const lastLoginKey = "portfolio-last-login";

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
  const totalQuests = 9;
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

  if (badges.length > 0) {
    badges.forEach((badge) => {
      const key = badge.getAttribute("data-badge");
      const unlocked =
        (key === "explore" && visitedCount === totalPages) ||
        (key === "projects" && progress.visited.includes("projects")) ||
        (key === "resume" && progress.visited.includes("resume")) ||
        progress.quests[key];
      badge.classList.toggle("unlocked", unlocked);
    });
  }

  const lastPercent = Number(window.localStorage.getItem(lastPercentKey) || 0);
  if (percentage > lastPercent) {
    window.localStorage.setItem(lastPercentKey, String(percentage));
    if (levelUp) {
      levelUp.classList.add("visible");
      window.setTimeout(() => {
        levelUp.classList.remove("visible");
      }, 1200);
    }
  }
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

if (mapNodes.length > 0 && pageKey) {
  mapNodes.forEach((node) => {
    const key = node.getAttribute("data-map");
    node.classList.toggle("active", key === pageKey);
  });
}

if (resetButton) {
  resetButton.addEventListener("click", () => {
    window.localStorage.removeItem(progressKey);
    window.localStorage.removeItem(lastPercentKey);
    window.localStorage.removeItem(loginKey);
    window.localStorage.removeItem(lastLoginKey);
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

const updateRewardUI = (streak) => {
  if (!rewardStatus) {
    return;
  }
  if (streak === 1) {
    rewardStatus.textContent = "Day 1 · +10 XP";
  } else if (streak === 2) {
    rewardStatus.textContent = "Day 2 · Badge unlocked";
  } else if (streak === 3) {
    rewardStatus.textContent = "Day 3 · Secret theme unlocked";
  } else if (streak >= 5) {
    rewardStatus.textContent = "Day 5 · Classified file unlocked";
  } else {
    rewardStatus.textContent = `Day ${streak} · Keep the streak`;
  }
};

const handleDailyLogin = () => {
  const today = new Date().toDateString();
  const lastLogin = window.localStorage.getItem(lastLoginKey);
  let streak = Number(window.localStorage.getItem(loginKey) || 0);

  if (lastLogin !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastLogin === yesterday.toDateString()) {
      streak += 1;
    } else {
      streak = 1;
    }
    window.localStorage.setItem(loginKey, String(streak));
    window.localStorage.setItem(lastLoginKey, today);
  }

  updateRewardUI(streak);
  if (streak >= 2) {
    markQuestDone("badge-day2");
  }
  if (streak >= 3) {
    markQuestDone("secret-theme");
  }
  if (streak >= 5) {
    markQuestDone("classified");
  }
};

if (rewardClaim) {
  rewardClaim.addEventListener("click", () => {
    const streak = Number(window.localStorage.getItem(loginKey) || 1);
    updateRewardUI(streak);
    playSound("complete");
  });
}

handleDailyLogin();

if (eventPop && eventClaim) {
  const showEvent = () => {
    eventPop.classList.add("visible");
  };
  const hideEvent = () => {
    eventPop.classList.remove("visible");
  };
  const delay = Math.floor(Math.random() * 120000) + 45000;
  window.setTimeout(showEvent, delay);
  eventClaim.addEventListener("click", () => {
    markQuestDone("bug-squash");
    playSound("complete");
    hideEvent();
  });
}

let idleTimer;
const setMascotMood = (state) => {
  if (!mascot) {
    return;
  }
  mascot.classList.remove("happy", "angry");
  if (state) {
    mascot.classList.add(state);
  }
  mascot.textContent = state === "angry" ? "😾" : "🐱";
};

const resetIdle = () => {
  window.clearTimeout(idleTimer);
  setMascotMood("happy");
  idleTimer = window.setTimeout(() => setMascotMood("angry"), 20000);
};

if (mascot) {
  mascot.textContent = "🐱";
  resetIdle();
  ["mousemove", "keydown", "click"].forEach((evt) =>
    document.addEventListener(evt, resetIdle)
  );
}

if (quizRun && quizResult) {
  quizRun.addEventListener("click", () => {
    const role = quizRole?.value || "legal";
    const focus = quizFocus?.value || "execution";
    const speed = quizSpeed?.value || "steady";
    const build = `${role} · ${focus} · ${speed}`;

    quizResult.textContent = `Recommended Kai build: ${build}. Prioritized projects highlighted below.`;
    projectCards.forEach((card) => {
      const type = card.getAttribute("data-project");
      card.classList.toggle("highlighted", role === "creative" && type === "video");
      card.classList.toggle("highlighted", role !== "creative" && type !== "video");
    });
    playSound("complete");
  });
}

if (skillNodes.length > 0) {
  skillNodes.forEach((node) => {
    node.addEventListener("click", () => {
      node.classList.toggle("unlocked");
      playSound("toggle");
    });
  });
}

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
