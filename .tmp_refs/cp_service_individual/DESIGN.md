---
name: Lumina Prestige
colors:
  surface: '#f9f9fb'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f5'
  surface-container: '#eeeeef'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e4'
  on-surface: '#1a1c1d'
  on-surface-variant: '#41484c'
  inverse-surface: '#2f3132'
  inverse-on-surface: '#f1f0f2'
  outline: '#72787d'
  outline-variant: '#c1c7cd'
  surface-tint: '#3c637a'
  primary: '#001c2a'
  on-primary: '#ffffff'
  primary-container: '#003247'
  on-primary-container: '#749bb3'
  inverse-primary: '#a4cce6'
  secondary: '#006c4f'
  on-secondary: '#ffffff'
  secondary-container: '#67fcc6'
  on-secondary-container: '#007354'
  tertiary: '#2b1300'
  on-tertiary: '#ffffff'
  tertiary-container: '#472605'
  on-tertiary-container: '#bd8b62'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c5e7ff'
  primary-fixed-dim: '#a4cce6'
  on-primary-fixed: '#001e2d'
  on-primary-fixed-variant: '#224b61'
  secondary-fixed: '#67fcc6'
  secondary-fixed-dim: '#43dfab'
  on-secondary-fixed: '#002115'
  on-secondary-fixed-variant: '#00513a'
  tertiary-fixed: '#ffdcc2'
  tertiary-fixed-dim: '#f3bb8e'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#643e1b'
  background: '#f9f9fb'
  on-background: '#1a1c1d'
  surface-variant: '#e2e2e4'
typography:
  display:
    fontFamily: Manrope
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  h1:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h3:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.01em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  section-padding-x: 5vw
  section-padding-y: 120px
  container-max-width: 1440px
  gutter: 32px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The brand identity centers on the intersection of strategic authority and digital innovation. This design system communicates high-level consulting expertise through a "Modern Corporate" aesthetic infused with "Glassmorphism." The visual language is designed to evoke a sense of deep trust and technical precision, catering to high-value B2B clients who seek both stability and a competitive edge.

The design style utilizes wide-open whitespace, generous padding, and sophisticated translucent layers. By layering frosted elements over deep tonal backgrounds, the UI achieves a sense of physical depth and modern craftsmanship. The atmosphere is quiet yet confident, using high-contrast accents to guide the eye toward key conversions and insights.

## Colors

The color palette is built on a foundation of "Deep Teal" to establish an immediate sense of institutional reliability. This is contrasted by "Soft Teal/Cyan," which acts as a beacon of modern energy, used exclusively for primary calls to action, active states, and highlighting key data points.

Backgrounds primarily utilize an "Off-white" surface to maintain a clean, editorial feel. Text is rendered in a "Charcoal" hue rather than pure black to reduce visual fatigue and preserve a premium, softened contrast. Functional colors (success, warning, error) should be desaturated to align with the primary teal's sophistication.

## Typography

This design system employs a dual-typeface strategy to balance character with utility. **Manrope** is used for all headings to provide a geometric yet warm professional tone. Headlines should feature tight letter-spacing and substantial weight to command attention.

**Inter** is utilized for all body copy, labels, and UI elements. Its neutral, systematic nature ensures maximum readability across data-heavy consulting reports and interface components. Line heights are kept generous (1.6x) to facilitate a comfortable reading pace, reinforcing the high-end, premium feel.

## Layout & Spacing

The layout philosophy follows a "Fixed-Fluid" model. Content is contained within a 1440px max-width grid, but backgrounds and glassmorphic decorative elements bleed to the edges of the viewport. This design system prioritizes vertical breathing room, utilizing significant margins (120px+) between major sections to prevent information density from feeling overwhelming.

Internal component spacing follows an 8px base-unit system. Gutters are intentionally wide (32px) to maintain a sense of luxury and clarity. Content should be grouped into logical "islands" with significant external padding to draw focus toward specific value propositions.

## Elevation & Depth

Depth is conveyed through a combination of "Ambient Shadows" and "Glassmorphism." Shadows are never pure black; they are tinted with the Primary Deep Teal color at very low opacity (5-8%) to create a natural, organic lift from the surface.

Floating panels and navigation bars utilize a Backdrop Blur (20px to 40px) with a semi-transparent white fill (opacity 70-80%). This creates a frosted glass effect that allows background colors to subtly influence the foreground, maintaining visual continuity. Borders on elevated elements should be 1px wide, using a slightly lighter tint of the background or a translucent white to define the edge without adding visual weight.

## Shapes

The shape language is defined by oversized, soft radii that contrast against the rigid corporate structure. Major content sections and large containers feature a radius between 24px and 40px, creating a distinctive, modern "containerized" look. 

Interactive elements like buttons follow a "Pill" style (fully rounded) to maximize their approachability and stand out against the more structured card layouts. Small UI components like input fields use a more conservative 12px radius to ensure they remain functional and professional.

## Components

### Buttons
Primary buttons use the Secondary Soft Teal background with Charcoal text for maximum pop. Hover states should include a subtle scale-up (1.02x) and an increased shadow. Ghost buttons utilize a 1px Primary Teal border with a slight background tint on hover.

### Cards & Sections
Cards are the hallmark of this design system. They feature a 24px corner radius, a subtle 1px translucent border, and a faint ambient shadow. For premium cards, apply the glassmorphic blur effect to the background to create a "layered" look over the main page content.

### Inputs & Forms
Input fields should be clean and minimalist. Use the "Off-white" background with a 1px border that shifts from "Gray-light" to "Primary Teal" on focus. Labels use the `label-md` typography style, positioned strictly above the input for clarity.

### Chips & Tags
Used for service categories or status indicators. These should be pill-shaped with low-opacity fills of the Secondary Teal or Primary Teal, using high-contrast text to ensure legibility.

### Navigation
The header should be a sticky, glassmorphic bar. This ensures that as the user scrolls, the content softly blurs beneath the navigation, maintaining a premium, high-tech feel throughout the browsing experience.