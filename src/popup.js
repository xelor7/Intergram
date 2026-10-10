// intergram · project by xelor — extension popup, v1.0.0
const DEFAULT_CONFIG = {
  schemaVersion: 12,
  enabled: true,
  theme: "obsidian-glass",
  accentColor: "#8b7dff",
  accentSecondary: "#4fd6e0",
  blurStrength: 12,
  glassOpacity: 76,
  borderRadius: 18,
  uiScale: 100,
  dockScale: 1.04,
  dockLabels: true,
  dockAutoHide: false,
  videoFilter: "off",
  videoAmbilight: false,
  videoVibrance: 105,
  videoSmoothControls: true,
  animationPreset: "balanced",
  profileRedesign: false,
  profileColumns: 3,
  profileGridGap: 9,
  hideSponsored: false,
  blurDMsUntilHover: false,
  wideFeedMode: false,
  compactStories: false,
  ambientLight: true,
  ambientIntensity: 84,
  ambientBlur: 50,
  ambientSpread: 42,
  ambientFrameRate: 24,
  reelAmbientMode: "live",
  themeGradientIntensity: 100,
  baseGradientEnabled: true,
  extraThemeGradient: false,
  topbarBlurStrength: 14,
  topbarOpaqueOnScroll: false,
  immersiveReels: true,
  homeChatPanel: false,
  ambientOrbs: false,
  customCSS: ""
};

const THEME_ACCENTS = {
  "obsidian-glass": { accentColor: "#8b7dff", accentSecondary: "#4fd6e0" },
  "daylight-glass": { accentColor: "#6a5cff", accentSecondary: "#16a6b8" },
  "obsidian-aurora": { accentColor: "#78827b", accentSecondary: "#9aa09a" },
  "vision-frost": { accentColor: "#7898a4", accentSecondary: "#a1b2b4" },
  "cyber-aurora": { accentColor: "#77998a", accentSecondary: "#a0aaa0" },
  "rose-quartz": { accentColor: "#a66d78", accentSecondary: "#c09199" },
  "midnight-oled": { accentColor: "#737a75", accentSecondary: "#969b96" },
  "pure-black": { accentColor: "#68716b", accentSecondary: "#929892" },
  "solar-frosted": { accentColor: "#5965a5", accentSecondary: "#74839a" },
  "daylight-linen": { accentColor: "#44514a", accentSecondary: "#657169" },
  "instagram-spectrum": { accentColor: "#c13584", accentSecondary: "#f77737" },
  "arctic-glass": { accentColor: "#426d83", accentSecondary: "#678c95" },
  "matcha-glass": { accentColor: "#778e70", accentSecondary: "#a4a27e" },
  "cocoa-dusk": { accentColor: "#9f795f", accentSecondary: "#b1957d" }
};

let currentConfig = { ...DEFAULT_CONFIG };
let saveTimer = null;

function normalizeConfig(value) {
  const previousSchema = Number(value?.schemaVersion || 0);
  const config = { ...DEFAULT_CONFIG, ...(value || {}) };
  if (previousSchema < 8) {
    if (!Number.isFinite(Number(value?.ambientFrameRate)) || Number(value?.ambientFrameRate) === 8) {
      config.ambientFrameRate = DEFAULT_CONFIG.ambientFrameRate;
    }
    config.reelAmbientMode = "live";
  }
  config.baseGradientEnabled = config.baseGradientEnabled !== false;
  if (previousSchema < 12) config.topbarOpaqueOnScroll = false;
  else config.topbarOpaqueOnScroll = Boolean(config.topbarOpaqueOnScroll);
  config.schemaVersion = 12;
  config.enabled = Boolean(config.enabled);
  config.blurStrength = Math.min(28, Math.max(0, Number(config.blurStrength) || 0));
  config.glassOpacity = Math.min(100, Math.max(35, Number(config.glassOpacity) || 76));
  config.borderRadius = Math.min(28, Math.max(8, Number(config.borderRadius) || 18));
  config.uiScale = Math.min(110, Math.max(80, Number(config.uiScale) || 100));
  config.dockScale = Math.min(1.2, Math.max(.9, Number(config.dockScale) || 1.04));
  config.videoVibrance = Math.min(125, Math.max(90, Number(config.videoVibrance) || 105));
  if (!Object.prototype.hasOwnProperty.call(THEME_ACCENTS, config.theme)) config.theme = DEFAULT_CONFIG.theme;
  config.profileRedesign = false;
  config.profileColumns = 3;
  config.ambientLight = Boolean(config.ambientLight);
  const numeric = (value, fallback, min, max) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  };
  config.ambientIntensity = numeric(config.ambientIntensity, DEFAULT_CONFIG.ambientIntensity, 0, 100);
  config.ambientBlur = numeric(config.ambientBlur, DEFAULT_CONFIG.ambientBlur, 12, 100);
  config.ambientSpread = numeric(config.ambientSpread, DEFAULT_CONFIG.ambientSpread, 8, 96);
  config.ambientFrameRate = numeric(config.ambientFrameRate, DEFAULT_CONFIG.ambientFrameRate, 2, 30);
  config.themeGradientIntensity = numeric(config.themeGradientIntensity, DEFAULT_CONFIG.themeGradientIntensity, 0, 150);
  config.extraThemeGradient = config.extraThemeGradient === true;
  config.topbarBlurStrength = numeric(config.topbarBlurStrength, DEFAULT_CONFIG.topbarBlurStrength, 0, 28);
  config.topbarOpaqueOnScroll = Boolean(config.topbarOpaqueOnScroll);
  config.reelAmbientMode = ["live", "theme-gradient", "blend"].includes(config.reelAmbientMode) ? config.reelAmbientMode : "live";
  config.videoAmbilight = Boolean(config.videoAmbilight);
  config.immersiveReels = Boolean(config.immersiveReels);
  config.homeChatPanel = false;
  config.profileGridGap = 9;
  return config;
}

