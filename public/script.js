// Optional: auto-clear form after submission
document.querySelector("form")?.addEventListener("submit", () => {
  setTimeout(() => {
    document.querySelector("input").value = "";
  }, 2000);
});
