# Petal Passport — Design Guidelines

Read this file before building any UI code. Every design decision should follow these guidelines.

## Aesthetic Direction

Organic, warm, botanical editorial. Think National Geographic meets a hand-illustrated garden journal. This is a gift from a daughter in Seattle to her mother in India — every pixel should feel like it was placed with care. The app should feel like opening a beautiful book, not using a utility.

## What to Avoid

Never use generic AI-generated aesthetics:
- No default system fonts (Inter, Roboto, Arial, system fonts)
- No purple-gradient-on-white SaaS aesthetic
- No default Mapbox markers (the red teardrops)
- No cookie-cutter card layouts or boring spacing
- No flat white backgrounds everywhere
- No generic spinners for loading states
- No cramped layouts — let elements breathe

## Typography

Use Google Fonts. Import both:
- **Headlines & display text**: Playfair Display (serif) — elegant, editorial, warm
- **Body text & UI elements**: DM Sans — clean, modern, readable

Pair them with clear hierarchy: large serif headlines, smaller sans-serif body. Use font weight and size to create contrast, not just bold.

## Color Palette

Use CSS variables for consistency across the app.

| Role | Color | Hex |
|------|-------|-----|
| Background | Warm cream | #F8F5EE |
| Primary | Deep botanical green | #2D5016 |
| Primary light | Soft green | #4A7C2E |
| Accent | Warm terracotta | #C4652E |
| Text primary | Charcoal | #2D2926 |
| Text secondary | Warm gray | #8A8480 |
| Text muted | Light warm gray | #AAA5A0 |
| Surface | Off-white | #FFFEF9 |
| Surface alt | Warm beige | #F4F1EA |
| Border | Soft warm | #EBE6DD |
| Status: Peak bloom | Green | #00B894 |
| Status: Starting | Amber | #E17055 |
| Status: Upcoming | Purple | #6C5CE7 |
| Status: Ending | Soft gold | #FDCB6E |
| Danger / Avoid | Rust red | #B33A1A |

Each bloom location also has its own accent color (stored in the data as `accentColor`) used for that bloom's hero gradient, audio player button, and tip border.

## Map Design

The map is the entire home screen — full viewport, edge to edge. No header bar, no footer bar, no tabs around it.

- Use Mapbox GL JS with `mapbox://styles/mapbox/outdoors-v12` as a base
- Customize the style to feel warmer: mute the blues, warm the greens, soften the grays
- The map should feel like a vintage botanical atlas, not Google Maps
- Only show pins for blooms that are currently in season (based on today's date)
- Inactive/off-season blooms do not appear on the map at all

### Pin Design

- Custom circular markers (NOT default Mapbox teardrops)
- Each pin shows a flower emoji centered inside a colored circle
- Circle color matches bloom status: green for peak, amber for starting, purple for upcoming
- Pins for peak blooms have a subtle pulsing glow animation
- Pins for personal blooms (isPersonal: true) have a small heart badge overlay
- Each pin has a small text label showing the status (e.g., "Peak now" or "8 weeks")
- Pins should feel like they belong on the map, not stuck on top of it

### Map Overlay

Overlaid on the map with transparency (not a separate header):
- App name "Petal Passport" in Playfair Display, top-left, with subtle text shadow
- Current month (e.g., "April") small and understated, top-right
- Small legend showing pin color meanings, bottom-left corner

## Bottom Sheet Preview

When a user taps a map pin, a preview card slides up from the bottom:
- Smooth spring animation on slide-up
- Small drag handle at the top of the sheet
- Background map dims slightly (overlay with 20% black opacity)
- Dismissible by swiping down or tapping the dimmed area

Preview card contents:
- Small hero photo (120px tall, full card width, rounded top corners)
- Flower name in Playfair Display
- Location in DM Sans, secondary color
- Status badge (colored pill)
- Season dates
- "Explore this bloom →" link
- Heart icon + "I was here" text if isPersonal is true

Tapping the preview navigates to the full detail page.

## Bloom Detail Page

This is the main experience. It should feel immersive — like turning a page in a beautiful botanical book. Every element should breathe. No clutter.

### Layout (top to bottom):

**1. Hero Photo**
- Full width, roughly 40% of viewport height
- The most stunning photo for this bloom
- Flower name and location overlaid at bottom with gradient for readability
- Status badge top-right
- Back arrow top-left with semi-transparent circular background
- Heart badge if personal bloom

**2. Audio Player**
- THE most prominent element after the hero — do not hide it
- Card-style container with the bloom's accent color tint as background
- Large circular play button filled with the bloom's accent color
- Primary label: "Listen to this story"
- Secondary label: "Narrated by [name] · X min"
- Waveform visualization or progress bar during playback
- Pause/resume on tap
- Audio continues playing while scrolling

**3. The Story**
- Section heading "The story" in Playfair Display
- 2-3 paragraphs of story text in DM Sans italic
- Warm, conversational tone — like a daughter talking to her mother

**4. Photo Gallery**
- Horizontal scrollable row
- 4-6 photos per bloom
- Rounded rectangle thumbnails, roughly 200px wide
- Subtle shadow, snap scrolling
- Mix of wide landscapes and close-ups

**5. Details Grid**
- 2-column grid with small info boxes
- Background: surface alt color
- Small uppercase label (muted color, 9-10px, letter-spacing)
- Value below in medium weight
- Fields: Best time, Season, Varieties, Country

**6. Insider Tip**
- Callout box with left border in the bloom's accent color
- "Insider tip" uppercase label
- Tip text in body font

**7. Personal Note (conditional)**
- Only appears when isPersonal is true
- Dashed border, warm gold-tinted background
- Heart icon + "From me to you" label
- Personal message in Playfair Display italic
- Should feel visually distinct from other sections — like a handwritten note tucked into the page

**8. Footer**
- "built with love, for Ma" in light serif italic, centered
- Back to map link

## Motion & Animation

Be gentle. This is a meditative app, not an energetic one.

- **Page load**: Stagger reveals from top to bottom, 50-80ms delay between elements
- **Bottom sheet**: Smooth spring animation (not linear). Use CSS `transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)`
- **Detail page entry**: Fade in from bottom, 300-400ms duration
- **Photos in gallery**: Subtle entrance animation as they scroll into view
- **Pin pulse**: Gentle glow pulse on peak bloom pins, 2-second cycle
- **Audio waveform**: Smooth bar animation during playback
- **Hover states** (desktop): Subtle lift on cards, soft color transitions

Avoid: Fast animations, bouncy springs, jarring transitions, anything that feels like a tech product rather than a botanical experience.

## Mobile-First

The primary user is a mother in India on her phone.

- Design everything at 375px width first, then adapt for larger screens
- Touch targets: minimum 44px for all interactive elements
- The map must be usable with one thumb
- Optimize all images (WebP format, lazy loading, srcset)
- Test with Chrome DevTools network throttling set to "Slow 3G"
- Total app size target: under 80MB
- Use Next.js Image component for automatic optimization

## Audio Player Details

The audio player is the soul of this app.

- Use ElevenLabs TTS API via a server-side API route (/api/narrate)
- Send the story text + voice ID to ElevenLabs, stream audio back
- Cache generated audio in localStorage (key: bloom-audio-[bloomId]) to avoid repeat API calls
- Show loading state while audio generates: "Preparing story..." with subtle animation
- Display elapsed time and total duration during playback
- Audio should continue playing if user scrolls the page

## Overall Guiding Principle

When in doubt between two design choices, pick the one that feels warmer, more personal, and more beautiful. This is not a product — it is a gift. Design accordingly.
