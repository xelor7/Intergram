// intergram · project by xelor — Manifest V3 service worker, v1.0.3
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

function migrateConfig(stored) {
  if (!stored) return { ...DEFAULT_CONFIG };
  const previousSchema = Number(stored.schemaVersion || 0);
  const migrated = { ...DEFAULT_CONFIG, ...stored, schemaVersion: 12 };
  if (!stored.schemaVersion && stored.theme === "obsidian-aurora") {
    Object.assign(migrated, {
      theme: DEFAULT_CONFIG.theme,
      blurStrength: DEFAULT_CONFIG.blurStrength,
      glassOpacity: DEFAULT_CONFIG.glassOpacity,
      borderRadius: DEFAULT_CONFIG.borderRadius,
      uiScale: DEFAULT_CONFIG.uiScale,
      dockScale: DEFAULT_CONFIG.dockScale,
      videoFilter: DEFAULT_CONFIG.videoFilter,
      videoAmbilight: DEFAULT_CONFIG.videoAmbilight,
      videoVibrance: DEFAULT_CONFIG.videoVibrance,
      hideSponsored: DEFAULT_CONFIG.hideSponsored,
      ambientOrbs: false,
      customCSS: ""
    });
  }
  if (previousSchema < 5) {
    const palette = THEME_ACCENTS[migrated.theme] || THEME_ACCENTS[DEFAULT_CONFIG.theme];
    migrated.accentColor = palette.accentColor;
    migrated.accentSecondary = palette.accentSecondary;
  }
  if (previousSchema < 8) {
    if (!Number.isFinite(Number(stored.ambientFrameRate)) || Number(stored.ambientFrameRate) === 8) {
      migrated.ambientFrameRate = DEFAULT_CONFIG.ambientFrameRate;
    }
    migrated.reelAmbientMode = "live";
  }
  const rate = Number(migrated.ambientFrameRate);
  migrated.ambientFrameRate = Number.isFinite(rate) ? Math.min(30, Math.max(2, rate)) : DEFAULT_CONFIG.ambientFrameRate;
  const gradientIntensity = Number(migrated.themeGradientIntensity);
  migrated.themeGradientIntensity = Number.isFinite(gradientIntensity) ? Math.min(150, Math.max(0, gradientIntensity)) : DEFAULT_CONFIG.themeGradientIntensity;
  migrated.baseGradientEnabled = migrated.baseGradientEnabled !== false;
  migrated.extraThemeGradient = migrated.extraThemeGradient === true;
  const topbarBlurStrength = Number(migrated.topbarBlurStrength);
  migrated.topbarBlurStrength = Number.isFinite(topbarBlurStrength) ? Math.min(28, Math.max(0, topbarBlurStrength)) : DEFAULT_CONFIG.topbarBlurStrength;
  migrated.topbarOpaqueOnScroll = previousSchema < 12 ? false : Boolean(migrated.topbarOpaqueOnScroll);
  if (!["live", "theme-gradient", "blend"].includes(migrated.reelAmbientMode)) migrated.reelAmbientMode = DEFAULT_CONFIG.reelAmbientMode;
  // Current builds deliberately preserve the native Direct inbox but do not
  // restore legacy Home-chat/Profile layouts removed from the current UI.
  migrated.profileRedesign = false;
  migrated.profileColumns = 3;
  migrated.profileGridGap = 9;
  migrated.homeChatPanel = false;
  return migrated;
}

chrome.runtime.onInstalled.addListener(async () => {
  const { intergramConfig } = await chrome.storage.sync.get("intergramConfig");
  const migrated = migrateConfig(intergramConfig);
  await chrome.storage.sync.set({ intergramConfig: migrated });
  chrome.action.setBadgeText({ text: "" });
});


chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync" || !changes.intergramConfig) return;
  const enabled = changes.intergramConfig.newValue?.enabled !== false;
  chrome.action.setBadgeText({ text: enabled ? "" : "OFF" });
  chrome.action.setBadgeBackgroundColor({ color: "#77736f" });
});

