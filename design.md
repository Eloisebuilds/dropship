---
version: alpha
name: Gymshark Athletic Minimal
description: A high-contrast, performance-led retail system with bold editorial headlines and restrained utility styling.
colors:
  primary: "#000000"
  secondary: "#E5E7EB"
  tertiary: "#6B7280"
  neutral: "#FFFFFF"
  surface: "#FFFFFF"
  on-surface: "#000000"
  error: "#B91C1C"
  overlay: "#111111CC"
typography:
  headline-display:
    fontFamily: Montserrat
    fontSize: 30px
    fontWeight: 700
    lineHeight: 35px
    letterSpacing: 0px
  headline-lg:
    fontFamily: Anton
    fontSize: 25px
    fontWeight: 400
    lineHeight: 25.2px
    letterSpacing: 0px
  headline-md:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0px
  headline-sm:
    fontFamily: Montserrat
    fontSize: 17px
    fontWeight: 400
    lineHeight: 21px
    letterSpacing: 0px
  body-lg:
    fontFamily: Roboto
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0px
  body-md:
    fontFamily: Roboto
    fontSize: 14px
    fontWeight: 400
    lineHeight: 19.6px
    letterSpacing: 0px
  body-sm:
    fontFamily: Roboto
    fontSize: 12px
    fontWeight: 400
    lineHeight: 17px
    letterSpacing: 0px
  label-lg:
    fontFamily: Roboto
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0px
  label-md:
    fontFamily: Roboto
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0px
  label-sm:
    fontFamily: Roboto
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0px
  caption:
    fontFamily: Roboto
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0px
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 2px
  sm: 10px
  md: 16px
  lg: 24px
  xl: 80px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 8px 16px
    height: 40px
  button-primary-hover:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 8px 16px
    height: 40px
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.none}"
    padding: 0px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 16px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  chip:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 4px 10px
---

# Gymshark Athletic Minimal

## Overview
Gymshark feels athletic, modern, and commercial, with a strong editorial edge. The screenshot leans on large lifestyle imagery, dark overlays, and minimal interface chrome to keep attention on product and performance messaging. The tone is confident and aspirational rather than playful, with a dense hero composition balanced by clean whitespace in supporting areas.

## Colors
- **Primary (#000000):** The core ink tone used for headlines, buttons, icons, and emphasis. It creates the brand's strong, performance-first contrast.
- **Neutral / Surface (#FFFFFF):** Clean white used for page surfaces, cards, and text-on-dark reversal moments. It keeps the system crisp and retail-oriented.
- **Secondary (#E5E7EB):** A light border and divider tone that supports structure without becoming visually heavy. It is best for cards, rules, and subtle framing.
- **Tertiary (#6B7280):** A muted gray for supporting text, inactive states, and less prominent interface elements. It softens the hierarchy while staying readable.
- **On-surface (#000000):** The default foreground color for content on light backgrounds. It reinforces the brand's high-contrast, utility-driven look.
- **Error (#B91C1C):** Reserved for validation, destructive actions, and alert states. It should remain rare and highly legible.
- **Overlay (#111111CC):** A dark translucent layer used over imagery to preserve text readability. It supports the moody, editorial feel seen in the hero.

## Typography
Headlines use a two-font system: Montserrat for structured brand copy and Anton for more dramatic promotional statements. The most visible hero and section heads are bold, tight, and compact, while supporting titles stay lighter in weight and slightly smaller for a clean retail hierarchy. Body copy uses Roboto for a neutral, highly readable voice across product descriptions, cookie copy, and utility text. Labels and buttons are also Roboto-based, typically bold, with no visible uppercase or extra letter-spacing conventions; the system relies more on weight and size than on decorative tracking.

## Layout
The page uses a full-bleed, image-led layout with a fixed-width feel in the content rails rather than a loose fluid editorial grid. Large hero panels span the viewport edge to edge, while section headers and product rows align to a simpler internal rhythm with modest gutters. Spacing is compact and deliberate: 2px and 10px for fine adjustments, 16px to 24px for common separation, and 80px for major section breathing room. Cards and overlays use consistent internal padding so content stays tidy even when the overall composition is dense.

## Elevation & Depth
Depth is subtle and mostly achieved through tonal contrast, overlays, and image layering rather than large shadows. The system is intentionally flat for most UI surfaces, with only soft shadowing on floating elements like the cookie panel. Borders and dimmed backgrounds provide separation more than elevation, which keeps the interface feeling modern and performance-focused. When emphasis is needed, the design uses black fills, translucent dark scrims, and strong contrast instead of dramatic depth effects.

## Shapes
The shape language is restrained and functional. Interactive controls and cards use small radii, primarily the 4px `rounded.sm` and 8px `rounded.md` values, which gives the UI a precise, athletic sharpness. Pills and chips may use `rounded.full`, but most containers remain squared-off to preserve the brand's disciplined look.

## Components
Buttons are simple and high-contrast. `button-primary` uses a black fill, white text, 8px 16px padding, and a 4px radius for the main call to action. `button-secondary` is transparent with a black border, matching the outlined hero action. `button-tertiary` and link-style actions should stay visually light, with no fill and minimal padding. Button height should remain around 40px for comfortable tap targets.

Cards use `card` styling: white background, 1px light border, 8px radius, and 16px padding. They should feel like content containers rather than elevated objects. Inputs should follow the same restrained system: white surface, subtle border treatment, 4px radius, and clear Roboto text at `body-md` size. Chips, tags, and small status pills should remain compact, optionally using `rounded.full` to communicate quick filters or metadata. Icons should be line-based, minimal, and monochrome, matching the surrounding utility UI. Lists and utility blocks should stay aligned and dense, with no decorative separators unless they improve scanability.

## Do's and Don'ts
- Do keep the interface monochrome-first, using black, white, and gray as the core palette.
- Do use strong image contrast and dark overlays to support headline readability.
- Do keep buttons compact, rectangular, and highly legible with minimal styling.
- Do favor Roboto for body copy and utility UI to preserve readability.
- Don't introduce large shadows or glossy depth effects.
- Don't use playful colors, rounded blobs, or soft pastel branding.
- Don't over-typographize the UI with excessive letter-spacing or all-caps treatment.
- Don't let containers drift into loose spacing; maintain a disciplined, retail-like rhythm.
