---
name: kaze-design-system
description: Design system skill for Kaze. Use when defining or updating colors, typography, buttons, cards, icons, tokens, themes, section patterns, and reusable visual rules across Version 1 and Technical Edition.
---

# Kaze Design System

Use this when changes should become reusable design language rather than one-off styling.

## Version 1 Direction

- Base: white, paper, ink, red, green, gold, dark.
- Feel: local, premium-accessible, clean, creative, quote-focused.
- Use the logo's gold as a premium accent, not a full-page color wash.

## Technical Edition Direction

- Base: ink, panel, surface, signal pink, electric blue, workwear gold.
- Feel: bright industrial/editorial, technical, modular, mobile-ready.
- Use overlays, specs, and icons to explain production value.

## Component Rules

- Buttons: clear command text, 44px+ touch height, strong contrast.
- Cards: 8px radius or less unless matching existing components.
- Icons: use `lucide-react` when available.
- Sections: avoid nested cards; prefer full-width bands and constrained content.
- Images: use real Kaze assets; set stable aspect ratios and intentional crops.

## Token Habit

Before adding new colors or spacing values, check existing CSS variables and route-level tokens. Extend deliberately when the new value supports a distinct design purpose.
