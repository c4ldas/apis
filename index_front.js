const root = document.documentElement;
const linkbox = document.querySelectorAll(".link-box");
const mode = document.querySelector(".mode");
const themeToggle = document.querySelector("#theme-toggle");
const description = document.querySelectorAll(".description")

function toggleTheme(obj) {
  const isDark =
    root.style.getPropertyValue("background-image") == "var(--bg-dark)";
  isDark ? lightMode() : darkMode();
}

function darkMode() {
  localStorage.setItem("theme", "dark"); // Store user preference
  root.style.setProperty("background-image", "var(--bg-dark)");
  root.style.setProperty("color", "var(--text-dark)");
  linkbox.forEach((box) => {
    box.style.setProperty("color", "var(--text-dark)");
    box.style.setProperty("background-color", "var(--box-bg-dark)");
  });

  description.forEach( (item) => {
    item.style.setProperty("color", "var(--text-dark)");
  });

  mode.style.setProperty("content", "url('../images/moon.svg')");
  mode.style.left = "70%";
  themeToggle.checked = true;
  return;
}

function lightMode() {
  localStorage.setItem("theme", "light"); // Store user preference
  root.style.setProperty("background-image", "var(--bg-light)"); // Background color
  root.style.setProperty("color", "var(--text-light)"); // Font color

  description.forEach( (item) => {
    item.style.setProperty("color", "var(--text-light)");
  });

  linkbox.forEach((box) => {
    box.style.setProperty("color", "var(--text-light)");
    box.style.setProperty("background-color", "var(--box-bg-light)");
  });

  mode.style.setProperty("content", "url('../images/sun.svg')");
  mode.style.left = "25%";
  themeToggle.checked = false;
  return;
}

document.addEventListener("DOMContentLoaded", () => {
  // Check the current user preference for theme color
  const savedTheme = localStorage.getItem("theme");
  console.log(savedTheme);

  // In case customer didn't have set a preference, check the system-wide preference
  // Defaults to light mode.
  if (!savedTheme) {
    const prefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    prefersDarkMode ? darkMode() : lightMode();
    return;
  }
  // In case they have set the mode, load the user preference
  savedTheme == "dark" ? darkMode() : lightMode();
});

document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
