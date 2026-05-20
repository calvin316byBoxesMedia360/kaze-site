# SYSTEM_CONTRACT.md - Core Agent Rules & Guidelines

## 1. Aesthetics & UI
- **Premium Design**: Always maintain the premium KAZE brand guidelines. Avoid basic UI.
- **Glassmorphism & Depth**: Use backdrop filters, layered elements, and smooth box-shadows to simulate depth.
- **Dark Mode Default**: Prefer dark themes (`[data-theme="dark"]` or `[data-theme="midnight"]`) unless otherwise specified.
- **Animations**: Implement subtle micro-animations on hover, scroll, or interactions to give the site a dynamic feel.

## 2. Localization & Content
- **Bilingual Content**: The target audience is bilingual (ES/EN). Every new text added to the interface MUST be translated in the corresponding dictionary within the app or translation logic.
- **Microcopy**: Avoid redundancies. Ensure copywriting sounds confident, professional, and close to the local community ("ningún proyecto es pequeño, ningún cliente es solo un número").

## 3. Tooling & Environments
- **Respect Historical Versions**: Never override the historical MVP directories (`kaze-site-local` or older servers) without user consent.
- **Deployments**: Vercel is the primary deployment environment. Always deploy changes with `vercel --prod` to ensure live verification.
- **Native Tools**: Always prefer specific agent tools (`view_file`, `write_to_file`, `replace_file_content`) over bash commands like `cat`, `sed`, or `grep`.

## 4. Workflows
- **Memory File**: Read `MEMORY.md` at the start of any new session.
- **Documentation**: After significant milestones, update documentation (`INFORME_PROYECTO_KAZE.html` and `MEMORY.md`).
- **Remotion**: Always suggest the creation of a Remotion presentation video after a major project milestone. The user can invoke it by saying: `"genera presentacion remotion"`.
