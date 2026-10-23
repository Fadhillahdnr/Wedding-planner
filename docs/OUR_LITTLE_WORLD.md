# MASTER PROMPT — OUR LITTLE WORLD
## Premium Wedding Planner Web Application with Interactive 3D Experience

You are a senior full-stack engineer, senior UI/UX designer, creative developer, 3D web developer, database architect, and QA engineer.

Your task is to **audit, design, implement, test, and document a complete, premium-quality Wedding Planner web application** for a couple who want to plan their wedding together.

Do not stop at recommendations, wireframes, mockups, or code snippets. Work directly inside the existing project repository, implement the actual application, verify the results, and document anything that remains incomplete.

The product must feel like a personal, romantic digital world created for two people—not a generic admin dashboard, wedding marketplace, or CRUD application.

---

# 1. PRODUCT VISION

### Product name

**Our Little World — Wedding Planner**

The name can be configured later, but use it as the working product identity.

### Core concept

Build a private, interactive wedding-planning application that combines:

1. A romantic, premium, interactive 3D world featuring two personalized chibi characters.
2. A functional wedding-planning dashboard.
3. Budget and expense management.
4. A wedding countdown and preparation timeline.
5. Vendor management and comparison.
6. A private memory gallery.
7. Shared tasks, notes, decisions, and progress.
8. Personalized romantic messages and delightful interactions.

The experience should make the couple feel happy and excited whenever they open the website, while making practical wedding-planning activities easier.

### Product principles

- Romantic but not childish.
- Premium but not excessively luxurious.
- Playful but not distracting.
- Visually rich but fast.
- Personal but privacy-conscious.
- Interactive but accessible.
- Beautiful on desktop and mobile.
- Functional, maintainable, secure, and testable.

The primary language of the interface should be **Bahasa Indonesia**, using warm, natural, affectionate wording where appropriate.

Avoid excessive emojis, generic AI-generated marketing copy, and repetitive decorative elements.

---

# 2. MANDATORY INITIAL AUDIT

Before modifying any code, inspect the existing repository.

Determine:

- Current Laravel version.
- PHP version and installed extensions.
- Whether the Laravel React Starter Kit is installed correctly.
- Inertia.js version.
- React and TypeScript versions.
- Tailwind CSS version.
- Whether shadcn/ui is configured.
- Existing routes, controllers, middleware, models, migrations, and seeders.
- Authentication implementation.
- Database configuration and migration status.
- Existing tests.
- Installed frontend and backend dependencies.
- Existing design system, components, and layouts.
- Whether `public/models/wedding_planner_chibi_couple.glb` exists.
- Whether Cloudinary credentials or integrations already exist.
- Existing documentation and project conventions.

Read `composer.json`, `package.json`, the route definitions, `.env.example`, relevant configuration files, and the existing source code before making architectural decisions.

Do not print or expose secrets from `.env`.

### Mandatory UI/UX skill

Find and read the installed `ui-ux-promax` skill before designing or implementing the interface.

Use the available skill discovery/read mechanism if necessary.

Apply its guidance to:

- Visual hierarchy.
- Layout and spacing.
- Typography.
- Color systems.
- Interaction design.
- Component consistency.
- Responsive design.
- Accessibility.
- Visual quality assurance.

Do not merely claim that the skill was used. Apply its guidance to the actual implementation.

### Existing project rules

- Continue using the existing project if it is valid.
- Do not recreate the project from scratch without a demonstrated technical necessity.
- Do not switch to Laravel Livewire.
- Do not create a separate Next.js application.
- Do not introduce an unnecessary standalone API architecture.
- Preserve existing working features unless a documented reason requires changing them.
- Avoid destructive commands, database resets, and file deletions unless explicitly justified and safely approved.
- Never overwrite the user's original assets without permission.

If something is unavailable, document it and continue with a safe, practical implementation.

---

# 3. REQUIRED TECHNOLOGY STACK

Use the following architecture.

## Backend

- Laravel.
- Laravel's built-in authentication from the React Starter Kit.
- PHP with strict validation and appropriate typing.
- PostgreSQL.
- Eloquent ORM.
- Laravel migrations, factories, and seeders.
- Laravel Policies and authorization middleware where appropriate.
- Form Requests for complex request validation.
- Pest for automated testing, if Pest was selected during project creation.

## Frontend

- Inertia.js.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Motion for React for interface animations.
- Lucide icons.
- React Three Fiber.
- Three.js.
- `@react-three/drei` where useful.
- Zod and React Hook Form when appropriate for complex forms, provided they integrate cleanly with the existing starter kit.

