# IMPLEMENTATION PROMPT — CINEMATIC WEDDING PLANNER LANDING PAGE

## ROLE

Act as a senior creative developer, frontend architect, motion designer, and UI/UX engineer.

Your task is to implement a premium, cinematic, scroll-interactive landing page for my existing Wedding Planner web application, using my uploaded couple animation video as the primary visual asset.

The implementation must be performed directly in my existing repository. Do not merely provide recommendations, sample code, or a design proposal. Inspect the codebase, implement the experience, run the available checks, and verify the result.

## 1. PRIMARY OBJECTIVE

Transform the Wedding Planner landing page into a beautiful, immersive, romantic experience where the couple's video becomes the main visual element.

The page should feel like a premium interactive digital love story, with cinematic transitions and meaningful visual changes as the user scrolls.

The core visual concept is:

**A tiny romantic world belonging to two people, gradually revealing their story and wedding-planning journey as the visitor scrolls.**

The video must be integrated into the actual website, not displayed as an isolated video player.

The user should feel as if they are entering a miniature wedding world, exploring it, and gradually discovering the purpose of the application.

## 2. EXISTING VIDEO ASSET — MANDATORY

I have already generated the couple animation video.

Uploaded filename:

`Chibi_couple_under_wedding_arch_20261023150634.mp4`

The uploaded file is initially available at:

`/mnt/data/Chibi_couple_under_wedding_arch_20261023150634.mp4`

First, verify that the file exists and inspect its duration, dimensions, aspect ratio, frame rate if available, and visual content.

Then copy or optimize it into the appropriate public asset directory in the existing Laravel project.

Recommended destination:

`public/videos/our-little-world.mp4`

The final asset path may be adjusted to match existing project conventions.

Do not assume the source video is perfectly loopable. Inspect it before deciding how to handle its beginning and ending.

### Video requirements

- Use the actual uploaded video.
- Do not replace it with a stock video.
- Do not generate a different couple.
- Do not recreate the couple with CSS, SVG, Three.js, or another model.
- Do not use the earlier GLB prototype as a replacement for this video.
- Preserve the original character appearance.
- Use the video as the primary visual focus of the landing page.
- Keep the video local to the project unless there is a compelling technical reason to use external hosting.
- Do not autoplay audio.
- Use `muted`, `playsInline`, `autoPlay`, and `loop` where appropriate.
- Handle browsers that block autoplay.
- Provide a suitable poster image or fallback when the video cannot load.
- Display a graceful loading state if necessary.

If video optimization is needed, use available tools such as FFmpeg when installed. Preserve the original uploaded asset and create a separate optimized copy.

Aim for a reasonable balance between visual quality and loading performance.

## 3. REFERENCE REPOSITORY — AANAYA-WEB

Reference:

`https://github.com/Fadhillahdnr/Aanaya-web.git`

Study this repository before implementation.

Do not rely only on its README or repository description.

Inspect the actual source code and identify the techniques responsible for its relevant scrolling behavior, animation choreography, section transitions, visual layering, or other interactive effects.

Use GitHub browsing, a local clone, or another available method to inspect the actual implementation.

If a local clone is needed, use a temporary directory outside my existing Wedding Planner repository. Do not replace or merge repositories blindly.

### Reference-analysis deliverables

Before implementing the animation, identify:

1. Which files implement the relevant landing-page interactions.
2. Which animation libraries or native browser APIs are used.
3. How scroll progress affects visual states.
4. How sections enter, leave, or overlap the viewport.
5. How background and foreground layers move.
6. How responsive behavior is implemented.
7. Which techniques can be adapted to the Wedding Planner.

Use the repository as a technical reference, not as a template to copy wholesale.

Do not invent a claim that a specific effect exists in the reference repository unless you have inspected and verified it.

If the exact technique cannot be inspected, document the limitation and implement a well-engineered equivalent.

### Architecture compatibility

My Wedding Planner project uses:

- Laravel.
- Inertia.js.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.

Preserve this architecture.

Do not convert the project to Blade, Alpine.js, Next.js, or a standalone Vite application just to imitate the reference.

Adapt the useful interaction patterns to the existing React and Inertia implementation.

## 4. CREATIVE DIRECTION

### Brand identity