function valueFor(key, value) {
  if (["blurStrength", "topbarBlurStrength", "borderRadius", "profileGridGap", "ambientBlur", "ambientSpread"].includes(key)) return `${value}px`;
  if (["glassOpacity", "uiScale", "videoVibrance", "ambientIntensity", "themeGradientIntensity"].includes(key)) return `${value}%`;
  if (key === "ambientFrameRate") return `${value} fps`;
  if (key === "dockScale") return `${Number(value).toFixed(2)}×`;
  return String(value);
}

function syncUI(value) {
  currentConfig = normalizeConfig(value);
  const brandAccent = /^#[0-9a-f]{6}$/i.test(currentConfig.accentColor) ? currentConfig.accentColor : DEFAULT_CONFIG.accentColor;
  const themeAccentPair = THEME_ACCENTS[currentConfig.theme] || THEME_ACCENTS[DEFAULT_CONFIG.theme];
  const brandAccent2 = /^#[0-9a-f]{6}$/i.test(currentConfig.accentSecondary) ? currentConfig.accentSecondary : themeAccentPair.accentSecondary;
  document.documentElement.style.setProperty("--brand-accent", brandAccent);
  document.documentElement.style.setProperty("--brand-accent-2", brandAccent2);
  document.querySelectorAll("[data-setting]").forEach((control) => {
    const key = control.dataset.setting;
    const setting = currentConfig[key];
    if (control.type === "checkbox") control.checked = Boolean(setting);
    else control.value = String(setting);
  });
  document.querySelectorAll("[data-value-for]").forEach((output) => {
    const key = output.dataset.valueFor;
    output.textContent = valueFor(key, currentConfig[key]);
  });
  window.IntergramComboBox?.sync(document);
  document.querySelectorAll("[data-theme]").forEach((button) => {
    const active = button.dataset.theme === currentConfig.theme;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function queueSave(immediate = false) {
  clearTimeout(saveTimer);
  const persist = () => {
    chrome.storage.sync.set({ intergramConfig: currentConfig }, () => {
      const status = document.getElementById("status-text");
      if (chrome.runtime.lastError) {
        status.textContent = "Could not save settings.";
        return;
      }
      status.textContent = currentConfig.enabled ? "Settings sync to Instagram." : "intergram is paused.";
    });
  };
  if (immediate) persist();
  else saveTimer = setTimeout(persist, 120);
}

function readControl(control) {
  if (control.type === "checkbox") return control.checked;
  if (control.value === "true") return true;
  if (control.value === "false") return false;
  if (["blurStrength", "glassOpacity", "borderRadius", "uiScale", "videoVibrance", "profileColumns", "profileGridGap", "dockScale", "ambientIntensity", "ambientBlur", "ambientSpread", "ambientFrameRate", "themeGradientIntensity", "topbarBlurStrength"].includes(control.dataset.setting)) {
    return Number(control.value);
  }
  return control.value;
}

function save(partial, immediate = false) {
  currentConfig = normalizeConfig({ ...currentConfig, ...partial });
  syncUI(currentConfig);
  queueSave(immediate);
}

document.addEventListener("DOMContentLoaded", () => {
  window.IntergramComboBox?.enhance(document);
  chrome.storage.sync.get("intergramConfig", (result) => {
    syncUI(result.intergramConfig || DEFAULT_CONFIG);
  });

  document.querySelectorAll("[data-setting]").forEach((control) => {
    const eventName = control.type === "range" ? "input" : "change";
    control.addEventListener(eventName, () => save({ [control.dataset.setting]: readControl(control) }, control.dataset.setting === "reelAmbientMode"));
  });

  window.IntergramComboBox?.sync(document);
  document.querySelectorAll("[data-theme]").forEach((button) => {
    button.addEventListener("click", () => {
      const theme = button.dataset.theme;
      // Persist palette switches immediately so a quick refresh uses the new
      // theme even before the normal debounced control-save interval expires.
      save({ theme, ...(THEME_ACCENTS[theme] || {}) }, true);
    });
  });

  document.getElementById("reset-btn").addEventListener("click", () => save({ ...DEFAULT_CONFIG }));

  document.getElementById("open-studio").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs && tabs[0];
      if (!tab?.id) return;
      chrome.tabs.sendMessage(tab.id, { type: "intergram:open-studio" }, () => {
        const status = document.getElementById("status-text");
        if (chrome.runtime.lastError) status.textContent = "Open Instagram to use Studio.";
        else status.textContent = "Studio opened on Instagram.";
      });
    });
  });
});