Use the versions compatible with the installed project. Do not blindly upgrade packages.

## Media storage

Use Cloudinary for user-uploaded photographs, videos, and supported audio assets.

PostgreSQL should store media metadata and Cloudinary identifiers, not the binary media itself.

## Architecture rule

Keep the frontend and backend in one Laravel repository.

Use Inertia.js for server-driven page navigation and data transfer. Use React for the interactive UI and 3D experience.

Do not duplicate business logic in the browser. Financial calculations, permissions, and sensitive operations must be enforced server-side.

---

# 4. DESIGN DIRECTION

## Visual identity

Use the supplied wedding-planner dashboard screenshot as the primary visual reference.

The desired design has:

- A soft ivory background.
- A restrained blush-pink and mint palette.
- Elegant editorial typography.
- Large, expressive serif headings.
- Small, legible supporting text.
- Rounded surfaces with subtle borders.
- Soft, natural shadows.
- Romantic miniature 3D environments.
- Beautiful photography and memory cards.
- Spacious layouts.
- Subtle decorative details.
- Clear navigation and practical information hierarchy.

The design should look carefully art-directed, not like a generic dashboard assembled from default component-library templates.

## Required color palette

Use these colors as the primary design tokens.

| Token | Hex | Intended usage |
|---|---|---|
| Coral Pink | `#F29191` | Primary actions, active states, important highlights |
| Soft Blush | `#F7ADAD` | Secondary surfaces, romantic accents |
| Pastel Aqua | `#B1E5E5` | Progress indicators, secondary accents |
| Mint Ice | `#CCFBFA` | Calm backgrounds and 3D environmental elements |
| Warm Ivory | `#FFF9F5` | Main page background and light surfaces |
| Deep Plum | `#49343D` | Primary text and strong contrast |

Additional neutral colors may be introduced for borders, disabled states, and readable secondary text, but the four supplied pastel colors must remain recognizable.

Create centralized design tokens rather than scattering arbitrary hexadecimal values throughout the application.

Use accessible contrast for text and controls. Do not use low-contrast pastel text for important information.

## Typography

Use an elegant serif family for large headings and a clean, readable sans-serif family for body text, forms, labels, and numerical information.

Use fonts that load reliably and support Indonesian characters.

Avoid excessive font sizes, decorative fonts in small text, and inconsistent type scales.

## Component styling

Use:

- Moderate corner radii.
- Consistent spacing.
- Clear hover, focus, pressed, disabled, and loading states.
- Subtle gradients only when useful.
- Soft shadows used selectively.
- Small decorative flourishes that support the wedding theme.

Avoid:

- Rainbow gradients.
- Excessive glassmorphism.
- Thick borders everywhere.
- Overly saturated colors.
- Excessive pill-shaped components.
- Repeating identical cards for every section.
- Large empty areas with no purpose.
- Generic admin-template styling.
- Animations that obstruct reading or form completion.

---

# 5. APPLICATION STRUCTURE

Implement a clear distinction between the public landing page and the authenticated private application.

## A. Landing page

Route: `/`

The landing page introduces the couple's wedding-planning world.

Include:

1. A premium hero section featuring the miniature 3D wedding world.
2. A romantic headline, such as:

   "Sedikit demi sedikit, menuju hari kita."

3. A short description explaining that the application helps the couple plan their future together.
4. A configurable wedding date and countdown preview when appropriate.
5. A clear login or access button.
6. A subtle preview of the application's planning features.
7. A warm, polished footer.

Do not expose private budgets, memories, uploaded media, or personal planning data on the public landing page.

If the application is intended to be completely private, keep the landing page informational and restrict access to private content behind authentication.

## B. Authenticated dashboard

Route: `/dashboard`

The dashboard is the main destination after login.

Implement the following visual structure.

### Header

Include:

- Greeting based on the authenticated user.
- Couple or application identity.
- Wedding countdown.
- A profile menu.
- Access to personal settings.
- A clear distinction between private and shared information.

Use a greeting such as "Hai, sayang!" only when appropriate to the configured application experience.

### Sidebar

Provide navigation for:

- Beranda.
- Anggaran.
- Timeline.
- Vendor.
- Kenangan.
- Tugas.
- Pengaturan.

Use consistent Lucide icons, restrained active states, and clear labels.

On mobile, convert the sidebar into a compact drawer or an appropriate mobile navigation pattern.

### Main hero: Our Little World

The hero should occupy the visual focus of the dashboard.

It should combine the 3D world, wedding countdown, romantic copy, and a primary action.

Suggested heading:

