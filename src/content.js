// intergram · project by xelor
// Instagram Web content script — v1.0.2
(() => {
  "use strict";

  // Apply the supplied Reel scale to current and newly-rendered virtualized
  // blocks. This newer inline-important rule wins wherever it overlaps the
  // older, exact 0.90 Reel target; otherwise that target remains unchanged.
  (() => {
    const selector = 'div[data-virtualized="false"]';
    const applyScale = (root) => {
      const matches = [];
      if (root?.nodeType === 1 && root.matches(selector)) matches.push(root);
      root?.querySelectorAll?.(selector).forEach((reel) => matches.push(reel));
      matches.forEach((reel) => {
        reel.style.setProperty("transform", "scale(1.05)", "important");
        reel.style.setProperty("transform-origin", "center center", "important");
      });
    };

    applyScale(document);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "attributes") {
          applyScale(record.target);
          continue;
        }
        for (const node of record.addedNodes) {
          if (node.nodeType === 1) applyScale(node);
        }
      }
    });
    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-virtualized"]
    });
  })();

  // Install the requested native Reel resize rule from the extension rather
  // than requiring a one-off DevTools injection. At document_start, wait for
  // Instagram's head element before attaching the style node.
  (() => {
    const styleId = "ig-reel-resize";
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      html.intergram-active div.x78zum5.xedcshv.x1n2onr6.x16ye13r.x5lhr3w {
        transform: scale(0.90);
        transform-origin: top center;
      }
    `;
    const attachStyle = () => {
      const host = document.head || (document.readyState !== "loading" ? document.documentElement : null);
      if (!host) return false;
      document.getElementById(styleId)?.remove();
      host.appendChild(style);
      return true;
    };
    if (!attachStyle()) {
      const observer = new MutationObserver(() => {
        if (attachStyle()) observer.disconnect();
      });
      observer.observe(document, { childList: true, subtree: true });
      document.addEventListener("DOMContentLoaded", () => {
        if (attachStyle()) observer.disconnect();
      }, { once: true });
    }
  })();

  // Move the native Reel actions by the requested amount. The style is installed
  // once per page, is safe at document_start, and mirrors the CSS fallback.
  (() => {
    const styleId = "ig-actions-up";
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      html.intergram-active div.x13a6bvl.x1diwwjn.x1247r65 {
        transform: translateY(-58px) !important;
      }
    `;
    const attachStyle = () => {
      const host = document.head || (document.readyState !== "loading" ? document.documentElement : null);
      if (!host) return false;
      document.getElementById(styleId)?.remove();
      host.appendChild(style);
      return true;
    };
    if (!attachStyle()) {
      const observer = new MutationObserver(() => {
        if (attachStyle()) observer.disconnect();
      });
      observer.observe(document, { childList: true, subtree: true });
      document.addEventListener("DOMContentLoaded", () => {
        if (attachStyle()) observer.disconnect();
      }, { once: true });
    }
  })();

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

  // Instagram's own CSS consumes these RGB tokens throughout the app. Using
  // them is what makes a theme reach the full interface, not just Intergram cards.
  const IG_PALETTES = {
    "daylight-linen": { page: "#f3f4f1", secondary: "#e9ece8", surface: "#ffffff", highlight: "#f7f8f6", text: "#222724", muted: "#68716b", tertiary: "#8a928d", line: "#dfe3df", incoming: "#e9ece8", outgoing: "#44514a" },
    "solar-frosted": { page: "#f2f4f8", secondary: "#ebeff5", surface: "#ffffff", highlight: "#f7f8fb", text: "#202431", muted: "#687083", tertiary: "#9098a8", line: "#dfe3eb", incoming: "#e8edf3", outgoing: "#5965b4" },
    "arctic-glass": { page: "#eef4f7", secondary: "#e4edf2", surface: "#ffffff", highlight: "#f4f8fa", text: "#1a2c3b", muted: "#587083", tertiary: "#8ba0ad", line: "#d9e3e8", incoming: "#e4edf2", outgoing: "#346ea8" },
    "instagram-spectrum": { page: "#faf6fa", secondary: "#f5eef4", surface: "#ffffff", highlight: "#fff7fa", text: "#2d252c", muted: "#7a6976", tertiary: "#9a8995", line: "#eadfe7", incoming: "#f2eaf1", outgoing: "#c13584" },
    "obsidian-aurora": { page: "#111315", secondary: "#191b1d", surface: "#1b1d1f", highlight: "#27292a", text: "#f1f2f0", muted: "#a4a8a5", tertiary: "#777b78", line: "#383b39", incoming: "#27292a", outgoing: "#78827b" },
    "vision-frost": { page: "#111a20", secondary: "#172228", surface: "#192228", highlight: "#263238", text: "#edf2f4", muted: "#9eabb0", tertiary: "#71828a", line: "#35434a", incoming: "#263238", outgoing: "#7898a4" },
    "cyber-aurora": { page: "#121715", secondary: "#17211c", surface: "#19221e", highlight: "#26312a", text: "#edf3ef", muted: "#a0aca4", tertiary: "#748276", line: "#354238", incoming: "#26312a", outgoing: "#77998a" },
    "rose-quartz": { page: "#191517", secondary: "#241c20", surface: "#271f23", highlight: "#352a2e", text: "#f4eef0", muted: "#baa9af", tertiary: "#8e7d82", line: "#42363a", incoming: "#352a2e", outgoing: "#a66d78" },
    "midnight-oled": { page: "#050607", secondary: "#0b0c0d", surface: "#111213", highlight: "#1b1c1d", text: "#f2f3f2", muted: "#a3a5a3", tertiary: "#777a77", line: "#2d2f2e", incoming: "#1b1c1d", outgoing: "#737a75" },
    "pure-black": { page: "#000000", secondary: "#050606", surface: "#090a0a", highlight: "#161717", text: "#f1f2f0", muted: "#a2a4a1", tertiary: "#747774", line: "#2a2c2b", incoming: "#171818", outgoing: "#68716b" },
    "matcha-glass": { page: "#151a15", secondary: "#1b221b", surface: "#1d251e", highlight: "#293329", text: "#eef3ec", muted: "#a7b3a3", tertiary: "#768174", line: "#384238", incoming: "#293329", outgoing: "#74936f" },
    "cocoa-dusk": { page: "#1b1715", secondary: "#231e1b", surface: "#28211e", highlight: "#362b27", text: "#f3eae3", muted: "#bca99c", tertiary: "#8e7d73", line: "#443833", incoming: "#362b27", outgoing: "#bd8a6b" }
  };

  // "Glass Aurora" design-system palettes. These carry everything the legacy
  // palettes do, plus the glass material values the UI reads from CSS.
  const GLASS_THEMES = {
    "obsidian-glass": {
      page: "#0b0b0f", secondary: "#121218", surface: "#1a1a21", highlight: "#22222b",
      text: "#f2f2f7", muted: "#a1a1ad", tertiary: "#7a7a86", line: "#23232c",
      incoming: "#22222b", outgoing: "#8b7dff",
      accent: "#8b7dff", accent2: "#4fd6e0", accent3: "#ff7ac8",
      alphaSurface: "rgba(255, 255, 255, .06)",
      alphaSurface2: "rgba(255, 255, 255, .10)",
      alphaBorder: "rgba(255, 255, 255, .09)",
      rgbSurface: "26, 26, 33", rgbSurface2: "34, 34, 43", rgbBorder: "255, 255, 255",
      blur: "24px", saturate: "180%",
      shadow: "0 8px 32px rgba(0, 0, 0, .40)",
      scrim: "rgba(0, 0, 0, .45)",
      hover: "rgba(255, 255, 255, .06)",
      onAccent: "#0b0b0f",
      scheme: "dark"
    },
    "daylight-glass": {
      page: "#f5f5f7", secondary: "#eceef3", surface: "#ffffff", highlight: "#fafafc",
      text: "#16181d", muted: "#5d6472", tertiary: "#8a92a1", line: "#e3e5ea",
      incoming: "#eceef3", outgoing: "#6a5cff",
      accent: "#6a5cff", accent2: "#16a6b8", accent3: "#e0559f",
      alphaSurface: "rgba(255, 255, 255, .62)",
      alphaSurface2: "rgba(255, 255, 255, .85)",
      alphaBorder: "rgba(15, 18, 25, .10)",
      rgbSurface: "255, 255, 255", rgbSurface2: "250, 250, 252", rgbBorder: "15, 18, 25",
      blur: "20px", saturate: "170%",
      shadow: "0 8px 32px rgba(31, 38, 56, .12)",
      scrim: "rgba(18, 22, 32, .38)",
      hover: "rgba(15, 18, 25, .05)",
      onAccent: "#ffffff",
      scheme: "light"
    }
  };

  function paletteOf(theme) {
    return GLASS_THEMES[theme] || IG_PALETTES[theme] || GLASS_THEMES["obsidian-glass"];
  }

  function legacyPalette(theme) {
    const palette = paletteOf(theme);
    const accent = THEME_ACCENTS[theme] || THEME_ACCENTS["obsidian-glass"];
    const dark = palette.scheme ? palette.scheme === "dark"
      : !["daylight-linen", "solar-frosted", "arctic-glass", "instagram-spectrum"].includes(theme);
    return {
      page: palette.page,
      secondary: palette.secondary,
      surface: palette.surface,
      highlight: palette.highlight,
      text: palette.text,
      muted: palette.muted,
      tertiary: palette.tertiary,
      line: palette.line,
      incoming: palette.incoming,
      outgoing: palette.outgoing,
      accent: accent.accentColor,
      accent2: accent.accentSecondary,
      accent3: palette.accent2 || accent.accentSecondary,
      alphaSurface: palette.alphaSurface || `rgba(${hexToRgb(palette.surface)}, ${dark ? .58 : .72})`,
      alphaSurface2: palette.alphaSurface2 || `rgba(${hexToRgb(palette.surface)}, ${dark ? .72 : .9})`,
      alphaBorder: palette.alphaBorder || `rgba(${hexToRgb(palette.line)}, ${dark ? .5 : .75})`,
      rgbSurface: palette.rgbSurface || hexToRgb(palette.surface),
      rgbSurface2: palette.rgbSurface2 || hexToRgb(palette.highlight),
      rgbBorder: palette.rgbBorder || hexToRgb(palette.line),
      blur: palette.blur || `${config.blurStrength}px`,
      saturate: palette.saturate || "170%",
      shadow: palette.shadow || (dark ? "0 8px 32px rgba(0, 0, 0, .40)" : "0 8px 32px rgba(31, 38, 56, .12)"),
      scrim: palette.scrim || (dark ? "rgba(0, 0, 0, .45)" : "rgba(18, 22, 32, .38)"),
      hover: palette.hover || (dark ? "rgba(255, 255, 255, .06)" : "rgba(15, 18, 25, .05)"),
      onAccent: palette.onAccent || (dark ? "#0b0b0f" : "#ffffff"),
      scheme: dark ? "dark" : "light"
    };
  }

  const THEME_NAMES = Object.keys(THEME_ACCENTS);
  const RESERVED_PROFILE_PATHS = new Set([
    "about", "accounts", "challenge", "create", "direct", "emails", "explore",
    "legal", "login", "p", "reel", "reels", "stories", "web"
  ]);
  const PROFILE_SUBROUTES = new Set(["saved", "tagged", "reels", "mentions", "followers", "following"]);
  const ROUTE_PREFIXES = [
    ".igx-native-sidebar a[href]",
    "nav:not(#igx-route-nav):not(#igx-home-nav):not(#igx-top-actions) a[href]",
    '[role="navigation"]:not(#igx-route-nav):not(#igx-home-nav):not(#igx-top-actions) a[href]'
  ];

  let bootstrapConfigCached = false;
  function readBootstrapConfig() {
    try {
      const cached = localStorage.getItem("intergram_xelor_config");
      if (!cached) return { ...DEFAULT_CONFIG };
      bootstrapConfigCached = true;
      return migrateLegacyConfig(JSON.parse(cached));
    } catch (_) {
      return { ...DEFAULT_CONFIG };
    }
  }
  function cacheConfigLocally(value) {
    try { localStorage.setItem("intergram_xelor_config", JSON.stringify(value)); }
    catch (_) { /* Storage can be blocked; the live tab still works. */ }
  }

  // Paint the last known preferences synchronously at document_start, then
  // reconcile with chrome.storage.sync once its asynchronous read completes.
  let config = readBootstrapConfig();
  let enhancementQueued = false;
  let enhancementTimer = 0;
  let configPersistTimer = 0;
  let pendingEnhancement = createEnhancementFlags();
  let lastClassifiedPath = "";
  let lastClassifiedPage = "";
  let observer = null;
  let bootScreen = null;
  let bootConfigReady = bootstrapConfigCached;
  let bootDomReady = false;
  let bootDismissQueued = false;
  let bootFailsafe = 0;
  let bootReadinessObserver = null;
  let bootReadinessTimer = 0;
  let bootLastMutationAt = 0;
  let bootReadySince = 0;
  let bootProgressFill = null;
  let bootProgressTimer = 0;
  let bootProgressValue = 8;
  let scrollRevealObserver = null;
  let chromePersistenceObserver = null;
  let applyingConfig = false;
  let lastSponsoredFilterState = null;
  let themeTokensApplied = false;
  let topbarScrollFrame = 0;
  const originalInlineThemeStyles = new Map();
  const themeStyleNames = new Set();

  function createEnhancementFlags() {
    return { routeChanged: false, sidebar: false, articles: false, stories: false, media: false, messages: false, videos: false, navigation: false, suggestions: false, activity: false, notifications: false, search: false, profile: false };
  }

  const clamp = (value, min, max, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  };

  function normalizeConfig(value) {
    const previousSchema = Number(value?.schemaVersion || 0);
    const next = { ...DEFAULT_CONFIG, ...(value || {}) };
    if (!THEME_NAMES.includes(next.theme)) next.theme = DEFAULT_CONFIG.theme;
    next.enabled = Boolean(next.enabled);
    next.blurStrength = clamp(next.blurStrength, 0, 28, DEFAULT_CONFIG.blurStrength);
    next.glassOpacity = clamp(next.glassOpacity, 35, 100, DEFAULT_CONFIG.glassOpacity);
    next.borderRadius = clamp(next.borderRadius, 8, 28, DEFAULT_CONFIG.borderRadius);
    next.uiScale = clamp(next.uiScale, 80, 110, DEFAULT_CONFIG.uiScale);
    next.dockScale = clamp(next.dockScale, 0.9, 1.2, DEFAULT_CONFIG.dockScale);
    next.videoVibrance = clamp(next.videoVibrance, 90, 125, DEFAULT_CONFIG.videoVibrance);
    next.profileColumns = 3;
    next.profileGridGap = DEFAULT_CONFIG.profileGridGap;
    next.dockLabels = Boolean(next.dockLabels);
    next.dockAutoHide = Boolean(next.dockAutoHide);
    next.videoAmbilight = Boolean(next.videoAmbilight);
    next.videoSmoothControls = Boolean(next.videoSmoothControls);
    next.profileRedesign = false;
    next.hideSponsored = Boolean(next.hideSponsored);
    next.blurDMsUntilHover = Boolean(next.blurDMsUntilHover);
    next.wideFeedMode = Boolean(next.wideFeedMode);
    next.compactStories = Boolean(next.compactStories);
    next.ambientLight = Boolean(next.ambientLight);
    next.ambientIntensity = clamp(next.ambientIntensity, 0, 100, DEFAULT_CONFIG.ambientIntensity);
    next.ambientBlur = clamp(next.ambientBlur, 12, 100, DEFAULT_CONFIG.ambientBlur);
    next.ambientSpread = clamp(next.ambientSpread, 8, 96, DEFAULT_CONFIG.ambientSpread);
    next.ambientFrameRate = clamp(next.ambientFrameRate, 2, 30, DEFAULT_CONFIG.ambientFrameRate);
    next.reelAmbientMode = ["live", "theme-gradient", "blend"].includes(next.reelAmbientMode)
      ? next.reelAmbientMode
      : DEFAULT_CONFIG.reelAmbientMode;
    next.themeGradientIntensity = clamp(next.themeGradientIntensity, 0, 150, DEFAULT_CONFIG.themeGradientIntensity);
    next.baseGradientEnabled = next.baseGradientEnabled !== false;
    next.extraThemeGradient = next.extraThemeGradient === true;
    next.topbarBlurStrength = clamp(next.topbarBlurStrength, 0, 28, DEFAULT_CONFIG.topbarBlurStrength);
    next.topbarOpaqueOnScroll = previousSchema < 12 ? false : Boolean(next.topbarOpaqueOnScroll);
    next.immersiveReels = Boolean(next.immersiveReels);
    // Home chat was explicitly removed from the Home layout; Direct remains the inbox.
    next.homeChatPanel = false;
    next.ambientOrbs = Boolean(next.ambientOrbs);
    next.animationPreset = ["balanced", "snappy", "gentle"].includes(next.animationPreset)
      ? next.animationPreset
      : "balanced";
    next.videoFilter = ["off", "ultra-crisp", "cinema-hdr"].includes(next.videoFilter)
      ? next.videoFilter
      : "off";
    next.customCSS = typeof next.customCSS === "string" ? next.customCSS.slice(0, 8000) : "";
    next.schemaVersion = 12;
    return next;
  }

  function migrateLegacyConfig(value) {
    const previousSchema = Number(value?.schemaVersion || 0);
    const migrated = normalizeConfig(value || DEFAULT_CONFIG);
    if (value && !value.schemaVersion && value.theme === "obsidian-aurora") {
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
    if (value && Number(value.schemaVersion || 0) < 5) {
      const palette = THEME_ACCENTS[migrated.theme] || THEME_ACCENTS[DEFAULT_CONFIG.theme];
      migrated.accentColor = palette.accentColor;
      migrated.accentSecondary = palette.accentSecondary;
    }
    if (previousSchema < 8) {
      // v4.2.8's 8 fps value was the default; lift that default to the smoother
      // low-resolution live-frame target while preserving explicit lower rates.
      if (!Number.isFinite(Number(value?.ambientFrameRate)) || Number(value?.ambientFrameRate) === 8) {
        migrated.ambientFrameRate = DEFAULT_CONFIG.ambientFrameRate;
      }
      migrated.reelAmbientMode = "live";
    }
    return normalizeConfig(migrated);
  }

  function safeColor(value, fallback) {
    return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? value : fallback;
  }

  function hexToRgb(hex) {
    const value = safeColor(hex, "#c13584").slice(1);
    return `${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)}`;
  }

  function setRootAttribute(root, name, value) {
    if (value === undefined || value === null) root.removeAttribute(name);
    else root.setAttribute(name, String(value));
  }

  function setThemeToken(root, name, value) {
    if (!originalInlineThemeStyles.has(name)) {
      originalInlineThemeStyles.set(name, {
        value: root.style.getPropertyValue(name),
        priority: root.style.getPropertyPriority(name)
      });
    }
    themeStyleNames.add(name);
    root.style.setProperty(name, value, "important");
  }

  function restoreThemeTokens(root) {
    themeStyleNames.forEach((name) => {
      const original = originalInlineThemeStyles.get(name);
      if (original?.value) root.style.setProperty(name, original.value, original.priority);
      else root.style.removeProperty(name);
    });
  }

  // Clean camera mark. Its gradient follows the selected theme palette and
  // updates live through the root's --igx-brand-gradient-* tokens.
  let brandGlyphInstance = 0;
  function brandMarkSVG() {
    const gradientId = `igx-brand-gradient-${++brandGlyphInstance}`;
    return `<svg class="igx-brand-glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><defs><linearGradient id="${gradientId}" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:var(--igx-brand-gradient-1,#8b7dff) !important"/><stop offset=".5" style="stop-color:var(--igx-brand-gradient-2,#4fd6e0) !important"/><stop offset="1" style="stop-color:var(--igx-brand-gradient-3,#ff7ac8) !important"/></linearGradient></defs><rect x="3.1" y="3.1" width="17.8" height="17.8" rx="5.1" fill="none" stroke-width="2.3" style="stroke:url(#${gradientId}) !important;fill:none !important"/><circle cx="12" cy="12" r="4.05" fill="none" stroke-width="2.3" style="stroke:url(#${gradientId}) !important;fill:none !important"/><circle cx="17.55" cy="6.55" r="1.2" style="fill:url(#${gradientId}) !important;stroke:none !important"/></svg>`;
  }

  function brandGradientStops() {
    const accents = THEME_ACCENTS[config.theme] || THEME_ACCENTS["obsidian-glass"];
    const palette = paletteOf(config.theme);
    return [
      safeColor(config.accentColor, accents.accentColor),
      safeColor(config.accentSecondary, accents.accentSecondary),
      safeColor(palette.accent3 || palette.outgoing || accents.accentColor, accents.accentColor)
    ];
  }

  let themeFaviconObserver = null;
  let themeFaviconQueued = false;
  function themeFaviconDataURL() {
    const [first, second, third] = brandGradientStops();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><linearGradient id="g" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse"><stop stop-color="${first}"/><stop offset=".5" stop-color="${second}"/><stop offset="1" stop-color="${third}"/></linearGradient></defs><rect x="3.1" y="3.1" width="17.8" height="17.8" rx="5.1" fill="none" stroke="url(#g)" stroke-width="2.3"/><circle cx="12" cy="12" r="4.05" fill="none" stroke="url(#g)" stroke-width="2.3"/><circle cx="17.55" cy="6.55" r="1.2" fill="url(#g)"/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  function syncThemeFavicon() {
    const head = document.head;
    if (!head) return;
    const existing = head.querySelector('link[data-igx-theme-favicon="true"]');
    if (!config.enabled) {
      existing?.remove();
      return;
    }
    let link = existing;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.dataset.igxThemeFavicon = "true";
      head.appendChild(link);
    }
    const href = themeFaviconDataURL();
    if (link.href !== href) link.href = href;
    // Keep the themed icon after Instagram's own favicon entries.
    if (head.lastElementChild !== link) head.appendChild(link);
    if (!themeFaviconObserver && window.MutationObserver) {
      themeFaviconObserver = new MutationObserver(() => {
        if (config.enabled && document.head?.lastElementChild !== document.head?.querySelector('link[data-igx-theme-favicon="true"]')) {
          if (themeFaviconQueued) return;
          themeFaviconQueued = true;
          window.setTimeout(() => { themeFaviconQueued = false; syncThemeFavicon(); }, 0);
        }
      });
      themeFaviconObserver.observe(head, { childList: true });
    }
  }

  function socialLinksMarkup(className = "igx-social-links") {
    return `<nav class="${className}" aria-label="Intergram social links">
      <a href="https://github.com/xelor7" target="_blank" rel="noreferrer" title="GitHub · xelor7" aria-label="GitHub, xelor7"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .7a11.3 11.3 0 0 0-3.57 22.02c.57.1.78-.25.78-.55v-2.1c-3.18.69-3.85-1.35-3.85-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.35.95.1-.73.4-1.24.7-1.53-2.54-.29-5.2-1.27-5.2-5.65 0-1.25.44-2.28 1.17-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.75.11 3.04.73.8 1.17 1.83 1.17 3.08 0 4.39-2.67 5.36-5.22 5.64.41.35.77 1.02.77 2.06v3.17c0 .3.21.66.79.55A11.3 11.3 0 0 0 12 .7Z"/></svg><span>GitHub</span></a>
      <a href="https://www.youtube.com/@xelor7" target="_blank" rel="noreferrer" title="YouTube · @xelor7" aria-label="YouTube, at xelor seven"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8Z"/><path d="m9.6 15.7 6.2-3.7-6.2-3.7v7.4Z" fill="#fff"/></svg><span>YouTube</span></a>
      <a href="https://dsc.gg/xelor" target="_blank" rel="noreferrer" title="Discord · dsc.gg/xelor" aria-label="Discord, d s c dot g g slash xelor"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.7 5.2A19.3 19.3 0 0 0 15 3.75l-.58 1.18a17.8 17.8 0 0 0-4.84 0L9 3.75a19.3 19.3 0 0 0-4.7 1.45C1.33 9.56.52 13.84.92 18.06a19.4 19.4 0 0 0 5.8 2.91l1.25-2.03c-.69-.26-1.34-.58-1.95-.97l.48-.37c3.77 1.75 7.86 1.75 11.58 0l.49.37c-.62.39-1.27.72-1.96.98l1.25 2.02a19.3 19.3 0 0 0 5.8-2.9c.47-4.9-.8-9.14-3.97-12.87ZM8.7 15.15c-1.13 0-2.05-1.04-2.05-2.32s.9-2.33 2.05-2.33 2.08 1.05 2.06 2.33c0 1.28-.91 2.32-2.06 2.32Zm6.6 0c-1.13 0-2.05-1.04-2.05-2.32s.9-2.33 2.05-2.33 2.08 1.05 2.06 2.33c0 1.28-.9 2.32-2.06 2.32Z"/></svg><span>Discord</span></a>
    </nav>`;
  }

  function showBootScreen() {
    // Cover the unthemed first paint with the camera and a compact, staged
    // progress bar driven by document, app-root, theme, and content readiness.
    if (!document.documentElement || bootScreen) return;
    bootScreen = document.createElement("div");
    bootScreen.id = "igx-boot-screen";
    bootScreen.setAttribute("role", "status");
    bootScreen.setAttribute("aria-label", "Loading Instagram");
    bootScreen.setAttribute("aria-live", "polite");
    const logo = document.createElement("span");
    logo.className = "igx-boot-logo";
    logo.setAttribute("aria-hidden", "true");
    logo.innerHTML = brandMarkSVG();
    const progress = document.createElement("div");
    progress.className = "igx-boot-progress";
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-label", "Instagram loading progress");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", "100");
    progress.setAttribute("aria-valuenow", "8");
    const fill = document.createElement("i");
    fill.setAttribute("aria-hidden", "true");
    progress.appendChild(fill);
    bootScreen.append(logo, progress);
    document.documentElement.appendChild(bootScreen);
    bootProgressFill = fill;
    bootProgressValue = 8;
    setBootProgress(bootProgressValue);
    tickBootProgress();
    startBootReadinessObserver();
    // A stalled page can never leave the indicator running indefinitely.
    bootFailsafe = window.setTimeout(dismissBootScreen, 3600);
  }

  function setBootProgress(value) {
    const next = Math.max(bootProgressValue, Math.min(100, Number(value) || 0));
    bootProgressValue = next;
    if (!bootProgressFill?.isConnected) return;
    bootProgressFill.style.setProperty("width", `${next}%`, "important");
    bootProgressFill.parentElement?.setAttribute("aria-valuenow", String(Math.round(next)));
  }

  function bootProgressGoal() {
    let goal = 10;
    if (document.readyState !== "loading") goal = 24;
    if (document.body) goal = 34;
    if (document.querySelector('[id^="mount_"], #react-root')) goal = 52;
    if (getPageMain()) goal = 68;
    if (bootDomReady) goal = 78;
    if (bootConfigReady) goal = 86;
    if (bootThemeIsReady()) goal = 92;
    if (pageHasUsableContent()) goal = 97;
    return goal;
  }

  function tickBootProgress() {
    if (!bootScreen || bootDismissQueued) return;
    let goal = 10;
    try { goal = bootProgressGoal(); } catch (_) { /* keep the staged indicator moving */ }
    if (bootProgressValue < goal) {
      setBootProgress(bootProgressValue + Math.max(.8, (goal - bootProgressValue) * .24));
    } else if (bootProgressValue < 92) {
      // Hold back the final few percent until Instagram's native content is ready.
      setBootProgress(Math.min(92, bootProgressValue + .14));
    }
    bootProgressTimer = window.setTimeout(tickBootProgress, 90);
  }

  function startBootReadinessObserver() {
    if (!document.documentElement || bootReadinessObserver || !window.MutationObserver) return;
    bootReadinessObserver = new MutationObserver((records) => {
      const meaningful = records.some((record) => {
        const target = record.target?.nodeType === 1 ? record.target : record.target?.parentElement;
        return !target?.closest?.("#igx-boot-screen, #igx-topbar, #igx-route-nav-wrap, #igx-home-sidebar, #igx-studio-drawer, .igx-reel-author");
      });
      if (!meaningful) return;
      bootLastMutationAt = performance.now();
      window.clearTimeout(bootReadinessTimer);
      bootReadinessTimer = window.setTimeout(checkBootReady, 50);
    });
    bootReadinessObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  function pageHasUsableContent() {
    if (!document.body || document.readyState === "loading") return false;
    const appRoot = document.querySelector('[id^="mount_"], #react-root');
    if (!appRoot) return false;
    const main = getPageMain();
    if (!main) return false;
    const text = (main.innerText || main.textContent || "").replace(/\s+/g, " ").trim();
    const page = currentPageName();
    if (page === "home") {
      return Boolean(main.querySelector('article, [role="feed"] article, video, a[href*="/stories/"]')) ||
        /no posts|you.re all caught up|start following|nothing to show/i.test(text);
    }
    if (page === "reels") {
      return Boolean(main.querySelector('video, article, [aria-label*="reel" i]')) || text.length > 100;
    }
    if (page === "profile") {
      return Boolean(main.querySelector('header, article, a[href*="/p/"], a[href*="/reel/"]')) || text.length > 100;
    }
    if (page === "direct") {
      return Boolean(main.querySelector('[role="list"], [role="grid"], [role="tabpanel"], a[href*="/direct/t/"]')) || text.length > 80;
    }
    return main.children.length > 0 && text.length > 40;
  }

  function bootThemeIsReady() {
    if (!config.enabled) return true;
    const root = document.documentElement;
    return Boolean(root && themeTokensApplied && root.classList.contains("intergram-active") &&
      root.style.getPropertyValue("--igx-theme-page-color"));
  }

  function dismissBootScreen() {
    if (!bootScreen || bootDismissQueued) return;
    bootDismissQueued = true;
    setBootProgress(100);
    window.clearTimeout(bootFailsafe);
    window.clearTimeout(bootReadinessTimer);
    window.clearTimeout(bootProgressTimer);
    bootProgressTimer = 0;
    bootReadinessObserver?.disconnect();
    bootReadinessObserver = null;
    bootScreen.classList.add("is-leaving");
    window.setTimeout(() => {
      bootScreen?.remove();
      bootScreen = null;
      bootProgressFill = null;
    }, 155);
  }

  function checkBootReady() {
    if (!bootScreen || bootDismissQueued || !bootConfigReady || !bootDomReady) return;
    if (!bootThemeIsReady() || !pageHasUsableContent()) {
      bootReadySince = 0;
      window.clearTimeout(bootReadinessTimer);
      bootReadinessTimer = window.setTimeout(checkBootReady, 90);
      return;
    }
    const now = performance.now();
    if (!bootReadySince) bootReadySince = now;
    const contentStable = now - bootLastMutationAt >= 110;
    const readyStable = now - bootReadySince >= 150;
    if (contentStable && readyStable) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (bootThemeIsReady() && pageHasUsableContent()) dismissBootScreen();
        else { bootReadySince = 0; checkBootReady(); }
      }));
      return;
    }
    window.clearTimeout(bootReadinessTimer);
    bootReadinessTimer = window.setTimeout(checkBootReady, 50);
  }

  function getScrollRevealObserver() {
    const reducedMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
    if (!window.IntersectionObserver || reducedMotion) return null;
    if (!scrollRevealObserver) {
      scrollRevealObserver = new IntersectionObserver((entries, activeObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("igx-scroll-revealed");
          activeObserver.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -28px 0px", threshold: 0.06 });
    }
    return scrollRevealObserver;
  }

  function markScrollReveal(root) {
    if (!root?.querySelectorAll) return;
    if (!config.enabled || currentPageName() !== "home") {
      root.querySelectorAll(".igx-scroll-reveal, .igx-scroll-revealed").forEach((node) => {
        scrollRevealObserver?.unobserve(node);
        node.classList.remove("igx-scroll-reveal", "igx-scroll-revealed");
      });
      return;
    }
    const selector = "article.igx-post-card";
    const candidates = [];
    if (root.matches?.(selector)) candidates.push(root);
    candidates.push(...root.querySelectorAll(selector));
    const revealObserver = getScrollRevealObserver();
    candidates.forEach((node) => {
      if (node.closest(".igx-home-suggestion-module") || node.classList.contains("igx-scroll-reveal")) return;
      node.classList.add("igx-scroll-reveal");
      if (revealObserver) revealObserver.observe(node);
      else node.classList.add("igx-scroll-revealed");
    });
  }

  function clearScrollReveal() {
    document.querySelectorAll(".igx-scroll-reveal").forEach((node) => {
      scrollRevealObserver?.unobserve(node);
      node.classList.remove("igx-scroll-reveal", "igx-scroll-revealed");
    });
  }

  function applyInstagramThemeTokens(root) {
    const palette = paletteOf(config.theme);
    const rgb = (hex) => hexToRgb(hex);
    const fallbackAccents = THEME_ACCENTS[config.theme] || THEME_ACCENTS[DEFAULT_CONFIG.theme];
    const accent = safeColor(config.accentColor, fallbackAccents.accentColor);
    const accent2 = safeColor(config.accentSecondary, fallbackAccents.accentSecondary);
    const dark = (palette.scheme ? palette.scheme === "dark" : !["daylight-linen", "solar-frosted", "arctic-glass", "instagram-spectrum"].includes(config.theme));
    const pageRgb = rgb(palette.page);
    const secondaryRgb = rgb(palette.secondary);
    const surfaceRgb = rgb(palette.surface);
    const highlightRgb = rgb(palette.highlight);
    const textRgb = rgb(palette.text);
    const mutedRgb = rgb(palette.muted);
    const tertiaryRgb = rgb(palette.tertiary);
    const lineRgb = rgb(palette.line);
    const accentRgb = rgb(accent);
    const accent2Rgb = rgb(accent2);
    const whiteRgb = "255, 255, 255";
    const hoverOverlay = dark ? "255, 255, 255, .075" : "0, 0, 0, .055";
    const blurTint = dark ? `${pageRgb}, .78` : `${whiteRgb}, .84`;
    const themeAliases = {
      "--igx-page": palette.page,
      "--igx-surface-rgb": surfaceRgb,
      "--igx-elevated-rgb": surfaceRgb,
      "--igx-text": palette.text,
      "--igx-muted": palette.muted,
      "--igx-theme-page-rgb": pageRgb,
      "--igx-theme-secondary-rgb": secondaryRgb,
      "--igx-theme-surface-rgb": surfaceRgb,
      "--igx-theme-highlight-rgb": highlightRgb,
      "--igx-theme-text-rgb": textRgb,
      "--igx-theme-muted-rgb": mutedRgb,
      "--igx-theme-tertiary-rgb": tertiaryRgb,
      "--igx-theme-line-rgb": lineRgb,
      "--igx-theme-incoming-rgb": rgb(palette.incoming),
      "--igx-theme-incoming-color": palette.incoming,
      "--igx-theme-accent-rgb": accentRgb,
      "--igx-theme-page-color": palette.page,
      "--igx-theme-secondary-color": palette.secondary,
      "--igx-theme-surface-color": palette.surface,
      "--igx-theme-highlight-color": palette.highlight,
      "--igx-theme-text-color": palette.text,
      "--igx-theme-muted-color": palette.muted,
      "--igx-theme-tertiary-color": palette.tertiary,
      "--igx-theme-line-color": palette.line,
      "--igx-theme-accent-color": accent,
      "--igx-theme-accent-soft": `rgba(${accentRgb}, .14)`,
      "--igx-theme-hover-overlay": hoverOverlay,
      "--igx-theme-background-blur": blurTint,
      "--igx-theme-radius": `${config.borderRadius}px`
    };
    Object.entries(themeAliases).forEach(([name, tokenValue]) => setThemeToken(root, name, tokenValue));
    const tokens = {
      "--barcelona-logo": textRgb,
      "--barcelona-primary-button": accentRgb,
      "--barcelona-primary-button-background": accent,
      "--barcelona-primary-button-text": "#ffffff",
      "--text-secondary": `rgb(${mutedRgb})`,
      "--challenge-link": accentRgb,
      "--grey-0": highlightRgb,
      "--grey-1": secondaryRgb,
      "--grey-2": lineRgb,
      "--grey-3": lineRgb,
      "--grey-4": tertiaryRgb,
      "--grey-5": mutedRgb,
      "--grey-6": mutedRgb,
      "--grey-7": mutedRgb,
      "--grey-8": textRgb,
      "--grey-9": textRgb,
      "--grey-10": textRgb,
      "--blue-0": highlightRgb,
      "--blue-1": secondaryRgb,
      "--blue-2": accentRgb,
      "--blue-3": accentRgb,
      "--blue-4": accentRgb,
      "--blue-5": accentRgb,
      "--blue-6": accentRgb,
      "--blue-7": accentRgb,
      "--blue-8": accentRgb,
      "--blue-9": accentRgb,
      "--ig-primary-background": pageRgb,
      "--ig-secondary-background": secondaryRgb,
      "--ig-secondary-elevated-background": secondaryRgb,
      "--ig-elevated-background": surfaceRgb,
      "--ig-elevated-highlight-background": highlightRgb,
      "--ig-elevated-separator": lineRgb,
      "--ig-banner-background": surfaceRgb,
      "--ig-banner-highlight-background": highlightRgb,
      "--ig-bubble-background": surfaceRgb,
      "--ig-dropdown-background": surfaceRgb,
      "--ig-highlight-background": highlightRgb,
      "--ig-temporary-highlight": highlightRgb,
      "--web-secondary-action": highlightRgb,
      "--ig-hover-overlay": hoverOverlay,
      "--ig-surface-background": pageRgb,
      "--ig-menu-background-color": surfaceRgb,
      "--ig-menu-text-color": textRgb,
      "--ig-primary-text": textRgb,
      "--ig-secondary-text": mutedRgb,
      "--ig-tertiary-text": tertiaryRgb,
      "--ig-primary-icon": textRgb,
      "--ig-secondary-icon": mutedRgb,
      "--ig-tertiary-icon": tertiaryRgb,
      "--ig-link": accentRgb,
      "--ig-colors-link-text": accentRgb,
      "--ig-colors-button-borderless-text": accentRgb,
      "--ig-colors-button-borderless-text--hover": accentRgb,
      "--ig-colors-button-primary-background": accentRgb,
      "--ig-colors-button-primary-background--hover": accentRgb,
      "--ig-colors-button-primary-background--pressed": accentRgb,
      "--ig-colors-button-primary-background--disabled": tertiaryRgb,
      "--ig-colors-button-primary-link-text": accentRgb,
      "--ig-colors-button-primary-link-text--hover": accentRgb,
      "--ig-colors-button-primary-link-text--disabled": tertiaryRgb,
      "--ig-colors-button-primary-text": whiteRgb,
      "--ig-colors-button-primary-text--disabled": whiteRgb,
      "--ig-colors-button-secondary-background": secondaryRgb,
      "--ig-colors-button-secondary-background--hover": highlightRgb,
      "--ig-colors-button-secondary-background--pressed": highlightRgb,
      "--ig-colors-button-secondary-link-text": accentRgb,
      "--ig-colors-button-secondary-text": textRgb,
      "--ig-primary-button": accentRgb,
      "--ig-primary-button-background": accentRgb,
      "--ig-primary-button-hover": accentRgb,
      "--ig-secondary-button": textRgb,
      "--ig-secondary-button-background": secondaryRgb,
      "--ig-secondary-button-hover": highlightRgb,
      "--ig-tertiary-button-background": surfaceRgb,
      "--ig-tertiary-button-border": lineRgb,
      "--ig-tertiary-button-hover": highlightRgb,
      "--ig-tertiary-button-text": textRgb,
      "--ig-separator": lineRgb,
      "--ig-stroke": lineRgb,
      "--ig-tablist-border": lineRgb,
      "--ig-input-border-primary": lineRgb,
      "--ig-input-border-secondary": lineRgb,
      "--ig-input-text-and-icon-primary": textRgb,
      "--ig-input-text-and-icon-secondary": mutedRgb,
      "--ig-text-input-border-prism": lineRgb,
      "--ig-text-input-border-hover-prism": tertiaryRgb,
      "--ig-background-blur": blurTint,
      "--ig-focus-stroke": accentRgb,
      "--ig-toggle-background-on-prism": accentRgb,
      "--ig-toggle-background-off-prism": secondaryRgb,
      "--ig-toggle-background-disabled-on-prism": tertiaryRgb,
      "--ig-toggle-background-disabled-off-prism": tertiaryRgb,
      "--ig-toggle-outline-prism": lineRgb,
      "--ig-toggle-outline-disabled-prism": lineRgb,
      "--ig-stroke-prism": lineRgb,
      "--ig-stroke-disabled-on-prism": lineRgb,
      "--ig-stroke-disabled-off-prism": lineRgb,
      "--ig-primary-button-border-radius": `${Math.min(14, config.borderRadius)}px`,
      "--ig-input-border-radius": `${Math.min(12, config.borderRadius)}px`,
      "--ig-incoming-message-bubble": rgb(palette.incoming),
      "--ig-outgoing-message-bubble": accentRgb,
      "--ig-text-on-color": whiteRgb,
      "--ig-text-on-media": whiteRgb,
      "--ig-stroke-on-media": whiteRgb,
      "--igd-thread-background-color": `rgb(${pageRgb})`,
      "--igd-thread-background-image": "none",
      "--igd-header-background-color": `rgb(${surfaceRgb})`,
      "--igd-composer-background-color": `rgb(${surfaceRgb})`,
      "--igd-composer-border-color": `rgb(${lineRgb})`,
      "--igd-composer-input-background-color": `rgb(${secondaryRgb})`,
      "--igd-incoming-message-text-color": `rgb(${textRgb})`,
      "--igd-outgoing-message-text-color": "#ffffff",
      "--igds-dialog-border-radius": `${config.borderRadius}px`,
      "--igds-menu-border-radius": `${Math.min(14, config.borderRadius)}px`,
      "--messenger-card-background": `rgb(${surfaceRgb})`,
      "--chat-composer-background-color": `rgb(${surfaceRgb})`,
      "--igdw-chat-tab-composer-border-color": `rgb(${lineRgb})`,
      "--mwp-message-row-background": `rgb(${pageRgb})`,
      "--WDS-systems-chat-foreground-wallpaper": `rgb(${pageRgb})`
    };

    Object.entries(tokens).forEach(([name, tokenValue]) => setThemeToken(root, name, tokenValue));
    setThemeToken(root, "--ig-primary-icon", textRgb);
    setThemeToken(root, "--ig-secondary-white-text", "255, 255, 255, .55");
    setThemeToken(root, "color-scheme", dark ? "dark" : "light");
  }

  function syncTopbarScrollState() {
    const root = document.documentElement;
    if (!root) return;
    const scrollTop = Math.max(
      Number(window.scrollY) || 0,
      Number(root.scrollTop) || 0,
      Number(document.body?.scrollTop) || 0
    );
    root.setAttribute("data-igx-topbar-scrolled", scrollTop > 8 ? "true" : "false");
  }

  function scheduleTopbarScrollState() {
    if (topbarScrollFrame) return;
    topbarScrollFrame = window.requestAnimationFrame(() => {
      topbarScrollFrame = 0;
      syncTopbarScrollState();
    });
  }

  function applyConfigToDOM(value) {
    const previousConfig = config;
    applyingConfig = true;
    config = normalizeConfig(value);
    const refreshSponsored = previousConfig.enabled !== config.enabled || previousConfig.hideSponsored !== config.hideSponsored;
    const refreshVideos = previousConfig.enabled !== config.enabled || previousConfig.videoSmoothControls !== config.videoSmoothControls;
    if (refreshSponsored) lastSponsoredFilterState = null;

    const root = document.documentElement;
    if (!root) { applyingConfig = false; return; }

    root.classList.toggle("intergram-active", config.enabled);
    root.classList.toggle("intergram-theme", config.enabled);
    root.setAttribute("data-igx-theme", config.theme);
    root.setAttribute("data-igx-video", config.videoFilter);
    root.setAttribute("data-igx-ambilight", String(config.videoAmbilight));
    root.setAttribute("data-igx-motion", config.animationPreset);
    root.setAttribute("data-igx-profile", "false");
    root.setAttribute("data-igx-compact-stories", String(config.compactStories));
    root.setAttribute("data-igx-wide-feed", String(config.wideFeedMode));
    root.setAttribute("data-igx-blur-dms", String(config.blurDMsUntilHover));
    root.setAttribute("data-igx-nav-labels", String(config.dockLabels));
    root.setAttribute("data-igx-video-controls", String(config.videoSmoothControls));
    root.setAttribute("data-igx-orbs", String(config.ambientOrbs));
    root.setAttribute("data-igx-immersive", String(config.enabled && config.immersiveReels && currentPageName() === "reels"));
    root.setAttribute("data-igx-ambient", String(config.ambientLight));
    root.setAttribute("data-igx-ambient-mode", config.reelAmbientMode);
    root.setAttribute("data-igx-video-glow", String(config.enabled && (config.ambientLight || config.videoAmbilight)));
    root.setAttribute("data-igx-base-gradient", String(config.baseGradientEnabled));
    root.setAttribute("data-igx-extra-gradient", String(config.extraThemeGradient));
    root.setAttribute("data-igx-topbar-opaque-on-scroll", String(config.topbarOpaqueOnScroll));
    syncTopbarScrollState();

    const themeChanged = !themeTokensApplied || previousConfig.theme !== config.theme ||
      previousConfig.accentColor !== config.accentColor || previousConfig.accentSecondary !== config.accentSecondary ||
      previousConfig.blurStrength !== config.blurStrength;
    if (config.enabled && themeChanged) {
      applyDesignSystemTokens(root);
      applyInstagramThemeTokens(root);
      themeTokensApplied = true;
    } else if (config.enabled && (!root.style.getPropertyValue("--ig-bg") || !root.style.getPropertyValue("--igx-theme-page-color"))) {
      // Instagram occasionally replaces the root style attribute during SPA
      // boot. Rebuild both token layers together, not just the base palette.
      applyDesignSystemTokens(root);
      applyInstagramThemeTokens(root);
      themeTokensApplied = true;
    } else if (!config.enabled && themeTokensApplied) {
      restoreThemeTokens(root);
      themeTokensApplied = false;
    }

    const accent = safeColor(config.accentColor, THEME_ACCENTS[config.theme].accentColor);
    const accent2 = safeColor(config.accentSecondary, THEME_ACCENTS[config.theme].accentSecondary);
    root.style.setProperty("--igx-accent", accent);
    root.style.setProperty("--igx-accent-2", accent2);
    const brandTertiary = safeColor(paletteOf(config.theme).accent3 || paletteOf(config.theme).outgoing || accent, accent);
    root.style.setProperty("--igx-brand-gradient-1", accent);
    root.style.setProperty("--igx-brand-gradient-2", accent2);
    root.style.setProperty("--igx-brand-gradient-3", brandTertiary);
    root.style.setProperty("--igx-accent-rgb", hexToRgb(accent));
    root.style.setProperty("--igx-accent-2-rgb", hexToRgb(accent2));
    syncThemeFavicon();
    root.style.setProperty("--igx-blur", `${config.blurStrength}px`);
    root.style.setProperty("--igx-glass-opacity", (config.glassOpacity / 100).toFixed(2));
    root.style.setProperty("--igx-radius", `${config.borderRadius}px`);
    root.style.setProperty("--igx-ui-scale", (config.uiScale / 100).toFixed(2));
    root.style.setProperty("--igx-nav-scale", String(config.dockScale));
    root.style.setProperty("--igx-video-saturate", String(config.videoVibrance / 100));
    root.style.setProperty("--igx-ambient-intensity", (config.ambientIntensity / 100).toFixed(2));
    root.style.setProperty("--igx-theme-gradient-intensity", (config.themeGradientIntensity / 100).toFixed(2));
    root.style.setProperty("--igx-topbar-blur", `${config.topbarBlurStrength}px`);
    root.style.setProperty("--igx-ambient-blur", `${config.ambientBlur}px`);
    root.style.setProperty("--igx-ambient-spread", `${config.ambientSpread}px`);
    root.style.setProperty("--igx-ambient-rate", String(config.ambientFrameRate));
    root.style.setProperty("--igx-feed-width", config.wideFeedMode ? "860px" : "740px");
    root.style.setProperty("--igx-motion-duration", config.animationPreset === "snappy" ? "140ms" : config.animationPreset === "gentle" ? "320ms" : "190ms");

    const topbar = document.getElementById("igx-topbar");
    const routeNav = document.getElementById("igx-route-nav-wrap");
    const drawer = document.getElementById("igx-studio-drawer");
    if (topbar) topbar.style.display = config.enabled ? "flex" : "none";
    if (routeNav) routeNav.style.display = config.enabled ? "flex" : "none";
    if (drawer) {
      const studioIsOpen = drawer.classList.contains("open");
      drawer.style.display = config.enabled || studioIsOpen ? "flex" : "none";
    }

    let userCss = document.getElementById("igx-user-custom-css");
    if (!userCss && config.customCSS && document.head) {
      userCss = document.createElement("style");
      userCss.id = "igx-user-custom-css";
      document.head.appendChild(userCss);
    }
    if (userCss) userCss.textContent = config.customCSS || "";

    ensureAmbientLayers();
    syncImmersiveReels();
    clearStoryNavigation();
    syncStudioControls();
    syncRouteNavigation();
    if (refreshSponsored) filterSponsoredPosts();
    if (refreshVideos) enhanceVideos();
    if (config.enabled) markScrollReveal(getPageMain());
    else clearScrollReveal();
    applyingConfig = false;
    if (config.enabled && currentPageName() === "home") {
      ensureHomeChatExpanded();
      scheduleChatGeometry(40);
    } else {
      syncHomeChatGeometry();
    }
  }


  /* ═════════════════════════════════════════════════════════════════════════
     v4.0.0 — design-system writer, style persistence, and page components
     ═════════════════════════════════════════════════════════════════════════ */

  // Writes the --ig-* variable set. Everything else (Instagram token aliases,
  // --igx-* bridge) is derived from these values in CSS, so a theme switch is
  // one write on <html>.
  function applyDesignSystemTokens(root) {
    const palette = legacyPalette(config.theme);
    const values = {
      "--ig-bg": palette.page,
      "--ig-bg-2": palette.secondary,
      "--ig-rgb-bg": hexToRgb(palette.page),
      "--ig-rgb-bg-2": hexToRgb(palette.secondary),
      "--ig-surface": palette.alphaSurface,
      "--ig-surface-2": palette.alphaSurface2,
      "--ig-rgb-surface": palette.rgbSurface,
      "--ig-rgb-surface-2": palette.rgbSurface2,
      "--ig-border": palette.alphaBorder,
      "--ig-border-strong": `rgba(${palette.rgbBorder}, ${palette.scheme === "dark" ? .18 : .2})`,
      "--ig-rgb-border": palette.rgbBorder,
      "--ig-text": palette.text,
      "--ig-muted": palette.muted,
      "--ig-faint": palette.tertiary,
      "--ig-rgb-text": hexToRgb(palette.text),
      "--ig-rgb-muted": hexToRgb(palette.muted),
      "--ig-rgb-faint": hexToRgb(palette.tertiary),
      "--ig-accent": palette.accent,
      "--ig-accent-2": palette.accent2,
      "--ig-accent-3": palette.accent3,
      "--ig-rgb-accent": hexToRgb(palette.accent),
      "--ig-on-accent": palette.onAccent,
      "--ig-hover": palette.hover,
      "--ig-scheme": palette.scheme,
      "--ig-glass": palette.alphaSurface,
      "--ig-glass-strong": palette.alphaSurface2,
      "--ig-glass-border": palette.alphaBorder,
      "--ig-glass-blur": `${config.blurStrength}px`,
      "--ig-glass-saturate": palette.saturate,
      "--ig-shadow-panel": palette.shadow,
      "--ig-scrim": palette.scrim
    };
    Object.entries(values).forEach(([name, value]) => setThemeToken(root, name, value));
  }

  // ── Root-state persistence ────────────────────────────────────────────────
  // Instagram's SPA never removes our <style> tag, but it does re-create entire
  // subtrees on client-side navigation. Re-asserting the root class + tokens on
  // every relevant mutation (and on pushState/popstate) is what stops stale
  // white surfaces from surviving a route change.
  function ensureRootState() {
    const root = document.documentElement;
    if (!root) return;
    if (config.enabled) {
      if (!root.classList.contains("intergram-theme")) root.classList.add("intergram-theme");
      if (!root.classList.contains("intergram-active")) root.classList.add("intergram-active");
      if (root.getAttribute("data-igx-theme") !== config.theme) root.setAttribute("data-igx-theme", config.theme);
      if (themeTokensApplied && (!root.style.getPropertyValue("--ig-bg") || !root.style.getPropertyValue("--igx-theme-page-color"))) {
        applyDesignSystemTokens(root);
        applyInstagramThemeTokens(root);
      }
    } else if (root.classList.contains("intergram-theme")) {
      root.classList.remove("intergram-theme");
    }
  }

  let ambientSampleTimer = 0;
  let ambientSampleIntervalMs = 0;
  let ambientSampleCanvas = null;
  let ambientVideoSources = new WeakMap();
  let ambientReelMediaVideo = null;
  let ambientReelMediaSource = "";
  const ambientImageCache = new Map();

  function setAmbientVideoColor(surface, color) {
    if (!surface) return;
    const nextColor = String(color || "").trim();
    if (nextColor) surface.style.setProperty("--igx-video-rgb", nextColor);
    else surface.style.removeProperty("--igx-video-rgb");
    const post = surface.closest?.("article.igx-post-card.igx-feed-video-card");
    if (post && post.querySelectorAll("video").length === 1) {
      if (nextColor) post.style.setProperty("--igx-post-video-rgb", nextColor);
      else post.style.removeProperty("--igx-post-video-rgb");
    }
  }

  function clearAmbientVideoColor(surface) {
    if (!surface) return;
    setAmbientVideoColor(surface, "");
    ambientVideoSources.delete(surface);
  }

  function ambientVideoSourceSignature(video) {
    if (!video) return "";
    const sources = [
      video.getAttribute("src"),
      video.src,
      video.currentSrc,
      ...Array.from(video.querySelectorAll("source")).flatMap((source) => [source.getAttribute("src"), source.src])
    ].map((value) => String(value || "").trim()).filter(Boolean);
    return Array.from(new Set(sources)).join("\u001f");
  }

  function ambientColorFromMedia(source) {
    const width = source?.videoWidth || source?.naturalWidth || source?.width || 0;
    const height = source?.videoHeight || source?.naturalHeight || source?.height || 0;
    if (!width || !height) return "";
    try {
      if (!ambientSampleCanvas) ambientSampleCanvas = document.createElement("canvas");
      const canvas = ambientSampleCanvas;
      canvas.width = 18;
      canvas.height = 18;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return "";
      // Use the full live frame, not a poster or a stale thumbnail. A tiny
      // downsample keeps this inexpensive while tracking the palette as scenes move.
      context.drawImage(source, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let red = 0, green = 0, blue = 0, weightSum = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], alpha = pixels[i + 3] / 255;
        const high = Math.max(r, g, b), low = Math.min(r, g, b);
        const luminance = .2126 * r + .7152 * g + .0722 * b;
        if (alpha < .5) continue;
        const saturation = high ? (high - low) / high : 0;
        const midtoneWeight = .34 + .66 * Math.max(.08, 1 - Math.abs(luminance - 112) / 155);
        const weight = alpha * (.40 + saturation * 1.45) * midtoneWeight;
        red += r * weight;
        green += g * weight;
        blue += b * weight;
        weightSum += weight;
      }
      if (!weightSum) return "";
      return [red, green, blue].map((channel) => Math.round(channel / weightSum)).join(", ");
    } catch (_) {
      // Instagram media may be cross-origin/tainted. The anonymous image probe
      // below handles CORS-enabled assets; otherwise keep the theme accent.
      return "";
    }
  }

  function probeAmbientImage(url) {
    if (!url || !/^https:\/\//i.test(url)) return "";
    const cached = ambientImageCache.get(url);
    if (cached) return cached.color || "";
    const entry = { color: "", pending: true };
    ambientImageCache.set(url, entry);
    if (ambientImageCache.size > 24) ambientImageCache.delete(ambientImageCache.keys().next().value);
    const probe = new Image();
    probe.crossOrigin = "anonymous";
    probe.decoding = "async";
    probe.onload = () => {
      entry.color = ambientColorFromMedia(probe);
      entry.pending = false;
      if (entry.color && config.enabled && (config.ambientLight || config.videoAmbilight)) sampleAmbientMedia();
    };
    probe.onerror = () => { entry.pending = false; };
    probe.src = url;
    return "";
  }

  function sampleAmbientVideoSurfaces() {
    const isReelsPage = currentPageName() === "reels";
    const surfaces = Array.from(document.querySelectorAll(".igx-ambient-video-surface"));
    if (isReelsPage) {
      // Reel glow is sampled once from the active decoded frame by
      // sampleReelColor(); avoid a duplicate canvas read for its surface.
      surfaces.forEach(clearAmbientVideoColor);
      return;
    }
    const visible = surfaces.map((surface) => {
      const video = surface instanceof HTMLVideoElement ? surface : surface.querySelector("video");
      if (!video) {
        clearAmbientVideoColor(surface);
        return null;
      }

      // A source change invalidates the old sample immediately. Never substitute
      // poster art: only decoded frames from the current video may color an edge.
      const source = ambientVideoSourceSignature(video);
      if (ambientVideoSources.get(surface) !== source) {
        setAmbientVideoColor(surface, "");
        ambientVideoSources.set(surface, source);
        return null;
      }
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
        setAmbientVideoColor(surface, "");
        return null;
      }

      const rect = surface.getBoundingClientRect();
      const width = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
      const height = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
      const style = window.getComputedStyle(surface);
      if (width < 64 || height < 64 || style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) {
        setAmbientVideoColor(surface, "");
        return null;
      }
      return { surface, video, area: width * height };
    }).filter(Boolean).sort((a, b) => b.area - a.area);

    visible.slice(0, isReelsPage ? 1 : 8).forEach(({ surface, video }) => {
      const color = ambientColorFromMedia(video);
      setAmbientVideoColor(surface, color);
    });
  }

  function sampleAmbientMedia() {
    if (!config.enabled || (!config.ambientLight && !config.videoAmbilight) || !document.body) return;
    const root = document.documentElement;
    sampleAmbientVideoSurfaces();
    if (!config.ambientLight) {
      root.style.removeProperty("--igx-media-rgb");
      return;
    }
    if (currentPageName() === "reels") {
      const reelVideo = getActiveReelVideo();
      const source = ambientVideoSourceSignature(reelVideo);
      if (ambientReelMediaVideo !== reelVideo || ambientReelMediaSource !== source) {
        ambientReelMediaVideo = reelVideo;
        ambientReelMediaSource = source;
        root.style.removeProperty("--igx-media-rgb");
        return;
      }
      // sampleReelColor owns the only Reels canvas read; reuse its current
      // source color for the theme wash instead of sampling twice per tick.
      const liveColor = root.style.getPropertyValue("--igx-glow-rgb");
      if (reelVideo && liveColor) root.style.setProperty("--igx-media-rgb", liveColor);
      else root.style.removeProperty("--igx-media-rgb");
      return;
    }
    ambientReelMediaVideo = null;
    ambientReelMediaSource = "";

    const candidates = Array.from(document.querySelectorAll(".igx-post-card img, .igx-post-card video, main img, main video, [role=\"main\"] img, [role=\"main\"] video"));
    const visible = candidates.map((media) => {
      const rect = media.getBoundingClientRect();
      const width = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
      const height = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
      if (width < 64 || height < 64) return null;
      const style = window.getComputedStyle(media);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return null;
      const area = width * height * (media instanceof HTMLVideoElement ? 1.12 : 1);
      return { media, area };
    }).filter(Boolean).sort((a, b) => b.area - a.area);

    for (const { media } of visible.slice(0, 4)) {
      if (media instanceof HTMLVideoElement && media.readyState < 2) continue;
      if (media instanceof HTMLImageElement && (!media.complete || !media.naturalWidth)) continue;
      let color = ambientColorFromMedia(media);
      if (!color && media instanceof HTMLImageElement) color = probeAmbientImage(media.currentSrc || media.src);
      if (!color) continue;
      if (root.style.getPropertyValue("--igx-media-rgb") !== color) root.style.setProperty("--igx-media-rgb", color);
      return;
    }
    root.style.removeProperty("--igx-media-rgb");
  }

  function clearReelAmbientCanvas(canvas) {
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (context) context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.dataset.frameReady = "false";
    canvas.__igxAmbientVideo = null;
    canvas.__igxAmbientSource = "";
    canvas.__igxAmbientSize = "";
    canvas.__igxAmbientGeometry = "";
    canvas.__igxAmbientMode = "";
  }

  function reelAmbientCanvasMetrics(canvas) {
    const viewportWidth = Math.max(1, Math.round(window.innerWidth || document.documentElement?.clientWidth || 1));
    const viewportHeight = Math.max(1, Math.round(window.innerHeight || document.documentElement?.clientHeight || 1));
    // Cap the backing texture at 320px and about 24% of the viewport. The tiny
    // canvas is the only visual frame surface; it is never read back for color.
    const scale = Math.min(.24, 320 / Math.max(viewportWidth, viewportHeight));
    const backingWidth = Math.max(96, Math.round(viewportWidth * scale));
    const backingHeight = Math.max(96, Math.round(viewportHeight * scale));
    const size = `${backingWidth}x${backingHeight}`;
    if (canvas.__igxAmbientSize !== size) {
      canvas.width = backingWidth;
      canvas.height = backingHeight;
      canvas.__igxAmbientSize = size;
      canvas.dataset.frameReady = "false";
    }
    return { viewportWidth, viewportHeight, backingWidth, backingHeight, size, scale };
  }

  function clearNativeReelWindow(context, rect, spread, metrics) {
    const { viewportWidth, viewportHeight, backingWidth, backingHeight } = metrics;
    const scaleX = backingWidth / viewportWidth;
    const scaleY = backingHeight / viewportHeight;
    const padding = Math.max(0, Number(spread) || 0);
    const left = Math.max(0, rect.left - padding);
    const top = Math.max(0, rect.top - padding);
    const right = Math.min(viewportWidth, rect.right + padding);
    const bottom = Math.min(viewportHeight, rect.bottom + padding);
    if (right <= left || bottom <= top) return;
    const x0 = Math.max(0, Math.floor(left * scaleX));
    const y0 = Math.max(0, Math.floor(top * scaleY));
    const x1 = Math.min(backingWidth, Math.ceil(right * scaleX));
    const y1 = Math.min(backingHeight, Math.ceil(bottom * scaleY));
    context.clearRect(x0, y0, x1 - x0, y1 - y0);
  }

  function drawReelAmbientFrame(canvas, video, rect, spread, mode = "live") {
    if (!canvas || !video) return false;
    const source = ambientVideoSourceSignature(video);
    const sourceChanged = canvas.__igxAmbientVideo !== video ||
      canvas.__igxAmbientSource !== source || canvas.__igxAmbientMode !== mode;
    if (sourceChanged) clearReelAmbientCanvas(canvas);
    canvas.__igxAmbientVideo = video;
    canvas.__igxAmbientSource = source;
    canvas.__igxAmbientMode = mode;

    const metrics = reelAmbientCanvasMetrics(canvas);
    const { viewportWidth, viewportHeight, backingWidth, backingHeight, size, scale } = metrics;
    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return false;
    const context = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!context) return false;

    const geometry = [
      size, viewportWidth, viewportHeight,
      Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height),
      Math.round(spread), mode,
      ...(mode === "blend" ? [config.theme, config.accentColor, config.accentSecondary] : [])
    ].join(":");
    if (video.paused && !sourceChanged && canvas.dataset.frameReady === "true" &&
        canvas.__igxAmbientGeometry === geometry) return true;

    let saved = false;
    try {
      context.save();
      saved = true;
      context.globalCompositeOperation = "source-over";
      // Opaque frame replacement avoids temporal blending/ghosting between Reels.
      context.globalAlpha = 1;
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "medium";
      // Blur at backing resolution before stretching, avoiding a viewport-sized
      // filter pass while retaining the live frame's broad color movement.
      const requestedBlur = Number(config.ambientBlur);
      const blurCssPixels = Number.isFinite(requestedBlur) ? Math.max(0, requestedBlur) : 50;
      const blurBackingPixels = Math.min(16, blurCssPixels * scale);
      context.filter = `${blurBackingPixels > 0 ? `blur(${blurBackingPixels.toFixed(1)}px) ` : ""}saturate(1.12) brightness(.92)`;
      context.clearRect(0, 0, backingWidth, backingHeight);
      context.drawImage(video, 0, 0, backingWidth, backingHeight);
      if (mode === "blend") {
        const palette = paletteOf(config.theme);
        const accents = THEME_ACCENTS[config.theme] || THEME_ACCENTS[DEFAULT_CONFIG.theme];
        const first = safeColor(config.accentColor, accents.accentColor);
        const second = safeColor(config.accentSecondary, accents.accentSecondary);
        const third = safeColor(palette.accent3 || palette.outgoing || first, first);
        const radius = Math.max(backingWidth, backingHeight) * .68;
        const paintThemeGlow = (x, y, color, opacity) => {
          const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, `rgba(${hexToRgb(color)}, ${opacity})`);
          gradient.addColorStop(.48, `rgba(${hexToRgb(color)}, ${(opacity * .34).toFixed(3)})`);
          gradient.addColorStop(1, `rgba(${hexToRgb(color)}, 0)`);
          context.fillStyle = gradient;
          context.fillRect(0, 0, backingWidth, backingHeight);
        };
        // A restrained screen blend keeps the moving video palette dominant,
        // with a soft theme glow centered behind (never over) the native player.
        context.globalCompositeOperation = "screen";
        context.filter = `blur(${Math.min(10, Math.max(2, blurBackingPixels * .72)).toFixed(1)}px)`;
        paintThemeGlow(backingWidth * .50, backingHeight * .47, first, .12);
        paintThemeGlow(backingWidth * .12, backingHeight * .24, second, .10);
        paintThemeGlow(backingWidth * .88, backingHeight * .72, third, .095);
      }
      context.restore();
      saved = false;

      // The live center is cleared so Instagram's real video and controls remain crisp.
      clearNativeReelWindow(context, rect, spread, metrics);
      canvas.__igxAmbientGeometry = geometry;
      canvas.dataset.frameReady = "true";
      return true;
    } catch (_) {
      if (saved) {
        try { context.restore(); } catch (_) { /* Canvas state may already be reset. */ }
      }
      clearReelAmbientCanvas(canvas);
      canvas.__igxAmbientVideo = video;
      canvas.__igxAmbientSource = source;
      canvas.__igxAmbientSize = size;
      canvas.__igxAmbientMode = mode;
      return false;
    }
  }

  function drawReelThemeGradient(canvas, rect, spread) {
    if (!canvas) return false;
    const metrics = reelAmbientCanvasMetrics(canvas);
    const { viewportWidth, viewportHeight, backingWidth, backingHeight, size, scale } = metrics;
    const palette = paletteOf(config.theme);
    const themeFallback = THEME_ACCENTS[config.theme] || THEME_ACCENTS[DEFAULT_CONFIG.theme];
    const primary = safeColor(config.accentColor, themeFallback.accentColor);
    const secondary = safeColor(config.accentSecondary, themeFallback.accentSecondary);
    const tertiary = safeColor(palette.accent3 || palette.outgoing || palette.accent || secondary, secondary);
    const source = ["theme-gradient", config.theme, primary, secondary, tertiary].join(":");
    const sourceChanged = canvas.__igxAmbientMode !== "theme-gradient" || canvas.__igxAmbientSource !== source;
    if (sourceChanged) clearReelAmbientCanvas(canvas);
    canvas.__igxAmbientVideo = null;
    canvas.__igxAmbientSource = source;
    canvas.__igxAmbientMode = "theme-gradient";
    canvas.__igxAmbientSize = size;

    const geometry = [
      source, size, viewportWidth, viewportHeight,
      Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height),
      Math.round(spread), Math.round(config.ambientBlur)
    ].join(":");
    if (!sourceChanged && canvas.dataset.frameReady === "true" && canvas.__igxAmbientGeometry === geometry) return true;
    const context = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!context) return false;

    let saved = false;
    try {
      context.save();
      saved = true;
      context.clearRect(0, 0, backingWidth, backingHeight);
      context.globalCompositeOperation = "source-over";
      context.globalAlpha = 1;
      context.imageSmoothingEnabled = true;
      const requestedBlur = Number(config.ambientBlur);
      const blurBackingPixels = Math.min(16, Math.max(0, Number.isFinite(requestedBlur) ? requestedBlur : 50) * scale);
      context.filter = blurBackingPixels > 0 ? `blur(${blurBackingPixels.toFixed(1)}px)` : "none";

      const dark = palette.scheme ? palette.scheme === "dark" :
        !["daylight-linen", "solar-frosted", "arctic-glass", "instagram-spectrum"].includes(config.theme);
      const strength = dark ? .40 : .25;
      const radius = Math.max(backingWidth, backingHeight) * .70;
      const paint = (x, y, color, opacity) => {
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${hexToRgb(color)}, ${opacity})`);
        gradient.addColorStop(.42, `rgba(${hexToRgb(color)}, ${(opacity * .42).toFixed(3)})`);
        gradient.addColorStop(1, `rgba(${hexToRgb(color)}, 0)`);
        context.fillStyle = gradient;
        context.fillRect(0, 0, backingWidth, backingHeight);
      };
      // Three subdued theme colors create a living, layered palette without
      // sampling or replacing the live-frame ambience mode.
      paint(backingWidth * .02, backingHeight * .50, primary, strength);
      paint(backingWidth * .98, backingHeight * .44, secondary, strength * .78);
      paint(backingWidth * .52, backingHeight * .02, tertiary, strength * .56);
      paint(backingWidth * .50, backingHeight * .47, primary, strength * .34);
      context.restore();
      saved = false;

      clearNativeReelWindow(context, rect, spread, metrics);
      canvas.__igxAmbientGeometry = geometry;
      canvas.dataset.frameReady = "true";
      return true;
    } catch (_) {
      if (saved) {
        try { context.restore(); } catch (_) { /* Canvas state may already be reset. */ }
      }
      clearReelAmbientCanvas(canvas);
      canvas.__igxAmbientSource = source;
      canvas.__igxAmbientMode = "theme-gradient";
      canvas.__igxAmbientSize = size;
      return false;
    }
  }

  function syncReelAmbientLayer(video = null) {
    const enabled = config.enabled && (config.ambientLight || config.videoAmbilight) && currentPageName() === "reels";
    let layer = document.getElementById("igx-reel-ambient");
    if (!enabled || !document.body) {
      layer?.remove();
      return null;
    }
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "igx-reel-ambient";
      layer.setAttribute("aria-hidden", "true");
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.dataset.frameReady = "false";
      layer.appendChild(canvas);
      document.body.appendChild(layer);
    }
    if (layer.dataset.igxViewportLayer !== "true") {
      ["left", "top", "width", "height"].forEach((name) => layer.style.removeProperty(name));
      layer.dataset.igxViewportLayer = "true";
    }
    let canvas = layer.querySelector("canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.dataset.frameReady = "false";
      layer.appendChild(canvas);
    }
    if (canvas.dataset.igxViewportCanvas !== "true") {
      ["left", "top", "width", "height"].forEach((name) => canvas.style.removeProperty(name));
      canvas.dataset.igxViewportCanvas = "true";
    }
    video = video || getActiveReelVideo();
    if (!video) {
      clearReelAmbientCanvas(canvas);
      layer.style.opacity = "0";
      layer.dataset.playing = "false";
      layer.dataset.frameReady = "false";
      return layer;
    }
    const rect = video.getBoundingClientRect();
    const style = window.getComputedStyle(video);
    if (rect.width < 80 || rect.height < 120 || style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) {
      clearReelAmbientCanvas(canvas);
      layer.style.opacity = "0";
      layer.dataset.playing = "false";
      layer.dataset.frameReady = "false";
      return layer;
    }
    const spread = Number(config.ambientSpread) || DEFAULT_CONFIG.ambientSpread;
    const mode = config.reelAmbientMode;
    const hasFrame = mode === "theme-gradient"
      ? drawReelThemeGradient(canvas, rect, spread)
      : drawReelAmbientFrame(canvas, video, rect, spread, mode);
    const level = Number(config.ambientIntensity) / 100;
    const modeOpacity = mode === "live" ? (video.paused ? .48 : .72)
      : mode === "theme-gradient" ? .70
        : video.paused ? .54 : .68;
    layer.style.opacity = (level * modeOpacity).toFixed(2);
    layer.dataset.playing = String(!video.paused);
    layer.dataset.ambientMode = mode;
    layer.dataset.frameReady = String(hasFrame);
    return layer;
  }

  function syncAmbientSampler() {
    const active = config.enabled && (config.ambientLight || config.videoAmbilight);
    if (!active) {
      window.clearInterval(ambientSampleTimer);
      ambientSampleTimer = 0;
      ambientSampleIntervalMs = 0;
      document.documentElement?.style.removeProperty("--igx-media-rgb");
      document.documentElement?.style.removeProperty("--igx-glow-rgb");
      document.documentElement?.style.setProperty("--ig-ambilight-strength", "0");
      document.querySelectorAll(".igx-ambient-video-surface").forEach((surface) => {
        clearAmbientVideoColor(surface);
      });
      ambientVideoSources = new WeakMap();
      ambientReelMediaVideo = null;
      ambientReelMediaSource = "";
      syncReelAmbientLayer(null);
      return;
    }
    if (currentPageName() === "reels") {
      // sampleReelColor is the sole live Reel sampler. Avoid a second timer
      // that repeated the DOM scan but did not contribute a visible frame.
      window.clearInterval(ambientSampleTimer);
      ambientSampleTimer = 0;
      ambientSampleIntervalMs = 0;
      document.documentElement?.style.removeProperty("--igx-media-rgb");
      return;
    }
    const delay = 1600;
    if (ambientSampleTimer && ambientSampleIntervalMs === delay) return;
    window.clearInterval(ambientSampleTimer);
    sampleAmbientMedia();
    ambientSampleIntervalMs = delay;
    ambientSampleTimer = window.setInterval(sampleAmbientMedia, delay);
  }

  function ensureAmbientLayers() {
    if (!document.body) return;
    let ambient = document.getElementById("igx-ambient");
    if (config.enabled && config.ambientLight && !ambient) {
      ambient = document.createElement("div");
      ambient.id = "igx-ambient";
      ambient.setAttribute("aria-hidden", "true");
      document.body.appendChild(ambient);
    } else if (ambient && (!config.enabled || !config.ambientLight)) {
      ambient.remove();
    }
    let bleed = document.getElementById("igx-ambilight");
    if (!bleed) {
      bleed = document.createElement("div");
      bleed.id = "igx-ambilight";
      bleed.setAttribute("aria-hidden", "true");
      document.body.appendChild(bleed);
    }
    syncAmbientSampler();
    syncReelAmbientLayer();
  }

  function startChromePersistence() {
    if (chromePersistenceObserver || !document.documentElement || !window.MutationObserver) return;
    chromePersistenceObserver = new MutationObserver(() => {
      if (applyingConfig) return;
      ensureRootState();
    });
    chromePersistenceObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-igx-theme", "style"],
      childList: true
    });
  }

  // Instagram is a SPA: patch history so client-side navigation is observable.
  function patchHistory() {
    if (!window.history) return;
    ["pushState", "replaceState"].forEach((method) => {
      const original = window.history[method];
      if (typeof original !== "function" || original.__igxPatched) return;
      const patched = function (...args) {
        const result = original.apply(this, args);
        window.setTimeout(onRouteChange, 0);
        return result;
      };
      patched.__igxPatched = true;
      window.history[method] = patched;
    });
  }

  let routeChangeTimer = 0;
  function onRouteChange() {
    ensureRootState();
    ensureAmbientLayers();
    window.clearTimeout(routeChangeTimer);
    routeChangeTimer = window.setTimeout(() => {
      markNativeSidebar();
      classifyAndMarkSurfaces({
        routeChanged: true, articles: true, stories: true, media: true,
        messages: true, videos: true, navigation: true, suggestions: true
      });
      filterSponsoredPosts();
      enhanceVideos();
      syncImmersiveReels();
    }, 90);
  }

  /* ── Profile page components ──────────────────────────────────────────── */
  const PROFILE_TAB_ICONS = {
    posts: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
    reels: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="M3.8 8.5h16.4M8 3.8l3.1 4.6M14.5 3.8l3.1 4.6"/><path d="m10.2 11.2 4.8 2.8-4.8 2.8z"/>',
    tagged: '<path d="M20.2 9.1c0 4.7-8.2 9.9-8.2 9.9S3.8 13.8 3.8 9.1a4.4 4.4 0 0 1 8.2-2.2 4.4 4.4 0 0 1 8.2 2.2z"/>',
    saved: '<path d="M6 3.5h12v17l-6-4.2-6 4.2z"/>',
    repost: '<path d="M7 7h9V4l4 4-4 4V9H9v6H7z"/><path d="M17 17H8v3l-4-4 4-4v3h8z"/>'
  };

  // Profile remains native; this route marks only the real header, tablist and
  // panel so the stylesheet can lay them out without inventing destinations.

  function markDirectNotesRow(main, threadList = null) {
    if (!main) return null;
    const scope = threadList || main.querySelector('[role="navigation"][aria-label*="thread list" i]') || main;
    const lists = Array.from(scope.querySelectorAll("ul")).filter((list) => {
      const items = Array.from(list.children);
      if (items.length < 2) return false;
      const storyItems = items.filter((item) => item.querySelector('img, [role="link"]') && item.querySelector('[role="button"], button, [aria-haspopup="dialog"]'));
      return storyItems.length >= 2 && /your note|share|note|achievement|unlocked/i.test(normalizedLabel(list.textContent));
    });
    let selected = null;
    for (const list of lists) {
      let row = list.parentElement;
      for (let depth = 0; row && row !== scope && row !== main && depth < 7; depth += 1, row = row.parentElement) {
        const text = normalizedLabel(row.innerText || row.textContent);
        const height = row.getBoundingClientRect().height;
        if (text.length > 4200 || (height > 260 && height > 0)) break;
        const hasNext = Array.from(row.querySelectorAll('button[aria-label], [role="button"][aria-label]'))
          .some((control) => /^next$/i.test(normalizedLabel(control.getAttribute("aria-label"))));
        if (row.querySelector("ul") === list && (hasNext || /your note|share|note|achievement|unlocked/i.test(text))) {
          selected = row;
          break;
        }
      }
      if (selected) break;
    }
    if (selected) {
      selected.classList.remove("igx-scroll-fade");
      selected.classList.add("igx-chat-notes");
    }
    return selected;
  }

  function markDirectListHeader(main) {
    if (!main) return;
    const listPane = main.querySelector(".igx-chat-list-pane") || main.querySelector('[role="navigation"][aria-label*="thread list" i]')?.parentElement;
    if (!listPane) return;
    const newMessageIcon = Array.from(listPane.querySelectorAll('svg[aria-label], svg title'))
      .find((node) => /new message/i.test(normalizedLabel(node.getAttribute("aria-label") || node.textContent)));
    const trigger = newMessageIcon?.closest('button, [role="button"], a');
    if (!trigger) return;

    let candidate = trigger.parentElement;
    for (let depth = 0; candidate && candidate !== listPane && depth < 7; depth += 1, candidate = candidate.parentElement) {
      if (!candidate.querySelector("h2, h3, [role=\"heading\"]")) continue;
      if (!candidate.contains(trigger)) continue;
      const text = normalizedLabel(candidate.innerText || candidate.textContent);
      if (text.length > 320 || candidate.querySelector('[role="tablist"], [role="listitem"], a[href*="/direct/t/"]')) continue;
      candidate.classList.add("igx-direct-list-header");
      return;
    }
  }

  function markDirectSearchSpacing(listPane) {
    if (!listPane?.querySelectorAll) return;
    listPane.querySelectorAll(".igx-direct-search-spacing").forEach((node) => node.classList.remove("igx-direct-search-spacing"));
    const input = Array.from(listPane.querySelectorAll('input[placeholder="Search" i], input[aria-label="Search input" i], input[type="search"]'))
      .find((field) => field.closest("label") && !field.closest(".igx-chat-composer"));
    if (!input) return;

    // The supplied xod5an3/x14vqqas block is considered only after finding
    // Instagram's real Search field inside the native Direct list pane.
    let candidate = input.closest("label")?.parentElement || input.parentElement;
    for (let depth = 0; candidate && candidate !== listPane && depth < 8; depth += 1, candidate = candidate.parentElement) {
      if (candidate.tagName !== "DIV" || !candidate.classList.contains("html-div")) continue;
      if (!candidate.classList.contains("xod5an3") || !candidate.classList.contains("x14vqqas")) continue;
      if (!candidate.contains(input)) continue;
      candidate.classList.add("igx-direct-search-spacing");
      return;
    }
  }

  function markDirectComposer(main) {
    if (!main?.querySelectorAll) return null;
    const markerClasses = [
      "igx-chat-composer", "igx-chat-composer-leading", "igx-chat-composer-input-wrap",
      "igx-chat-composer-trailing", "igx-chat-textbox"
    ];
    markerClasses.forEach((name) => main.querySelectorAll(`.${name}`).forEach((node) => node.classList.remove(name)));

    const textbox = Array.from(main.querySelectorAll('[contenteditable="true"][role="textbox"], textarea, input'))
      .find((node) => /message/i.test(normalizedLabel(
        `${node.getAttribute("aria-placeholder") || ""} ${node.getAttribute("placeholder") || ""} ${node.getAttribute("data-placeholder") || ""}`
      )));
    if (!textbox) return null;

    const labelsIn = (node) => {
      const labels = [node.getAttribute("aria-label"), node.getAttribute("title")];
      node.querySelectorAll("[aria-label], [title], svg[aria-label]").forEach((control) => {
        labels.push(control.getAttribute("aria-label"), control.getAttribute("title"));
      });
      return normalizedLabel(labels.filter(Boolean).join(" ")).toLowerCase();
    };
    let host = textbox.parentElement;
    for (let depth = 0; host && host !== main && depth < 7; depth += 1, host = host.parentElement) {
      const children = Array.from(host.children);
      if (children.length < 3 || children.length > 4) continue;
      const leading = children.find((child) => /emoji/i.test(labelsIn(child)));
      const trailing = children.find((child) => /voice clip|add photo|photo or video|gif|sticker/i.test(labelsIn(child)));
      const inputWrap = children.find((child) => child === textbox || child.contains(textbox));
      if (!leading || !trailing || !inputWrap || leading === trailing || leading === inputWrap || trailing === inputWrap) continue;
      if (!/voice clip|add photo|photo or video|gif|sticker/i.test(labelsIn(trailing))) continue;
      host.classList.add("igx-chat-composer");
      leading.classList.add("igx-chat-composer-leading");
      inputWrap.classList.add("igx-chat-composer-input-wrap");
      trailing.classList.add("igx-chat-composer-trailing");
      textbox.classList.add("igx-chat-textbox");
      return host;
    }
    return null;
  }

  function markChatChrome(main) {
    if (!main) return;
    ensureHomeChatExpanded();
    markDirectComposer(main);
    const threadList = main.querySelector('[role="navigation"][aria-label*="thread list" i]');
    const searchPane = main.querySelector(".igx-chat-list-pane") || threadList?.parentElement;
    markDirectSearchSpacing(searchPane);
    markDirectNotesRow(main, threadList);
    const tabs = Array.from(main.querySelectorAll('[role="tablist"], [role="tab"]'))
      .map((el) => el.closest('[role="tablist"]') || el.parentElement)
      .filter(Boolean)
      .find((el) => /primary|general|requests/i.test(el.textContent || ""));
    if (tabs) tabs.classList.add("igx-chat-tabs");

    // The Notes/Stories strip is marked by its native horizontal avatar list
    // above; do not infer it from arbitrary message text elsewhere in the pane.

    const empty = Array.from(main.querySelectorAll("div, section")).find((el) => {
      if (el === main || el.children.length > 6) return false;
      return /your messages|send a message to start a chat|select a message/i.test(el.textContent || "");
    });
    if (empty) empty.classList.add("igx-chat-empty");

    // Instagram's current Direct markup exposes the conversation list as a
    // navigation landmark, not a listbox. Use that semantic node and its real
    // thread sibling to mark the existing two-pane shell without adding wrappers.
    let semanticPairMarked = false;
    if (threadList) {
      threadList.classList.add("igx-direct-panel");

      const isThreadBranch = (element) => {
        const text = normalizedLabel(element.innerText || element.textContent);
        if (/your messages|select a message|select a conversation|send a message to start a chat|message requests|these messages are from|choose a chat/i.test(text)) return true;
        return Boolean(element.querySelector('[contenteditable="true"], textarea, [role="textbox"], [data-pagelet*="Thread" i]'));
      };

      let shell = threadList.parentElement;
      for (let depth = 0; shell && shell !== main && depth < 10; depth += 1, shell = shell.parentElement) {
        const children = Array.from(shell.children);
        const listBranch = children.find((child) => child === threadList || child.contains(threadList));
        if (!listBranch) continue;
        const threadBranch = children.find((child) => child !== listBranch &&
          !child.matches('[data-visualcompletion="ignore"]') && isThreadBranch(child));
        if (!threadBranch) continue;

        shell.classList.add("igx-chat-shell");
        listBranch.classList.add("igx-chat-list-pane", "igx-direct-panel");
        threadBranch.classList.add("igx-chat-thread-pane", "igx-direct-panel");
        let contentHost = shell;
        for (let hostDepth = 0; contentHost.parentElement && contentHost.parentElement !== main && contentHost.parentElement !== document.body && hostDepth < 8; hostDepth += 1) {
          contentHost = contentHost.parentElement;
        }
        if (contentHost !== shell && contentHost !== main) contentHost.classList.add("igx-direct-content-host");
        semanticPairMarked = true;
        break;
      }
    }

    // Compatibility fallback for older Instagram builds whose two panels use
    // listbox/grid/tabpanel roles instead of the current Thread list landmark.
    const panels = Array.from(main.querySelectorAll('[role="listbox"], [role="grid"], [role="tabpanel"]'));
    if (!semanticPairMarked && panels.length >= 2) {
      let shell = panels[0].parentElement;
      for (let depth = 0; shell && shell !== main && depth < 6; depth += 1) {
        if (panels.slice(1).every((panel) => shell.contains(panel))) break;
        shell = shell.parentElement;
      }
      if (shell && shell !== main) {
        shell.classList.add("igx-chat-shell");
        let contentHost = shell;
        for (let hostDepth = 0; contentHost.parentElement && contentHost.parentElement !== main && contentHost.parentElement !== document.body && hostDepth < 8; hostDepth += 1) {
          contentHost = contentHost.parentElement;
        }
        if (contentHost !== shell && contentHost !== main) contentHost.classList.add("igx-direct-content-host");
      } else main.classList.add("igx-chat-shell");
      const listPanel = panels.find((panel) => panel.matches('[role="listbox"], [role="grid"]'));
      const threadPanel = panels.find((panel) => panel.matches('[role="tabpanel"]'));
      listPanel?.classList.add("igx-chat-list-pane", "igx-direct-panel");
      threadPanel?.classList.add("igx-chat-thread-pane", "igx-direct-panel");
    }

    // Structural fallback for Direct builds that omit the Thread list landmark
    // and tabpanel roles: pair Instagram's visible Primary/General tabs and
    // repeated conversation controls with the native empty state/composer.
    if (!semanticPairMarked) {
      let tabHost = main.querySelector(".igx-chat-tabs");
      if (!tabHost) {
        const tabControls = Array.from(main.querySelectorAll('[role="tab"], button, a, [role="button"]'))
          .filter((control) => /^(?:primary|general|requests)(?:\b|\s)/i.test(normalizedLabel(
            `${control.getAttribute("aria-label") || ""} ${control.textContent || ""}`
          )));
        const primary = tabControls.find((control) => /\bprimary\b/i.test(normalizedLabel(control.textContent || control.getAttribute("aria-label"))));
        if (primary) {
          let candidate = primary.parentElement;
          for (let depth = 0; candidate && candidate !== main && depth < 5; depth += 1, candidate = candidate.parentElement) {
            const text = normalizedLabel(candidate.innerText || candidate.textContent).toLowerCase();
            if (text.length <= 240 && /\bprimary\b/.test(text) && /\bgeneral\b/.test(text)) {
              tabHost = candidate;
              tabHost.classList.add("igx-chat-tabs");
              break;
            }
          }
        }
      }

      const tabText = normalizedLabel(tabHost?.innerText || tabHost?.textContent).toLowerCase();
      const threadSeed = empty || main.querySelector('[contenteditable="true"], textarea, [role="textbox"]');
      if (tabHost && /\bprimary\b/.test(tabText) && /\bgeneral\b/.test(tabText) && threadSeed) {
        let shell = tabHost.parentElement;
        for (let depth = 0; shell && shell !== main && depth < 10; depth += 1, shell = shell.parentElement) {
          const children = Array.from(shell.children);
          const listBranch = children.find((child) => child === tabHost || child.contains(tabHost));
          const threadBranch = children.find((child) => child !== listBranch &&
            (child === threadSeed || child.contains(threadSeed)));
          if (!listBranch || !threadBranch) continue;
          const directRows = listBranch.querySelectorAll('a[href*="/direct/t/"], [role="listitem"]').length;
          const controls = Array.from(listBranch.querySelectorAll('a[href], button, [role="button"]'))
            .filter((control) => !control.closest(".igx-chat-tabs")).length;
          if (directRows < 2 && controls < 4) continue;

          shell.classList.add("igx-chat-shell");
          listBranch.classList.add("igx-chat-list-pane", "igx-direct-panel");
          threadBranch.classList.add("igx-chat-thread-pane", "igx-direct-panel");
          let contentHost = shell;
          for (let hostDepth = 0; contentHost.parentElement && contentHost.parentElement !== main &&
            contentHost.parentElement !== document.body && hostDepth < 8; hostDepth += 1) {
            contentHost = contentHost.parentElement;
          }
          if (contentHost !== shell && contentHost !== main) contentHost.classList.add("igx-direct-content-host");
          break;
        }
      }
    }
    // The list-pane marker may be assigned by either native landmark detection
    // or the compatibility fallback above.
    markDirectListHeader(main);
  }

  /* ── Explore / search ─────────────────────────────────────────────────── */
  const NATIVE_SEARCH_INPUT_SELECTOR = 'input[aria-label="Search input" i], input[placeholder="Search" i][type="text"], input[type="search"][aria-label*="search" i]';
  const NATIVE_SEARCH_OWN_UI = "#igx-topbar, #igx-route-nav-wrap, #igx-home-sidebar, #igx-studio-drawer";
  let nativeSearchRequestUntil = 0;

  function nativeSearchPanelContext(input) {
    for (let node = input?.parentElement; node && node !== document.documentElement; node = node.parentElement) {
      if (node.matches?.('[role="dialog"], [aria-modal="true"], aside')) return true;
      const label = normalizedLabel(node.getAttribute?.("aria-label") || "");
      if (/^(?:search panel|search dialog)$/i.test(label)) return true;
    }
    return false;
  }

  function nativeSearchFieldVisible(input) {
    if (!input?.isConnected) return false;
    // Instagram may keep a native field in the DOM while its panel is closed.
    // Test its containing panel so hidden ancestors are not mistaken for open UI.
    for (let node = input.parentElement; node && node !== document.documentElement; node = node.parentElement) {
      if (node.hidden || node.getAttribute("aria-hidden") === "true") return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) <= .01) return false;
    }
    const rect = (input.parentElement || input).getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.bottom > 0 &&
      rect.left < window.innerWidth && rect.top < window.innerHeight;
  }

  function markNativeSearchInputs() {
    // This build adds no Explore search bar and does not hide or reparent native
    // fields. Clean markers left by earlier versions, then reconcile only the
    // transient open-intent flag against Instagram's own visible inputs.
    document.querySelectorAll(".igx-native-search-page-duplicate, .igx-native-search-page-duplicate-host, .igx-native-search-input, .igx-native-search-field-host")
      .forEach((node) => node.classList.remove(
        "igx-native-search-page-duplicate", "igx-native-search-page-duplicate-host",
        "igx-native-search-input", "igx-native-search-field-host"
      ));
    const visibleNativeField = Array.from(document.querySelectorAll(NATIVE_SEARCH_INPUT_SELECTOR))
      .some(nativeSearchFieldVisible);
    const root = document.documentElement;
    if (root?.getAttribute("data-igx-native-search-open") === "true" && !visibleNativeField && Date.now() >= nativeSearchRequestUntil) {
      root.removeAttribute("data-igx-native-search-open");
    }
  }

  function markStoryViewerSurfaces() {
    const replySelector = 'textarea[placeholder^="Reply to " i]';
    document.querySelectorAll(".igx-story-viewer").forEach((dialog) => {
      if (!dialog.querySelector(replySelector)) dialog.classList.remove("igx-story-viewer");
    });
    document.querySelectorAll(".igx-story-reply-textarea").forEach((field) => {
      if (!field.matches(replySelector)) field.classList.remove("igx-story-reply-textarea");
    });
    document.querySelectorAll(".igx-story-empty-placeholder").forEach((node) => node.classList.remove("igx-story-empty-placeholder"));

    document.querySelectorAll(replySelector).forEach((field) => {
      const dialog = field.closest('[role="dialog"], [aria-modal="true"]');
      if (!dialog) return;
      dialog.classList.add("igx-story-viewer");
      field.classList.add("igx-story-reply-textarea");
    });

    // Hide only the exact empty div reported inside a Story/Reel viewer. Do not
    // match an Instagram class globally or touch real media/actions/content.
    document.querySelectorAll("div.x1dr59a3.xeq5yr9.x1n327nk").forEach((node) => {
      const dialog = node.closest('[role="dialog"], [aria-modal="true"]');
      if (!dialog || node.children.length || normalizedLabel(node.textContent)) return;
      const hasReply = Boolean(dialog.querySelector(replySelector));
      const hasMedia = Boolean(dialog.querySelector("video, img[alt*='story' i]"));
      if (hasReply || hasMedia) node.classList.add("igx-story-empty-placeholder");
    });
  }

  function markExploreChrome(main) {
    if (!main) return;
    document.querySelectorAll(".igx-search-field").forEach((node) => node.classList.remove("igx-search-field"));
    markNativeSearchInputs(main);
    const searchSelector = 'input[placeholder*="search" i], input[aria-label*="search" i], input[type="search"]';
    const input = main.querySelector(searchSelector) || Array.from(document.querySelectorAll(searchSelector))
      .find((candidate) => !candidate.closest(NATIVE_SEARCH_OWN_UI));
    const field = input?.closest("form") || input?.parentElement;
    if (field && field !== main) field.classList.add("igx-search-field");
    // Do not add overlays or HUD to Explore tiles; Instagram owns their player and links.
  }

  /* ── Reels immersive mode + media-derived ambient color ───────────────── */
  let ambilightTimer = 0;
  let ambilightIntervalMs = 0;
  let ambilightLastVisualFrameAt = 0;
  let ambilightBlockedSource = "";
  let ambilightRetryAt = 0;
  let ambilightLastColorSampleAt = 0;
  let sampledReelVideo = null;
  let sampledReelSource = "";
  let smoothedReelRgb = null;

  function smoothReelColor(color) {
    const channels = String(color || "").split(",").map((value) => Number(value.trim()));
    if (channels.length !== 3 || channels.some((value) => !Number.isFinite(value))) return "";
    if (!smoothedReelRgb) smoothedReelRgb = channels;
    else smoothedReelRgb = smoothedReelRgb.map((value, index) => value * .54 + channels[index] * .46);
    return smoothedReelRgb.map((value) => Math.round(value)).join(", ");
  }

  function setReelAmbientFallback(root, video = null) {
    // If the current frame is unreadable (e.g. cross-origin media), use only a
    // low-key theme accent. Never retain the preceding Reel's sampled color.
    root.style.removeProperty("--igx-glow-rgb");
    root.style.setProperty("--ig-ambilight", "rgba(var(--ig-rgb-accent), .28)");
    root.style.setProperty("--ig-ambilight-strength", ".22");
    syncReelAmbientLayer(video);
  }

  function getActiveReelVideo() {
    const videos = Array.from(document.querySelectorAll(".igx-reel-surface video, main video, [role=\"main\"] video"));
    return videos.map((video) => {
      const rect = video.getBoundingClientRect();
      const width = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
      const height = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
      if (width < 80 || height < 120) return null;
      const style = window.getComputedStyle(video);
      const hiddenByOurReelMarker = video.classList.contains("igx-reel-secondary-media") ||
        Boolean(video.closest(".igx-reel-secondary-surface"));
      if (style.display === "none" || (!hiddenByOurReelMarker &&
        (style.visibility === "hidden" || Number(style.opacity) === 0))) return null;
      const visibleArea = width * height;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const centerPenalty = Math.min(0.8, Math.abs(centerX - window.innerWidth / 2) / Math.max(1, window.innerWidth) +
        Math.abs(centerY - window.innerHeight / 2) / Math.max(1, window.innerHeight));
      const score = visibleArea * (video.paused ? .72 : 1.08) * (1 - centerPenalty);
      return { video, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score)[0]?.video || null;
  }

  function sampleReelColor() {
    const root = document.documentElement;
    if (!root) return;
    const reelPage = currentPageName() === "reels";
    const ambientEnabled = config.enabled && (config.ambientLight || config.videoAmbilight) && reelPage;
    const shouldSample = ambientEnabled && ["live", "blend"].includes(config.reelAmbientMode);
    root.setAttribute("data-igx-immersive", String(Boolean(config.enabled && config.immersiveReels && reelPage)));
    if (!shouldSample) {
      if (ambilightTimer) window.clearTimeout(ambilightTimer);
      ambilightTimer = 0;
      ambilightIntervalMs = 0;
      ambilightLastVisualFrameAt = 0;
      sampledReelVideo = null;
      sampledReelSource = "";
      smoothedReelRgb = null;
      ambilightBlockedSource = "";
      ambilightRetryAt = 0;
      ambilightLastColorSampleAt = 0;
      root.style.removeProperty("--igx-glow-rgb");
      root.style.removeProperty("--igx-media-rgb");
      root.style.setProperty("--ig-ambilight-strength", "0");
      syncReelAmbientLayer(ambientEnabled ? getActiveReelVideo() : null);
      return;
    }

    const video = getActiveReelVideo();
    const source = ambientVideoSourceSignature(video);
    if (sampledReelVideo !== video || sampledReelSource !== source) {
      sampledReelVideo = video;
      sampledReelSource = source;
      smoothedReelRgb = null;
      ambilightBlockedSource = "";
      ambilightRetryAt = 0;
      ambilightLastColorSampleAt = 0;
      root.style.removeProperty("--igx-media-rgb");
      setReelAmbientFallback(root, video);
      return;
    }
    if (video && video.paused && root.style.getPropertyValue("--igx-glow-rgb")) {
      syncReelAmbientLayer(video);
      return;
    }
    if (!video || video.readyState < 2 || !video.videoWidth) {
      root.style.removeProperty("--igx-media-rgb");
      setReelAmbientFallback(root, video);
      return;
    }
    if (source && source === ambilightBlockedSource && Date.now() < ambilightRetryAt) {
      setReelAmbientFallback(root, video);
      return;
    }

    // Color extraction uses its own 18×18 readback canvas and runs at no more
    // than 8 fps; the separate low-resolution visual canvas can still refresh
    // smoothly at the user's chosen rate (up to 30 fps).
    const requestedRate = Number(config.ambientFrameRate) || DEFAULT_CONFIG.ambientFrameRate;
    const colorSampleInterval = Math.max(125, Math.round(1000 / Math.min(8, requestedRate)));
    const now = Date.now();
    if (now - ambilightLastColorSampleAt < colorSampleInterval) {
      syncReelAmbientLayer(video);
      return;
    }
    ambilightLastColorSampleAt = now;

    try {
      const rawColor = ambientColorFromMedia(video);
      if (!rawColor) throw new Error("Live frame unavailable");
      const color = smoothReelColor(rawColor);
      if (!color) throw new Error("Live frame color unavailable");
      root.style.setProperty("--igx-glow-rgb", color);
      root.style.setProperty("--ig-ambilight", `rgba(${color}, .48)`);
      root.style.setProperty("--ig-ambilight-strength", ".34");
      ambilightBlockedSource = "";
      ambilightRetryAt = 0;
      syncReelAmbientLayer(video);
    } catch (_) {
      // Tainted frames are not repeatedly sampled every visual tick. Re-check
      // the live source occasionally in case its origin/decoder becomes readable.
      ambilightBlockedSource = source;
      ambilightRetryAt = Date.now() + 3000;
      smoothedReelRgb = null;
      root.style.removeProperty("--igx-media-rgb");
      setReelAmbientFallback(root, video);
    }
  }

  function scheduleReelAmbientFrame() {
    if (!ambilightIntervalMs || ambilightTimer) return;
    // Wake close to the desired cadence, then paint on the next compositor frame.
    ambilightTimer = window.setTimeout(() => {
      ambilightTimer = 0;
      if (!ambilightIntervalMs) return;
      window.requestAnimationFrame((timestamp) => {
        if (!ambilightIntervalMs) return;
        if (ambilightLastVisualFrameAt && timestamp - ambilightLastVisualFrameAt + 1 < ambilightIntervalMs) {
          scheduleReelAmbientFrame();
          return;
        }
        ambilightLastVisualFrameAt = timestamp;
        sampleReelColor();
        scheduleReelAmbientFrame();
      });
    }, Math.max(0, ambilightIntervalMs - 12));
  }

  function syncImmersiveReels() {
    syncAmbientSampler();
    const shouldSample = config.enabled && (config.ambientLight || config.videoAmbilight) &&
      currentPageName() === "reels" && ["live", "blend"].includes(config.reelAmbientMode);
    sampleReelColor();
    if (shouldSample) {
      const rate = Math.max(2, Math.min(30, Number(config.ambientFrameRate) || DEFAULT_CONFIG.ambientFrameRate));
      const delay = Math.round(1000 / rate);
      if (ambilightIntervalMs !== delay) {
        if (ambilightTimer) window.clearTimeout(ambilightTimer);
        ambilightTimer = 0;
        ambilightIntervalMs = delay;
        ambilightLastVisualFrameAt = performance.now();
      }
      scheduleReelAmbientFrame();
    } else {
      if (ambilightTimer) window.clearTimeout(ambilightTimer);
      ambilightTimer = 0;
      ambilightIntervalMs = 0;
      ambilightLastVisualFrameAt = 0;
    }
  }

  function reelKeyboardContextIsBlocked(event) {
    const blocked = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="dialog"], [aria-modal="true"], dialog, #igx-studio-drawer.open, .igx-native-notifications-panel';
    const target = event.target instanceof Element ? event.target : null;
    const active = document.activeElement instanceof Element ? document.activeElement : null;
    return Boolean(target?.closest(blocked) || active?.closest(blocked));
  }

  function scrollReelByKeyboard(direction, video) {
    const main = getPageMain();
    const surface = getReelSurfaceForVideo(video, main);
    const surfaceRect = surface?.getBoundingClientRect();
    const behavior = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    let target = video.parentElement;

    for (let depth = 0; target && target !== document.body && depth < 12; depth += 1, target = target.parentElement) {
      const style = window.getComputedStyle(target);
      if (!/(?:auto|scroll|overlay|hidden)/i.test(style.overflowY || "") ||
          target.scrollHeight <= target.clientHeight + 24) continue;
      const canMove = direction < 0 ? target.scrollTop > 2 : target.scrollTop + target.clientHeight < target.scrollHeight - 2;
      if (!canMove) continue;
      const visibleStep = Math.min(target.clientHeight || window.innerHeight, surfaceRect?.height || target.clientHeight || window.innerHeight);
      target.scrollBy({ top: direction * Math.max(160, visibleStep * .92), behavior });
      return true;
    }

    const scroller = document.scrollingElement || document.documentElement;
    const maxScroll = Math.max(0, scroller.scrollHeight - window.innerHeight);
    const currentScroll = Math.max(window.scrollY || 0, scroller.scrollTop || 0);
    const canMoveDocument = direction < 0 ? currentScroll > 2 : currentScroll < maxScroll - 2;
    if (canMoveDocument) {
      window.scrollBy({ top: direction * Math.max(160, window.innerHeight * .92), behavior });
      return true;
    }

    // A few Instagram layouts expose explicit native Reel navigation buttons.
    // Use one only when it is visibly beside the active player; never synthesize
    // a click on a Like/Comment/Share action.
    const pattern = direction < 0
      ? /^(?:previous|prev)\s+(?:reel|video|clip)$/i
      : /^(?:next|forward)\s+(?:reel|video|clip)$/i;
    const controls = Array.from((main || document).querySelectorAll('button, [role="button"], a[role="button"]'));
    const control = controls.find((item) => {
      const label = normalizedLabel(`${item.getAttribute("aria-label") || ""} ${item.getAttribute("title") || ""} ${item.innerText || item.textContent}`).toLowerCase();
      if (!pattern.test(label)) return false;
      const rect = item.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      return !surfaceRect || Math.max(0, surfaceRect.left - rect.right, rect.left - surfaceRect.right) <= 180;
    });
    if (!control) return false;
    control.click();
    return true;
  }

  function handleReelSpaceKeydown(event) {
    if (currentPageName() !== "reels" || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (reelKeyboardContextIsBlocked(event)) return;
    const target = event.target instanceof Element ? event.target : null;
    const active = document.activeElement instanceof Element ? document.activeElement : null;
    const key = event.key;

    if (event.code === "Space" || key === " " || key === "Spacebar") {
      // Leave buttons, links, and Instagram's native play/pause controls alone.
      if (target?.closest('button, a, [role="button"], video[controls]') || active?.closest('button, a, [role="button"], video[controls]')) return;
      const video = getActiveReelVideo();
      if (!video) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (event.repeat) return;
      if (video.paused) {
        const playback = video.play();
        if (playback && typeof playback.catch === "function") playback.catch(() => {});
      } else video.pause();
      return;
    }

    if (key !== "ArrowUp" && key !== "ArrowDown" && key !== "Up" && key !== "Down") return;
    const focusedControl = target?.closest('button, a, [role="button"], [role="link"], video[controls]') ||
      active?.closest('button, a, [role="button"], [role="link"], video[controls]');
    // Native Reel controls own focused arrow-key interactions too.
    if (focusedControl) return;
    const video = getActiveReelVideo();
    if (!video) return;
    const moved = scrollReelByKeyboard(key === "ArrowUp" || key === "Up" ? -1 : 1, video);
    if (!moved) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
  // Install at document_start on window capture so shortcuts affect only the
  // active Reel and Instagram cannot also scroll the page for the same key.
  window.addEventListener("keydown", handleReelSpaceKeydown, true);

  /* ── Notifications: reveal Instagram's real in-place panel ─────────────── */
  const NATIVE_NOTIFICATION_FILTERS = new Set([
    "all", "people you follow", "comments", "follows", "tags & mentions", "verified",
    "mentions", "likes", "following", "requests", "for you"
  ]);
  const NATIVE_NOTIFICATIONS_TRANSITION_GRACE_MS = 5000;
  const NATIVE_NOTIFICATIONS_OPEN_TIMEOUT_MS = 9000;
  let nativeNotificationsLastPanel = null;
  let nativeNotificationTriggerClickPurpose = "";
  let nativeNotificationsOpenRequestUntil = 0;
  let nativeNotificationsClosePendingUntil = 0;
  let nativeNotificationsLastVisibleAt = 0;
  let nativeNotificationsLatchedOpen = false;
  let nativeNotificationsGraceTimer = 0;
  let nativeNotificationsVisibilityObserver = null;
  let nativeNotificationsObservedPanel = null;
  let nativeNotificationsVisibilitySyncTimer = 0;
  const nativeNotificationOriginalVisibility = new WeakMap();

  function scheduleNativeNotificationsGraceSync(until) {
    if (nativeNotificationsGraceTimer) window.clearTimeout(nativeNotificationsGraceTimer);
    nativeNotificationsGraceTimer = 0;
    const delay = Math.max(60, until - Date.now() + 40);
    nativeNotificationsGraceTimer = window.setTimeout(() => {
      nativeNotificationsGraceTimer = 0;
      syncNativeNotificationsPanel();
    }, delay);
  }

  function clearNativeNotificationItemMarks(panel) {
    if (!panel) return;
    panel.querySelectorAll(".igx-notification-list-host, .igx-notification-item, .igx-notification-avatar-host, .igx-notification-copy-host, .igx-notification-action-host")
      .forEach((node) => node.classList.remove(
        "igx-notification-list-host", "igx-notification-item", "igx-notification-avatar-host",
        "igx-notification-copy-host", "igx-notification-action-host"
      ));
  }

  function markNativeNotificationItems(panel) {
    // Rows and date-group wrappers keep Instagram's exact native display/grid
    // structure. Remove extension-owned layout markers left by earlier builds.
    clearNativeNotificationItemMarks(panel);
  }

  function clearNativeNotificationAnchor() {
    const root = document.documentElement;
    root?.style.removeProperty("--igx-notifications-top");
    root?.style.removeProperty("--igx-notifications-right");
  }

  function syncNativeNotificationAnchor() {
    const root = document.documentElement;
    if (!root) return;
    const extensionTrigger = document.querySelector('#igx-route-nav [data-nav="activity"]');
    const nativeTrigger = findNativeNotificationTrigger();
    const isVisibleTrigger = (control) => {
      if (!control?.isConnected) return false;
      const rect = control.getBoundingClientRect();
      const style = window.getComputedStyle(control);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" &&
        style.visibility !== "hidden" && Number(style.opacity) > .01;
    };
    // The native trigger stays callable while its sidebar is suppressed. For
    // panel placement, prefer a visible native bell and otherwise anchor to
    // Intergram's visible Notifications action rather than a zero-sized bell.
    const trigger = isVisibleTrigger(nativeTrigger) ? nativeTrigger : extensionTrigger;
    const rect = trigger?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      clearNativeNotificationAnchor();
      return;
    }
    const chromeValue = window.getComputedStyle(root).getPropertyValue("--igx-chrome-cover-height") ||
      window.getComputedStyle(root).getPropertyValue("--ig-chrome-height");
    const chromeBottom = Number.parseFloat(chromeValue) || 64;
    const top = Math.max(Math.ceil(rect.bottom + 14), Math.ceil(chromeBottom + 14));
    const right = Math.max(16, Math.ceil(window.innerWidth - rect.right));
    root.style.setProperty("--igx-notifications-top", `${top}px`);
    root.style.setProperty("--igx-notifications-right", `${right}px`);
  }

  function findNativeNotificationsPanel() {
    const ownUI = "#igx-topbar, #igx-route-nav-wrap, #igx-home-sidebar, #igx-studio-drawer, #igx-notifications-overlay";
    const pageMain = getPageMain();
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, [role="heading"]'))
      .filter((heading) => !heading.closest(ownUI) && /^notifications$/i.test(normalizedLabel(heading.innerText || heading.textContent)));
    // Instagram has shipped the in-place panel both with and without a heading.
    // Seed from accessible panel roots too, then require the same activity/filter
    // evidence below so unrelated dialogs and navigation controls are rejected.
    const accessiblePanelRoots = Array.from(document.querySelectorAll(
      '[aria-label*="notification" i], [title*="notification" i], [role="dialog"], [role="complementary"]'
    )).filter((node) => !node.closest(ownUI));
    const panelSeeds = Array.from(new Set([...headings, ...accessiblePanelRoots]));

    for (const heading of panelSeeds) {
      let candidate = heading;
      for (let depth = 0; candidate && candidate !== document.body && depth < 12; depth += 1, candidate = candidate.parentElement) {
        // Do not mistake the full Activity route/main column for the in-place
        // panel. A floating panel is a bounded child and is still eligible.
        if (candidate === pageMain || (pageMain && candidate !== heading && candidate.contains(pageMain))) break;
        const text = normalizedLabel(candidate.innerText || candidate.textContent);
        if (text.length > 30000) break;
        const controls = Array.from(candidate.querySelectorAll('button, [role="button"], [role="tab"], a[role="button"]'));
        const filters = new Set();
        let hasClose = false;
        controls.forEach((control) => {
          const labels = [control.getAttribute("aria-label"), control.getAttribute("title"), control.innerText || control.textContent]
            .map((value) => normalizedLabel(value).toLowerCase()).filter(Boolean);
          labels.forEach((label) => { if (NATIVE_NOTIFICATION_FILTERS.has(label)) filters.add(label); });
          if (labels.some((label) => /^(?:close|dismiss)$/i.test(label))) hasClose = true;
        });
        const grouped = Array.from(candidate.querySelectorAll('[role="heading"], h1, h2, h3, h4'))
          .some((item) => /^(?:this week|this month|earlier)$/i.test(normalizedLabel(item.innerText || item.textContent)));
        const nativeRows = candidate.querySelectorAll('[data-pressable-container="true"]').length;
        const ariaName = normalizedLabel(`${candidate.getAttribute("aria-label") || ""} ${candidate.getAttribute("title") || ""}`).toLowerCase();
        const semanticPanel = candidate.matches('[role="dialog"], [role="complementary"], aside') || /notifications?|activity feed/.test(ariaName);
        const hasActivity = grouped || ACTIVITY_ITEM_TEXT.test(text) || nativeRows > 0;
        const verifiedPanel = (filters.size >= 4 && hasClose && hasActivity) ||
          (filters.size >= 2 && (hasClose || semanticPanel) && hasActivity) ||
          (semanticPanel && (filters.size >= 1 || grouped || nativeRows > 0));
        if (verifiedPanel) return candidate;
      }
    }
    return null;
  }

  function nativeNotificationPanelIsVisible(panel) {
    if (!panel?.isConnected) return false;
    for (let node = panel; node && node !== document.documentElement; node = node.parentElement) {
      if (node.hidden || node.getAttribute("aria-hidden") === "true") return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) <= .01) return false;
    }
    const rect = panel.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function nativeNotificationVisibilityHostIsSafe(host, panel) {
    if (!host || host === panel || host === document.body || host === document.documentElement || host === getPageMain()) return false;
    if (host.matches?.('main, [role="main"], nav, [role="navigation"], #react-root, [id^="mount_"]')) return false;
    if (host.querySelector?.('main, [role="main"], article, nav, [role="navigation"]')) return false;
    const outsideText = Array.from(host.childNodes || [])
      .filter((node) => node !== panel && !(node.nodeType === 1 && node.contains(panel)))
      .map((node) => node.textContent || "").join("").replace(/\s+/g, " ").trim();
    if (outsideText.length > 2000) return false;
    const unrelatedControls = Array.from(host.querySelectorAll?.('button, [role="button"], a[href], input, textarea, select') || [])
      .filter((control) => !panel.contains(control));
    return unrelatedControls.length <= 2;
  }

  function stopNativeNotificationsVisibilityObserver() {
    nativeNotificationsVisibilityObserver?.disconnect();
    nativeNotificationsVisibilityObserver = null;
    nativeNotificationsObservedPanel = null;
    if (nativeNotificationsVisibilitySyncTimer) window.clearTimeout(nativeNotificationsVisibilitySyncTimer);
    nativeNotificationsVisibilitySyncTimer = 0;
  }

  function observeNativeNotificationsVisibility(panel) {
    if (!panel?.isConnected || !window.MutationObserver) return;
    if (nativeNotificationsObservedPanel === panel && nativeNotificationsVisibilityObserver) return;
    stopNativeNotificationsVisibilityObserver();
    nativeNotificationsObservedPanel = panel;
    nativeNotificationsVisibilityObserver = new MutationObserver(() => {
      if (nativeNotificationsVisibilitySyncTimer) window.clearTimeout(nativeNotificationsVisibilitySyncTimer);
      nativeNotificationsVisibilitySyncTimer = window.setTimeout(() => {
        nativeNotificationsVisibilitySyncTimer = 0;
        if (document.documentElement?.getAttribute("data-igx-notifications-open") === "true") {
          syncNativeNotificationsPanel();
        }
      }, 55);
    });
    nativeNotificationsVisibilityObserver.observe(panel, {
      attributes: true,
      attributeFilter: ["style", "class", "hidden", "aria-hidden"],
      childList: true,
      subtree: true
    });
    let depth = 0;
    for (let node = panel.parentElement;
      node && node !== document.body && node !== document.documentElement && depth < 12;
      node = node.parentElement, depth += 1) {
      nativeNotificationsVisibilityObserver.observe(node, {
        attributes: true,
        attributeFilter: ["style", "class", "hidden", "aria-hidden"]
      });
    }
  }

  function setNativeNotificationImportantStyle(node, property, value) {
    if (node.style.getPropertyValue(property) !== value || node.style.getPropertyPriority(property) !== "important") {
      node.style.setProperty(property, value, "important");
    }
  }

  function restoreNativeNotificationNode(node) {
    const original = nativeNotificationOriginalVisibility.get(node);
    if (!original) return;
    if (node.hidden !== original.hidden) node.hidden = original.hidden;
    if (original.ariaHidden === null) {
      if (node.hasAttribute("aria-hidden")) node.removeAttribute("aria-hidden");
    } else if (node.getAttribute("aria-hidden") !== original.ariaHidden) {
      node.setAttribute("aria-hidden", original.ariaHidden);
    }
    Object.entries(original.inlineStyles).forEach(([property, saved]) => {
      const value = node.style.getPropertyValue(property);
      const priority = node.style.getPropertyPriority(property);
      if (value === saved.value && priority === saved.priority) return;
      if (saved.value) node.style.setProperty(property, saved.value, saved.priority);
      else node.style.removeProperty(property);
    });
    nativeNotificationOriginalVisibility.delete(node);
  }

  function clearNativeNotificationVisibilityClasses(node) {
    restoreNativeNotificationNode(node);
    node.classList.remove("igx-native-notifications-visibility-override", "igx-native-notifications-state-override", "igx-native-notifications-display-override");
  }

  function restoreNativeNotificationsVisibility(panel) {
    if (!panel?.isConnected) return;
    const path = [];
    for (let node = panel; node && node !== document.body && node !== document.documentElement; node = node.parentElement) {
      path.push(node);
    }
    document.querySelectorAll(".igx-native-notifications-visibility-override, .igx-native-notifications-state-override, .igx-native-notifications-display-override")
      .forEach((node) => {
        if (!path.includes(node) && node !== panel) clearNativeNotificationVisibilityClasses(node);
      });

    for (const node of path) {
      let original = nativeNotificationOriginalVisibility.get(node);
      if (!original) {
        const style = window.getComputedStyle(node);
        original = {
          displayHidden: style.display === "none",
          visibilityHidden: style.visibility === "hidden" || node.hidden || node.getAttribute("aria-hidden") === "true",
          opacityHidden: Number(style.opacity) <= .01,
          hidden: node.hidden,
          ariaHidden: node.getAttribute("aria-hidden"),
          inlineStyles: Object.fromEntries(["display", "visibility", "opacity"].map((property) => [property, {
            value: node.style.getPropertyValue(property),
            priority: node.style.getPropertyPriority(property)
          }]))
        };
        if (!original.displayHidden && !original.visibilityHidden && !original.opacityHidden) continue;
        if (node !== panel && !nativeNotificationVisibilityHostIsSafe(node, panel)) break;
        nativeNotificationOriginalVisibility.set(node, original);
      } else if (node !== panel && !nativeNotificationVisibilityHostIsSafe(node, panel)) {
        break;
      }

      // Keep the original blocker state in the WeakMap: computed styles now
      // include our own override, so re-reading them would otherwise undo the
      // fix on the next React mutation while the panel is still explicitly open.
      if (original.displayHidden) node.classList.add("igx-native-notifications-display-override");
      if (original.visibilityHidden || original.opacityHidden) node.classList.add("igx-native-notifications-state-override");
      if (node !== panel) node.classList.add("igx-native-notifications-visibility-override");
      if (original.displayHidden) setNativeNotificationImportantStyle(node, "display", "block");
      if (original.visibilityHidden) setNativeNotificationImportantStyle(node, "visibility", "visible");
      if (original.opacityHidden) setNativeNotificationImportantStyle(node, "opacity", "1");
      if (original.hidden && node.hidden) node.hidden = false;
      if (original.ariaHidden === "true" && node.getAttribute("aria-hidden") !== "false") node.setAttribute("aria-hidden", "false");
    }
  }

  function clearNativeNotificationsPresentation(panels = [], panel = null) {
    stopNativeNotificationsVisibilityObserver();
    if (nativeNotificationsGraceTimer) window.clearTimeout(nativeNotificationsGraceTimer);
    nativeNotificationsGraceTimer = 0;
    const marked = new Set([...panels, ...(panel ? [panel] : [])]);
    marked.forEach((oldPanel) => {
      clearNativeNotificationVisibilityClasses(oldPanel);
      oldPanel.classList.remove("igx-native-notifications-panel", "igx-native-notifications-display-override");
      oldPanel.querySelectorAll(".igx-empty-notification-grid").forEach((node) => node.classList.remove("igx-empty-notification-grid"));
      clearNativeNotificationItemMarks(oldPanel);
    });
    document.querySelectorAll(".igx-native-notifications-visibility-override, .igx-native-notifications-state-override, .igx-native-notifications-display-override")
      .forEach(clearNativeNotificationVisibilityClasses);
    nativeNotificationsLatchedOpen = false;
    document.documentElement?.removeAttribute("data-igx-notifications-open");
    clearNativeNotificationAnchor();
  }

  function resetNativeNotificationsForRoute() {
    nativeNotificationsOpenRequestUntil = 0;
    nativeNotificationsClosePendingUntil = 0;
    nativeNotificationsLastVisibleAt = 0;
    nativeNotificationsLastPanel = null;
    nativeNotificationsLatchedOpen = false;
    clearNativeNotificationsPresentation(Array.from(document.querySelectorAll(".igx-native-notifications-panel")));
  }

  function syncNativeNotificationsPanel() {
    const root = document.documentElement;
    const now = Date.now();
    const panels = Array.from(document.querySelectorAll(".igx-native-notifications-panel"));
    const panel = findNativeNotificationsPanel() || (nativeNotificationsLastPanel?.isConnected ? nativeNotificationsLastPanel : null);
    const isVisible = Boolean(panel && nativeNotificationPanelIsVisible(panel));

    if (now < nativeNotificationsClosePendingUntil) {
      nativeNotificationsOpenRequestUntil = 0;
      nativeNotificationsLastVisibleAt = 0;
      nativeNotificationsLastPanel = null;
      clearNativeNotificationsPresentation(panels, panel);
      return null;
    }

    const openRequested = now < nativeNotificationsOpenRequestUntil;
    const wasOpenRecently = nativeNotificationsLastVisibleAt > 0 &&
      now - nativeNotificationsLastVisibleAt < NATIVE_NOTIFICATIONS_TRANSITION_GRACE_MS;
    const explicitlyOpen = nativeNotificationsLatchedOpen || root?.getAttribute("data-igx-notifications-open") === "true" || openRequested || wasOpenRecently;
    const keepOpen = isVisible || Boolean(panel && explicitlyOpen) || (!panel && (openRequested || wasOpenRecently));

    if (!keepOpen) {
      nativeNotificationsOpenRequestUntil = 0;
      nativeNotificationsLastVisibleAt = 0;
      nativeNotificationsLastPanel = null;
      clearNativeNotificationsPresentation(panels, panel);
      return null;
    }

    if (!panel) {
      stopNativeNotificationsVisibilityObserver();
      // A newly opened panel can be between React mounts. Retain the native
      // open intent only for the bounded open/remount grace window.
      root?.setAttribute("data-igx-notifications-open", "true");
      syncNativeNotificationAnchor();
      const graceUntil = Math.max(
        nativeNotificationsOpenRequestUntil,
        nativeNotificationsLastVisibleAt ? nativeNotificationsLastVisibleAt + NATIVE_NOTIFICATIONS_TRANSITION_GRACE_MS : 0
      );
      if (graceUntil > now) scheduleNativeNotificationsGraceSync(graceUntil);
      return null;
    }

    // Connected, semantically verified panel nodes stay open while the native
    // layer transitions opacity/visibility. Root state is now latched until an
    // explicit bell/Close/outside/Escape action, rather than timing out on CSS.
    if (isVisible) {
      nativeNotificationsOpenRequestUntil = 0;
      nativeNotificationsLastVisibleAt = now;
      nativeNotificationsLatchedOpen = true;
    }
    nativeNotificationsClosePendingUntil = 0;
    nativeNotificationsLastPanel = panel;
    if (nativeNotificationsGraceTimer) window.clearTimeout(nativeNotificationsGraceTimer);
    nativeNotificationsGraceTimer = 0;
    panels.forEach((oldPanel) => {
      if (oldPanel === panel) return;
      clearNativeNotificationVisibilityClasses(oldPanel);
      oldPanel.classList.remove("igx-native-notifications-panel", "igx-native-notifications-display-override");
      oldPanel.querySelectorAll(".igx-empty-notification-grid").forEach((node) => node.classList.remove("igx-empty-notification-grid"));
      clearNativeNotificationItemMarks(oldPanel);
    });
    panel.classList.add("igx-native-notifications-panel");
    // A verified, explicitly opened panel may be hidden by its own node or a
    // small React wrapper. Restore only those bounded blockers; never unhide the
    // whole app/main/navigation tree, and clear these markers on every close.
    restoreNativeNotificationsVisibility(panel);
    panel.querySelectorAll(".igx-empty-notification-grid").forEach((node) => node.classList.remove("igx-empty-notification-grid"));
    markNativeNotificationItems(panel);
    root?.setAttribute("data-igx-notifications-open", "true");
    observeNativeNotificationsVisibility(panel);
    syncNativeNotificationAnchor();
    return panel;
  }

  function findNativeNotificationTrigger() {
    const ownUI = "#igx-topbar, #igx-route-nav-wrap, #igx-home-sidebar, #igx-studio-drawer, .igx-native-notifications-panel";
    const candidates = [];
    const seen = new Set();
    const add = (items) => items.forEach((item) => {
      if (item && !seen.has(item)) { seen.add(item); candidates.push(item); }
    });
    add(findNativeControls());
    // Instagram may remount its icon row outside ROUTE_PREFIXES. Search only
    // native navigation landmarks, never the injected toolbar or post content.
    document.querySelectorAll('.igx-native-sidebar, nav, [role="navigation"]').forEach((root) => {
      if (root.matches(ownUI) || root.closest(ownUI)) return;
      add(root.querySelectorAll('a[href], button, [role="button"]'));
    });

    const matches = [];
    for (const control of candidates) {
      if (control.closest(ownUI)) continue;
      const iconLabels = Array.from(control.querySelectorAll('svg[aria-label]'))
        .map((svg) => normalizedLabel(svg.getAttribute("aria-label")));
      const clickable = control.closest('a[href], button, [role="button"]') || control;
      if (clickable.closest(ownUI)) continue;
      const ownLabels = [control, clickable].flatMap((node) => [node.getAttribute("aria-label"), node.getAttribute("title")])
        .map((label) => normalizedLabel(label)).filter(Boolean);
      const href = clickable.getAttribute("href") || "";
      const isNotificationLabel = (label) => /^(?:notifications?(?:\s+(?:and|&)\s+activity)?|activity(?:\s+feed)?)$/i.test(label);
      const labeledTrigger = ownLabels.some(isNotificationLabel) || iconLabels.some(isNotificationLabel);
      if (!labeledTrigger) continue;
      // Never invoke route-bearing links: only the native in-place control (or
      // its hash anchor) is eligible for this no-path-change interaction.
      if (href && !href.startsWith("#")) continue;
      matches.push(clickable);
    }
    return matches.find((control) => {
      const rect = control.getBoundingClientRect();
      const style = window.getComputedStyle(control);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" &&
        style.visibility !== "hidden" && Number(style.opacity) > .01;
    }) || matches[0] || null;
  }

  function notificationCloseControl(panel) {
    if (!panel) return null;
    return Array.from(panel.querySelectorAll('button, [role="button"], a[role="button"]'))
      .find((control) => [control.getAttribute("aria-label"), control.getAttribute("title"), control.innerText || control.textContent]
        .some((value) => /^close$/i.test(normalizedLabel(value)))) || null;
  }

  function scheduleNativeNotificationsSync() {
    [100, 240, 480, 900, 1500, 2800, 4200, NATIVE_NOTIFICATIONS_OPEN_TIMEOUT_MS].forEach((delay) => window.setTimeout(syncNativeNotificationsPanel, delay));
  }

  function clickNativeNotificationTrigger(trigger, purpose = "") {
    if (!trigger) return false;
    const previousPurpose = nativeNotificationTriggerClickPurpose;
    nativeNotificationTriggerClickPurpose = purpose;
    try {
      if (trigger instanceof HTMLAnchorElement) {
        // Run after React's delegated bubble handler: it gets to toggle the
        // native panel first, while the anchor's hash/default never changes URL.
        const initialURL = window.location.href;
        const suppressDefault = (event) => {
          if (event.target === trigger || trigger.contains(event.target)) event.preventDefault();
        };
        window.addEventListener("click", suppressDefault, { once: true });
        try { trigger.click(); }
        finally {
          window.removeEventListener("click", suppressDefault);
          // Protect the exact path/query/hash contract if the host anchor still
          // attempts same-document navigation after its delegated handler runs.
          if (window.location.href !== initialURL) {
            try { window.history.replaceState(window.history.state, "", initialURL); } catch (_) { /* Keep the active page. */ }
          }
        }
      } else trigger.click();
      return true;
    } finally {
      nativeNotificationTriggerClickPurpose = previousPurpose;
    }
  }

  function closeNativeNotifications() {
    const panel = syncNativeNotificationsPanel();
    const close = notificationCloseControl(panel);
    const trigger = findNativeNotificationTrigger();
    nativeNotificationsOpenRequestUntil = 0;
    nativeNotificationsLastVisibleAt = 0;
    nativeNotificationsLastPanel = null;
    nativeNotificationsLatchedOpen = false;
    nativeNotificationsClosePendingUntil = Date.now() + 1000;
    if (nativeNotificationsGraceTimer) window.clearTimeout(nativeNotificationsGraceTimer);
    nativeNotificationsGraceTimer = 0;
    if (close) close.click();
    else clickNativeNotificationTrigger(trigger, "close");
    document.documentElement?.removeAttribute("data-igx-notifications-open");
    clearNativeNotificationAnchor();
    scheduleNativeNotificationsSync();
  }

  function openNotifications() {
    const panel = syncNativeNotificationsPanel();
    if (panel) {
      closeNativeNotifications();
      return;
    }
    const root = document.documentElement;
    const now = Date.now();
    const opening = now < nativeNotificationsOpenRequestUntil;
    const justConfirmedOpen = root?.getAttribute("data-igx-notifications-open") === "true" &&
      nativeNotificationsLastVisibleAt > 0 && now - nativeNotificationsLastVisibleAt < NATIVE_NOTIFICATIONS_TRANSITION_GRACE_MS;
    if (opening || justConfirmedOpen) {
      scheduleNativeNotificationsSync();
      return;
    }
    // findNativeNotificationTrigger intentionally returns its native, hidden
    // sidebar control as a fallback; HTMLElement.click() still reaches Instagram's
    // delegated handler while the exact sidebar DOM remains visually suppressed.
    const trigger = findNativeNotificationTrigger();
    if (!trigger) return;
    nativeNotificationsClosePendingUntil = 0;
    nativeNotificationsLastVisibleAt = 0;
    nativeNotificationsLastPanel = null;
    nativeNotificationsLatchedOpen = true;
    nativeNotificationsOpenRequestUntil = now + NATIVE_NOTIFICATIONS_OPEN_TIMEOUT_MS;
    root?.setAttribute("data-igx-notifications-open", "true");
    if (!clickNativeNotificationTrigger(trigger, "open")) {
      nativeNotificationsOpenRequestUntil = 0;
      nativeNotificationsLatchedOpen = false;
      root?.removeAttribute("data-igx-notifications-open");
      return;
    }
    scheduleNativeNotificationsSync();
  }

  function persistConfig(immediate = false) {
    window.clearTimeout(configPersistTimer);
    cacheConfigLocally(config);
    const write = () => {
      try {
        if (typeof chrome !== "undefined" && chrome.storage?.sync) {
          chrome.storage.sync.set({ intergramConfig: config });
        } else {
          localStorage.setItem("intergram_xelor_config", JSON.stringify(config));
        }
      } catch (_) {
        // Keep the current tab working even if storage is unavailable.
      }
    };
    if (immediate) write();
    else configPersistTimer = window.setTimeout(write, 140);
  }

  function saveConfig(partial, immediate = false) {
    // Do not pre-assign `config` here: applyConfigToDOM diffs against the
    // previous value to decide whether to rewrite the theme tokens. Assigning
    // first made every settings change look like "no theme change", which is
    // exactly why switching theme never repainted Instagram's own surfaces.
    applyConfigToDOM({ ...config, ...partial });
    persistConfig(immediate);
  }

  function loadInitialConfig() {
    if (typeof chrome !== "undefined" && chrome.storage?.sync) {
      try {
        chrome.storage.sync.get("intergramConfig", (result) => {
          if (chrome.runtime?.lastError) {
            bootConfigReady = true;
            checkBootReady();
            return;
          }
          const stored = result?.intergramConfig;
          config = migrateLegacyConfig(stored || (bootstrapConfigCached ? config : DEFAULT_CONFIG));
          applyConfigToDOM(config);
          cacheConfigLocally(config);
          if (!stored || Number(stored.schemaVersion || 0) < 12) persistConfig(true);
          bootConfigReady = true;
          checkBootReady();
        });
        chrome.storage.onChanged.addListener((changes, area) => {
          if (area === "sync" && changes.intergramConfig?.newValue) {
            applyConfigToDOM(changes.intergramConfig.newValue);
            cacheConfigLocally(config);
          }
        });
        return;
      } catch (_) {
        // Continue with the local defaults.
      }
    }

    try {
      const stored = localStorage.getItem("intergram_xelor_config");
      if (stored) { config = migrateLegacyConfig(JSON.parse(stored)); bootstrapConfigCached = true; }
    } catch (_) { /* Keep the synchronously cached/default config. */ }
    applyConfigToDOM(config);
    cacheConfigLocally(config);
    bootConfigReady = true;
    checkBootReady();
  }

  function routeKeyFromHref(href) {
    if (!href) return "";
    let url;
    try {
      url = new URL(href, window.location.href);
    } catch (_) {
      return "";
    }
    if (url.origin !== window.location.origin) return "";
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (path === "/") return "home";
    if (path === "/explore" || path.startsWith("/explore/")) return "explore";
    if (path === "/reels" || path.startsWith("/reels/")) return "reels";
    if (path === "/direct" || path.startsWith("/direct/")) return "messages";
    if (path === "/accounts/activity" || path.startsWith("/accounts/activity/")) return "activity";
    if (path === "/create" || path.startsWith("/create/")) return "create";
    return "";
  }

  function getRouteAnchors(scope = document) {
    return Array.from(scope.querySelectorAll("a[href]"))
      .filter((anchor) => !anchor.closest("#igx-topbar, #igx-route-nav-wrap, #igx-home-sidebar, #igx-studio-drawer"))
      .filter((anchor) => routeKeyFromHref(anchor.getAttribute("href")));
  }

  function getPageMain() {
    return document.querySelector('main[role="main"]') ||
      document.querySelector('[role="main"]') ||
      document.querySelector("main");
  }

  function countRoutes(element) {
    const routes = new Set();
    for (const anchor of getRouteAnchors(element)) routes.add(routeKeyFromHref(anchor.getAttribute("href")));
    return routes;
  }

  function markPageLayout(sidebar) {
    if (!sidebar) return;
    let node = sidebar.parentElement;
    for (let depth = 0; node && node !== document.body && depth < 10; depth += 1, node = node.parentElement) {
      const children = Array.from(node.children);
      const sideChild = children.find((child) => child === sidebar || child.contains(sidebar));
      if (!sideChild) continue;
      const contentChild = children.find((child) => child !== sideChild && child.querySelector("main[role='main'], [role='main'], main"));
      if (contentChild) {
        node.classList.add("igx-page-layout");
        contentChild.classList.add("igx-content-shell");
        return;
      }
    }
  }

  // Mark only a visually empty ~72px full-height sibling between the detected
  // native nav and main content; this is the blank rail spacer shown in the
  // supplied DOM, not another navigation or content container.
  function markNativeSidebarSpacer(sidebar) {
    const main = getPageMain();
    if (!sidebar || !main) return;
    const viewportHeight = Math.max(window.innerHeight || 0, 1);
    for (let ancestor = sidebar.parentElement, depth = 0; ancestor && ancestor !== document.body && depth < 8; ancestor = ancestor.parentElement, depth += 1) {
      const children = Array.from(ancestor.children);
      const sideChild = children.find((child) => child === sidebar || child.contains(sidebar));
      const contentChild = children.find((child) => child !== sideChild && (child === main || child.contains(main)));
      if (!sideChild || !contentChild) continue;
      children.forEach((candidate) => {
        if (candidate === sideChild || candidate === contentChild || candidate.contains(sidebar) || candidate.contains(main)) return;
        const rect = candidate.getBoundingClientRect();
        const computed = window.getComputedStyle(candidate);
        const width = rect.width || Number.parseFloat(computed.width) || 0;
        const height = rect.height || Number.parseFloat(computed.height) || 0;
        const text = normalizedLabel(candidate.innerText || candidate.textContent);
        const meaningful = candidate.querySelector('a[href], button, [role="button"], [role="link"], input, textarea, select, img, video, canvas');
        if (!text && !meaningful && width >= 56 && width <= 90 && height >= viewportHeight * .35) {
          candidate.classList.add("igx-native-sidebar-spacer");
        }
      });
      return;
    }
  }

  // Some Instagram builds wrap the route-bearing nav in a separate 72px
  // full-height shell. Hide that shell only when its geometry and route links
  // prove it is the native sidebar; never match an arbitrary blank column.
  function markNativeSidebarShell(sidebar) {
    const main = getPageMain();
    if (!sidebar || !main) return;
    const viewportHeight = Math.max(window.innerHeight || 0, 1);
    const viewportWidth = Math.max(window.innerWidth || 0, 1);
    for (let candidate = sidebar.parentElement, depth = 0;
      candidate && candidate !== document.body && depth < 6;
      candidate = candidate.parentElement, depth += 1) {
      if (candidate === main || candidate.contains(main) || candidate.matches?.(".igx-native-notifications-panel") ||
          candidate.querySelector?.(".igx-native-notifications-panel")) continue;
      const routes = countRoutes(candidate);
      if (routes.size < 3) continue;
      const routeLinks = getRouteAnchors(candidate).length;
      if (routeLinks > 24) continue;
      const rect = candidate.getBoundingClientRect();
      const computed = window.getComputedStyle(candidate);
      const width = rect.width || Number.parseFloat(computed.width) || Number.parseFloat(candidate.style.width) || 0;
      const height = rect.height || Number.parseFloat(computed.height) || Number.parseFloat(candidate.style.height) || 0;
      const left = rect.width ? rect.left : 0;
      if (width < 56 || width > 90 || height < viewportHeight * .35 ||
          left > Math.min(180, viewportWidth * .18)) continue;
      candidate.classList.add("igx-native-sidebar-shell");
      return;
    }
  }

  // The supplied page archive uses a div-based navigation rail, not a <nav> landmark.
  // Detect the rail from its route links and narrow, full-height geometry.
  function markNativeSidebar() {
    if (!document.body) return;
    document.querySelectorAll(".igx-native-sidebar-shell").forEach((el) => el.classList.remove("igx-native-sidebar-shell"));
    const retained = document.querySelector(".igx-native-sidebar");
    document.querySelectorAll(".igx-native-sidebar-spacer").forEach((el) => el.classList.remove("igx-native-sidebar-spacer"));
    if (retained && countRoutes(retained).size >= 3) {
      markPageLayout(retained);
      markNativeSidebarShell(retained);
      markNativeSidebarSpacer(retained);
      return;
    }
    document.querySelectorAll(".igx-native-sidebar").forEach((el) => el.classList.remove("igx-native-sidebar"));
    document.querySelectorAll(".igx-page-layout").forEach((el) => el.classList.remove("igx-page-layout"));
    document.querySelectorAll(".igx-content-shell").forEach((el) => el.classList.remove("igx-content-shell"));

    const candidates = new Map();
    const addRouteToAncestors = (anchor) => {
      const route = routeKeyFromHref(anchor.getAttribute("href"));
      if (!route) return;
      let node = anchor.parentElement;
      for (let depth = 1; node && node !== document.body && depth < 10; depth += 1, node = node.parentElement) {
        let data = candidates.get(node);
        if (!data) {
          data = { routes: new Set(), linkCount: 0, nestingDepth: depth };
          candidates.set(node, data);
        }
        data.routes.add(route);
        data.linkCount += 1;
        data.nestingDepth = Math.max(data.nestingDepth, depth);
      }
    };
    getRouteAnchors().forEach(addRouteToAncestors);

    const semanticRoots = Array.from(document.querySelectorAll('nav:not(#igx-route-nav):not(#igx-home-nav):not(#igx-top-actions), [role="navigation"]'))
      .filter((el) => !el.closest("#igx-topbar, #igx-route-nav-wrap, #igx-home-sidebar, #igx-studio-drawer"));
    semanticRoots.forEach((root) => {
      if (candidates.has(root)) return;
      const routes = new Set();
      let linkCount = 0;
      getRouteAnchors(root).forEach((anchor) => {
        const route = routeKeyFromHref(anchor.getAttribute("href"));
        if (route) { routes.add(route); linkCount += 1; }
      });
      if (routes.size) candidates.set(root, { routes, linkCount, nestingDepth: 0 });
    });

    const main = getPageMain();
    const viewportHeight = Math.max(window.innerHeight || 0, 1);
    const viewportWidth = Math.max(window.innerWidth || 0, 1);
    let best = null;
    let bestScore = -Infinity;

    for (const [el, data] of candidates) {
      const routeCount = data.routes.size;
      if (routeCount < 3 || data.linkCount > 24 || (main && (el === main || el.contains(main)))) continue;
      const rect = el.getBoundingClientRect();
      const computed = window.getComputedStyle(el);
      const width = rect.width || parseFloat(computed.width) || 0;
      const height = rect.height || parseFloat(computed.height) || 0;
      const left = rect.width ? rect.left : 0;
      const narrowRail = width >= 34 && width <= 300 && height >= viewportHeight * .35 && left <= Math.min(180, viewportWidth * .18);
      const bottomRail = width >= viewportWidth * .65 && height >= 36 && height <= 190 && rect.bottom >= viewportHeight - 120;
      const semantic = el.matches('nav, [role="navigation"]');
      if (!narrowRail && !bottomRail) continue;

      let score = routeCount * 8 + (semantic ? 2 : 0);
      if (narrowRail) score += 18 + Math.max(0, 8 - Math.abs(width - 72) / 18);
      if (bottomRail) score += 18;
      if (data.linkCount <= 14) score += 2;
      score += Math.min(data.nestingDepth, 10) * .25;
      if (score > bestScore) { best = el; bestScore = score; }
    }

    if (best) {
      best.classList.add("igx-native-sidebar");
      markPageLayout(best);
      markNativeSidebarShell(best);
      markNativeSidebarSpacer(best);
    }
  }

  function inlinePixelValue(element, name) {
    const raw = element?.style?.getPropertyValue(name) || "";
    const value = Number.parseFloat(raw);
    return Number.isFinite(value) ? value : 0;
  }

  function nativeChatColumnSize(element) {
    const rect = element.getBoundingClientRect();
    return {
      width: Math.max(rect.width || 0, inlinePixelValue(element, "--x-width")),
      height: Math.max(rect.height || 0, inlinePixelValue(element, "--x-height"))
    };
  }

  function markNativeChatLayout() {
    document.querySelectorAll(".igx-native-chat-layout, .igx-native-chat-pane, .igx-native-chat-list-pane, .igx-native-chat-thread-pane, .igx-native-chat-column, .igx-native-chat-list, .igx-native-chat-thread, .igx-native-message-toggle, .igx-native-message-toggle-wrap, .igx-native-message-popup, .igx-native-chat-panel, .igx-native-message-launcher").forEach((node) => {
      node.classList.remove("igx-native-chat-layout", "igx-native-chat-pane", "igx-native-chat-list-pane", "igx-native-chat-thread-pane", "igx-native-chat-column", "igx-native-chat-list", "igx-native-chat-thread", "igx-native-message-toggle", "igx-native-message-toggle-wrap", "igx-native-message-popup", "igx-native-chat-panel", "igx-native-message-launcher");
    });

    const messageLabels = Array.from(document.querySelectorAll('[aria-label*="message" i], [title*="message" i]'))
      .filter((node) => !node.closest("#igx-topbar, #igx-route-nav-wrap, #igx-home-sidebar, #igx-studio-drawer, .igx-native-sidebar"));
    const nativeToggles = new Set();
    for (const node of messageLabels) {
      const button = node.closest('button, [role="button"]');
      if (!button || button.closest("#igx-topbar, #igx-route-nav-wrap, #igx-studio-drawer, .igx-native-sidebar")) continue;
      const text = (button.textContent || "").replace(/\s+/g, " ").trim();
      const label = `${button.getAttribute("aria-label") || ""} ${node.getAttribute("aria-label") || ""} ${text}`.replace(/\s+/g, " ").trim();
      const collapsedMessagesLauncher = /^messages?\s*\d+\s*messages?$/i.test(text) ||
        /^messages?\s*[-:]\s*\d+\s+new notification/i.test(label) ||
        /^direct messaging\s*[-:]\s*\d+\s+new notification/i.test(label);
      if (collapsedMessagesLauncher && label.length < 180) nativeToggles.add(button);
    }

    if (currentPageName() !== "home") {
      nativeToggles.forEach((button) => button.classList.add("igx-native-message-toggle"));
      nativeToggles.forEach((button) => button.parentElement?.classList.add("igx-native-message-toggle-wrap"));
      return;
    }

    const columns = Array.from(document.querySelectorAll('[style*="--x-height"][style*="--x-width"]'))
      .filter((element) => !element.closest("#igx-topbar, #igx-route-nav-wrap, #igx-studio-drawer, .igx-native-sidebar"))
      .map((element) => {
        const size = nativeChatColumnSize(element);
        const text = (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
        return { element, ...size, text };
      })
      .filter((item) => item.width >= 260 && item.height >= 300 && /message|messages|go back/i.test(item.text));

    const hostCandidates = new Set();
    for (const item of columns) {
      let ancestor = item.element.parentElement;
      for (let depth = 0; ancestor && ancestor !== document.body && depth < 9; depth += 1, ancestor = ancestor.parentElement) {
        if (ancestor.closest("main, article, #igx-topbar, #igx-route-nav-wrap, #igx-studio-drawer, .igx-native-sidebar")) continue;
        const contained = columns.filter((column) => ancestor.contains(column.element));
        const branches = new Set(contained.map((column) => {
          let branch = column.element;
          while (branch.parentElement && branch.parentElement !== ancestor) branch = branch.parentElement;
          return branch;
        }));
        const text = (ancestor.innerText || ancestor.textContent || "").replace(/\s+/g, " ");
        if (branches.size >= 2 && /messages/i.test(text) && /new message/i.test(text) && /go back/i.test(text)) {
          hostCandidates.add(ancestor);
          break;
        }
      }
    }

    if (!hostCandidates.size && columns.length) {
      // Instagram's expanded tray on Home usually renders a single pane (the
      // conversation list) until a thread is opened. Treat that as the chat
      // surface too, otherwise the Home right column would stay empty.
      const biggest = columns.slice().sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
      let host = biggest.element.parentElement;
      for (let depth = 0; host && host !== document.body && depth < 9; depth += 1, host = host.parentElement) {
        if (host.closest("main, article, #igx-topbar, #igx-route-nav-wrap, #igx-studio-drawer, .igx-native-sidebar")) continue;
        const text = (host.innerText || host.textContent || "").replace(/\s+/g, " ");
        if (/messages|chats/i.test(text) && /new message|search/i.test(text)) {
          hostCandidates.add(host);
          break;
        }
      }
    }

    let chatHost = null;
    if (hostCandidates.size) {
      chatHost = Array.from(hostCandidates).sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        const aArea = Math.max(1, aRect.width) * Math.max(1, aRect.height);
        const bArea = Math.max(1, bRect.width) * Math.max(1, bRect.height);
        return aArea - bArea;
      })[0];
      chatHost.classList.add("igx-native-chat-layout");
      columns.filter((column) => chatHost.contains(column.element)).forEach((column) => {
        const thread = /go back/i.test(column.text) || /message\.\.\./i.test(column.text) || /choose a gif/i.test(column.text);
        const type = thread ? "thread" : "list";
        column.element.classList.add("igx-native-chat-column", `igx-native-chat-${type}`);
        let pane = column.element;
        while (pane.parentElement && pane.parentElement !== chatHost) pane = pane.parentElement;
        pane.classList.add("igx-native-chat-pane", `igx-native-chat-${type}-pane`);
      });
    }

    nativeToggles.forEach((button) => {
      button.classList.add("igx-native-message-toggle");
      const wrapper = button.parentElement;
      if (wrapper) {
        wrapper.classList.add("igx-native-message-toggle-wrap");
        if (chatHost?.contains(wrapper)) wrapper.classList.add("igx-native-message-popup");
      }
    });
  }

  function findMessagesLauncherButton() {
    const candidates = Array.from(document.querySelectorAll('button, [role="button"], a[href^="/direct"]'))
      .filter((el) => !el.closest("#igx-topbar, #igx-route-nav-wrap, #igx-studio-drawer, .igx-native-sidebar, .igx-native-chat-layout"));
    return candidates.find((el) => {
      const label = normalizedLabel(el.getAttribute("aria-label") || el.getAttribute("title") || "");
      const text = normalizedLabel(el.textContent);
      return /^messages?$/i.test(label) || /^messages?\s*\d+\s*messages?$/i.test(text) || /^chats?$/i.test(label);
    }) || null;
  }

  // Instagram keeps the Direct tray collapsed on Home, so a real conversation
  // list only exists once the launcher is opened. Open it once per route, then
  // let the normal detection reposition it. Nothing is fabricated.
  let homeChatExpandedFor = "";
  function ensureHomeChatExpanded() {
    if (!config.enabled || !config.homeChatPanel || currentPageName() !== "home") return;
    if (window.innerWidth <= 900) return;
    syncHomeChatGeometry();
    const root = document.documentElement;
    if (root.getAttribute("data-igx-chat-geom") !== "ready") return;
    if (root.getAttribute("data-igx-chat-fit") === "false") return;
    const path = window.location.pathname || "/";
    if (homeChatExpandedFor === path) return;
    if (document.querySelector(".igx-native-chat-layout")) { homeChatExpandedFor = path; return; }
    const launcher = document.querySelector(".igx-native-message-toggle") || findMessagesLauncherButton();
    if (!launcher) return;
    try { launcher.click(); } catch (_) { return; }
    homeChatExpandedFor = path;
    const settleNativeTray = (attempt = 0) => {
      markNativeChatLayout();
      classifyAndMarkSurfaces({ messages: true });
      if (!document.querySelector(".igx-native-chat-layout") && attempt < 3) {
        window.setTimeout(() => settleNativeTray(attempt + 1), 180);
      } else {
        syncHomeChatGeometry();
      }
    };
    window.setTimeout(() => settleNativeTray(), 120);
  }

  // The Home chat panel is position: fixed (Instagram portals the Direct tray
  // outside <main>), so measure the live shell rather than guessing from 100vw.
  // This matches the grid track exactly across scrollbars, zoom, and breakpoints.
  let chatGeomTimer = 0;
  let homeChatResizeObserver = null;
  let observedHomeChatSurface = null;
  function syncHomeChatGeometry() {
    const root = document.documentElement;
    if (!root) return;
    const clear = () => {
      root.removeAttribute("data-igx-chat-geom");
      root.removeAttribute("data-igx-chat-fit");
      root.style.removeProperty("--ig-chat-edge");
      root.style.removeProperty("--ig-chat-col-px");
    };
    if (!root.classList.contains("intergram-theme") || !config.enabled || !config.homeChatPanel || currentPageName() !== "home") {
      clear();
      homeChatResizeObserver?.disconnect();
      homeChatResizeObserver = null;
      observedHomeChatSurface = null;
      return;
    }
    const vw = root.clientWidth || window.innerWidth || 0;
    if (!vw || vw <= 900) { clear(); return; }
    const surface = document.querySelector(".igx-main-surface");
    if (!surface) return;
    if (typeof window.ResizeObserver === "function" && observedHomeChatSurface !== surface) {
      homeChatResizeObserver?.disconnect();
      observedHomeChatSurface = surface;
      homeChatResizeObserver = new window.ResizeObserver(() => scheduleChatGeometry(90));
      homeChatResizeObserver.observe(surface);
    }
    const rect = surface.getBoundingClientRect();
    if (!rect || !rect.width) return;                 // not laid out yet
    const styles = window.getComputedStyle(surface);
    const padLeft = parseFloat(styles.paddingLeft) || 0;
    const padRight = parseFloat(styles.paddingRight) || 0;
    const inner = Math.max(0, rect.width - padLeft - padRight);
    if (!inner) return;
    const columnGap = parseFloat(styles.columnGap) || 24;
    // Keep enough room for the primary feed column. Collapse the optional Home
    // inbox rather than squeezing or overlapping native Home content.
    const desired = Math.min(960, Math.max(340, Math.round(inner * 0.40)));
    const maxChat = Math.max(280, Math.round(inner - columnGap - 860));
    const width = Math.min(desired, maxChat);
    const edge = Math.max(8, Math.round(vw - rect.right + padRight));
    root.style.setProperty("--ig-chat-col-px", `${width}px`);
    root.style.setProperty("--ig-chat-edge", `${edge}px`);
    root.setAttribute("data-igx-chat-geom", "ready");
    // Preserve native Home content; collapse instead of squeezing or overlapping it.
    root.setAttribute("data-igx-chat-fit", inner - width - columnGap >= 860 ? "true" : "false");
  }

  function scheduleChatGeometry(delay = 140) {
    window.clearTimeout(chatGeomTimer);
    chatGeomTimer = window.setTimeout(() => {
      syncHomeChatGeometry();
      if (document.documentElement.getAttribute("data-igx-chat-fit") === "true") ensureHomeChatExpanded();
    }, delay);
  }

  function restoreDefaultStoryRail(scope = document) {
    // Instagram owns the Story tray, rings, and native navigation. Remove only
    // stale extension layout/overlay markers and any old Intergram arrow buttons.
    const storyClasses = [
      "igx-story-rail", "igx-story-virtual-spacer", "igx-home-story-item", "igx-story-ring-canvas",
      "igx-story-ring-host", "igx-story-ring-seen", "igx-story-native-next", "igx-story-native-prev", "igx-story-next",
      "igx-story-scaled-item", "igx-story-rail-frame", "igx-story-control", "igx-story-avatar-frame",
      "igx-story-avatar-link", "igx-story-label", "igx-home-story-host", "igx-home-story-frame",
      "igx-home-story-only-frame", "igx-home-content-column"
    ];
    document.querySelectorAll(".igx-story-arrow, [data-igx-story-nav-control=\"true\"]").forEach((arrow) => arrow.remove());
    document.querySelectorAll(storyClasses.map((name) => `.${name}`).join(",")).forEach((node) => {
      node.removeAttribute("data-igx-story-pan");
      node.classList.remove(...storyClasses);
      node.style.removeProperty("--igx-story-position");
      node.style.removeProperty("--igx-story-item-width");
      node.removeAttribute("data-igx-story-forward-steps");
      if (Object.prototype.hasOwnProperty.call(node, "__igxStoryList")) node.__igxStoryList = null;
    });
    document.querySelectorAll(".igx-theme-story-ring-overlay").forEach((overlay) => overlay.remove());
    if (scope && scope !== document) {
      scope.querySelectorAll(".igx-story-arrow, [data-igx-story-nav-control=\"true\"]").forEach((arrow) => arrow.remove());
    }
    document.documentElement?.style.removeProperty("--igx-story-rail-left");
  }

  function clearStoryNavigation() {
    // Remove only Intergram-added Story buttons; Instagram's native controls are untouched.
    document.querySelectorAll(".igx-story-arrow, [data-igx-story-nav-control=\"true\"]").forEach((button) => button.remove());
  }

  const FRIEND_SUGGESTION_TITLE = /^(?:suggested for you|suggestions for you|friends? suggestions?|people you may know|people to follow|suggested accounts|suggested people|suggested profiles|accounts you may like|accounts to follow|people to discover|discover people|find people|find friends)$/i;
  const FRIEND_SUGGESTION_KEY = /(?:friend|user|account|people)[-_ ]*(?:suggestion|suggested)|(?:suggestion|suggested)[-_ ]*(?:friend|user|account|people)/i;

  function normalizedLabel(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  // Hide the complete unlabeled Home rail by its native controls and content,
  // not by Instagram's generated class names. Stop before any feed/article root.
  function markHomeAccountRail() {
    if (currentPageName() !== "home") return;
    const switchControls = Array.from(document.querySelectorAll('button, a, [role="button"]'))
      .filter((control) => [control.getAttribute("aria-label"), control.textContent, control.getAttribute("title")]
        .some((label) => normalizedLabel(label).toLowerCase() === "switch"));
    const footerLinkText = /^(?:about|blog|jobs|help|press|api|privacy|terms|locations|language|meta verified|instagram lite|threads|contact uploading(?: and| &) non-users)$/i;

    switchControls.forEach((control) => {
      let current = control;
      for (let depth = 0; current && current !== document.body && depth < 16; depth += 1, current = current.parentElement) {
        if (current.matches('main, [role="main"], article') || current.closest("article") || current.querySelector("article")) break;
        const text = normalizedLabel(current.textContent);
        if (text.length > 12000) break;
        if (!/\bsuggested for you\b/i.test(text)) continue;
        const footerLinks = Array.from(current.querySelectorAll("a[href]"))
          .filter((link) => footerLinkText.test(normalizedLabel(link.textContent) || normalizedLabel(link.getAttribute("aria-label") || link.getAttribute("title"))));
        if (footerLinks.length >= 3) {
          current.classList.add("igx-home-account-rail");
          break;
        }
      }
    });
  }

  // Hide only the semantically verified stock footer on Profile. Instagram
  // renders it through several root shapes, but every candidate must contain
  // Meta copyright plus the expected footer links; Home is intentionally excluded.
  function markNativeInstagramFooter() {
    document.querySelectorAll(".igx-native-footer").forEach((node) => node.classList.remove("igx-native-footer"));
    if (currentPageName() !== "profile") return;
    const footerLabels = /^(?:meta|about|blog|jobs|help|press|api|privacy|terms|locations|popular|instagram lite|meta ai|muse|threads|contact uploading(?: &| and) non-users|meta verified)$/i;
    const roots = Array.from(document.querySelectorAll('footer[role="contentinfo"], footer, [role="contentinfo"]'));
    for (const candidate of roots) {
      const text = normalizedLabel(candidate.innerText || candidate.textContent);
      if (text.length > 2600) continue;
      const linkCount = Array.from(candidate.querySelectorAll("a[href]"))
        .filter((link) => footerLabels.test(normalizedLabel(link.innerText || link.textContent))).length;
      const hasLanguage = Boolean(candidate.querySelector('select[aria-label*="display language" i]'));
      const hasCopyright = /©\s*20\d{2}\s+instagram from meta/i.test(text);
      if (linkCount >= 7 && hasCopyright && (hasLanguage || linkCount >= 10)) {
        candidate.classList.add("igx-native-footer");
        return;
      }
    }
  }

  // Instagram can append the account switcher and suggestions block in separate
  // SPA mutations. Recheck the bounded Home rail after it hydrates.
  function scheduleHomeAccountRailRescan() {
    [120, 360, 900, 1800].forEach((delay) => {
      window.setTimeout(() => {
        if (currentPageName() === "home") markHomeAccountRail();
      }, delay);
    });
  }

  function isProfileSuggestionLink(anchor) {
    const href = anchor.getAttribute("href") || "";
    const match = href.match(/^\/([^/?#]+)\/?$/);
    return Boolean(match && !RESERVED_PROFILE_PATHS.has(match[1].toLowerCase()));
  }

  function markSuggestionContainer(labelNode, root, isMain) {
    if (labelNode.closest("article")) return false;
    let current = labelNode;
    for (let depth = 0; current && current !== root && current !== document.body && depth < 9; depth += 1) {
      if (current.matches("article") || current.querySelector("article")) return false;
      const text = normalizedLabel(current.innerText || current.textContent);
      if (text.length > 3200) return false;
      const controls = Array.from(current.querySelectorAll('button, [role="button"], a[role="button"]'));
      const follows = controls.filter((control) => /^(?:follow|follow back)(?:\s|$)/i.test(normalizedLabel(`${control.getAttribute("aria-label") || ""} ${control.textContent || ""}`)));
      const profiles = Array.from(current.querySelectorAll("a[href]")).filter(isProfileSuggestionLink);
      const tagged = FRIEND_SUGGESTION_KEY.test(`${current.getAttribute("data-testid") || ""} ${current.getAttribute("aria-label") || ""}`);
      const semantic = current.matches('aside, section, [role="region"], [role="list"]');
      if (tagged || (semantic && (follows.length || profiles.length >= 2 || text.length < 1200)) || (profiles.length >= 2 && follows.length >= 1)) {
        current.classList.add("igx-home-suggestion-module");
        return true;
      }
      current = current.parentElement;
    }

    // An explicitly labelled aside/region can itself be the suggestion rail.
    if (!isMain && root && !root.querySelector("article") && root.matches('aside, section, [role="region"], [role="list"]')) {
      const text = normalizedLabel(root.innerText || root.textContent);
      if (text.length < 3200) {
        root.classList.add("igx-home-suggestion-module");
        return true;
      }
    }
    return false;
  }

  function markHomeSuggestions(main) {
    if (currentPageName() !== "home") return;
    const roots = new Set();
    if (main) roots.add(main);
    document.querySelectorAll('aside, [role="complementary"], [role="region"]').forEach((root) => {
      if (!root.closest("#igx-topbar, #igx-route-nav-wrap, #igx-home-sidebar, #igx-studio-drawer")) roots.add(root);
    });

    roots.forEach((root) => {
      const isMain = root === main || root.matches("main, [role=main]");
      const labels = Array.from(root.querySelectorAll('h1, h2, h3, h4, [role="heading"], span, strong, p, div, [aria-label], [data-testid]'));
      if (root.matches("[aria-label], [data-testid]")) labels.unshift(root);
      labels.forEach((element) => {
        if (element.closest("article")) return;
        if (element.tagName === "DIV" && element.children.length && !element.hasAttribute("aria-label") && !element.hasAttribute("data-testid")) return;
        const text = normalizedLabel(element.textContent);
        if (text.length > 72 && !element.hasAttribute("aria-label") && !element.hasAttribute("data-testid")) return;
        const attrs = normalizedLabel(`${element.getAttribute("aria-label") || ""} ${element.getAttribute("data-testid") || ""}`);
        const titleMatch = text.length <= 72 && FRIEND_SUGGESTION_TITLE.test(text);
        const keyMatch = FRIEND_SUGGESTION_KEY.test(attrs);
        if (titleMatch || keyMatch) markSuggestionContainer(element, root, isMain);
      });

    });

    // The semantic account rail is scanned separately at the page classifier,
    // including when no <main> or landmark root is available yet.
  }

  const ACTIVITY_ITEM_TEXT = /trying to log (?:in|into) instagram|started following you|started following|requested to follow|followed you|mentioned you|liked your|commented on your|replied to your|shared a post with you/i;

  function markActivityChrome(main) {
    if (!main) return;
    main.classList.add("igx-activity-surface");

    const headings = Array.from(main.querySelectorAll('h1, h2, h3, h4, [role="heading"], strong, span'))
      .filter((node) => /^(?:this week|this month|earlier)$/i.test(normalizedLabel(node.textContent)));
    headings.forEach((heading) => {
      let section = heading.parentElement;
      for (let depth = 0; section && section !== main && depth < 6; depth += 1, section = section.parentElement) {
        const text = normalizedLabel(section.innerText || section.textContent);
        if (text.length > 2400) break;
        if (section.querySelector("img") || ACTIVITY_ITEM_TEXT.test(text)) {
          section.classList.add("igx-activity-section");
          break;
        }
      }
    });

    const textNodes = Array.from(main.querySelectorAll("p, span, a, div, [role=\"listitem\"]"))
      .filter((node) => {
        if (node.closest(".igx-activity-item")) return false;
        const text = normalizedLabel(node.innerText || node.textContent);
        return text.length >= 20 && text.length <= 360 && ACTIVITY_ITEM_TEXT.test(text);
      });
    textNodes.forEach((textNode) => {
      let row = textNode;
      for (let depth = 0; row && row !== main && depth < 8; depth += 1, row = row.parentElement) {
        const text = normalizedLabel(row.innerText || row.textContent);
        const images = row.querySelectorAll("img").length;
        if (images === 1 && row.children.length >= 2 && text.length <= 420) {
          row.classList.add("igx-activity-item");
          const copyLeaf = Array.from(row.querySelectorAll("p, span, a, div"))
            .filter((node) => {
              const label = normalizedLabel(node.innerText || node.textContent);
              return label.length >= 16 && label.length <= 360 && ACTIVITY_ITEM_TEXT.test(label) && !node.querySelector("img, button, [role=\"button\"]");
            })
            .sort((a, b) => (normalizedLabel(a.textContent).length - normalizedLabel(b.textContent).length))[0];
          if (copyLeaf) {
            let copy = copyLeaf;
            for (let depth = 0; copy.parentElement && copy.parentElement !== row && depth < 6; depth += 1) {
              if (copy.parentElement.querySelector("img")) break;
              copy = copy.parentElement;
            }
            copy.classList.add("igx-activity-copy");
          }
          break;
        }
      }
    });
  }

  function getReelSurfaceForVideo(video, main) {
    if (!video || !main || !main.contains(video)) return null;
    let surface = video.parentElement;
    for (let depth = 0; surface && surface !== main && depth < 8; depth += 1, surface = surface.parentElement) {
      const rect = surface.getBoundingClientRect();
      if (rect.width > 240 && rect.height > 300 && rect.height < 1500) return surface;
    }
    return null;
  }

  function getAmbientSurfaceForVideo(video, main) {
    if (!video) return null;
    const reelSurface = video.closest(".igx-reel-surface");
    if (reelSurface && (!main || main.contains(reelSurface))) return reelSurface;
    let surface = video.parentElement;
    let fallback = !surface || surface === main || surface.querySelectorAll("video").length > 1 ? video : surface;
    for (let depth = 0; surface && surface !== main && depth < 8; depth += 1, surface = surface.parentElement) {
      if (surface.querySelectorAll("video").length > 1) break;
      const rect = surface.getBoundingClientRect();
      if (rect.width >= 96 && rect.height >= 96) return surface;
      fallback = surface;
    }
    return fallback || video;
  }

  function markAmbientVideoSurfaces(main) {
    if (!main?.querySelectorAll) return;
    const videos = Array.from(main.querySelectorAll("video"))
      .filter((video) => !video.closest('[role="dialog"], [aria-modal="true"]'));
    const surfaces = new Set();
    const feedTiles = new Set();
    const feedCards = new Set();
    videos.forEach((video) => {
      const surface = getAmbientSurfaceForVideo(video, main);
      if (!surface) return;
      surface.classList.add("igx-ambient-video-surface");
      surfaces.add(surface);
      const post = video.closest("article.igx-post-card");
      if (post && post.contains(surface) && surface !== post && surface.querySelectorAll("video").length === 1) {
        // Mark only this post's media wrapper, plus its own separate action row
        // host so the sampled frame color can continue beneath those controls.
        surface.classList.add("igx-feed-video-tile");
        feedTiles.add(surface);
        if (post.querySelectorAll("video").length === 1) {
          post.classList.add("igx-feed-video-card");
          feedCards.add(post);
        }
      }
    });
    main.querySelectorAll(".igx-ambient-video-surface").forEach((surface) => {
      if (surfaces.has(surface) || surface instanceof HTMLVideoElement || surface.querySelector("video")) return;
      clearAmbientVideoColor(surface);
      surface.classList.remove("igx-ambient-video-surface", "igx-feed-video-tile");
    });
    main.querySelectorAll(".igx-feed-video-tile").forEach((tile) => {
      if (feedTiles.has(tile)) return;
      tile.classList.remove("igx-feed-video-tile");
    });
    main.querySelectorAll(".igx-feed-video-card").forEach((card) => {
      if (feedCards.has(card)) return;
      card.classList.remove("igx-feed-video-card");
      card.style.removeProperty("--igx-post-video-rgb");
    });
  }

  function markPostActions(main) {
    if (!main?.querySelectorAll) return;
    main.querySelectorAll(".igx-post-action-host").forEach((host) => host.classList.remove("igx-post-action-host"));
    const actionNames = [
      ["like", /\blikes?\b/i],
      ["comment", /\bcomments?\b/i],
      ["repost", /\breposts?\b/i],
      ["share", /\bshares?\b/i],
      ["save", /\bsaves?\b/i]
    ];
    const sections = Array.from(main.querySelectorAll("section"))
      .filter((section) => !section.closest('[role="dialog"], [aria-modal="true"]'));
    const matchedSections = new Map();
    sections.forEach((section) => {
      const labels = [section.getAttribute("aria-label"), section.getAttribute("title")];
      section.querySelectorAll("[aria-label], [title], svg[aria-label]").forEach((control) => {
        labels.push(control.getAttribute("aria-label"), control.getAttribute("title"));
      });
      const accessibleText = labels.filter(Boolean).join(" ");
      const matched = actionNames.reduce((count, [, pattern]) => count + (pattern.test(accessibleText) ? 1 : 0), 0);
      if (matched >= 4) matchedSections.set(section, true);
    });
    sections.forEach((section) => {
      const hasSmallerActionSection = Array.from(section.querySelectorAll("section")).some((child) => matchedSections.has(child));
      const isActionSection = matchedSections.has(section) && !hasSmallerActionSection;
      section.classList.toggle("igx-post-actions", isActionSection);
      const host = section.parentElement;
      if (isActionSection && host && host !== main && host.children.length >= 2 &&
          !host.matches("article, main, section, header, footer, nav, aside, [role], [contenteditable]")) {
        host.classList.add("igx-post-action-host");
      }
    });
  }

  let lastMarkedReelMain = null;
  let lastMarkedReelVideo = null;
  let lastMarkedReelSurface = null;
  let lastMarkedReelSource = "";
  let lastMarkedReelAuthorVideo = null;
  let lastMarkedReelAuthorSource = "";

  function clearReelSurfaceMarkers(main) {
    if (!main?.querySelectorAll) return;
    main.querySelectorAll(".igx-reel-surface, .igx-reel-secondary-surface, .igx-reel-secondary-media, .igx-reel-empty-placeholder, .igx-reel-action-rail, .igx-reel-share-action").forEach((node) => {
      node.style.removeProperty("--igx-reel-share-shift-y");
      node.classList.remove("igx-reel-surface", "igx-reel-secondary-surface", "igx-reel-secondary-media", "igx-reel-empty-placeholder", "igx-reel-action-rail", "igx-reel-share-action");
    });
  }

  const REEL_EMPTY_PLACEHOLDER_SELECTOR = ".xp9pnto.xgtm274.x16gzn2n.xfysgsd.x1i5p2am.x1whfx0g.xr2y4jy.x1ihp6rs.x13fuv20.x18b5jzi.x1q0q8m5.x1t7ytsu.x178xt8z.x1lun4ml.xso031l.xpilrb4.x1n2onr6.xkh2ocl.x78zum5.xdt5ytf.x16ye13r";

  function markReelEmptyPlaceholder(main, activeSurface) {
    if (!main?.querySelectorAll || !activeSurface) return;
    main.querySelectorAll(".igx-reel-empty-placeholder").forEach((node) => node.classList.remove("igx-reel-empty-placeholder"));
    const candidates = Array.from(main.querySelectorAll(REEL_EMPTY_PLACEHOLDER_SELECTOR));
    const hasContent = (node) => Boolean(node.querySelector(
      'video, img, canvas, svg, button, a[href], input, textarea, select, iframe, [role], [contenteditable="true"]'
    )) || Boolean(normalizedLabel(node.textContent));

    candidates.forEach((candidate) => {
      if (hasContent(candidate) || candidate.children.length > 2 || candidate.querySelectorAll("*").length > 5) return;
      let context = activeSurface;
      let verified = false;
      for (let depth = 0; context && context !== main && depth < 6; depth += 1, context = context.parentElement) {
        if (context.contains(candidate) && context.querySelectorAll("video").length === 1) {
          verified = true;
          break;
        }
      }
      if (!verified) return;
      const rect = candidate.getBoundingClientRect();
      if (rect.width < 96 || rect.height < 96) return;
      candidate.classList.add("igx-reel-empty-placeholder");
    });
  }

  function markReelSurfaces(main) {
    if (!main) return;
    const activeVideo = getActiveReelVideo();
    if (!activeVideo || !main.contains(activeVideo)) {
      if (lastMarkedReelSurface) clearAmbientVideoColor(lastMarkedReelSurface);
      if (lastMarkedReelVideo && lastMarkedReelVideo !== lastMarkedReelSurface) clearAmbientVideoColor(lastMarkedReelVideo);
      clearReelSurfaceMarkers(main);
      if (lastMarkedReelMain === main) {
        lastMarkedReelMain = lastMarkedReelVideo = lastMarkedReelSurface = null;
        lastMarkedReelSource = "";
      }
      if (currentPageName() === "reels") {
        const root = document.documentElement;
        root?.style.removeProperty("--igx-media-rgb");
        if (config.enabled && (config.ambientLight || config.videoAmbilight) && root) setReelAmbientFallback(root);
      }
      main.querySelectorAll(".igx-reel-center-control").forEach((node) => node.classList.remove("igx-reel-center-control"));
      return;
    }

    const activeSurface = getReelSurfaceForVideo(activeVideo, main);
    const activeSource = ambientVideoSourceSignature(activeVideo);
    const sourceChanged = lastMarkedReelVideo === activeVideo && lastMarkedReelSource !== activeSource;
    const playerChanged = lastMarkedReelVideo && (lastMarkedReelVideo !== activeVideo || lastMarkedReelSurface !== activeSurface);
    if (playerChanged && lastMarkedReelSurface) clearAmbientVideoColor(lastMarkedReelSurface);
    if (sourceChanged || playerChanged) {
      if (sourceChanged) clearAmbientVideoColor(activeSurface || activeVideo);
      const root = document.documentElement;
      root?.style.removeProperty("--igx-media-rgb");
      if (config.enabled && (config.ambientLight || config.videoAmbilight) && root) setReelAmbientFallback(root);
    }
    const alreadyMarked = lastMarkedReelMain === main && lastMarkedReelVideo === activeVideo &&
      lastMarkedReelSurface === activeSurface && lastMarkedReelSource === activeSource &&
      (activeSurface ? activeSurface.classList.contains("igx-reel-surface") : !activeVideo.classList.contains("igx-reel-secondary-media"));
    if (alreadyMarked) return;

    clearReelSurfaceMarkers(main);
    main.querySelectorAll(".igx-reel-center-control").forEach((node) => node.classList.remove("igx-reel-center-control"));
    lastMarkedReelMain = main;
    lastMarkedReelVideo = activeVideo;
    lastMarkedReelSurface = activeSurface;
    lastMarkedReelSource = activeSource;
    if (activeSurface) {
      activeSurface.classList.add("igx-reel-surface");
    }
    markReelEmptyPlaceholder(main, activeSurface);

    const videos = Array.from(main.querySelectorAll("video"));
    videos.forEach((video) => {
      if (video !== activeVideo) video.classList.add("igx-reel-secondary-media");
    });

    // Instagram can keep neighboring Reel slides mounted behind the selected
    // video. Hide only independent large media surfaces; retain shared controls,
    // author details, and anything inside the active player.
    videos.forEach((video) => {
      if (video === activeVideo) return;
      const surface = getReelSurfaceForVideo(video, main);
      if (!surface || surface === activeSurface) return;
      if (activeSurface && (surface.contains(activeSurface) || activeSurface.contains(surface))) return;
      surface.classList.add("igx-reel-secondary-surface");
    });

    if (!activeSurface) return;
    main.querySelectorAll("img").forEach((image) => {
      if (activeSurface.contains(image)) return;
      const rect = image.getBoundingClientRect();
      if (rect.width >= 240 && rect.height >= 300) image.classList.add("igx-reel-secondary-media");
    });
    main.querySelectorAll('[style*="background-image" i], [style*="background:" i]').forEach((element) => {
      if (element === main || element.contains(activeSurface) || activeSurface.contains(element)) return;
      const rect = element.getBoundingClientRect();
      if (rect.width < 240 || rect.height < 300 || rect.height >= 1500) return;
      if (window.getComputedStyle(element).backgroundImage !== "none") {
        element.classList.add("igx-reel-secondary-surface");
      }
    });
  }

  function reelControlLabel(control) {
    return [
      control.getAttribute("aria-label"), control.getAttribute("title"), control.innerText || control.textContent,
      ...Array.from(control.querySelectorAll("[aria-label], [title]")).flatMap((node) => [node.getAttribute("aria-label"), node.getAttribute("title")])
    ].map((value) => normalizedLabel(value).toLowerCase()).filter(Boolean).join(" ");
  }

  function markReelActionControls(main, force = true) {
    if (!main) return;
    const existingShare = main.querySelector(".igx-reel-share-action");
    if (!force && existingShare) return;
    main.querySelectorAll(".igx-reel-action-rail, .igx-reel-share-action").forEach((node) => {
      node.classList.remove("igx-reel-action-rail", "igx-reel-share-action");
      node.style.removeProperty("--igx-reel-share-shift-y");
    });
    const surface = main.querySelector(".igx-reel-surface");
    if (!surface) return;
    const surfaceRect = surface.getBoundingClientRect();
    if (surfaceRect.width < 180 || surfaceRect.height < 240) return;
    const controls = Array.from(main.querySelectorAll('button, [role="button"], a[role="button"]'));
    const visibleRect = (control) => {
      const rect = control.getBoundingClientRect();
      const style = window.getComputedStyle(control);
      if (rect.width <= 0 || rect.height <= 0 || style.display === "none" || style.visibility === "hidden" || Number(style.opacity) <= .01) return null;
      const horizontalGap = Math.max(0, surfaceRect.left - rect.right, rect.left - surfaceRect.right);
      const verticalNear = rect.bottom >= surfaceRect.top + surfaceRect.height * .48 && rect.top <= surfaceRect.bottom + 72;
      return horizontalGap <= 180 && verticalNear ? rect : null;
    };
    const visibleControls = controls.map((control) => {
      const rect = visibleRect(control);
      return rect ? { control, rect, label: reelControlLabel(control) } : null;
    }).filter(Boolean);
    const shareEntry = visibleControls.find(({ label }) => /\bshare\b/i.test(label));
    if (!shareEntry) return;
    const repostEntry = visibleControls.find(({ label }) => /\brepost\b/i.test(label));
    const share = shareEntry.control;
    share.classList.add("igx-reel-share-action");

    // Offset only the native Share control, using the Repost control's live
    // bounds. The action rail and all native parents remain in place.
    if (repostEntry && repostEntry.control !== share) {
      const currentShift = Number.parseFloat(share.style.getPropertyValue("--igx-reel-share-shift-y")) || 0;
      const baseShareTop = shareEntry.rect.top - currentShift;
      const shift = Math.max(0, Math.ceil(repostEntry.rect.bottom + 8 - baseShareTop));
      if (shift > 0) share.style.setProperty("--igx-reel-share-shift-y", `${shift}px`);
      else share.style.removeProperty("--igx-reel-share-shift-y");
    }
  }

  function restoreNativeProfile(main) {
    const scope = main || document;
    const extensionClasses = [
      "igx-main-surface", "igx-post-card", "igx-profile-header", "igx-profile-grid", "igx-grid-row",
      "igx-profile-highlight-row", "igx-profile-layout", "igx-profile-primary-host", "igx-profile-tab-host",
      "igx-profile-panel-host", "igx-profile-tabs", "igx-profile-tab", "igx-profile-tab-panel",
      "igx-profile-tile", "igx-explore-tile", "igx-explore-grid", "igx-profile-actions",
      "igx-profile-stray-card", "igx-highlight-add", "igx-profile-surface", "igx-profile-highlight-placeholder",
      "igx-profile-highlight-shell", "igx-profile-highlight-list", "igx-profile-highlight-control",
      "igx-profile-highlight-wrapper", "igx-profile-highlight-paintless", "igx-profile-empty-state",
      "igx-scroll-reveal", "igx-scroll-revealed"
    ];
    if (main) {
      main.classList.remove(...extensionClasses);
      main.style.removeProperty("--igx-profile-clearance");
    }
    extensionClasses.forEach((className) => {
      scope.querySelectorAll(`.${className}`).forEach((node) => node.classList.remove(className));
    });
    scope.querySelectorAll("[data-igx-profile-has-highlights]").forEach((node) => node.removeAttribute("data-igx-profile-has-highlights"));
    scope.querySelectorAll("[data-igx-profile-tab], [data-igx-stray-card], [data-igx-tab-label]").forEach((node) => {
      node.removeAttribute("data-igx-profile-tab");
      node.removeAttribute("data-igx-stray-card");
      node.removeAttribute("data-igx-tab-label");
    });
    scope.querySelectorAll(".igx-tile-overlay").forEach((node) => node.remove());
  }

  function markProfileAndExplore(main, page) {
    if (!main || page !== "explore") return;
    const mediaSelector = 'a[href*="/p/"], a[href*="/reel/"]';
    const mediaLinks = Array.from(main.querySelectorAll(mediaSelector));
    mediaLinks.forEach((link) => link.classList.add("igx-explore-tile"));
  }

  function getReelAuthorInfo(anchor) {
    const href = anchor?.getAttribute("href") || "";
    let url;
    try { url = new URL(href, window.location.href); } catch (_) { return null; }
    if (url.origin !== window.location.origin) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 1 || RESERVED_PROFILE_PATHS.has(parts[0].toLowerCase()) || !/^[a-z0-9._]{1,30}$/i.test(parts[0])) return null;
    const avatar = anchor.querySelector("img");
    let username = parts[0];
    try { username = decodeURIComponent(username); } catch (_) { /* keep the path label */ }
    let avatarSrc = "";
    try {
      const candidate = avatar?.currentSrc || avatar?.src || "";
      const imageUrl = new URL(candidate, window.location.href);
      if (imageUrl.protocol === "https:") avatarSrc = imageUrl.href;
    } catch (_) { /* avatar is optional */ }
    return { href: url.pathname, username: `@${username}`, avatarSrc };
  }

  function markReelAuthors(main) {
    if (!main) return;
    const activeVideo = getActiveReelVideo();
    const activeSource = activeVideo ? ambientVideoSourceSignature(activeVideo) : "";
    const existingBadge = main.querySelector(".igx-reel-author");
    if (activeVideo && activeVideo === lastMarkedReelAuthorVideo && activeSource === lastMarkedReelAuthorSource &&
        existingBadge?.parentElement?.contains(activeVideo)) return;
    main.querySelectorAll(".igx-reel-author").forEach((node) => node.remove());
    main.querySelectorAll(".igx-reel-author-host").forEach((node) => node.classList.remove("igx-reel-author-host"));
    lastMarkedReelAuthorVideo = null;
    lastMarkedReelAuthorSource = "";
    if (!activeVideo || !main.contains(activeVideo)) return;
    [activeVideo].forEach((video) => {
      let host = video.parentElement;
      let author = null;
      let depth = 0;
      while (host && host !== main && depth < 9) {
        const links = Array.from(host.querySelectorAll("a[href]"));
        const info = links.map((link) => ({ link, info: getReelAuthorInfo(link) })).find((item) => item.info);
        const rect = host.getBoundingClientRect();
        if (info && host.querySelectorAll("video").length === 1 && rect.width >= 220 && rect.height >= 280 && rect.height <= Math.max(window.innerHeight * 1.35, 900)) {
          author = info;
          break;
        }
        host = host.parentElement;
        depth += 1;
      }
      if (!author || !host || host.querySelector(".igx-reel-author")) return;

      host.classList.add("igx-reel-author-host");
      const badge = document.createElement("div");
      badge.className = "igx-reel-author";
      badge.setAttribute("aria-label", `Reel by ${author.info.username}`);
      const link = document.createElement("a");
      link.className = "igx-reel-author-link";
      link.href = author.info.href;
      link.title = author.info.username;
      if (author.info.avatarSrc) {
        const image = document.createElement("img");
        image.src = author.info.avatarSrc;
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        link.appendChild(image);
      }
      const name = document.createElement("span");
      name.textContent = author.info.username;
      link.appendChild(name);
      badge.appendChild(link);
      host.appendChild(badge);
      lastMarkedReelAuthorVideo = video;
      lastMarkedReelAuthorSource = activeSource;
    });
  }

  function isNativeInstagramMediaRoute() {
    const first = (window.location.pathname || "/").split("/").filter(Boolean)[0]?.toLowerCase() || "";
    return first === "explore" || first === "reel" || first === "reels" || first === "stories";
  }

  function currentPageName() {
    const path = window.location.pathname || "/";
    const parts = path.split("/").filter(Boolean);
    if (path === "/") return "home";
    if (parts[0] === "direct") return "direct";
    if (parts[0] === "reels") return "reels";
    if (parts[0] === "explore") return "explore";
    if (parts[0] === "accounts") return parts[1] === "activity" ? "activity" : "settings";
    if (parts.length === 1 && !RESERVED_PROFILE_PATHS.has(parts[0])) return "profile";
    if (parts.length >= 2 && !RESERVED_PROFILE_PATHS.has(parts[0].toLowerCase()) &&
      /^[a-z0-9._]{1,30}$/i.test(parts[0]) && PROFILE_SUBROUTES.has(parts[1].toLowerCase())) return "profile";
    return "other";
  }

  function syncRouteNavigation() {
    const page = currentPageName();
    const route = page === "direct" ? "messages" : page;
    document.querySelectorAll("#igx-route-nav [data-nav]").forEach((item) => {
      const active = item.getAttribute("data-nav") === route;
      item.classList.toggle("active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
  }

  function clearRouteSurfaceMarkers() {
    clearStoryNavigation();
    document.querySelectorAll(".igx-story-viewer, .igx-story-reply-textarea, .igx-story-empty-placeholder").forEach((node) => {
      node.classList.remove("igx-story-viewer", "igx-story-reply-textarea", "igx-story-empty-placeholder");
    });
    document.querySelectorAll(".igx-chat-notes").forEach((node) => node.classList.remove("igx-scroll-fade"));
    document.querySelectorAll(".igx-story-rail").forEach((list) => list.removeAttribute("data-igx-story-pan"));
    document.querySelectorAll("[data-igx-story-forward-steps]").forEach((node) => node.removeAttribute("data-igx-story-forward-steps"));
    document.querySelectorAll(".igx-ambient-video-surface").forEach(clearAmbientVideoColor);
    document.querySelectorAll(".igx-feed-video-card").forEach((card) => card.style.removeProperty("--igx-post-video-rgb"));
    const selectors = [
      ".igx-story-rail", ".igx-story-virtual-spacer", ".igx-home-story-item", ".igx-story-next", ".igx-story-scaled-item", ".igx-story-rail-frame", ".igx-story-control", ".igx-story-avatar-frame", ".igx-story-avatar-link", ".igx-story-label", ".igx-home-story-host", ".igx-home-story-frame", ".igx-home-story-only-frame", ".igx-home-content-column", ".igx-feed-column", ".igx-profile-header", ".igx-profile-grid", ".igx-grid-row", ".igx-profile-highlight-row", ".igx-profile-layout", ".igx-profile-primary-host", ".igx-profile-tab-host", ".igx-profile-panel-host", ".igx-profile-tabs", ".igx-profile-tab", ".igx-profile-tab-panel",
      ".igx-profile-tile", ".igx-profile-actions", ".igx-profile-stray-card", ".igx-highlight-add", ".igx-profile-surface", ".igx-explore-grid", ".igx-explore-tile", ".igx-direct-surface", ".igx-direct-list-header", ".igx-direct-search-spacing", ".igx-home-suggestion-module", ".igx-home-account-rail", ".igx-reel-center-control",
      ".igx-activity-surface", ".igx-activity-section", ".igx-activity-item", ".igx-activity-copy", ".igx-native-footer",
      ".igx-direct-panel", ".igx-chat-list-pane", ".igx-chat-thread-pane", ".igx-chat-tabs", ".igx-chat-notes", ".igx-chat-empty", ".igx-direct-content-host", ".igx-dm-thread-item", ".igx-reel-surface", ".igx-reel-secondary-surface", ".igx-reel-secondary-media", ".igx-reel-action-rail", ".igx-reel-share-action", ".igx-reel-author-host", ".igx-reel-empty-placeholder", ".igx-ambient-video-surface", ".igx-feed-video-tile", ".igx-feed-video-card", ".igx-post-card", ".igx-post-actions", ".igx-post-action-host",
      ".igx-native-chat-layout", ".igx-native-chat-pane", ".igx-native-chat-list-pane", ".igx-native-chat-thread-pane", ".igx-native-chat-column", ".igx-native-chat-list", ".igx-native-chat-thread", ".igx-chat-shell",
      ".igx-native-message-toggle", ".igx-native-message-toggle-wrap", ".igx-native-message-popup",
      ".igx-chat-composer", ".igx-chat-composer-leading", ".igx-chat-composer-input-wrap", ".igx-chat-composer-trailing", ".igx-chat-textbox",
      ".igx-profile-highlight-placeholder", ".igx-profile-highlight-shell", ".igx-profile-highlight-list",
      ".igx-profile-highlight-control", ".igx-profile-highlight-wrapper", ".igx-profile-highlight-paintless", ".igx-profile-empty-state"
    ].join(",");
    document.querySelectorAll(selectors).forEach((node) => {
      if (node.classList.contains("igx-reel-share-action")) node.style.removeProperty("--igx-reel-share-shift-y");
      node.classList.remove(
        "igx-story-rail", "igx-story-virtual-spacer", "igx-home-story-item", "igx-story-next", "igx-story-scaled-item", "igx-story-rail-frame", "igx-story-control", "igx-story-avatar-frame", "igx-story-avatar-link", "igx-story-label", "igx-home-story-host", "igx-home-story-frame", "igx-home-story-only-frame", "igx-home-content-column", "igx-feed-column", "igx-profile-header", "igx-profile-grid", "igx-grid-row", "igx-profile-highlight-row", "igx-profile-layout", "igx-profile-primary-host", "igx-profile-tab-host", "igx-profile-panel-host", "igx-profile-tabs", "igx-profile-tab", "igx-profile-tab-panel",
        "igx-profile-tile", "igx-profile-actions", "igx-profile-stray-card", "igx-highlight-add", "igx-profile-surface", "igx-profile-highlight-placeholder", "igx-profile-highlight-shell", "igx-profile-highlight-list", "igx-profile-highlight-control", "igx-profile-highlight-wrapper", "igx-profile-highlight-paintless", "igx-profile-empty-state", "igx-explore-grid", "igx-explore-tile", "igx-direct-surface", "igx-direct-list-header", "igx-direct-search-spacing", "igx-home-suggestion-module", "igx-home-account-rail", "igx-reel-center-control",
        "igx-activity-surface", "igx-activity-section", "igx-activity-item", "igx-activity-copy", "igx-native-footer",
        "igx-direct-panel", "igx-chat-list-pane", "igx-chat-thread-pane", "igx-chat-tabs", "igx-chat-notes", "igx-chat-empty", "igx-direct-content-host", "igx-chat-shell", "igx-direct-list-header", "igx-dm-thread-item", "igx-reel-surface", "igx-reel-secondary-surface", "igx-reel-secondary-media", "igx-reel-action-rail", "igx-reel-share-action", "igx-reel-author-host", "igx-reel-empty-placeholder", "igx-ambient-video-surface", "igx-feed-video-tile", "igx-feed-video-card", "igx-post-actions", "igx-post-action-host",
        "igx-native-chat-layout", "igx-native-chat-pane", "igx-native-chat-list-pane", "igx-native-chat-thread-pane", "igx-native-chat-column", "igx-native-chat-list", "igx-native-chat-thread",
        "igx-native-message-toggle", "igx-native-message-toggle-wrap", "igx-native-message-popup", "igx-post-card",
        "igx-chat-composer", "igx-chat-composer-leading", "igx-chat-composer-input-wrap", "igx-chat-composer-trailing", "igx-chat-textbox"
      );
    });
    document.querySelectorAll(".igx-profile-highlight-placeholder").forEach((node) => node.classList.remove("igx-profile-highlight-placeholder"));
    document.querySelectorAll(".igx-profile-header-paintless, .igx-profile-surface-shell").forEach((node) => {
      node.classList.remove("igx-profile-header-paintless", "igx-profile-surface-shell");
    });
    document.querySelectorAll("[data-igx-profile-has-highlights]").forEach((node) => node.removeAttribute("data-igx-profile-has-highlights"));
    document.querySelectorAll(".igx-story-scaled-item, .igx-home-story-item, .igx-story-virtual-spacer").forEach((node) => {
      node.style.removeProperty("--igx-story-position");
      node.style.removeProperty("--igx-story-item-width");
    });
    document.querySelectorAll(".igx-reel-author, .igx-explore-indicator").forEach((node) => node.remove());
    document.querySelectorAll(".igx-explore-reel-overlay-pass-through").forEach((node) => node.classList.remove("igx-explore-reel-overlay-pass-through"));
    document.documentElement?.style.removeProperty("--igx-story-rail-left");
  }

  function classifyAndMarkSurfaces(work = {}) {
    const path = window.location.pathname || "/";
    const pathStart = path.split("/").filter(Boolean)[0]?.toLowerCase() || "";
    const isNativeMediaDetailPath = pathStart === "reel" || pathStart === "stories";
    const page = currentPageName();
    const routeChanged = Boolean(work.routeChanged) || path !== lastClassifiedPath;
    const profileSegment = path.split("/").filter(Boolean)[0]?.toLowerCase() || "";
    const previousProfileSegment = lastClassifiedPath.split("/").filter(Boolean)[0]?.toLowerCase() || "";
    const stayingOnProfile = lastClassifiedPage === "profile" && page === "profile" &&
      profileSegment === previousProfileSegment;
    if (path !== lastClassifiedPath && lastClassifiedPath) resetNativeNotificationsForRoute();
    if (routeChanged && lastClassifiedPath && !stayingOnProfile) {
      clearRouteSurfaceMarkers();
      lastMarkedReelMain = lastMarkedReelVideo = lastMarkedReelSurface = null;
      lastMarkedReelSource = "";
      lastMarkedReelAuthorVideo = null;
      lastMarkedReelAuthorSource = "";
    }
    if (routeChanged && !stayingOnProfile) homeChatExpandedFor = "";
    lastClassifiedPath = path;
    lastClassifiedPage = page;
    const root = document.documentElement;
    if (root && root.getAttribute("data-igx-page") !== page) root.setAttribute("data-igx-page", page);
    if (root) {
      root.setAttribute("data-igx-profile", "false");
      if (config.enabled) root.setAttribute("data-igx-theme", config.theme);
      if (routeChanged && config.enabled && themeTokensApplied) {
        // Instagram sometimes swaps its root token values during SPA navigation.
        // Reapply the persisted selection without waiting for a popup write.
        applyDesignSystemTokens(root);
        applyInstagramThemeTokens(root);
      }
    }
    const mount = document.querySelector('[id^="mount_"]') || document.querySelector("#react-root");
    if (mount && !mount.classList.contains("igx-app-root")) mount.classList.add("igx-app-root");

    const main = getPageMain();
    markStoryViewerSurfaces();
    if (page === "profile") {
      // Keep Instagram's supplied Profile header, highlights, empty state, and
      // native content intact; only the explicitly requested stock footer is marked.
      restoreNativeProfile(main);
      markNativeInstagramFooter();
    } else if (page === "reels" || isNativeMediaDetailPath) {
      // Reels, singular Reel details, and Story routes keep Instagram's native
      // main/player layout. Do not apply Intergram's generic flex main surface.
      main?.classList.remove("igx-main-surface");
      main?.querySelectorAll(".igx-post-card, .igx-post-actions, .igx-post-action-host, .igx-feed-video-card, .igx-feed-video-tile")
        .forEach((node) => node.classList.remove("igx-post-card", "igx-post-actions", "igx-post-action-host", "igx-feed-video-card", "igx-feed-video-tile"));
    } else if (page === "explore") {
      // Instagram owns Explore's grid and selected-Reel detail composition.
      // Keep its native main display model and remove only legacy Home media marks.
      main?.classList.remove("igx-main-surface");
      main?.querySelectorAll(".igx-post-card, .igx-post-actions, .igx-post-action-host, .igx-feed-video-card, .igx-feed-video-tile")
        .forEach((node) => node.classList.remove("igx-post-card", "igx-post-actions", "igx-post-action-host", "igx-feed-video-card", "igx-feed-video-tile"));
    } else {
      if (main && !main.classList.contains("igx-main-surface")) main.classList.add("igx-main-surface");
      if (page === "home") {
        main?.querySelectorAll("article:not(.igx-post-card)").forEach((article) => {
          if (!article.closest('[role="dialog"], [aria-modal="true"]')) article.classList.add("igx-post-card");
        });
      }
    }
    markExploreReelClickOverlays();

    if (main && page === "home") {
      if (routeChanged || work.articles) {
        const firstArticle = main.querySelector("article");
        if (firstArticle && !firstArticle.closest(".igx-feed-column")) {
          let host = firstArticle.parentElement;
          for (let depth = 0; host && host !== main && depth < 8; depth += 1, host = host.parentElement) {
            if (host.querySelectorAll("article").length >= 2) {
              host.classList.add("igx-feed-column");
              break;
            }
          }
        }
      }
      if (routeChanged || work.suggestions) markHomeSuggestions(main);
    } else if (page === "home" && (routeChanged || work.suggestions)) {
      markHomeSuggestions(main);
    }
    if (page === "home") {
      restoreDefaultStoryRail(main);
      // Do this on every Home classification, not only on the first suggested-
      // content mutation. The rail often hydrates after the feed itself.
      markHomeAccountRail();
      if (routeChanged) scheduleHomeAccountRailRescan();
    } else {
      clearStoryNavigation();
    }

    if (main && (routeChanged || work.media) && page === "explore") markProfileAndExplore(main, page);
    if (main && page === "activity" && (routeChanged || work.activity)) markActivityChrome(main);
    if (routeChanged || work.notifications) syncNativeNotificationsPanel();
    if (routeChanged || work.search) markNativeSearchInputs();
    if (main && (routeChanged || work.messages || work.search) && page === "direct") markChatChrome(main);
    if (main && (routeChanged || work.media || work.search) && page === "explore") markExploreChrome(main);
    if (main && page === "home" && (routeChanged || work.articles || work.media)) markPostActions(main);
    if (main && page !== "profile" && (routeChanged || work.articles || work.media)) markScrollReveal(main);
    if (routeChanged || work.navigation) updateTopbarProfile();
    if (routeChanged || work.messages) markNativeChatLayout();
    if (page === "home") ensureHomeChatExpanded();
    if (page === "home") {
      syncHomeChatGeometry();
    }
    syncRouteNavigation();

    if (page === "direct") {
      if (main && !main.classList.contains("igx-direct-surface")) main.classList.add("igx-direct-surface");
      if (routeChanged) {
        document.querySelectorAll('[role="listbox"], [role="grid"], [role="tabpanel"]').forEach((el) => el.classList.add("igx-direct-panel"));
        document.querySelectorAll('[role="listitem"], a[href*="/direct/t/"]').forEach((el) => el.classList.add("igx-dm-thread-item"));
      }
    }

    if (page === "reels" && main && (routeChanged || work.videos)) {
      markReelSurfaces(main);
      markReelAuthors(main);
      markReelActionControls(main);
    }
    if (main && (routeChanged || work.videos || work.media)) markAmbientVideoSurfaces(main);
    if (routeChanged || (page === "reels" && work.videos && config.reelAmbientMode !== "live")) syncImmersiveReels();
    checkBootReady();
  }

  function findNativeControls() {
    const selectors = ROUTE_PREFIXES.join(",");
    const roots = Array.from(document.querySelectorAll(selectors));
    const scope = document.querySelector(".igx-native-sidebar") || roots[0]?.closest('nav, [role="navigation"]') || null;
    const result = scope ? Array.from(scope.querySelectorAll('a[href], button, [role="button"]')) : [];
    if (scope && result.length) return result;
    return Array.from(document.querySelectorAll('nav:not(#igx-route-nav):not(#igx-home-nav):not(#igx-top-actions) a[href], nav:not(#igx-route-nav):not(#igx-home-nav):not(#igx-top-actions) button, [role="navigation"] a[href], [role="navigation"] button'))
      .filter((el) => !el.closest("#igx-topbar, #igx-route-nav-wrap, #igx-home-sidebar, #igx-studio-drawer"));
  }

  function triggerNativeNavAction(keywords, fallbackUrl) {
    const controls = findNativeControls();
    const normalized = keywords.map((word) => word.toLowerCase());
    for (const control of controls) {
      const label = `${control.getAttribute("aria-label") || ""} ${control.getAttribute("title") || ""} ${control.textContent || ""} ${control.querySelector("svg")?.getAttribute("aria-label") || ""}`.toLowerCase().replace(/\s+/g, " ").trim();
      if (!normalized.some((word) => label === word || label.includes(word))) continue;
      const clickable = control.closest('a[href], button, [role="button"]') || control;
      clickable.click();
      return true;
    }
    if (fallbackUrl) {
      window.location.assign(fallbackUrl);
      return true;
    }
    return false;
  }

  function openNativeSearch() {
    const root = document.documentElement;
    nativeSearchRequestUntil = Date.now() + 2800;
    root?.setAttribute("data-igx-native-search-open", "true");
    if (!triggerNativeNavAction(["search"], "/explore/")) {
      nativeSearchRequestUntil = 0;
      root?.removeAttribute("data-igx-native-search-open");
      return;
    }
    // Wait for Instagram's own Search field after invoking its native handler;
    // Intergram adds no input and does not hide or reparent any Search field.
    let attempts = 0;
    const confirm = () => {
      markNativeSearchInputs();
      const input = Array.from(document.querySelectorAll(NATIVE_SEARCH_INPUT_SELECTOR))
        .find((field) => !field.closest(NATIVE_SEARCH_OWN_UI) && nativeSearchFieldVisible(field));
      if (input) {
        nativeSearchRequestUntil = 0;
        return;
      }
      attempts += 1;
      if (attempts < 24) window.setTimeout(confirm, 120);
      else {
        nativeSearchRequestUntil = 0;
        root?.removeAttribute("data-igx-native-search-open");
      }
    };
    window.setTimeout(confirm, 100);
  }

  function getProfileAnchor() {
    const sidebar = document.querySelector(".igx-native-sidebar");
    const anchors = sidebar
      ? Array.from(sidebar.querySelectorAll("a[href]"))
      : Array.from(document.querySelectorAll('a[href]')).filter((anchor) => !anchor.closest("article, #igx-topbar, #igx-route-nav-wrap, #igx-home-sidebar, #igx-studio-drawer"));
    let labeledProfileAnchor = null;
    for (const anchor of anchors) {
      const href = anchor.getAttribute("href") || "";
      const label = `${anchor.getAttribute("aria-label") || ""} ${anchor.textContent || ""} ${anchor.querySelector("svg")?.getAttribute("aria-label") || ""} ${anchor.querySelector("img")?.getAttribute("alt") || ""}`.toLowerCase();
      if (!label.includes("profile") || !href.startsWith("/")) continue;
      if (anchor.querySelector("img")) return anchor;
      labeledProfileAnchor ||= anchor;
    }
    // Prefer the account avatar image over a generic Profile glyph if Instagram
    // exposes the avatar through its one-segment account link instead.
    for (const anchor of anchors) {
      const href = anchor.getAttribute("href") || "";
      const match = href.match(/^\/([^/?#]+)\/?(?:\?.*)?$/);
      if (match && !RESERVED_PROFILE_PATHS.has(match[1].toLowerCase()) && anchor.querySelector("img")) return anchor;
    }
    return labeledProfileAnchor;
  }

  function updateTopbarProfile() {
    const holder = document.querySelector("#igx-route-nav [data-profile-avatar]");
    if (!holder) return;
    const avatar = getProfileAnchor()?.querySelector("img");
    let source = "";
    try {
      const candidate = avatar?.currentSrc || avatar?.src || "";
      const url = new URL(candidate, window.location.href);
      if (url.protocol === "https:") source = url.href;
    } catch (_) {
      source = "";
    }
    if (source && holder.dataset.avatarSrc === source) return;
    holder.replaceChildren();
    if (source) {
      const image = document.createElement("img");
      image.src = source;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      holder.appendChild(image);
      holder.dataset.avatarSrc = source;
    } else {
      holder.innerHTML = svgIcon("profile");
      delete holder.dataset.avatarSrc;
    }
  }

  const ICONS = {
    home: '<path d="m3.5 10.7 8.5-7 8.5 7"/><path d="M5.5 9.7v10h13v-10M9.6 19.7v-6.1h4.8v6.1"/>',
    search: '<circle cx="10.8" cy="10.8" r="7.1"/><path d="m16.1 16.1 4.2 4.2"/>',
    reels: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="M3.8 8.5h16.4M8 3.8l3.1 4.6M14.5 3.8l3.1 4.6"/><path d="m10.2 11.2 4.8 2.8-4.8 2.8z"/>',
    messages: '<path d="M20.5 11.4a8.5 8.5 0 0 1-8.5 8.5 8.7 8.7 0 0 1-3.8-.9L3.5 20l.9-4.1A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 11.5 3h.5a8.5 8.5 0 0 1 8.5 8.4z"/>',
    activity: '<path d="M20.2 9.1c0 4.7-8.2 9.9-8.2 9.9S3.8 13.8 3.8 9.1a4.4 4.4 0 0 1 8.2-2.2 4.4 4.4 0 0 1 8.2 2.2z"/>',
    notification: '<path d="M18 8.5a6 6 0 0 0-12 0c0 6.5-2.5 7.2-2.5 8.5h17c0-1.3-2.5-2-2.5-8.5"/><path d="M10 20.5h4"/>',
    create: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.6"/><path d="M12 8v8M8 12h8"/>',
    profile: '<circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c.8-3.5 3.2-5.3 7.5-5.3s6.7 1.8 7.5 5.3"/>',
    studio: '<path d="M4 7h8M16 7h4M4 17h4M12 17h8"/><circle cx="14" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    close: '<path d="m6.5 6.5 11 11M17.5 6.5l-11 11"/>',
    speed: '<path d="M4.5 16.5a7.5 7.5 0 1 1 15 0"/><path d="m12 12 3.6-3.6M7.5 16.5h9"/>'
  };

  function svgIcon(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
  }

  const ROUTE_NAV_ITEMS = [
    { name: "home", label: "Home", kind: "link", href: "/" },
    { name: "search", label: "Search", kind: "action", action: "search" },
    { name: "reels", label: "Reels", kind: "link", href: "/reels/" },
    { name: "messages", label: "Messages", kind: "link", href: "/direct/inbox/" },
    { name: "activity", label: "Notifications", kind: "action", action: "activity" },
    { name: "create", label: "Create", kind: "action", action: "create" },
    { name: "studio", label: "Studio", kind: "action", action: "studio" },
    { name: "profile", label: "Profile", kind: "action", action: "profile" }
  ];

  function performAction(action, event) {
    if (action === "studio") {
      event.preventDefault();
      setStudioOpen(!document.getElementById("igx-studio-drawer")?.classList.contains("open"));
    } else if (action === "search") {
      event.preventDefault();
      openNativeSearch();
    } else if (action === "activity") {
      event.preventDefault();
      openNotifications();
    } else if (action === "create") {
      event.preventDefault();
      triggerNativeNavAction(["create", "new post"], "/create/style/");
    } else if (action === "profile") {
      event.preventDefault();
      if (!triggerNativeNavAction(["profile"], null)) {
        // Click Instagram's own profile anchor so its SPA router handles the
        // transition instead of hard-navigating the entire document.
        getProfileAnchor()?.click();
      }
    }
  }

  function bindActionButtons(container) {
    container.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (button) performAction(button.getAttribute("data-action"), event);
    });
  }

  function injectTopbar() {
    if (!document.body || document.getElementById("igx-topbar")) return;
    const topbar = document.createElement("header");
    topbar.id = "igx-topbar";
    topbar.setAttribute("aria-label", "Intergram branding");
    topbar.innerHTML = `
      <a class="igx-brand" href="/" aria-label="Intergram home" title="Intergram">
        <span class="igx-brand-symbol">${brandMarkSVG()}</span>
        <span class="igx-brand-copy"><strong>Intergram</strong></span>
      </a>
    `;
    document.body.appendChild(topbar);
  }

  function buildRouteNavMarkup(id, label) {
    return `<nav id="${id}" aria-label="${label}">
      ${ROUTE_NAV_ITEMS.map((item) => item.kind === "link"
        ? `<a class="igx-nav-item" data-nav="${item.name}" href="${item.href}" aria-label="${item.label}" title="${item.label}"><span class="igx-nav-tooltip">${item.label.toLowerCase()}</span>${svgIcon(item.name)}</a>`
        : `<button class="igx-nav-item ${item.name === "studio" ? "igx-studio-trigger" : ""} ${item.name === "profile" ? "igx-profile-action" : ""}" type="button" data-action="${item.action}" data-nav="${item.name}" aria-label="${item.label}" title="${item.label}"><span class="igx-nav-tooltip">${item.label.toLowerCase()}</span>${item.name === "profile" ? `<span data-profile-avatar>${svgIcon(item.name)}</span>` : svgIcon(item.name === "activity" ? "notification" : item.name)}</button>`
      ).join("")}
    </nav>`;
  }

  function injectRouteNavigation() {
    if (!document.body) return;
    document.getElementById("igx-home-sidebar")?.remove();
    if (!document.getElementById("igx-route-nav-wrap")) {
      const wrap = document.createElement("div");
      wrap.id = "igx-route-nav-wrap";
      wrap.innerHTML = buildRouteNavMarkup("igx-route-nav", "intergram navigation");
      document.body.appendChild(wrap);
      bindActionButtons(wrap);
    }
    syncRouteNavigation();
  }

  const THEME_BUTTONS = [
    ["obsidian-glass", "obsidian glass", "linear-gradient(135deg,#1a1a22,#0b0b0f)"],
    ["daylight-glass", "daylight glass", "linear-gradient(135deg,#ffffff,#eef0f5)"],
    ["daylight-linen", "linen", "#f6f7f5"],
    ["instagram-spectrum", "instagram", "linear-gradient(135deg,#8b69c7,#d95589,#f09a5a)"],
    ["solar-frosted", "solar", "#f2f4fa"],
    ["arctic-glass", "arctic", "#e9f2f7"],
    ["obsidian-aurora", "obsidian", "#1c1b20"],
    ["vision-frost", "vision", "#17202b"],
    ["cyber-aurora", "sage night", "#17221f"],
    ["rose-quartz", "rose", "#25171e"],
    ["midnight-oled", "midnight", "#08080a"],
    ["pure-black", "pure black", "#000000"],
    ["matcha-glass", "matcha", "#192019"],
    ["cocoa-dusk", "cocoa", "#211a18"]
  ];

  function injectStudioDrawer() {
    if (!document.body || document.getElementById("igx-studio-drawer")) return;
    const drawer = document.createElement("aside");
    drawer.id = "igx-studio-drawer";
    drawer.setAttribute("aria-label", "Intergram customization studio");
    drawer.setAttribute("aria-hidden", "true");
    drawer.innerHTML = `
      <header class="igx-studio-header">
        <div class="igx-studio-heading-copy"><strong>intergram settings</strong><small>Customize your Instagram workspace</small></div>
        <button type="button" class="igx-studio-enable-button" data-toggle-enabled aria-pressed="true" aria-label="Disable Intergram" title="Disable Intergram">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v8"/><path d="M6.1 6.6a8 8 0 1 0 11.8 0"/></svg>
        </button>
        <button type="button" class="igx-icon-button" data-close-studio aria-label="Close studio">${svgIcon("close")}</button>
      </header>
      <div class="igx-studio-body">
        <section class="igx-control-group">
          <h2>Theme</h2>
          <div class="igx-theme-grid">
            ${THEME_BUTTONS.map(([theme, label, swatch]) => `<button type="button" class="igx-theme-card" data-igx-theme-choice="${theme}" aria-label="${label}" title="${label}"><i style="background:${swatch}"></i><span>${label}</span></button>`).join("")}
          </div>
          <label class="igx-control-row"><span>gradient intensity</span><output data-value-for="themeGradientIntensity">100%</output></label>
          <input type="range" min="0" max="150" step="1" data-setting="themeGradientIntensity" aria-label="Theme gradient intensity">
          <label class="igx-toggle-row"><span>use previous gradient as base</span><input type="checkbox" data-setting="baseGradientEnabled"></label>
          <label class="igx-toggle-row"><span>optional theme gradient overlay</span><input type="checkbox" data-setting="extraThemeGradient"></label>
        </section>

        <section class="igx-control-group">
          <h2>Surfaces</h2>
          <label class="igx-control-row"><span>glass blur</span><output data-value-for="blurStrength">12px</output></label>
          <input type="range" min="0" max="28" step="1" data-setting="blurStrength" aria-label="Glass blur">
          <label class="igx-control-row"><span>topbar blur</span><output data-value-for="topbarBlurStrength">14px</output></label>
          <input type="range" min="0" max="28" step="1" data-setting="topbarBlurStrength" aria-label="Topbar blur">
          <label class="igx-toggle-row"><span>opaque topbar while scrolling</span><input type="checkbox" data-setting="topbarOpaqueOnScroll"></label>
          <label class="igx-control-row"><span>surface opacity</span><output data-value-for="glassOpacity">76%</output></label>
          <input type="range" min="35" max="100" step="1" data-setting="glassOpacity" aria-label="Surface opacity">
          <label class="igx-control-row"><span>corner radius</span><output data-value-for="borderRadius">18px</output></label>
          <input type="range" min="8" max="28" step="1" data-setting="borderRadius" aria-label="Corner radius">
          <label class="igx-control-row"><span>feed width</span><select data-setting="wideFeedMode"><option value="false">standard</option><option value="true">wide</option></select></label>
          <label class="igx-toggle-row"><span>ambient light</span><input type="checkbox" data-setting="ambientLight"></label>
          <label class="igx-control-row"><span>Reels ambience</span><select data-setting="reelAmbientMode"><option value="live">live video frame</option><option value="theme-gradient">theme gradient</option><option value="blend">blend live + theme</option></select></label>
        </section>

        <section class="igx-control-group">
          <h2>Layout</h2>
          <label class="igx-control-row"><span>navigation & studio scale</span><output data-value-for="uiScale">100%</output></label>
          <input type="range" min="80" max="110" step="1" data-setting="uiScale" aria-label="Navigation and studio scale">
        </section>

        <section class="igx-control-group">
          <h2>Video & motion</h2>
          <label class="igx-control-row"><span>video presentation</span><select data-setting="videoFilter"><option value="off">original</option><option value="ultra-crisp">light clarity</option><option value="cinema-hdr">cinema</option></select></label>
          <label class="igx-control-row"><span>video colour</span><output data-value-for="videoVibrance">105%</output></label>
          <input type="range" min="90" max="125" step="1" data-setting="videoVibrance" aria-label="Video colour">
          <label class="igx-toggle-row"><span>video ambilight</span><input type="checkbox" data-setting="videoAmbilight"></label>
          <label class="igx-control-row"><span>glow intensity</span><output data-value-for="ambientIntensity">84%</output></label>
          <input type="range" min="0" max="100" step="2" data-setting="ambientIntensity" aria-label="Ambient glow intensity">
          <label class="igx-control-row"><span>glow softness</span><output data-value-for="ambientBlur">50px</output></label>
          <input type="range" min="12" max="100" step="2" data-setting="ambientBlur" aria-label="Glow softness">
          <label class="igx-control-row"><span>glow spread</span><output data-value-for="ambientSpread">42px</output></label>
          <input type="range" min="8" max="96" step="2" data-setting="ambientSpread" aria-label="Glow spread">
          <label class="igx-control-row"><span>live update rate</span><output data-value-for="ambientFrameRate">24 fps</output></label>
          <input type="range" min="2" max="30" step="1" data-setting="ambientFrameRate" aria-label="Ambient light update rate">
          <label class="igx-toggle-row"><span>reels immersive mode</span><input type="checkbox" data-setting="immersiveReels"></label>
          <label class="igx-toggle-row"><span>smooth video controls</span><input type="checkbox" data-setting="videoSmoothControls"></label>
          <label class="igx-control-row"><span>motion</span><select data-setting="animationPreset"><option value="balanced">balanced</option><option value="snappy">snappy</option><option value="gentle">gentle</option></select></label>
        </section>

        <section class="igx-control-group">
          <h2>Navigation & privacy</h2>
          <label class="igx-control-row"><span>navigation size</span><output data-value-for="dockScale">1.04×</output></label>
          <input type="range" min="0.9" max="1.2" step="0.02" data-setting="dockScale" aria-label="Navigation size">
          <label class="igx-toggle-row"><span>navigation labels</span><input type="checkbox" data-setting="dockLabels"></label>
          <label class="igx-toggle-row"><span>blur direct messages until hover</span><input type="checkbox" data-setting="blurDMsUntilHover"></label>
          <label class="igx-toggle-row"><span>hide sponsored posts</span><input type="checkbox" data-setting="hideSponsored"></label>
        </section>
        <footer class="igx-studio-footer">
          <div class="igx-studio-footer-main"><span>Settings stay on this device.</span><button type="button" data-reset-config>reset</button></div>
          ${socialLinksMarkup("igx-social-links igx-studio-socials")}
        </footer>
      </div>
    `;
    document.body.appendChild(drawer);
    window.IntergramComboBox?.enhance(drawer);

    drawer.addEventListener("click", (event) => {
      const closeButton = event.target.closest("[data-close-studio]");
      if (closeButton) setStudioOpen(false);
      if (event.target.closest("[data-toggle-enabled]")) saveConfig({ enabled: !config.enabled });
      const themeButton = event.target.closest("[data-igx-theme-choice]");
      if (themeButton) {
        const theme = themeButton.getAttribute("data-igx-theme-choice");
        saveConfig({ theme, ...(THEME_ACCENTS[theme] || {}) });
      }
      if (event.target.closest("[data-reset-config]")) saveConfig({ ...DEFAULT_CONFIG });
    });

    drawer.addEventListener("input", handleStudioSetting);
    drawer.addEventListener("change", handleStudioSetting);
    drawer.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setStudioOpen(false);
    });
    syncStudioControls();
  }

  function parseControlValue(control) {
    if (control.type === "checkbox") return control.checked;
    if (control.value === "true") return true;
    if (control.value === "false") return false;
    if (["blurStrength", "glassOpacity", "borderRadius", "uiScale", "videoVibrance", "profileColumns", "profileGridGap", "ambientIntensity", "ambientBlur", "ambientSpread", "ambientFrameRate", "themeGradientIntensity", "topbarBlurStrength"].includes(control.dataset.setting)) return Number(control.value);
    if (control.dataset.setting === "dockScale") return Number(control.value);
    return control.value;
  }

  function handleStudioSetting(event) {
    const control = event.target.closest("[data-setting]");
    if (!control) return;
    const key = control.dataset.setting;
    saveConfig({ [key]: parseControlValue(control) }, event.type === "change");
  }

  function syncStudioControls() {
    const drawer = document.getElementById("igx-studio-drawer");
    if (!drawer) return;
    drawer.querySelectorAll("[data-setting]").forEach((control) => {
      const value = config[control.dataset.setting];
      if (control.type === "checkbox") control.checked = Boolean(value);
      else control.value = String(value);
    });
    window.IntergramComboBox?.sync(drawer);
    const enableButton = drawer.querySelector("[data-toggle-enabled]");
    if (enableButton) {
      enableButton.setAttribute("aria-pressed", String(config.enabled));
      enableButton.setAttribute("aria-label", config.enabled ? "Disable Intergram" : "Enable Intergram");
      enableButton.title = config.enabled ? "Disable Intergram" : "Enable Intergram";
    }
    drawer.querySelectorAll("[data-igx-theme-choice]").forEach((button) => {
      const active = button.getAttribute("data-igx-theme-choice") === config.theme;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-pressed", "true");
      else button.setAttribute("aria-pressed", "false");
    });
    drawer.querySelectorAll("[data-value-for]").forEach((output) => {
      const key = output.dataset.valueFor;
      const value = config[key];
      if (["blurStrength", "topbarBlurStrength", "borderRadius", "profileGridGap", "ambientBlur", "ambientSpread"].includes(key)) output.textContent = `${value}px`;
      else if (["glassOpacity", "uiScale", "videoVibrance", "ambientIntensity", "themeGradientIntensity"].includes(key)) output.textContent = `${value}%`;
      else if (key === "ambientFrameRate") output.textContent = `${value} fps`;
      else if (key === "dockScale") output.textContent = `${Number(value).toFixed(2)}×`;
    });
  }

  function setStudioOpen(open) {
    const drawer = document.getElementById("igx-studio-drawer");
    if (!drawer) return;
    drawer.classList.toggle("open", Boolean(open));
    drawer.setAttribute("aria-hidden", String(!open));
    drawer.style.display = config.enabled || Boolean(open) ? "flex" : "none";
  }

  function toggleStudioDrawer() {
    const drawer = document.getElementById("igx-studio-drawer");
    setStudioOpen(!drawer?.classList.contains("open"));
  }

  const explicitlyMutedVideos = new WeakSet();

  function gestureVideo(event, target) {
    const direct = target.closest("video");
    if (direct) return direct;
    const reelSurface = target.closest(".igx-reel-surface");
    if (reelSurface) return reelSurface.querySelector("video");
    const post = target.closest("article.igx-post-card");
    if (!post) return null;
    const point = Number.isFinite(event.clientX) && Number.isFinite(event.clientY);
    const videos = Array.from(post.querySelectorAll("video"));
    return videos.find((video) => {
      const rect = video.getBoundingClientRect();
      return !point || (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom);
    }) || null;
  }

  function handleUserVideoAudioGesture(event) {
    if (!event.isTrusted || !config.enabled || isNativeInstagramMediaRoute()) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest(NATIVE_SEARCH_OWN_UI)) return;
    const video = gestureVideo(event, target);
    if (!(video instanceof HTMLVideoElement) || video.closest('[role="dialog"], [aria-modal="true"]')) return;
    const control = target.closest('button, [role="button"], a[href], input[type="range"]');
    const label = normalizedLabel(control ? `${control.getAttribute("aria-label") || ""} ${control.getAttribute("title") || ""} ${control.textContent || ""} ${control.querySelector("svg[aria-label]")?.getAttribute("aria-label") || ""}` : "").toLowerCase();
    if (/\b(?:unmute|turn on sound|sound on|volume on)\b/.test(label)) {
      explicitlyMutedVideos.delete(video);
      return;
    }
    if (/\b(?:mute|turn off sound|sound off|volume off|volume)\b/.test(label)) {
      if (/\b(?:mute|turn off sound|sound off|volume off)\b/.test(label)) explicitlyMutedVideos.add(video);
      return;
    }
    const playbackControl = /^(?:play|pause)(?:\s+(?:video|reel|clip))*$/i.test(label);
    if (control && !playbackControl) return;
    // Native browser controls own their sound toggle. For Instagram's muted
    // player, only an explicit trusted click/tap on the media or Play control
    // lifts mute; no autoplay or user-gesture restrictions are bypassed.
    if (video.controls || explicitlyMutedVideos.has(video) || !video.muted) return;
    video.muted = false;
    video.defaultMuted = false;
  }

  function markExploreReelClickOverlays() {
    const firstPathSegment = (window.location.pathname || "/").split("/").filter(Boolean)[0]?.toLowerCase() || "";
    const onExplore = currentPageName() === "explore";
    const onReelDetail = firstPathSegment === "reel";
    const selector = "div.x1ey2m1c.xtijo5x.x1o0tod.xixxii4.x13vifvy.x1h0vfkc";
    // Re-derive this pass-through marker on each route/media scan; do not leave
    // a stale click-through rule on a reused React node after its context changes.
    document.querySelectorAll(".igx-explore-reel-overlay-pass-through").forEach((node) => {
      node.classList.remove("igx-explore-reel-overlay-pass-through");
    });
    if (!config.enabled || (!onExplore && !onReelDetail)) return;

    const main = getPageMain();
    document.querySelectorAll(selector).forEach((node) => {
      if (node.closest("#igx-topbar, #igx-route-nav-wrap, #igx-studio-drawer, .igx-native-sidebar, .igx-native-notifications-panel")) return;
      const role = normalizedLabel(node.getAttribute("role")).toLowerCase();
      const isPresentationalRole = ["presentation", "none"].includes(role);
      const hasFocusableTabIndex = node.hasAttribute("tabindex") &&
        (node.tabIndex >= 0 || (node.tabIndex < 0 && !isPresentationalRole));
      if (node.children.length || normalizedLabel(node.textContent) ||
          (role && !isPresentationalRole) ||
          node.hasAttribute("aria-label") || node.hasAttribute("title") ||
          node.matches("button, a, input, textarea, select, [contenteditable]") || hasFocusableTabIndex) return;
      const rect = node.getBoundingClientRect();
      if (rect.width < 24 || rect.height < 24) return;

      const dialog = node.closest('[role="dialog"], [aria-modal="true"]');
      const hasStoryReply = Boolean(dialog?.querySelector('textarea[placeholder^="Reply to " i]'));
      let verifiedMediaContext = Boolean(dialog?.querySelector("video") && !hasStoryReply);
      if (onExplore) {
        const reelLinkSelector = 'a[href*="/reel/"], a[href*="/reels/"]';
        const article = node.closest("article");
        let reelLink = node.closest(reelLinkSelector) || article?.querySelector(reelLinkSelector) || null;
        // Some Explore tiles place the click shield beside (not inside) the
        // native anchor. Accept only a nearby wrapper with one Reel destination.
        for (let scope = node.parentElement, depth = 0; !reelLink && scope && scope !== main && depth < 5; scope = scope.parentElement, depth += 1) {
          const links = scope.querySelectorAll(reelLinkSelector);
          if (links.length === 1) reelLink = links[0];
          else if (links.length > 1) break;
        }
        if (reelLink && !hasStoryReply) verifiedMediaContext = true;
      }
      if (onReelDetail && main?.contains(node) && !hasStoryReply) {
        for (let scope = node.parentElement, depth = 0; scope && depth < 9; scope = scope.parentElement, depth += 1) {
          const videoCount = scope.querySelectorAll("video").length;
          const scopeRect = scope.getBoundingClientRect();
          if (videoCount === 1 && scopeRect.width >= 200 && scopeRect.height >= 240) {
            verifiedMediaContext = true;
            break;
          }
          if (scope === main) break;
        }
      }
      if (verifiedMediaContext) node.classList.add("igx-explore-reel-overlay-pass-through");
    });
  }

  function clearStaleExploreReelMarkers(main) {
    if (!main?.querySelectorAll) return;
    const reelMarkers = [
      "igx-reel-surface", "igx-reel-secondary-surface", "igx-reel-secondary-media",
      "igx-reel-empty-placeholder", "igx-reel-action-rail", "igx-reel-share-action",
      "igx-reel-author-host", "igx-reel-center-control"
    ];
    if (reelMarkers.some((name) => main.classList.contains(name))) {
      main.classList.remove(...reelMarkers);
      main.style.removeProperty("--igx-reel-share-shift-y");
    }
    main.querySelectorAll(reelMarkers.map((name) => `.${name}`).join(",")).forEach((node) => {
      node.classList.remove(...reelMarkers);
      node.style.removeProperty("--igx-reel-share-shift-y");
    });
    main.querySelectorAll(".igx-reel-author, .igx-explore-indicator").forEach((node) => node.remove());
    main.querySelectorAll(".igx-explore-reel-overlay-pass-through").forEach((node) => node.classList.remove("igx-explore-reel-overlay-pass-through"));
  }

  function clearNativePlayerEnhancements() {
    document.querySelectorAll(".igx-video-hud").forEach((hud) => hud.remove());
    document.querySelectorAll("video[data-igx-enhanced]").forEach((video) => video.removeAttribute("data-igx-enhanced"));
    document.querySelectorAll(".igx-video-wrap").forEach((wrap) => wrap.classList.remove("igx-video-wrap"));
  }

  function clearNativeMediaSurfaceMarkers(scope) {
    if (!scope?.querySelectorAll) return;
    const selector = ".igx-ambient-video-surface, .igx-feed-video-tile, .igx-feed-video-card, .igx-post-card, .igx-post-actions, .igx-post-action-host";
    const nodes = [];
    if (scope.matches?.(selector)) nodes.push(scope);
    nodes.push(...scope.querySelectorAll(selector));
    nodes.forEach((node) => {
      if (node.classList.contains("igx-ambient-video-surface")) clearAmbientVideoColor(node);
      node.classList.remove("igx-ambient-video-surface", "igx-feed-video-tile", "igx-feed-video-card", "igx-post-card", "igx-post-actions", "igx-post-action-host");
      node.style.removeProperty("--igx-post-video-rgb");
    });
  }

  function clearNativeDialogPlayerEnhancements() {
    const dialogs = document.querySelectorAll('[role="dialog"], [aria-modal="true"]');
    dialogs.forEach((dialog) => {
      dialog.querySelectorAll(".igx-video-hud").forEach((hud) => hud.remove());
      dialog.querySelectorAll("video[data-igx-enhanced]").forEach((video) => video.removeAttribute("data-igx-enhanced"));
      dialog.querySelectorAll(".igx-video-wrap").forEach((wrap) => wrap.classList.remove("igx-video-wrap"));
      clearNativeMediaSurfaceMarkers(dialog);
    });
  }

  function enhanceVideos() {
    const pathStart = (window.location.pathname || "/").split("/").filter(Boolean)[0]?.toLowerCase() || "";
    const page = currentPageName();
    if (page === "explore") {
      const main = getPageMain();
      clearStaleExploreReelMarkers(main);
      markExploreReelClickOverlays();
      clearNativePlayerEnhancements();
      // Explore previews are native links/players; leave their event tree alone.
      clearNativeMediaSurfaceMarkers(main);
      return;
    }
    if (page === "reels") {
      // Avoid changing the active Reel's positioned wrapper or inserting a HUD
      // into Instagram's video subtree; its native player stays untouched.
      document.querySelectorAll(".igx-video-hud").forEach((hud) => hud.remove());
      document.querySelectorAll(".igx-video-wrap").forEach((wrap) => wrap.classList.remove("igx-video-wrap"));
      document.querySelectorAll("video[data-igx-enhanced]").forEach((video) => video.removeAttribute("data-igx-enhanced"));
      markAmbientVideoSurfaces(getPageMain());
      return;
    }
    if (pathStart === "reel" || pathStart === "stories") {
      const main = getPageMain();
      clearStaleExploreReelMarkers(main);
      markExploreReelClickOverlays();
      clearNativePlayerEnhancements();
      // Instagram opens Explore-selected Reels and Stories on detail routes
      // such as /reel/<shortcode>; do not wrap or decorate their native video.
      clearNativeMediaSurfaceMarkers(main);
      return;
    }
    clearNativeDialogPlayerEnhancements();
    if (!config.enabled || !config.videoSmoothControls) {
      document.querySelectorAll(".igx-video-hud").forEach((hud) => hud.remove());
      document.querySelectorAll(".igx-video-wrap").forEach((wrap) => wrap.classList.remove("igx-video-wrap"));
      document.querySelectorAll("video[data-igx-enhanced]").forEach((video) => video.removeAttribute("data-igx-enhanced"));
      markAmbientVideoSurfaces(getPageMain());
      return;
    }

    Array.from(document.querySelectorAll("video:not([data-igx-enhanced])")).forEach((video) => {
      const parent = video.parentElement;
      if (!parent) return;
      // Native post/Reel/Story dialogs own their player chrome and click targets.
      if (video.closest('[role="dialog"], [aria-modal="true"]')) return;
      video.setAttribute("data-igx-enhanced", "true");
      parent.classList.add("igx-video-wrap");
      const hud = document.createElement("div");
      hud.className = "igx-video-hud";
      hud.innerHTML = `
        <button type="button" class="igx-hud-btn" data-video-action="speed" aria-label="Change playback speed">1×</button>
        <button type="button" class="igx-hud-btn" data-video-action="pip" aria-label="Picture in picture">PiP</button>
        <button type="button" class="igx-hud-btn" data-video-action="filter" aria-label="Toggle video presentation">HD</button>
      `;
      hud.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const button = event.target.closest("[data-video-action]");
        if (!button) return;
        const action = button.dataset.videoAction;
        if (action === "speed") {
          const speeds = [1, 1.25, 1.5, 2];
          const current = speeds.indexOf(video.playbackRate);
          const next = speeds[(current + 1) % speeds.length];
          video.playbackRate = next;
          button.textContent = `${next}×`;
        } else if (action === "pip") {
          if (document.pictureInPictureElement) document.exitPictureInPicture?.().catch(() => {});
          else video.requestPictureInPicture?.().catch(() => {});
        } else if (action === "filter") {
          const next = config.videoFilter === "off" ? "ultra-crisp" : config.videoFilter === "ultra-crisp" ? "cinema-hdr" : "off";
          saveConfig({ videoFilter: next });
          button.textContent = next === "off" ? "HD" : next === "cinema-hdr" ? "HDR" : "HD+";
        }
      });
      parent.appendChild(hud);
    });
    markAmbientVideoSurfaces(getPageMain());
  }

  function filterSponsoredPosts() {
    const active = config.enabled && config.hideSponsored;
    if (lastSponsoredFilterState !== active) {
      document.querySelectorAll("article[data-igx-ad-checked]").forEach((article) => article.removeAttribute("data-igx-ad-checked"));
      lastSponsoredFilterState = active;
    }
    if (!active) {
      document.querySelectorAll('article[data-igx-hidden-ad="true"]').forEach((article) => {
        article.style.removeProperty("display");
        article.removeAttribute("data-igx-hidden-ad");
      });
      return;
    }

    document.querySelectorAll("article:not([data-igx-ad-checked])").forEach((article) => {
      const isSponsored = Array.from(article.querySelectorAll("span, a, div"))
        .some((node) => node.children.length === 0 && (node.textContent || "").trim().toLowerCase() === "sponsored");
      article.setAttribute("data-igx-ad-checked", "true");
      if (isSponsored) {
        article.setAttribute("data-igx-hidden-ad", "true");
        article.style.setProperty("display", "none", "important");
      }
    });
  }

  function nodeContains(node, selector) {
    if (!node || node.nodeType !== 1) return false;
    return node.matches(selector) || Boolean(node.querySelector(selector));
  }

  function collectMutationWork(records) {
    const work = pendingEnhancement;
    const ownUI = "#igx-topbar, #igx-route-nav-wrap, #igx-home-sidebar, #igx-studio-drawer, #igx-boot-screen, .igx-reel-author";
    const storySelector = '[role="button"][aria-label*="story" i], button[aria-label*="story" i], a[href*="/stories/"], textarea[placeholder^="Reply to " i]';
    const mediaSelector = 'a[href*="/p/"], a[href*="/reel/"]';
    const postActionSelector = 'section [aria-label*="like" i], section [aria-label*="comment" i], section [aria-label*="repost" i], section [aria-label*="share" i], section [aria-label*="save" i], section [title*="like" i], section [title*="comment" i], section [title*="repost" i], section [title*="share" i], section [title*="save" i]';
    const messageSelector = '[aria-label*="message" i], [aria-label*="chat" i], [title*="message" i], [data-testid*="message" i], a[href^="/direct"]';
    const navigationSelector = 'a[href="/"], a[href^="/explore"], a[href^="/reels"], a[href^="/direct"], a[href^="/accounts/activity"], a[href^="/create"]';
    const profileAvatarSelector = '.igx-native-sidebar a[href] img[alt*="profile picture" i]';
    const suggestionSelector = '[data-testid*="friend-suggestion" i], [data-testid*="user-suggestion" i], [data-testid*="account-suggestion" i], [aria-label*="people you may know" i], [aria-label*="suggested for you" i]';
    const suggestionText = /suggested for you|suggestions for you|people you may know|friends? suggestions?|suggested accounts|suggested people|suggested profiles|accounts you may like|accounts to follow|people to discover|discover people|find people|find friends/i;
    const homeRailClueText = /\b(?:switch|suggested for you|about|help|press|api|jobs|privacy|terms|locations|language|meta verified|instagram lite|threads|instagram from meta)\b|©\s*20\d{2}/i;
    const notificationPanelClue = /\bnotifications\b/i;
    const searchInputSelector = NATIVE_SEARCH_INPUT_SELECTOR;
    const page = currentPageName();
    let inspected = 0;

    for (const record of records || []) {
      if (record.target?.closest?.(ownUI)) continue;
      for (const node of record.addedNodes || []) {
        if (!node || node.nodeType !== 1 || node.closest(ownUI)) continue;
        inspected += 1;
        if (page !== "reels") {
          if (nodeContains(node, "article")) work.articles = true;
          if (nodeContains(node, storySelector)) work.stories = true;
          if (nodeContains(node, mediaSelector)) work.media = true;
          if (nodeContains(node, postActionSelector)) work.articles = true;
          if (nodeContains(node, messageSelector)) work.messages = true;
        }
        if ((!isNativeInstagramMediaRoute() && (nodeContains(node, "video:not([data-igx-enhanced])") || nodeContains(node, 'button[aria-label*="play" i], [role="button"][aria-label*="play" i], button[aria-label*="pause" i], [role="button"][aria-label*="pause" i]'))) ||
            nodeContains(node, '[role="dialog"] video, [aria-modal="true"] video')) work.videos = true;
        if (page === "reels" && nodeContains(node, 'button[aria-label*="share" i], [role="button"][aria-label*="share" i], button[title*="share" i], [role="button"][title*="share" i], button[aria-label*="repost" i], [role="button"][aria-label*="repost" i], button[title*="repost" i], [role="button"][title*="repost" i]')) work.videos = true;
        if (nodeContains(node, searchInputSelector)) work.search = true;
        const addedText = (node.textContent || "").slice(0, 8000);
        if ((page !== "reels" && (nodeContains(node, suggestionSelector) || suggestionText.test(addedText))) ||
            (page === "home" && homeRailClueText.test(addedText))) work.suggestions = true;
        if (page === "activity" && ACTIVITY_ITEM_TEXT.test((node.textContent || "").slice(0, 4000))) work.activity = true;
        if (notificationPanelClue.test(addedText) && /people you follow|tags\s*&\s*mentions|this week/i.test(addedText)) work.notifications = true;
        if (page === "profile" && /\bnew\b/i.test(addedText) &&
            node.querySelector('button svg, [role="button"] svg, a[role="button"] svg')) work.profile = true;
        if (nodeContains(node, navigationSelector)) { work.sidebar = true; work.navigation = true; }
        if (nodeContains(node, profileAvatarSelector)) work.navigation = true;
        if (inspected >= 36) {
          const routeFlags = {
            home: ["articles", "stories", "media", "messages", "videos", "sidebar", "navigation", "suggestions"],
            explore: ["media", "videos", "sidebar", "navigation", "search"],
            reels: ["videos"],
            profile: ["media", "videos", "navigation", "profile"],
            direct: ["messages", "navigation", "search"],
            activity: ["activity", "notifications", "navigation"]
          }[page] || ["navigation", "search"];
          routeFlags.forEach((flag) => { work[flag] = true; });
          return work;
        }
      }
      for (const node of record.removedNodes || []) {
        if (!node || node.nodeType !== 1) continue;
        if (nodeContains(node, searchInputSelector)) work.search = true;
        const removedText = (node.textContent || "").slice(0, 8000);
        if (nodeContains(node, ".igx-native-notifications-panel") ||
            (notificationPanelClue.test(removedText) && /people you follow|tags\s*&\s*mentions|this week/i.test(removedText))) {
          work.notifications = true;
        }
      }
    }
    return work;
  }

  function schedulePageEnhancement(records = []) {
    const work = collectMutationWork(records);
    if (window.location.pathname !== lastClassifiedPath) {
      work.routeChanged = true;
      work.sidebar = true;
    }
    if (!Object.values(work).some(Boolean) || enhancementQueued) return;

    enhancementQueued = true;
    enhancementTimer = window.setTimeout(() => {
      const pending = pendingEnhancement;
      pendingEnhancement = createEnhancementFlags();
      enhancementQueued = false;
      requestAnimationFrame(() => {
        if (window.location.pathname !== lastClassifiedPath) {
          pending.routeChanged = true;
          pending.sidebar = true;
        }
        if (pending.routeChanged || pending.sidebar) markNativeSidebar();
        classifyAndMarkSurfaces(pending);
        if (pending.routeChanged || pending.articles) filterSponsoredPosts();
        if (pending.routeChanged || pending.videos) enhanceVideos();
        checkBootReady();
      });
    }, 130);
  }

  let reelSurfaceScanTimer = 0;
  let reelSurfaceScanForceActions = false;

  function scheduleReelSurfaceScan(forceActions = false) {
    if (currentPageName() !== "reels") return;
    reelSurfaceScanForceActions = reelSurfaceScanForceActions || forceActions;
    if (reelSurfaceScanTimer) return;
    reelSurfaceScanTimer = window.setTimeout(() => {
      reelSurfaceScanTimer = 0;
      if (currentPageName() !== "reels") { reelSurfaceScanForceActions = false; return; }
      const main = getPageMain();
      if (!main) { reelSurfaceScanForceActions = false; return; }
      const forceActions = reelSurfaceScanForceActions;
      reelSurfaceScanForceActions = false;
      const priorVideo = lastMarkedReelVideo;
      const priorSource = lastMarkedReelSource;
      markReelSurfaces(main);
      const mediaChanged = priorVideo !== lastMarkedReelVideo || priorSource !== lastMarkedReelSource;
      if (forceActions || mediaChanged) {
        markReelAuthors(main);
        markReelActionControls(main, true);
        markAmbientVideoSurfaces(main);
      }
      syncReelAmbientLayer(getActiveReelVideo());
    }, 170);
  }

  function initDOM() {
    if (!document.body) return;
    syncThemeFavicon();
    // Gate the native page behind a brief theme-color cover until readiness or the bounded failsafe.
    injectTopbar();
    injectRouteNavigation();
    injectStudioDrawer();
    markNativeSidebar();
    classifyAndMarkSurfaces({ routeChanged: true, articles: true, stories: true, media: true, messages: true, videos: true, navigation: true, suggestions: true });
    applyConfigToDOM(config);
    syncHomeChatGeometry();
    if (config.enabled) {
      filterSponsoredPosts();
      enhanceVideos();
    }
    patchHistory();
    startChromePersistence();
    ensureAmbientLayers();
    syncImmersiveReels();
    bootDomReady = true;
    checkBootReady();
    if (observer) return;

    observer = new MutationObserver(schedulePageEnhancement);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("popstate", () => onRouteChange());
    window.addEventListener("hashchange", () => onRouteChange());
    window.addEventListener("resize", () => {
      scheduleChatGeometry(120);
      scheduleReelSurfaceScan(true);
      syncTopbarScrollState();
      if (document.documentElement.getAttribute("data-igx-notifications-open") === "true") syncNativeNotificationsPanel();
    });
    window.addEventListener("orientationchange", () => { scheduleChatGeometry(240); scheduleReelSurfaceScan(true); });
    window.addEventListener("scroll", () => {
      scheduleReelSurfaceScan(false);
      scheduleTopbarScrollState();
    }, { capture: true, passive: true });
    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const notificationRoot = document.documentElement;
      const nativePanelCandidate = findNativeNotificationsPanel() ||
        (nativeNotificationsLastPanel?.isConnected ? nativeNotificationsLastPanel : null);
      const notificationPanel = target.closest(".igx-native-notifications-panel") ||
        (nativePanelCandidate?.contains(target) ? nativePanelCandidate : null);

      if (notificationPanel) {
        // Reconcile user-opened native panels before handling their real controls.
        syncNativeNotificationsPanel();
        const control = target.closest('button, [role="button"], a[role="button"]');
        const isCloseControl = control && [
          control.getAttribute("aria-label"), control.getAttribute("title"), control.innerText || control.textContent
        ].some((value) => /^(?:close|dismiss)$/i.test(normalizedLabel(value)));
        if (isCloseControl) {
          nativeNotificationsOpenRequestUntil = 0;
          nativeNotificationsLastVisibleAt = 0;
          nativeNotificationsLastPanel = null;
          nativeNotificationsLatchedOpen = false;
          nativeNotificationsClosePendingUntil = Date.now() + 1000;
          if (nativeNotificationsGraceTimer) window.clearTimeout(nativeNotificationsGraceTimer);
          nativeNotificationsGraceTimer = 0;
          notificationRoot?.removeAttribute("data-igx-notifications-open");
          clearNativeNotificationAnchor();
          scheduleNativeNotificationsSync();
        }
        // Filters, activity rows, and their native handlers stay untouched.
        return;
      }

      const nativeTrigger = findNativeNotificationTrigger();
      const clickedNativeTrigger = Boolean(nativeTrigger &&
        (nativeTrigger === target || nativeTrigger.contains(target) || target.contains(nativeTrigger)));
      const now = Date.now();
      if (clickedNativeTrigger) {
        if (nativeTrigger instanceof HTMLAnchorElement && (nativeTrigger.getAttribute("href") || "").startsWith("#")) {
          // Keep Instagram's in-place trigger from adding a fragment to the URL.
          event.preventDefault();
        }
        if (nativeNotificationTriggerClickPurpose !== "open") {
          const panelBeforeClick = findNativeNotificationsPanel() ||
            (nativeNotificationsLastPanel?.isConnected ? nativeNotificationsLastPanel : null);
          const alreadyOpen = nativeNotificationTriggerClickPurpose === "close" ||
            notificationRoot?.getAttribute("data-igx-notifications-open") === "true" ||
            now < nativeNotificationsOpenRequestUntil ||
            Boolean(panelBeforeClick && (panelBeforeClick.classList.contains("igx-native-notifications-panel") ||
              nativeNotificationPanelIsVisible(panelBeforeClick)));
          if (alreadyOpen) {
            nativeNotificationsOpenRequestUntil = 0;
            nativeNotificationsLastVisibleAt = 0;
            nativeNotificationsLastPanel = null;
            nativeNotificationsLatchedOpen = false;
            nativeNotificationsClosePendingUntil = now + 1000;
            if (nativeNotificationsGraceTimer) window.clearTimeout(nativeNotificationsGraceTimer);
            nativeNotificationsGraceTimer = 0;
            notificationRoot?.removeAttribute("data-igx-notifications-open");
            clearNativeNotificationAnchor();
          } else {
            // A direct click on Instagram's own bell is an open intent too.
            nativeNotificationsClosePendingUntil = 0;
            nativeNotificationsLastVisibleAt = 0;
            nativeNotificationsLastPanel = null;
            nativeNotificationsLatchedOpen = true;
            nativeNotificationsOpenRequestUntil = now + NATIVE_NOTIFICATIONS_OPEN_TIMEOUT_MS;
            notificationRoot?.setAttribute("data-igx-notifications-open", "true");
            scheduleNativeNotificationsGraceSync(nativeNotificationsOpenRequestUntil);
          }
        }
      }

      const activityToggle = target.closest('#igx-route-nav-wrap [data-nav="activity"]');
      const clickPanel = nativePanelCandidate && nativePanelCandidate.contains(target);
      const panelOpen = notificationRoot?.getAttribute("data-igx-notifications-open") === "true" ||
        now < nativeNotificationsOpenRequestUntil ||
        Boolean(nativePanelCandidate && nativeNotificationPanelIsVisible(nativePanelCandidate));
      if (panelOpen && !clickPanel && !clickedNativeTrigger && !activityToggle) {
        // Match the native outside-click dismissal; Escape and the Close button
        // use the same close path, while Activity remains an in-place toggle.
        closeNativeNotifications();
      }
      if (target.closest("#igx-topbar, #igx-route-nav-wrap, #igx-home-sidebar, #igx-studio-drawer, .igx-reel-author")) return;
      window.setTimeout(() => {
        syncNativeNotificationsPanel();
        markNativeChatLayout();
        schedulePageEnhancement();
      }, 0);
    }, true);
    window.addEventListener("keydown", (event) => {
      if (event.altKey && event.key.toLowerCase() === "i") {
        event.preventDefault();
        toggleStudioDrawer();
      } else if (event.key === "Escape") {
        if (document.documentElement.getAttribute("data-igx-notifications-open") === "true") closeNativeNotifications();
        else setStudioOpen(false);
      }
    });

    if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message?.type === "intergram:open-studio") {
          setStudioOpen(true);
          sendResponse({ ok: true });
        }
        return false;
      });
    }
  }

  function primeThemeAtDocumentStart() {
    const applyWhenReady = () => {
      if (!document.documentElement) return false;
      applyConfigToDOM(config);
      startChromePersistence();
      return true;
    };
    if (applyWhenReady()) return;
    if (typeof MutationObserver === "function") {
      const rootObserver = new MutationObserver(() => {
        if (!applyWhenReady()) return;
        rootObserver.disconnect();
      });
      rootObserver.observe(document, { childList: true, subtree: true });
    } else {
      document.addEventListener("DOMContentLoaded", applyWhenReady, { once: true });
    }
  }

  document.addEventListener("click", handleUserVideoAudioGesture, true);
  if (document.documentElement) showBootScreen();
  else document.addEventListener("DOMContentLoaded", showBootScreen, { once: true });
  primeThemeAtDocumentStart();
  loadInitialConfig();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initDOM, { once: true });
  else initDOM();
})();
