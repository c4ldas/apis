const root = document.documentElement;
const linkbox = document.querySelectorAll(".link-box");
const mode = document.querySelector(".mode");
const themeToggle = document.querySelector("#theme-toggle");

function toggleTheme(obj) {
  const isDark = root.style.getPropertyValue("background-image") == "var(--bg-dark)";
  isDark ? lightMode() : darkMode();
}

function darkMode() {
  localStorage.setItem("theme", "dark"); // Store user preference
  root.style.setProperty("background-image", "var(--bg-dark)"); // Background color
  root.style.setProperty("color", "var(--text-dark)"); // Font color
  mode.style.setProperty("content", "url('../images/moon.svg')"); // Change image to moon
  mode.style.setProperty("left", "70%"); // Change position of the moon image
  linkbox.forEach((box) => {
    box.style.setProperty("background-color", "var(--box-bg-dark)"); // Set link-box background color
    const description = box.querySelector(".description"); // Get the description element inside link-box
    description.style.setProperty("color", "var(--text-dark)"); // Set description text color
  });  
  themeToggle.checked = true;
  return;
}

function lightMode() {
  localStorage.setItem("theme", "light"); // Store user preference
  root.style.setProperty("background-image", "var(--bg-light)"); // Background color
  root.style.setProperty("color", "var(--text-light)"); // Font color
  mode.style.setProperty("content", "url('../images/sun.svg')"); // Change image to sun
  mode.style.setProperty("left", "25%"); // Change position of the sun image
  linkbox.forEach((box) => {
    box.style.setProperty("background-color", "var(--box-bg-light)"); // Set link-box background color
    const description = box.querySelector(".description"); // Get the description element inside link-box
    description.style.setProperty("color", "var(--text-light)"); // Set description text color
  });  
  themeToggle.checked = false;
  return;
}

document.addEventListener("DOMContentLoaded", () => {  
  const savedTheme = localStorage.getItem("theme"); // Check the current user preference for theme color

  // Check the system-wide preference, if no preference set previously. Defaults to light mode.
  if (!savedTheme) {
    const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    prefersDarkMode ? darkMode() : lightMode();
    return;
  }
  // In case they have set the mode, load the user preference
  savedTheme == "dark" ? darkMode() : lightMode();
});

document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