Working name: **Our Little World**

The experience should feel:

- Romantic.
- Intimate.
- Dreamy.
- Soft.
- Elegant.
- Whimsical.
- Cinematic.
- Premium.
- Personal.

Avoid making it look like a generic SaaS landing page or a typical wedding vendor marketplace.

The video should establish the emotional identity of the website immediately.

### Mandatory color palette

Use the following design tokens consistently:

- Coral pink: `#F29191`
- Soft blush: `#F7ADAD`
- Pastel aqua: `#B1E5E5`
- Mint ice: `#CCFBFA`
- Warm ivory: `#FFF9F5`
- Deep plum: `#49343D`

The palette should complement the video's existing colors.

Use warm ivory and subtle gradients for readability. Use coral and blush as romantic highlights. Use mint and aqua for supporting environmental accents.

Do not apply a heavy color overlay that makes the original characters difficult to see.

### Typography

Use elegant editorial typography for large headlines and a clean, readable sans-serif for supporting text.

Large headlines should have deliberate line breaks and generous spacing.

Use natural Indonesian copy with a warm emotional tone.

Avoid excessive emojis, overly generic marketing copy, and large amounts of text.

## 5. LANDING PAGE STRUCTURE

Create a cohesive, full-page experience with several sections that unfold through scrolling.

The following sequence is the intended creative direction. Adapt the exact layout after inspecting the video and the reference repository.

### Scene 1 — The entrance

The initial viewport should be visually striking.

Display the couple video as a full-screen or near-full-screen background.

Use a `position: sticky` or equivalent layered layout where appropriate.

The video should be prominent and large enough to appreciate the characters.

Apply a carefully tuned gradient or soft overlay only where necessary to support the text.

Suggested content:

Small eyebrow:
"OUR LITTLE WORLD"

Main headline:
"Sedikit demi sedikit, menuju hari kita."

Supporting copy:
"Sebuah dunia kecil untuk merencanakan hari besar yang kita impikan bersama."

Primary action:
"Mulai perjalanan kita"

Secondary scroll indicator:
"Scroll untuk menjelajahi cerita kita"

Keep the text composition elegant and uncluttered.

Do not cover the characters' faces with text.

The initial scene should be beautiful even before the user starts scrolling.

### Scene 2 — The story unfolds

As the visitor scrolls, keep the video visible within a sticky visual stage while the surrounding content changes.

The background must not simply disappear when the next section enters the viewport.

Create a controlled transition in which the video remains the visual anchor while text and environmental layers change around it.

Suggested headline:

"Semua dimulai dari sebuah mimpi."

Reveal a short supporting sentence using a subtle text animation.

Use the actual scroll position to control the progression where appropriate.

### Scene 3 — The world becomes immersive

Create a cinematic scroll-driven scene.

Depending on the source video's composition, animate the video container and surrounding layers through carefully controlled changes such as:

- Gradual scale changes.
- Subtle vertical translation.
- Gentle parallax.
- Clip-path or mask transitions.
- Background color transitions.
- Foreground decorative elements moving at different speeds.
- Gradual changes in text position and opacity.

The animation should feel like the visitor is moving deeper into a miniature wedding world.

Do not apply every effect simultaneously. Select the effects that work best with the actual video.

Do not distort the characters or stretch the video.

Maintain the video's aspect ratio with an appropriate `object-fit` strategy.

### Scene 4 — The meaning of the world

Transition from the cinematic hero into the purpose of the application.

Suggested heading:

"Bukan sekadar merencanakan pernikahan."

Supporting copy:

"Tapi menyimpan setiap rencana, keputusan, dan kenangan kecil yang membawa kita lebih dekat ke hari itu."

Reveal three editorial feature elements:

**Anggaran kita**

A shared space to plan expenses and understand the wedding budget.

**Langkah menuju hari kita**

A timeline for tasks, milestones, and upcoming decisions.

**Cerita yang ingin kita simpan**

A private collection of memories, photographs, notes, and meaningful moments.

Use real application routes where they exist.

Do not add nonfunctional buttons.

These sections should feel like part of the same story, not disconnected cards copied from an admin dashboard.

### Scene 5 — The planning journey

Introduce a more structured visual section.

Show how the couple can organize their wedding preparation.

