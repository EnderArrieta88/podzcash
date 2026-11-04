# Airwave

> Referencia de diseño — https://designmd.ai/duanhdan/airwave
> Licencia MIT. Descargado para uso como referencia interna de PodZcash.

## Overview
Airwave is a design system for podcast platforms, audio shows, and on-demand listening apps. The aesthetic borrows from late-night broadcast booths and vintage audio gear — charcoal surfaces, glowing amber accents, and waveform visualizations that act as both decoration and information. Where most dark-mode systems lean cool and technical, Airwave runs warm: amber is the heartbeat color, used on play states, scrubber positions, waveform peaks, and live indicators. The result is a listening environment that feels intimate at 11pm and clear at 11am. Airwave is purpose-built for audio-first content with playback, episode lists, transcripts, and discovery as primary surfaces — distinct from concert-energy systems that target music streaming.

## Colors
- **Background** (#0F0E0D): Warm near-black — the dominant app surface
- **Surface** (#1A1816): Card and panel surface — slightly warmer than background
- **Surface Elevated** (#252220): Hover states, active items, modal surfaces
- **Surface Highest** (#332F2C): Active playback bar, persistent header on scroll
- **Amber** (#F59E0B): Primary brand color — play states, waveform fill, live indicator, primary CTAs
- **Amber Glow** (#FBBF24): Hover and pressed states; used at 60% opacity for shadows
- **Amber Soft** (#3A2E1C): Amber-tinted backgrounds for active items, selection
- **Ember** (#DC6B2F): Secondary accent — episode tags, category pills
- **Text Primary** (#F5F1E8): Warm off-white — headings and body text
- **Text Secondary** (#A8A099): Descriptions, episode metadata, timestamps
- **Text Subtle** (#6B655F): Dates, durations, listener counts
- **Text Faint** (#403B36): Disabled text, placeholder
- **Outline** (#2D2A27): Card edges, divider rules
- **Outline Strong** (#454039): Focused inputs, prominent separators
- **Waveform Track** (#403B36): Default waveform color before playback head
- **Waveform Played** (#F59E0B): Waveform color behind the playback head — amber
- **Live** (#EF4444): Reserved for live broadcast indicator pulse
- **Success** (#22C55E): Downloaded, saved
- **Warning** (#F59E0B): New episode badge (same as amber primary)
- **Danger** (#EF4444): Remove, unsubscribe

## Typography
- **Display**: GT Sectra (fallback Tiempos Headline, Georgia) — used for show titles, episode hero headlines, feature copy
- **Sans**: Inter (fallback Söhne, system-ui) — used for body, UI, navigation, transcript text
- **Mono**: JetBrains Mono (fallback Berkeley Mono) — timestamps, chapter markers, RSS feed URLs

The serif display brings warmth and editorial weight to show titles — countering the technical coldness many audio apps fall into. Body text uses Inter at 16px with a 26px leading for readable episode descriptions. Transcripts use Inter at 17px with a 32px leading — generous for long reading sessions. Timestamps and chapter markers use mono so the columns of "01:23:45" align cleanly. Episode numbers render in mono with caption uppercase styling.

Type scale: Display 56/60 (serif, -0.02em), H1 40/48 (serif), H2 28/36 (serif), H3 20/28 (sans 600), Body Large 17/28 (sans), Body 16/26 (sans), Small 14/22, Caption 12/16 uppercase 0.1em tracking, Episode Number 11/14 mono uppercase, Timestamp 13/16 mono tabular.

## Elevation
Airwave avoids heavy shadows since the dark background absorbs them. Elevation is communicated through surface lightness — each step up in elevation moves one step lighter on the surface scale. Cards on background use the surface color (#1A1816). Hover lifts to surface-elevated (#252220). The persistent playback bar at the bottom uses surface-highest (#332F2C) with a 1px top border in outline-strong. Modals use surface-elevated with a faint amber-glow border (rgba(245, 158, 11, 0.08)) and a backdrop wash of rgba(15, 14, 13, 0.75).

A signature elevation effect: the currently-playing episode card glows with a soft amber halo (0 0 32px rgba(245, 158, 11, 0.15)) that pulses subtly during active playback.

Border radius: 2px for waveform bars, 6px for small chips and pills, 10px for buttons, 12px for cards, 16px for modals, 999px for the play button and circular avatars.

## Components
- **Play Button (Hero)**: The signature component. A 72px amber circle with a black play triangle. Hover lifts with an amber-glow shadow (0 0 40px rgba(251, 191, 36, 0.4)). Pressed state inverts to a pause icon and the surrounding waveform animates. Smaller variants exist at 48px (in episode list) and 32px (inline within transcripts).
- **Waveform**: The defining visual element. Each episode's audio is rendered as vertical bars at 2px width with 1px gaps, height-modulated by audio amplitude. Bars before the playback head are amber (#F59E0B); bars after are waveform-track (#403B36). Clicking any bar seeks to that position. Hovering a bar shows a timestamp tooltip in mono. Waveforms appear at 80px tall on the playback bar, 48px in episode cards, and 120px on the episode detail page.
- **Playback Bar**: A persistent bar pinned to the bottom of the viewport at 96px tall on desktop, 72px on mobile. Contains: 48px square episode artwork (left), show name + episode title (next), 48px play button (center), waveform with scrubber (right), and time elapsed / remaining in mono. The bar sits at surface-highest with a 1px outline-strong top border. On mobile, the waveform collapses to a thin amber progress line.
- **Episode Card**: Standard list card showing episode artwork (64px square, 6px radius), episode number in mono caption uppercase, episode title in serif display 20px, show name in sans small ember-tinted, duration and date in mono small text-subtle, a 48px play button on the right. Currently-playing cards gain the amber glow halo.
- **Show Header**: A full-width hero on show detail pages. Show artwork at 240px square sits on the left; show title (serif display 56px) and host names sit on the right. Below: subscriber count, episode count, category tags in ember pills, and a primary "Follow" CTA in amber. Background uses a blurred, amber-tinted gradient from the show artwork.
- **Transcript**: Long-form prose layout with speaker labels in caption uppercase amber, timestamp anchors in mono ember-tinted at the start of each block, and the currently-spoken sentence highlighted with an amber-soft background that animates word-by-word during playback. Click any sentence to seek.
- **Chapter Markers**: A horizontal strip above the waveform showing chapter divisions. Each chapter is a labeled segment with a small mono timestamp; current chapter highlights amber.
- **Live Indicator**: A small live (#EF4444) circle with a pulsing halo, paired with "LIVE" in mono uppercase. Used on currently-broadcasting episodes.
- **Speed Control**: A pill toggle for playback speed (0.8x, 1.0x, 1.25x, 1.5x, 2.0x). Active speed is amber-filled mono caption.
- **Sleep Timer**: An icon button (crescent moon) opening a popover with timer durations. Active timer shows the countdown in mono next to the icon.
- **Subscribe Button**: When unsubscribed, an outline button in amber. When subscribed, fills to amber with a check icon and the text "Subscribed" — clicking opens a confirm popover before removal.
- **Inputs**: 1px outline-strong border, surface background, 10px radius, 12x16px padding, 16px sans text. Focus border becomes amber with a 4px amber-soft ring. Search input has an amber icon at the left.

## Spacing
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px
- Container max-width: 1280px with 32px horizontal padding on desktop
- Episode list row height: 88px on desktop, 72px on mobile
- Playback bar height: 96px desktop, 72px mobile
- Sidebar width: 240px (collapsed: 64px showing icons only)
- Section spacing: 64px between major sections, 32px between subsections

## Motion
Motion in Airwave is rhythmic — it borrows from the cadence of audio. Standard duration is 240ms with cubic-bezier(0.4, 0, 0.2, 1) easing. Playback button transitions use 180ms. The active episode's amber halo pulses on a 2.4-second sine wave at low amplitude — subtle, like breathing. Waveform bars animate height on entry (staggered 16ms each, 360ms total). Page transitions cross-fade over 240ms. The mini-player expanding to full-screen on mobile uses a spring physics curve (stiffness 240, damping 28).

## Iconography
Custom outlined icon set at 2px stroke. The vocabulary is broadcast-themed: microphone, headphones, radio tower, RSS antenna, sound wave, vinyl record, cassette tape, broadcast booth, on-air sign. Icons are 20px default in text-secondary, scaling to 24px in playback controls and 16px in dense list contexts. Active icons brighten to amber.

## Voice and Tone
- Conversational but produced. Like a host's intro, not a dashboard alert.
- Use show language: "On this episode," "From the archives," "Coming up next."
- Subscribe verbs are warm: "Follow," "Add to library," "Save for later" — not "Subscribe" alone.
- Empty states use audio idiom: "Nothing in the queue," "Dead air," "No transcript available yet."
- Push notifications are show-personal: "New from [Show Name]" rather than "You have a new podcast."

## Do's and Don'ts
- Do let waveforms be the visual hero — they carry both decoration and information
- Do use amber as the heartbeat color across play states, scrubbers, and live indicators
- Do pair the GT Sectra display serif with Inter sans — the warmth of serif balances the dark surface
- Do use mono for any time-based data: timestamps, durations, chapter markers
- Do treat the playback bar as persistent — never let navigation interrupt active playback
- Don't use cool blue or cyan accents — Airwave is intentionally warm
- Don't apply amber to large surface fills — it must remain a precision accent
- Don't render waveforms as static images — they must reflect actual audio amplitude
- Don't compress episode artwork below 48px — show identity must remain recognizable
- Don't use round playback button shadows that bleed into surrounding content — the amber glow is the only acceptable bloom
- Don't allow page transitions to interrupt playback or shift the playback bar