"Cerita kita, sedikit demi sedikit."

Suggested supporting text:

"Setiap rencana kecil, membawa kita lebih dekat ke hari yang paling kita tunggu."

Include:

- The interactive 3D wedding environment.
- The couple's characters.
- A live countdown.
- An action to continue planning.
- Subtle environmental animation.
- An appropriate loading state and fallback.

The hero must not consume the entire viewport at the expense of useful planning information.

### Planning cards

Below the hero, implement a thoughtful dashboard grid.

**Card 1 — Langkah Kita Berikutnya**

Display the next incomplete tasks, due dates, completion state, and links to complete them.

Suggested tasks:

- Tentukan tanggal dan konsep.
- Rencanakan anggaran awal.
- Cari dan bandingkan vendor.

These should be actual database-backed tasks, not permanent hardcoded examples.

**Card 2 — Anggaran Bersama**

Display:

- Total estimated budget.
- Total actual expenses.
- Amount remaining.
- Percentage of budget used.
- Category breakdown.
- A clear empty state when no budget has been entered.

Do not display fake financial values as real data.

**Card 3 — Cerita yang Sudah Kita Susun**

Display selected memory photographs, notes, and planning milestones.

Use actual user-uploaded content when available. When no content exists, display a designed empty state with a helpful action.

### Additional dashboard sections

Include:

- Upcoming milestones.
- Recently updated tasks.
- Recent shared decisions.
- Recent expenses.
- Recent memories.
- A personalized romantic note or message.

Keep the dashboard organized and avoid displaying every possible metric at once.

---

# 6. INTERACTIVE 3D WORLD

The 3D world is a central feature, not an optional decorative image.

Use React Three Fiber and Three.js, with `@react-three/drei` where appropriate.

## Character asset

The expected asset path is:

`public/models/wedding_planner_chibi_couple.glb`

The asset is an initial stylized static GLB prototype inspired by the supplied couple image.

The current file may contain separate named geometric parts but is not guaranteed to have a skeletal rig, animation clips, accurate facial reconstruction, or production-quality sculpting.

**Inspect the actual GLB before implementing character behavior. Do not assume animations or rigging exist.**

### Required initial integration

- Load the GLB with `useGLTF`.
- Use the correct public asset path.
- Center the model and position it appropriately.
- Configure camera, lighting, exposure, shadows, and environment.
- Preserve the supplied model's proportions and materials.
- Ensure both characters are visible and framed correctly.
- Avoid clipping, disappearing geometry, incorrect orientation, and excessive size.
- Provide a useful loading indicator.
- Provide a graceful fallback if the asset cannot load.
- Avoid unnecessary duplicate loading of the same model.

Do not substitute an unrelated stock character without explicit approval.

### Character fidelity

The characters should preserve the recognizable design of the supplied reference:

**Male character**
- Dark, wavy hair.
- Expressive chibi face.
- Light grey polo shirt.
- Dark trousers.
- Light sneakers.
- Small moustache.

**Female character**
- Pink hijab.
- Soft, expressive chibi face.
- Cream top.
- Pink skirt and matching lower garments.
- Light shoes.
- Optional handbag and small floral detail.

The current GLB is a prototype. If its geometry needs improvement, identify the specific limitations and provide a practical refinement plan.

Do not claim the model is photorealistic, fully rigged, or animated unless verified.

## 3D environment

Build a romantic miniature wedding environment inspired by the dashboard reference.

Potential elements:

- A floral wedding arch.
- A curved ivory pathway.
- Soft mint terrain.
- Pastel flowers and foliage.
- A small gazebo.
- Warm lanterns.
- Floating hearts or stars used sparingly.
- Soft clouds or a subtle sky background.
- Decorative miniature props.

The environment should complement the characters instead of overpowering them.

Keep the 3D scene visually cohesive, with a clear focal point and comfortable framing.

### Interaction requirements

Implement the following where practical:

1. **Pointer parallax:** the camera or environment responds subtly to pointer movement.
2. **Touch interaction:** mobile users can interact with the scene using touch.
3. **Hover feedback:** interactive objects respond to pointer hover.
4. **Clickable objects:** relevant objects can navigate to planning features.
5. **Gentle idle animation:** environmental movement continues without distracting the user.
6. **Milestone feedback:** completing tasks can trigger a restrained celebratory effect.
7. **Reduced-motion support:** respect the user's operating-system preference.
8. **Mobile fallback:** provide a simplified scene or static illustration when 3D is unsupported or too expensive to render.

Avoid excessive camera movement, aggressive particle effects, constant shaking, or controls that make the dashboard difficult to use.

