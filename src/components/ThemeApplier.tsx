import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { settingsService } from "@/api/services/settingsService";

/**
 * Converts a #rrggbb hex color to the "H S% L%" string CSS custom properties use.
 * Falls back to null on invalid input so callers can skip applying.
 */
export function hexToHslString(hex: string): string | null {
  const m = /^#?([a-f\d]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const intval = parseInt(m[1], 16);
  const r = ((intval >> 16) & 255) / 255;
  const g = ((intval >> 8) & 255) / 255;
  const b = (intval & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const STYLE_ID = "magadh-custom-theme";

function applyTheme(map: Record<string, string>) {
  const mode = map["theme.mode"];
  const existing = document.getElementById(STYLE_ID);
  if (mode !== "custom") {
    if (existing) existing.remove();
    return;
  }

  const overrides: string[] = [];
  const pairs: Array<[string, string]> = [
    ["theme.primary", "--primary"],
    ["theme.accent", "--accent"],
    ["theme.gold", "--gold"],
  ];
  for (const [settingKey, cssVar] of pairs) {
    const hex = map[settingKey];
    if (!hex) continue;
    const hsl = hexToHslString(hex);
    if (hsl) overrides.push(`  ${cssVar}: ${hsl};`);
  }

  const primaryHsl = map["theme.primary"] ? hexToHslString(map["theme.primary"]) : null;
  const goldHsl = map["theme.gold"] ? hexToHslString(map["theme.gold"]) : null;
  if (primaryHsl) {
    overrides.push(`  --ring: ${primaryHsl};`);
    overrides.push(`  --sidebar-primary: ${primaryHsl};`);
    overrides.push(`  --sidebar-ring: ${primaryHsl};`);
  }
  if (primaryHsl && goldHsl) {
    overrides.push(`  --gradient-gold: linear-gradient(135deg, hsl(${goldHsl}), hsl(${primaryHsl}));`);
  }

  if (overrides.length === 0) {
    if (existing) existing.remove();
    return;
  }

  const css = `:root {\n${overrides.join("\n")}\n}`;
  if (existing) {
    existing.textContent = css;
  } else {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }
}

export function ThemeApplier() {
  const q = useQuery({
    queryKey: ["public", "settings"],
    queryFn: settingsService.public,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  useEffect(() => {
    if (q.data) applyTheme(q.data);
  }, [q.data]);

  return null;
}