Use a visually rich but restrained composition.

Possible elements:

- A timeline.
- Progress indicators.
- A small collection of upcoming milestones.
- Budget or task previews.
- A romantic visual transition connecting this section to the video scene.

If the visitor is not authenticated, display generic feature previews rather than exposing personal wedding data.

If the visitor is authenticated and the application already supports these features, use the real backend data appropriately.

Do not fabricate personal budget amounts, expenses, completed tasks, or wedding dates.

### Scene 6 — The invitation

Conclude the storytelling sequence with a clear call to action.

Suggested headline:

"Yuk, kita susun dunia kecil kita."

Supporting copy:

"Satu langkah kecil hari ini, satu langkah lebih dekat ke hari yang kita tunggu."

Primary CTA:
"Masuk ke Our Little World"

If registration or login already exists, link to the correct route.

Do not invent route names. Inspect the existing route definitions.

Finish with a calm, elegant visual transition.

The visitor should understand what the application is and what to do next.

## 6. SCROLL-DRIVEN ANIMATION SYSTEM

The defining feature of this implementation is that scrolling should control the storytelling experience.

Use an animation architecture compatible with the existing application.

Preferred approach when compatible:

- GSAP.
- GSAP ScrollTrigger.
- Lenis for optional smooth scrolling.

If the existing project already uses an appropriate animation library, evaluate whether it should be reused.

Do not install multiple overlapping animation systems without a clear reason.

### Scroll behavior

Implement a small number of carefully choreographed scenes.

Use a pinned or sticky visual stage when it improves the experience.

As the user scrolls:

1. The opening headline appears.
2. The supporting text reveals progressively.
3. The video remains visible while the surrounding content changes.
4. The video container may scale or change shape smoothly.
5. Background layers move with subtle parallax.
6. New content enters at deliberate scroll positions.
7. The cinematic sequence resolves into the practical planning features.
8. The final CTA appears naturally.

Animations tied to the scroll position should follow the actual scroll progress rather than playing independently at arbitrary speeds.

Use `scrub` or an equivalent progress-linked animation when appropriate.

Use scroll-triggered animations for smaller reveals that do not need to be directly tied to scroll progress.

Avoid excessive animation.

### Motion quality

The desired motion should feel fluid and controlled.

Use:

- Smooth easing for non-scroll-linked transitions.
- Carefully tuned scrub behavior for scroll-linked motion.
- Small stagger delays.
- Subtle blur-to-clear reveals when appropriate.
- Controlled opacity and transform changes.
- Consistent animation timing.
- Thoughtful transitions between background states.

Avoid:

- Aggressive bouncing.
- Random rotations.
- Excessive zoom.
- Rapid camera-like movement.
- Overlapping animations that make content unreadable.
- Scroll hijacking.
- Forced full-page snapping.
- Long periods where users cannot reach normal page content.
- Animation that breaks browser back-to-top behavior.

The visitor must retain normal control over scrolling.

## 7. VIDEO-SCROLL SYNCHRONIZATION

The uploaded video is an ordinary MP4, not necessarily a collection of individually addressable frames.

Do not assume that every video can be perfectly scrubbed frame-by-frame in every browser.

First inspect the video's duration, keyframes, file size, and actual visual motion.

Then select the most reliable strategy.

### Strategy A — Recommended default

Use the video as a looping or continuously playing background.

Synchronize the surrounding text, masks, container dimensions, parallax, and visual transitions with scroll progress.

This is appropriate when the video contains natural continuous motion and should remain visually alive.

### Strategy B — Scroll-scrubbed playback

If it produces a substantially better result, investigate synchronizing `HTMLVideoElement.currentTime` with scroll progress.

If you implement this approach:

- Seek using the actual video duration.
- Handle metadata loading.
- Handle browsers that delay seeking.
- Avoid seeking on every raw scroll event without throttling or coordination.
- Keep seeking work efficient.
- Avoid visible flickering and repeated decoding stalls.
- Verify that the video's encoding supports the intended experience.
- Consider producing an optimized version with suitable keyframe intervals.
- Provide a fallback if seeking performance is poor.

Do not use both playback modes simultaneously in conflicting ways.

### Important design decision

Choose one primary playback strategy for each scene.

