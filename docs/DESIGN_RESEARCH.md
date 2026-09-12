# Design Research: High-End Financial SaaS Design System
**Inspiration**: `taste-skill--No-Ai-designs`, `premium-ui-design-skill`, `Paper-design-shaders`, `spring-text-engine`, Apple SF Pro / macOS financial ergonomics.  
**Date**: September 12, 2026  

---

## 1. Visual Philosophy: Quiet Authority & Financial Clarity

Modern enterprise finance platforms must reject generic AI slop: no low-contrast light gray text on white cards, no oversaturated cartoonish gradients, and no random neon shadows. The design language must communicate **institutional trust, numerical precision, and effortless hierarchy**.

### Core Dials (Derived from Taste-Skill)
- **`DESIGN_VARIANCE`**: `3/10` (Disciplined, structured, symmetrical grid; no avant-garde floating layouts that disrupt tabular reading).
- **`MOTION_INTENSITY`**: `4/10` (Snappy, spring-based micro-interactions for drawers, modals, and row expansions; static tables during data scanning).
- **`VISUAL_DENSITY`**: `8/10` (High information density designed for finance professionals who scan 50+ invoices at a glance).

---

## 2. Color System: Dark & Light Institutional Ladders

### Dark Canvas & Surface Ladder (Default)
```css
--canvas-bg: #000000;
--surface-subtle: #141416;
--surface-card: #1C1C1E;
--surface-elevated: #2C2C2E;
--surface-overlay: #3A3A3C;

--border-hairline: rgba(255, 255, 255, 0.08);
--border-strong: rgba(255, 255, 255, 0.16);

--text-primary: #FFFFFF;
--text-secondary: #8E8E93;
--text-tertiary: #636366;
--text-disabled: #48484A;

--accent-blue: #007AFF;
--accent-blue-hover: #0062CC;
--accent-blue-subtle: rgba(0, 122, 255, 0.12);

--status-success: #34C759;
--status-success-subtle: rgba(52, 199, 89, 0.12);
--status-warning: #FF9500;
--status-warning-subtle: rgba(255, 149, 0, 0.12);
--status-danger: #FF3B30;
--status-danger-subtle: rgba(255, 59, 48, 0.12);
--status-info: #5856D6;
--status-info-subtle: rgba(88, 86, 214, 0.12);
```

### Light Canvas & Surface Ladder (Toggleable)
```css
--canvas-bg: #F2F2F7;
--surface-subtle: #E5E5EA;
--surface-card: #FFFFFF;
--surface-elevated: #FFFFFF;
--border-hairline: rgba(0, 0, 0, 0.08);
--text-primary: #000000;
--text-secondary: #6E6E73;
```

---

## 3. Typography Stack

| Role | Font Family | Fallback Stack | Usage & Sizing |
|---|---|---|---|
| **Headings & Hero** | `Outfit`, `Inter` | `system-ui, -apple-system, sans-serif` | 24px–48px, Weight 600/700, Tight letter-spacing (-0.02em) |
| **Primary UI & Tables** | `Inter` (variable) | `system-ui, -apple-system, sans-serif` | 13px–15px, Weight 400/500, Line height 1.5 |
| **Financial Figures & Hash** | `JetBrains Mono` | `Fira Code, SFMono-Regular, monospace` | 13px–16px, Tabular figures (`font-variant-numeric: tabular-nums`) |

---

## 4. Motionography & Spring Physics

Following `premium-ui-design-skill` motion parameters:
```javascript
export const springPresets = {
  // Snappy modal & drawer reveals
  modalSpring: {
    type: "spring",
    stiffness: 300,
    damping: 25,
    mass: 0.8
  },
  // Smooth tab and filter cross-fades
  tabTransition: {
    duration: 0.2,
    ease: [0.25, 0.1, 0.25, 1.0]
  },
  // Subtle card hover feedback
  cardHover: {
    type: "spring",
    stiffness: 400,
    damping: 30
  }
};
```
*Accessibility Note*: Every animated component must honor `@media (prefers-reduced-motion: reduce)` by disabling transitions.

---

## 5. High-Density Financial Components

1. **KPI Metric Card**: Count-up animated integer with period delta indicator (↑ 4.2% vs last month), colored trend pill, and contextual formula tooltip.
2. **Receivables Aging Table**:
   - Fixed header with virtualized row scrolling for 1,000+ records.
   - Distinct color-coded aging buckets: Current (Neutral), 1–30 (Subtle Yellow), 31–60 (Amber), 61–90 (Orange), 91–180 (Red), 181+ (Deep Crimson).
   - Monospace numeric alignment on the right.
3. **Detail Drawer**: Spring-animated slide-over from the right with invoice audit trail, customer profile, risk score badge, and linked collections timeline.
4. **Maker-Checker Modal**: Prominent dual-signature visual status showing Maker metadata, payload SHA-256 hash, and independent Checker sign-off controls.