### Clickable object mapping

Examples:

- Wedding arch → Timeline.
- Decorative calendar → Tasks and milestones.
- Memory photo frame → Kenangan.
- Budget-themed object → Anggaran.
- Gazebo or letterbox → Romantic notes or shared memories.

All interactive objects must have real actions. Do not add clickable objects that do nothing.

Use accessible alternative navigation so users do not need to interact with the 3D scene to reach essential features.

### Animation policy

The initial GLB may be static.

Do not fake full-body character animation by arbitrarily deforming the entire model or rotating individual mesh parts in ways that break the character.

Until a proper rigged model is available, animate the camera and environment, use subtle scene transitions, and provide restrained visual feedback.

If rigging is later added, support suitable idle, greeting, celebration, or interaction animations.

### Performance

- Lazy-load the 3D scene where appropriate.
- Use an error boundary.
- Avoid unnecessary React re-renders.
- Use efficient lighting and shadows.
- Avoid excessive geometry and particles.
- Respect device capability and reduced-motion preferences.
- Avoid forcing high-resolution rendering on mobile.
- Dispose of resources correctly when required.
- Ensure the rest of the dashboard remains usable if WebGL fails.

---

# 7. WEDDING COUNTDOWN

Implement a real countdown using the configured wedding date and time.

Requirements:

- Store the wedding date and time in the database.
- Provide timezone-aware handling.
- Display days, hours, minutes, and seconds where appropriate.
- Update the countdown without refreshing the page.
- Handle missing dates gracefully.
- Handle dates in the past gracefully.
- Avoid hardcoded values such as "730 days" in the actual application.
- Recalculate from the actual configured date rather than decrementing a stored counter.
- Allow authorized users to update the wedding date.

The countdown should remain correct across browser refreshes and sessions.

---

# 8. WEDDING PLANNING FEATURES

All features must be connected to real backend data and protected by authorization.

## A. Authentication and couple membership

Implement or adapt Laravel's existing authentication.

Support the intended private use case of two partners sharing one wedding plan.

Requirements:

- Login and logout.
- Registration according to the application's privacy model.
- Password reset when supported by the configured authentication system.
- User profile settings.
- A private couple or wedding-plan workspace.
- An invitation or membership mechanism if both partners need separate accounts.
- Shared data scoped to the correct couple.
- Clear authorization rules.

Do not assume that a logged-in user may access every other user's wedding data.

Do not expose invitation tokens or sensitive account details in public responses.

Avoid implementing teams support from the Laravel starter kit unless a genuine requirement justifies it. The intended model is a private couple workspace, not a multi-tenant team-management platform.

## B. Wedding settings

Provide settings for:

- Wedding title.
- Wedding date and time.
- Timezone.
- Couple display names.
- Optional profile images or avatars.
- Currency.
- Initial wedding budget.
- Wedding notes.
- Preferred wedding concept or theme.

Default currency should be Indonesian rupiah (IDR), but make the setting configurable.

## C. Budget management

Implement a proper budget and expense system.

### Budget categories

Provide configurable categories, with reasonable defaults such as:

- Venue.
- Catering.
- Dekorasi.
- Busana.
- Makeup.
- Photography & Video.
- Undangan.
- Hiburan.
- Transportasi.
- Souvenir.
- Dokumen dan administrasi.
- Lainnya.

Users must be able to create, edit, and remove categories where safe.

### Budget functionality

Implement:

- Initial budget.
- Estimated cost by category.
- Actual expenses.
- Payment status.
- Payment date.
- Vendor association where applicable.
- Expense notes.
- Receipts or supporting media where appropriate.
- Filtering and sorting.
- Budget summary.
- Remaining budget.
- Expense history.
- Empty states and validation errors.

### Financial integrity

Perform monetary calculations on the server using appropriate decimal database types and safe arithmetic.

Do not use binary floating-point arithmetic for authoritative financial calculations.

Clearly distinguish:

- Planned cost.
- Estimated cost.
- Actual expense.
- Paid amount.
- Outstanding amount.

Prevent invalid negative values where they are not meaningful.

Ensure the UI updates correctly after creating, editing, or deleting an expense.

## D. Timeline and tasks

Implement:

- Milestone creation.
- Task creation.
- Task editing.
- Task completion.
- Due dates.
- Priority.
- Status.
- Assignee.
- Notes.
- Related vendors or budget categories where useful.
- Filters for upcoming, overdue, completed, and all tasks.
- A timeline or calendar-oriented view.
- Sorting by date and priority.

Example milestones:

- Menentukan tanggal pernikahan.
- Menentukan konsep dan tema.
- Menyusun anggaran.
- Survei venue.
- Memilih vendor.
- Memesan busana.
- Mengirim undangan.
- Konfirmasi tamu.
- Finalisasi kebutuhan hari H.

These should be initial suggestions that users can edit, not mandatory fixed workflow steps.

## E. Vendor management

Implement a private vendor directory.

Each vendor can include:

- Vendor name.
- Category.
- Contact person.
- Phone number.
- Email.
- Website or social-media link.
- Address.
- Estimated price.
- Quoted price.
- Booking status.
- Payment status where appropriate.
- Rating or personal assessment.
- Notes.
- Photos or documents.
- Comparison status.

Support creating, viewing, editing, archiving, and deleting vendor records according to authorization rules.

Allow users to compare vendors by price, category, notes, and status.

Do not build a public vendor marketplace, public vendor profiles, or third-party vendor booking platform.

## F. Memories gallery

Implement a private gallery for:

- Photos.
- Short videos.
- Audio or voice notes where practical.
- Captions.
- Dates.
- Tags.
- Memory categories.
- Optional links to milestones or events.

Support upload, preview, metadata editing, and deletion.

Use Cloudinary for media storage and delivery.

Ensure media access follows the application's privacy requirements. A random URL or identifier must not be treated as sufficient authorization for private content.

## G. Romantic notes and messages

Implement a small private feature for messages between partners.

Potential features:

- Create a note.
- Mark a note as private to its author or shared with the couple.
- Set an optional reveal date.
- View notes that are currently available.
- Add a title and message.
- Mark a message as read if appropriate.

Do not accidentally reveal scheduled messages before their intended date.

Server-side authorization must enforce privacy and reveal-date rules.

## H. Notifications and activity

If practical, provide in-app notifications for:

- Upcoming deadlines.
- Overdue tasks.
- Newly shared notes.
- Updated plans.
- Important milestones.

An activity history may show meaningful shared changes, but do not expose sensitive information unnecessarily.

Avoid building an elaborate notification infrastructure before the core application is stable.

---

# 9. DATABASE DESIGN

Design a normalized and maintainable PostgreSQL schema that supports the features above.

Potential entities include:

- users.
- couples or wedding_plans.
- couple_memberships.
- wedding_settings.
- budget_categories.
- budgets.
- expenses.
- vendors.
- vendor_quotes or vendor_comparisons where useful.
- tasks.
- milestones.
- memories.
- media_assets.
- romantic_notes.
- notifications.
- activity_logs.

You may adapt names and relationships to fit the existing repository. Do not create unnecessary tables merely to follow this list literally.

### Database requirements

- Correct foreign keys.
- Appropriate indexes.
- Unique constraints where needed.
- Correct decimal precision for money.
- Timestamps.
- Soft deletes where justified.
- Consistent naming.
- Database-level integrity for important relationships.
- Appropriate cascading behavior.
- Efficient queries and pagination.

Use migrations, factories, and seeders.

Do not rely on client-side state as the authoritative source of persisted data.

### Seed data

Provide tasteful, clearly identifiable demo data for local development if useful.

Examples:

- Sample wedding tasks.
- Sample budget categories.
- Example milestones.
- A few example vendors.
- Example memory records without exposing private real information.

Seeded values must be explicitly recognizable as demo data. Production users must not see fabricated real expenses or personal memories.

Do not require demo data to exist for the application to function.

---

# 10. CLOUDINARY INTEGRATION

Use Cloudinary for photographs, videos, and supported audio uploads.

## Configuration

Use environment variables:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Update `.env.example` with placeholder values only.

Never commit real credentials or expose the API secret to the frontend.

If the project already has an established Cloudinary integration, audit and reuse it where appropriate.

## Upload architecture

Use a secure upload approach appropriate to the existing stack.

Where direct browser-to-Cloudinary uploads are used:

1. Authenticate and authorize the user.
2. Validate the requested asset type, size, and intended folder.
3. Generate a signed upload authorization on the server.
4. Keep the Cloudinary API secret server-side.
5. Restrict permitted resource types and upload parameters.
6. Verify the resulting asset metadata where necessary.
7. Persist the Cloudinary public ID, resource type, format, dimensions, file size, and relevant ownership information.
8. Return only the information required by the client.

For server-mediated uploads, enforce the same authorization and validation requirements.

## Privacy

For private memories or documents:

- Choose an appropriate private-delivery strategy.
- Do not rely on unpredictable URLs as the only security control.
- Authorize access to the database record.
- Use signed delivery URLs or other appropriate access controls when necessary.
- Avoid logging signed URLs or secrets unnecessarily.
- Delete the Cloudinary asset when appropriate and authorized.
- Handle database and Cloudinary failures consistently.

