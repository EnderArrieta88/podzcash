# Red Broadcast

> Referencia de diseño — https://designmd.ai/chef/red-broadcast
> Licencia MIT. Descargado para uso como referencia interna de PodZcash.
> Aporta la disciplina de grillas de contenido y páginas de canal, no la paleta.

## Overview
A content-first design system engineered for video consumption at scale. Red Broadcast uses a signature red accent sparingly against clean white and dark surfaces, letting video thumbnails dominate the visual landscape. The aesthetic is efficient and grid-driven — designed for rapid scanning across thousands of videos while maintaining a consistent, recognizable framework that works from mobile to living room screens.

## Colors
- **Primary** (#FF0000): Subscribe button, live badges, progress bars — Broadcast Red
- **Primary Hover** (#CC0000): Hover state for red interactive elements
- **Secondary** (#065FD4): Text links, hashtags, channel mentions — Link Blue
- **Neutral** (#606060): Secondary text, metadata, icon buttons — Gray 600
- **Background** (#FFFFFF): Light mode primary background
- **Surface** (#F2F2F2): Chip bar background, sidebar hover, comment input — Gray 100
- **Text Primary** (#0F0F0F): Video titles, channel names, primary content — Near Black
- **Text Secondary** (#606060): View counts, timestamps, descriptions — Gray 600
- **Border** (#E5E5E5): Dividers, card outlines (rarely used) — Gray 200
- **Success** (#2BA640): Verified badges, successful uploads, monetization active
- **Warning** (#FB8C00): Age-restricted content, copyright claims, review pending
- **Error** (#FF0000): Reuses red — strikes, policy violations, upload failures

## Typography
- **Display Font**: Roboto
- **Body Font**: Roboto
- **Code Font**: Roboto Mono

Roboto is used everywhere for its neutral versatility and extensive language support — critical for a global platform. Headlines use weight 500 and 700 for titles. Body text uses weight 400 for descriptions and metadata. The type system is compact, with most UI text at 12-14px to maximize space for video content. Video titles are the most prominent text element, using weight 500 at 14-16px with strict 2-line clamping for grid consistency.

- **Page Title**: Roboto 24px/32px, weight 700
- **Section Title**: Roboto 20px/28px, weight 500
- **Video Title (Grid)**: Roboto 14px/20px, weight 500, max 2 lines, text-overflow ellipsis
- **Video Title (Watch)**: Roboto 20px/28px, weight 700
- **Channel Name**: Roboto 14px/20px, weight 500
- **Body**: Roboto 14px/20px, weight 400
- **Body Small**: Roboto 12px/18px, weight 400
- **Metadata**: Roboto 12px/16px, weight 400
- **Label**: Roboto 12px/16px, weight 500, tracking 0.02em

## Elevation
Elevation is minimal in the content browsing experience. Level 0: flat, no shadow — default for cards and most surfaces (borders are preferred over shadows). Level 1: 0 1px 2px rgba(0,0,0,0.1) — for sticky header on scroll and mini-player. Level 2: 0 4px 32px rgba(0,0,0,0.1) — for dropdown menus, share dialogs, comment option menus. Level 3: 0 8px 40px rgba(0,0,0,0.2) — for modals and full-screen overlays.

## Components
- **Buttons**: Subscribe uses dark fill, white text, 36px height, 16px horizontal padding, 9999px border-radius. Icon buttons are 40px circles, transparent, hover background.
- **Cards**: No visible card container — video grid items are raw thumbnail + text stack. Thumbnail is 16:9 aspect ratio, 12px border-radius, with duration badge bottom-right (12px weight 500, on rgba(0,0,0,0.6) backdrop, 4px/8px padding, 4px radius). Below: channel avatar (36px circle) left, title + channel name + metadata (views dot date) right. Hover on thumbnail shows preview on delay (2 seconds).
- **Inputs**: 40px height, surface background or transparent with 1px bottom border. Search input: flat bottom border style.
- **Chips**: Pill-shaped (9999px radius), surface background, 14px weight 500, 8px/12px padding. Selected: inverted. Horizontally scrolling chip bar below header for category filtering. First chip is always "All".
- **Lists**: Video list items use horizontal layout: 168x94px thumbnail left, title + channel + metadata right. Up Next sidebar: stacked list, 8px gap.

## Spacing
- Base unit: 8px
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- Component padding: 12px standard, 16px for sidebar items, 24px for page sections
- Section spacing: 24px between major sections, 8px between video metadata lines
- Video grid auto-fills with 320px minimum column width.
- Card grid gap: 16px horizontal, 40px vertical (to accommodate title + metadata below thumbnails)

## Border Radius
- 2px: Badges, duration tags, timestamp links
- 4px: Dropdown menus, tooltips, duration overlays
- 8px: Mini-player, modals, settings panels
- 12px: Thumbnails, video player, large cards
- 9999px: Buttons, chips, avatars

## Do's and Don'ts
- Do make thumbnails the dominant visual element — they drive clicks more than any UI
- Do keep aspect ratio consistent for all artwork
- Don't overuse the accent — reserve it for primary actions, live indicators, and progress bars only
- Do clamp titles to exactly 2 lines with ellipsis for grid consistency
- Don't add borders or shadows to content cards — let artwork sit directly on the background
- Do show metadata compactly: "channel dot date dot duration" format
- Don't auto-play previews on hover immediately — use a delay to prevent flickering
- Don't use custom scrollbars — rely on native scrolling for performance