Do not let a video loop fight against a scroll timeline that continuously forces `currentTime` to a different value.

The experience must feel intentional, smooth, and stable.

## 8. VIDEO PRESENTATION AND RESPONSIVENESS

Use a responsive video container that preserves the visual integrity of the source.

Desktop:

- Use a large cinematic composition.
- Keep both characters visible.
- Preserve a clear focal point.
- Use the available screen space effectively.

Tablet:

- Adjust the focal point and text layout.
- Avoid unnecessary cropping.
- Reduce animation complexity if needed.

Mobile:

- Reframe the video using an appropriate `object-position`.
- Keep both characters visible whenever possible.
- Reduce the number of simultaneous layers.
- Reduce scroll-animation complexity.
- Prevent layout overflow.
- Avoid huge pinned sections that make the page tedious to navigate.
- Ensure the CTA remains easy to reach.

Do not assume that `object-fit: cover` will always preserve the important characters. Inspect the actual video and tune the focal position accordingly.

If a dedicated mobile video crop is necessary, create it from the uploaded source without replacing the original asset.

## 9. TECHNICAL IMPLEMENTATION

Inspect the existing React/Inertia application before adding dependencies.

Potential component structure:

- `LandingPage`
- `CinematicHero`
- `WeddingVideoBackground`
- `ScrollStory`
- `StorySection`
- `PlanningFeatureSection`
- `FinalCallToAction`
- `ScrollProgressIndicator`

Use the existing project conventions rather than forcing these exact filenames.

Keep animation logic separate from content where reasonable.

### React lifecycle requirements

- Register and clean up GSAP animations correctly.
- Use `gsap.context()` or the appropriate React integration when available.
- Avoid duplicate ScrollTrigger instances.
- Refresh or recalculate scroll positions when video metadata, fonts, or layout dimensions change.
- Avoid memory leaks.
- Avoid direct DOM mutations that conflict with React.
- Avoid layout shifts during video loading.
- Keep the initial render stable.
- Use stable refs for animated elements.

Do not recreate all animations on every React render.

Use a proper cleanup strategy when components unmount.

### Lenis integration

If Lenis is used:

- Coordinate it correctly with GSAP's ticker and ScrollTrigger updates.
- Prevent duplicate scroll listeners.
- Avoid conflicting native and custom scroll systems.
- Ensure anchors and keyboard navigation remain usable.
- Test browser back-to-top behavior.
- Provide a fallback for reduced motion.

If smooth scrolling introduces bugs or worsens accessibility, prefer native scrolling.

### Dependency management

Before installing any package:

1. Inspect `package.json`.
2. Check whether a compatible package is already installed.
3. Confirm compatibility with the current React and Vite setup.
4. Install only what is required.
5. Preserve the current package manager and lockfile.
6. Run the production build after changes.

Do not blindly copy Next.js-specific code from another project into the Laravel application.

## 10. VISUAL DESIGN DETAILS

Use the supplied pastel palette:

- `#F29191`
- `#F7ADAD`
- `#B1E5E5`
- `#CCFBFA`
- `#FFF9F5`
- `#49343D`

Use the video as the visual centerpiece.

Add depth with a restrained combination of:

- Gradient overlays.
- Layered backgrounds.
- Soft blur.
- Subtle shadows.
- Carefully composed typography.
- Delicate floral accents.
- Gentle parallax.
- Rounded visual masks.
- Fine decorative lines.

Do not cover the video with excessive cards, text, or decorative elements.

Do not make the page look like a standard dashboard with a video pasted behind it.

The video, typography, and scroll transitions must feel like one cohesive composition.

### Navigation

Use a minimal navigation system.

Possible items:

- Our Little World.
- Cerita Kita.
- Perencanaan.
- Masuk.

Adapt these labels to the actual application.

The navigation should remain readable over the video.

Use an appropriate background or contrast transition when scrolling away from the hero.

## 11. ACCESSIBILITY

Implement:

- `prefers-reduced-motion` support.
- A simplified, non-animated presentation when reduced motion is enabled.
- Keyboard-accessible navigation.
- Visible focus indicators.
- Proper heading hierarchy.
- Readable text contrast.
- Descriptive links and buttons.
- No content available only through hover.
- A pause or reduced-motion strategy for distracting continuous effects where appropriate.