## Validation

Validate:

- Allowed file types.
- File size.
- Resource type.
- User ownership.
- Upload destination.
- Metadata.
- Authorization.

Do not trust browser-provided MIME types or public IDs without verification.

Provide clear error states for failed uploads.

The application must remain usable when Cloudinary is not yet configured in local development.

Document which environment variables are required for full media functionality.

---

# 11. FRONTEND ARCHITECTURE AND CODE QUALITY

Follow the existing Laravel React Starter Kit conventions.

Organize the application into understandable modules.

Potential frontend organization:

- `resources/js/pages/`
- `resources/js/components/`
- `resources/js/layouts/`
- `resources/js/hooks/`
- `resources/js/types/`
- `resources/js/lib/`
- `resources/js/components/three/`

Adapt to the actual repository rather than forcing this exact structure if it already has a good convention.

### Component responsibilities

Separate:

- Dashboard layout.
- Sidebar and header.
- Countdown.
- 3D world.
- Budget widgets.
- Task list.
- Vendor comparison.
- Memory gallery.
- Forms.
- Dialogs.
- Loading states.
- Empty states.
- Error states.

Keep reusable UI components reusable.

Avoid:

- Giant components containing the entire application.
- Duplicated business logic.
- `any` types used to silence TypeScript errors.
- Excessive prop drilling.
- Unnecessary global state.
- Direct database access from the frontend.
- Hardcoded user-specific information.
- Fake interactivity.
- Dead buttons.
- Placeholder links that lead nowhere.
- Unnecessary dependencies.

Use strict TypeScript types for important data structures.

Use server-side validation as the authority for submitted data.

Use Inertia form patterns or the existing starter-kit conventions wherever appropriate.

---

# 12. ACCESSIBILITY AND RESPONSIVE DESIGN

Support desktop, tablet, and mobile.

### Desktop

- Use the premium sidebar and editorial dashboard composition.
- Give the 3D hero adequate space.
- Keep essential planning information visible.
- Use an intentional grid.

### Tablet

- Reduce unnecessary columns.
- Maintain readable typography.
- Keep navigation accessible.
- Reduce the visual complexity of the 3D scene where appropriate.

### Mobile

- Use a compact navigation pattern.
- Stack dashboard sections.
- Avoid horizontal overflow.
- Make forms and actions touch-friendly.
- Scale or simplify the 3D environment.
- Keep the countdown legible.
- Do not require hover to reveal essential actions.
- Provide accessible alternatives to 3D-only interactions.

### Accessibility

- Use semantic HTML.
- Provide visible keyboard focus.
- Label form fields.
- Associate validation messages with inputs.
- Support keyboard navigation.
- Provide accessible dialog behavior.
- Use appropriate text contrast.
- Respect reduced-motion preferences.
- Avoid communicating status through color alone.
- Provide text alternatives for meaningful images.
- Keep animations from blocking interactions.

---

# 13. SECURITY REQUIREMENTS

Treat this application as a private application containing personal and financial information.

Implement:

- Server-side authorization for every protected resource.
- Request validation.
- CSRF protection through the framework's standard mechanisms.
- Safe authentication and session handling.
- Secure file-upload validation.
- Rate limiting for sensitive endpoints where appropriate.
- Safe error handling.
- Protection against mass assignment.
- Protection against insecure direct object references.
- Proper ownership checks.
- Safe external-link handling.
- Appropriate output escaping.
- No secrets committed to source control.
- No sensitive data in client-side bundles.
- No private information exposed in public routes.

A user must not be able to access another couple's expenses, vendors, memories, tasks, or notes by changing a URL or request parameter.

Test authorization boundaries explicitly.

Do not disable security middleware to make development easier.

Do not use destructive production database commands.

Document any security-sensitive assumptions.

---

# 14. PERFORMANCE AND RELIABILITY

The application should feel fast even with a visually rich hero.

Requirements:

- Optimize queries and prevent N+1 problems.
- Paginate larger lists.
- Avoid unnecessarily fetching all memories or expenses at once.
- Use appropriate indexes.
- Lazy-load nonessential media.
- Use image transformations and responsive image delivery where supported.
- Optimize 3D loading.
- Avoid blocking the entire page while the 3D scene loads.
- Avoid excessive animations and React re-renders.
- Provide clear loading, error, and empty states.
- Handle network failures gracefully.
- Ensure essential planning features work without WebGL.
- Keep frontend and backend errors observable during development without exposing secrets to end users.

