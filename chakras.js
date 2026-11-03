(() => {
  const explorer = document.querySelector("[data-chakra-explorer]");
  const chakras = window.EmilyChakras;
  if (!explorer || !Array.isArray(chakras) || chakras.length !== 7) return;

  const fields = Object.fromEntries([...explorer.querySelectorAll("[data-chakra-field]")].map((field) => [field.dataset.chakraField, field]));
  const selectors = [...explorer.querySelectorAll("[data-chakra-id]")];
  const feedback = explorer.querySelector(".chakra-feedback");
  const fallbackLabel = explorer.querySelector(".chakra-fallback-label");
  const fallback = explorer.querySelector(".chakra-copy-fallback");
  let selectedId = "heart";

  const selectedChakra = () => chakras.find((chakra) => chakra.id === selectedId);
  const render = (id) => {
    const chakra = chakras.find((item) => item.id === id);
    if (!chakra) return;
    selectedId = id;
    fields.order.textContent = `${String(chakra.order).padStart(2, "0")} / 07`;
    fields.name.textContent = chakra.nameZh;
    fields.nameEn.textContent = chakra.nameEn;
    fields.sanskrit.textContent = chakra.sanskrit;
    fields.location.textContent = chakra.location;
    fields.theme.textContent = chakra.theme;
    fields.description.textContent = chakra.description;
    fields.question.textContent = chakra.reflectionQuestion;
    fields.practice.textContent = chakra.dailyPractice;
    fields.affirmation.textContent = chakra.affirmation;
    fields.swatch.style.setProperty("--chakra-color", chakra.color);
    explorer.style.setProperty("--chakra-color", chakra.color);
    selectors.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.chakraId === id)));
    feedback.textContent = "";
    feedback.classList.remove("is-error");
    fallback.hidden = true;
    fallbackLabel.hidden = true;
  };

  selectors.forEach((button) => button.addEventListener("click", () => render(button.dataset.chakraId)));
  explorer.querySelectorAll("[data-chakra-step]").forEach((button) => button.addEventListener("click", () => {
    const index = chakras.findIndex((chakra) => chakra.id === selectedId);
    const delta = Number(button.dataset.chakraStep);
    render(chakras[(index + delta + chakras.length) % chakras.length].id);
    explorer.querySelector(`[data-chakra-id="${selectedId}"].chakra-tab`)?.focus();
  }));

  explorer.querySelector(".chakra-copy")?.addEventListener("click", async () => {
    const chakra = selectedChakra();
    const text = [
      `${chakra.nameZh}｜${chakra.nameEn}（${chakra.sanskrit}）`,
      chakra.description,
      `自我覺察：${chakra.reflectionQuestion}`,
      `今日練習：${chakra.dailyPractice}`,
      `肯定語：${chakra.affirmation}`,
    ].join("\n\n");
    try {
      if (!navigator.clipboard?.writeText || !window.isSecureContext) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(text);
      feedback.textContent = "探索卡已複製，可以貼到想保存的地方。";
      feedback.classList.remove("is-error");
      fallback.hidden = true;
      fallbackLabel.hidden = true;
    } catch {
      feedback.textContent = "複製沒有成功，請選取下方文字後手動複製。";
      feedback.classList.add("is-error");
      fallback.value = text;
      fallback.hidden = false;
      fallbackLabel.hidden = false;
      fallback.focus();
      fallback.select();
    }
  });

  render(selectedId);
})();
