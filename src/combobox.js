// Shared, accessible custom combo boxes for the popup and the in-page Studio.
// The native <select> remains the settings source of truth; only its presentation
// is replaced so the opened option list can be themed consistently.
(() => {
  "use strict";

  const SELECT_CLASS = "igx-combo-native";
  const WRAPPER_CLASS = "igx-combo";
  const MENU_CLASS = "igx-combo-menu";
  let nextId = 0;
  let activeState = null;
  let outsideListenerInstalled = false;

  function rowLabel(select) {
    const explicit = select.getAttribute("aria-label");
    if (explicit) return explicit;
    const row = select.closest("label, .control-line, .igx-control-row");
    const text = row?.querySelector("span")?.textContent || row?.textContent || "";
    return String(text).replace(/\s+/g, " ").trim();
  }

  function selectedIndex(select) {
    const index = Array.from(select.options).findIndex((option) => option.value === select.value);
    return index < 0 ? 0 : index;
  }

  function render(state) {
    const { select, trigger, menu, options } = state;
    const index = selectedIndex(select);
    const selected = select.options[index];
    trigger.textContent = selected?.textContent?.trim() || "Choose an option";
    trigger.disabled = select.disabled;
    options.forEach((optionButton, optionIndex) => {
      const isSelected = optionIndex === index;
      optionButton.setAttribute("aria-selected", String(isSelected));
      optionButton.classList.toggle("is-selected", isSelected);
      optionButton.classList.toggle("is-active", state.open && optionIndex === state.activeIndex);
    });
    if (!state.open) state.activeIndex = index;
    if (state.open && options[state.activeIndex]) {
      trigger.setAttribute("aria-activedescendant", options[state.activeIndex].id);
    }
  }

  function positionMenu(state) {
    if (!state.open || !state.menu.isConnected) return;
    const rect = state.trigger.getBoundingClientRect();
    const viewportWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth);
    const viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight);
    const margin = 8;
    const width = Math.min(Math.max(rect.width, 144), viewportWidth - margin * 2);
    const left = Math.max(margin, Math.min(viewportWidth - width - margin, rect.left));
    const below = Math.max(0, viewportHeight - rect.bottom - margin - 6);
    const above = Math.max(0, rect.top - margin - 6);
    const naturalHeight = Math.min(state.menu.scrollHeight || 220, 280);
    const placeAbove = below < Math.min(naturalHeight, 168) && above > below;
    const available = Math.max(96, placeAbove ? above : below);
    const maxHeight = Math.min(280, available);
    state.menu.style.left = `${Math.round(left)}px`;
    state.menu.style.width = `${Math.round(width)}px`;
    state.menu.style.maxHeight = `${Math.round(maxHeight)}px`;
    state.menu.style.top = placeAbove
      ? `${Math.max(margin, Math.round(rect.top - maxHeight - 6))}px`
      : `${Math.min(viewportHeight - margin, Math.round(rect.bottom + 6))}px`;
  }

  function close(state, returnFocus = false) {
    if (!state?.open) return;
    state.open = false;
    render(state);
    state.wrapper.classList.remove("is-open");
    state.trigger.setAttribute("aria-expanded", "false");
    state.trigger.removeAttribute("aria-activedescendant");
    state.menu.hidden = true;
    if (state.menu.parentNode !== state.wrapper) state.wrapper.appendChild(state.menu);
    if (activeState === state) activeState = null;
    if (returnFocus) state.trigger.focus({ preventScroll: true });
  }

  function open(state) {
    if (state.select.disabled || state.open) return;
    if (activeState && activeState !== state) close(activeState);
    state.open = true;
    state.activeIndex = selectedIndex(state.select);
    state.menu.hidden = false;
    document.body.appendChild(state.menu);
    state.wrapper.classList.add("is-open");
    state.trigger.setAttribute("aria-expanded", "true");
    activeState = state;
    render(state);
    positionMenu(state);
    if (state.options[state.activeIndex]) {
      state.options[state.activeIndex].scrollIntoView({ block: "nearest" });
    }
  }

  function selectIndex(state, index) {
    const option = state.select.options[index];
    if (!option || option.disabled) return;
    const changed = state.select.value !== option.value;
    state.select.value = option.value;
    render(state);
    close(state, true);
    if (changed) state.select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function moveActive(state, amount) {
    const count = state.options.length;
    if (!count) return;
    const direction = amount < 0 ? -1 : 1;
    let index = state.activeIndex;
    for (let attempt = 0; attempt < count; attempt += 1) {
      index = (index + direction + count) % count;
      if (!state.select.options[index]?.disabled) break;
    }
    state.activeIndex = index;
    render(state);
    state.options[index]?.scrollIntoView({ block: "nearest" });
  }

  function onTriggerKeydown(state, event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!state.open) open(state);
      else moveActive(state, event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      if (!state.open) open(state);
      state.activeIndex = event.key === "Home" ? 0 : state.options.length - 1;
      render(state);
      state.options[state.activeIndex]?.scrollIntoView({ block: "nearest" });
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (state.open) selectIndex(state, state.activeIndex);
      else open(state);
      return;
    }
    if (event.key === "Escape" && state.open) {
      event.preventDefault();
      close(state, true);
      return;
    }
    if (event.key === "Tab" && state.open) close(state);
  }

  function installGlobalHandlers() {
    if (outsideListenerInstalled) return;
    outsideListenerInstalled = true;
    document.addEventListener("pointerdown", (event) => {
      if (!activeState) return;
      const target = event.target;
      if (activeState.wrapper.contains(target) || activeState.menu.contains(target)) return;
      close(activeState);
    }, true);
    window.addEventListener("resize", () => {
      if (activeState) positionMenu(activeState);
    }, { passive: true });
    window.addEventListener("scroll", () => {
      if (activeState) positionMenu(activeState);
    }, { passive: true, capture: true });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activeState) close(activeState, true);
    }, true);
  }

  function enhanceOne(select) {
    if (!(select instanceof HTMLSelectElement) || select.classList.contains(SELECT_CLASS)) return null;
    const label = rowLabel(select);
    const wrappingLabel = select.closest("label");
    if (wrappingLabel) {
      const replacement = document.createElement("div");
      replacement.className = wrappingLabel.className;
      Array.from(wrappingLabel.attributes).forEach((attribute) => {
        if (attribute.name !== "class" && attribute.name !== "for") {
          replacement.setAttribute(attribute.name, attribute.value);
        }
      });
      while (wrappingLabel.firstChild) replacement.appendChild(wrappingLabel.firstChild);
      wrappingLabel.replaceWith(replacement);
    }

    const wrapper = document.createElement("span");
    wrapper.className = WRAPPER_CLASS;
    wrapper.dataset.igxCustomCombo = "true";
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "igx-combo-trigger";
    trigger.setAttribute("role", "combobox");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", label || "Choose an option");
    const menu = document.createElement("div");
    menu.className = MENU_CLASS;
    menu.id = `igx-combo-listbox-${++nextId}`;
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", label || "Options");
    menu.hidden = true;
    trigger.setAttribute("aria-controls", menu.id);

    const options = Array.from(select.options).map((nativeOption, index) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "igx-combo-option";
      option.id = `${menu.id}-option-${index}`;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      option.setAttribute("tabindex", "-1");
      option.dataset.optionIndex = String(index);
      option.textContent = nativeOption.textContent.trim();
      option.disabled = nativeOption.disabled;
      option.addEventListener("click", () => selectIndex(state, index));
      menu.appendChild(option);
      return option;
    });

    const state = { select, wrapper, trigger, menu, options, activeIndex: selectedIndex(select), open: false };
    select.classList.add(SELECT_CLASS);
    select.setAttribute("aria-hidden", "true");
    select.tabIndex = -1;
    select.insertAdjacentElement("beforebegin", wrapper);
    wrapper.append(trigger, menu, select);
    trigger.addEventListener("click", () => state.open ? close(state) : open(state));
    trigger.addEventListener("keydown", (event) => onTriggerKeydown(state, event));
    render(state);
    installGlobalHandlers();
    return state;
  }

  function enhance(root = document) {
    if (!root?.querySelectorAll) return;
    const selects = [];
    if (root instanceof HTMLSelectElement) selects.push(root);
    selects.push(...root.querySelectorAll("select"));
    selects.forEach(enhanceOne);
  }

  function sync(root = document) {
    if (!root?.querySelectorAll) return;
    const selects = [];
    if (root instanceof HTMLSelectElement) selects.push(root);
    selects.push(...root.querySelectorAll(`select.${SELECT_CLASS}`));
    selects.forEach((select) => {
      const wrapper = select.closest(`.${WRAPPER_CLASS}`);
      const trigger = wrapper?.querySelector(".igx-combo-trigger");
      const menu = wrapper?.querySelector(`.${MENU_CLASS}`) || document.getElementById(trigger?.getAttribute("aria-controls") || "");
      if (!wrapper || !trigger || !menu) return;
      const options = Array.from(menu.querySelectorAll('[role="option"]'));
      render({ select, wrapper, trigger, menu, options, activeIndex: selectedIndex(select), open: trigger.getAttribute("aria-expanded") === "true" });
    });
  }

  window.IntergramComboBox = Object.freeze({ enhance, sync });
})();