Use caching only where it provides a measurable benefit and respects private-data boundaries.

---

# 15. TESTING AND QUALITY ASSURANCE

Write and run automated tests appropriate to the existing project.

## Backend tests

Cover:

- Authentication.
- Couple workspace membership.
- Authorization.
- Budget calculations.
- Expense creation and updates.
- Task creation and completion.
- Milestone management.
- Vendor CRUD operations.
- Memory metadata.
- Upload authorization.
- Romantic-note privacy and reveal dates.
- Validation errors.
- Cross-couple access prevention.

Use factories and isolated test data.

Do not require real Cloudinary credentials for ordinary automated tests. Mock external services where appropriate.

## Frontend checks

Run the available project checks, including:

- TypeScript checking where configured.
- ESLint or the existing linting command.
- Production frontend build.
- Relevant component tests where practical.
- Tests for key interactive behaviors.

## Manual/browser verification

Where a browser automation tool is available, verify:

1. Landing page loads.
2. Authentication works.
3. Dashboard loads.
4. Countdown handles the configured wedding date.
5. Navigation works.
6. Forms validate correctly.
7. Budget values update after changes.
8. Tasks can be completed.
9. Vendors can be managed.
10. Memory uploads handle success and failure.
11. The GLB loads correctly.
12. 3D interactions work.
13. Mobile layout has no horizontal overflow.
14. Reduced-motion behavior is respected.
15. Unauthorized access is rejected.

Do not claim a test passed unless it was actually run and the result was observed.

If a check cannot be run, explain why.

---

# 16. DEPENDENCY AND VULNERABILITY MANAGEMENT

The project may initially report npm dependency vulnerabilities.

Audit the actual dependencies and determine which advisories apply to the installed versions.

Requirements:

- Inspect `npm audit` results.
- Distinguish direct from transitive dependencies.
- Review severity and exploitability.
- Prefer compatible targeted updates.
- Check Laravel, PHP, and Composer dependencies where appropriate.
- Do not blindly execute `npm audit fix --force`.
- Do not upgrade the entire stack unnecessarily.
- Do not suppress vulnerability reports without justification.
- Re-run build and tests after dependency changes.

Report unresolved high- or critical-severity issues and the reasons they remain unresolved.

---

# 17. ENVIRONMENT AND DEVELOPER EXPERIENCE

Ensure the project is straightforward to run locally on macOS.

Document:

- Required PHP version.
- Required Composer version.
- Required Node.js and npm versions.
- PostgreSQL setup.
- Environment configuration.
- Database creation.
- Migrations and seeders.
- Cloudinary setup.
- Frontend dependencies.
- Local development command.
- Production build command.
- Test commands.
- Troubleshooting.

Use the existing Laravel project configuration.

Typical environment variables include:

```dotenv
APP_NAME="Our Little World"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=wedding_planner
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Use the application's existing environment conventions and avoid overwriting working local settings.

Do not invent real credentials.

Do not print secrets in logs or documentation.

Provide clear instructions for creating the local database and running migrations.

---

# 18. IMPLEMENTATION WORKFLOW

Work autonomously through the following phases.

## Phase 1 — Audit

- Inspect the repository.
- Read the `ui-ux-promax` skill.
- Identify existing functionality.
- Identify missing dependencies and configuration.
- Check the GLB asset.
- Create a concise implementation plan.
- Record risks and assumptions.

Do not stop after presenting the plan.

## Phase 2 — Foundation

- Confirm Laravel, Inertia, React, TypeScript, and Tailwind integration.
- Establish or refine design tokens.
- Set up shared layout components.
- Establish route and authorization conventions.
- Design the core database relationships.
- Add or adapt migrations and models.

## Phase 3 — Design system and landing page

- Implement typography and color tokens.
- Build the main layout.
- Build responsive navigation.
- Implement the landing page.
- Establish shared UI components.
- Verify the visual direction against the supplied reference.

## Phase 4 — Interactive 3D experience

- Inspect the GLB.
- Integrate the model.
- Create the initial miniature environment.
- Implement pointer and touch interaction.
- Add loading and fallback states.
- Optimize the scene.
- Verify compatibility with React Three Fiber.

## Phase 5 — Functional dashboard

Implement real functionality for:

- Countdown.
- Budget.
- Expenses.
- Tasks.
- Timeline.
- Vendors.
- Memories.
- Romantic notes.
- Couple settings.

Use real persistence and authorization.

## Phase 6 — Cloudinary

- Implement secure media upload.
- Persist media metadata.
- Implement appropriate private delivery.
- Add upload error handling.
- Document environment configuration.

## Phase 7 — QA and hardening

- Run automated tests.
- Run type checks.
- Run linting.
- Run the production build.
- Test authorization.
- Test the 3D experience.
- Test mobile layouts.
- Review dependency vulnerabilities.
- Fix verified issues.

## Phase 8 — Documentation and handoff

Create or update:

- `README.md`
- `.env.example`
- Database and architecture documentation.
- Cloudinary setup documentation.
- Testing instructions.
- 3D asset integration notes.
- A summary of implemented features.
- A list of unresolved issues and next steps.

Keep documentation accurate to the actual implementation.

---

# 19. DEFINITION OF DONE

The project is not complete merely because the dashboard looks attractive.

The implementation is complete when the following conditions have been met, or when any remaining limitations have been explicitly documented.

### Application

- [ ] Laravel project runs successfully.
- [ ] Authentication is functional.
- [ ] Private application routes are protected.
- [ ] Landing page and dashboard render correctly.
- [ ] Shared layout and navigation work.
- [ ] Database migrations run successfully.
- [ ] Core planning features persist data.
- [ ] Empty states and validation errors work.
- [ ] Couple-level authorization is tested.

### Design

- [ ] Supplied pastel palette is implemented consistently.
- [ ] The interface follows the intended romantic editorial direction.
- [ ] Typography and spacing are consistent.
- [ ] The design works on desktop and mobile.
- [ ] No major horizontal overflow exists.
- [ ] Important actions have clear feedback.
- [ ] Reduced-motion and accessibility requirements are addressed.

### 3D

- [ ] The supplied GLB is integrated or a precise blocker is documented.
- [ ] Both characters are framed correctly.
- [ ] The environment is visually coherent.
- [ ] The scene loads with a useful loading state.
- [ ] Interaction works on supported desktop and mobile devices.
- [ ] A fallback exists when WebGL is unavailable.
- [ ] No unsupported claims are made about rigging or animations.

### Data and security

- [ ] Budget calculations are correct.
- [ ] User input is validated.
- [ ] Unauthorized cross-couple access is prevented.
- [ ] Private media is handled appropriately.
- [ ] Cloudinary secrets remain server-side.
- [ ] Important security boundaries have tests.

### Engineering

- [ ] Relevant tests pass.
- [ ] Type checks pass where configured.
- [ ] Linting passes where configured.
- [ ] Production build passes.
- [ ] Dependency vulnerabilities are reviewed.
- [ ] Setup instructions are accurate.
- [ ] Remaining limitations are documented.

---

# 20. FINAL AGENT BEHAVIOR

Follow these rules throughout the task.

1. **Implement, do not merely advise.** Make actual repository changes.
2. Inspect before editing.
3. Follow the existing architecture unless there is a concrete reason to change it.
4. Use the `ui-ux-promax` skill before designing the interface.
5. Preserve the supplied visual reference and four-color palette.
6. Preserve the supplied couple-character asset.
7. Do not assume the GLB is rigged or animated.
8. Do not invent functionality, test results, or successful deployments.
9. Do not use fake financial information as real user data.
10. Do not leave important buttons nonfunctional.
11. Do not sacrifice accessibility for visual effects.
12. Do not sacrifice core application usability for the 3D experience.
13. Do not perform destructive operations without justification and safeguards.
14. Do not expose private data or credentials.
15. Use maintainable code and appropriate tests.
16. If an external service is not configured, implement the integration safely and document what configuration is required.
17. If a feature cannot be completed, state the exact blocker and provide the best safe partial implementation.
18. Do not stop after generating the landing page; implement the core planning workflows.
19. Do not claim the Definition of Done has been met unless the relevant checks were actually completed.
20. At the end, provide a concise but precise implementation report.

The final report must contain:

- Summary of what was implemented.
- Main files and modules created or modified.
- Database migrations added.
- Routes and features implemented.
- 3D asset integration status.
- Cloudinary integration status.
- Commands and checks executed.
- Test, lint, type-check, and build results.
- Security or dependency issues discovered.
- Required environment variables.
- Exact steps to run the application locally.
- Features or issues still outstanding.

## FINAL GOAL

Deliver a beautiful, intimate, interactive, and technically sound wedding-planning application that feels like **a small digital world belonging to two people**.

The 3D world should create delight. The planning tools should create clarity. The engineering should make the product reliable.

Prioritize a cohesive, high-quality implementation over unnecessary complexity. Begin by auditing the existing repository, then proceed through implementation and verification without stopping at the planning stage.