Do not require users to complete a complex animation to reach the login or planning features.

Avoid scroll snapping that traps keyboard or touch users.

## 12. PERFORMANCE

The landing page must remain fast and usable.

Requirements:

- Optimize the MP4 for web delivery where necessary.
- Use `preload="metadata"` or another appropriate preload policy rather than blindly downloading the full video immediately.
- Use a poster image for the initial visual state when appropriate.
- Avoid loading the video multiple times.
- Avoid unnecessary high-resolution variants.
- Keep the initial viewport stable.
- Lazy-load below-the-fold media where appropriate.
- Avoid heavy blur filters across the entire video.
- Use transforms and opacity for most animations.
- Avoid expensive layout recalculations.
- Avoid unnecessarily large pinned sections on mobile.
- Respect device and network constraints.
- Provide a reduced-motion fallback.
- Ensure the page remains useful if video playback fails.

Do not introduce a large 3D runtime just to create the requested effect. The uploaded video is the main visual asset.

## 13. QUALITY ASSURANCE

After implementation, run the available checks.

At minimum:

- TypeScript check if configured.
- Linting if configured.
- Production frontend build.
- Relevant automated tests.
- Browser verification if browser automation is available.

Inspect the page at multiple scroll positions:

1. Initial viewport.
2. Early hero transition.
3. Middle of the pinned video scene.
4. Transition into planning features.
5. Final CTA.
6. Mobile viewport.
7. Reduced-motion mode.

Verify:

- Video loads correctly.
- The correct couple video is used.
- Text remains readable.
- Characters are not unintentionally cropped.
- Scroll progress drives the intended effects.
- Sticky elements release at the correct positions.
- No horizontal overflow occurs.
- The footer and final CTA remain reachable.
- Navigation works.
- There are no obvious console errors.
- No duplicate animations occur after navigation.
- No memory leaks or persistent scroll-lock issues are observed.

Do not claim a check passed unless it was actually run.

If browser verification is unavailable, report that limitation honestly.

## 14. IMPLEMENTATION WORKFLOW

### Phase 1 — Inspect

Inspect the existing Laravel/React project, the uploaded MP4, and the actual source code of Aanaya-web.

Determine the best compatible implementation strategy.

### Phase 2 — Plan

Define the page structure, animation sequence, video playback strategy, and component responsibilities.

Keep the plan concise and continue with implementation.

### Phase 3 — Build the static composition

First create the responsive landing page with the actual video and correct content hierarchy.

Ensure that the page is visually coherent even with animations disabled.

### Phase 4 — Add scroll storytelling

Implement the sticky visual stage, scroll-linked progression, parallax, section transitions, and text reveals.

Use a limited number of polished effects rather than many disconnected animations.

### Phase 5 — Optimize

Optimize the video, mobile layout, rendering behavior, and animation lifecycle.

### Phase 6 — Verify

Run the build and available checks. Inspect the result across the full scroll sequence.

Fix issues before declaring completion.

## 15. DEFINITION OF DONE

The task is complete when:

- The actual uploaded MP4 is integrated into the landing page.
- The video is the primary visual centerpiece.
- The page feels cinematic and romantic.
- Scrolling produces intentional, smooth visual progression.
- The video and text transitions work together.
- The landing page is responsive.
- The existing Laravel/Inertia/React architecture is preserved.
- The reference repository has been inspected, or its inspection limitations are documented.
- Accessibility and reduced-motion behavior are addressed.
- The production build succeeds, or the exact blocker is documented.
- The final CTA and navigation work.
- The final report accurately describes the implementation.

## 16. FINAL REPORT

At the end, report:

1. What was implemented.
2. Which files were created or modified.
3. Where the video asset was placed.
4. Which reference techniques were identified and adapted.
5. Which animation libraries were used and why.
6. How scrolling controls the scene.
7. How video playback works.
8. What was done for mobile and reduced motion.
9. Which checks were run and their actual results.
10. Any remaining limitations.

**Final instruction:** 
Start by inspecting the existing repository, uploaded video, and reference repository. Then implement the cinematic landing page directly in the existing project. Prioritize the quality of the complete scrolling experience over the number of animation effects.
