# 📝 Markdown App - Project Roadmap (Frontend Focused)

## 🎯 Goal
Build a markdown editor + preview app in React to practice:
- State management
- Component structure
- UI design
- Markdown rendering

No backend required → simulate persistence with `localStorage`.

---

## ✅ Level 1: Basics (MVP)
- [ ] Setup React project (Vite or CRA)
- [ ] Install `react-markdown`
- [ ] Add textarea for markdown input
- [ ] Render markdown preview side-by-side
- [ ] Basic styling with Tailwind (split screen, padding, borders)

**Guidance:**  
Focus on **state management** (`useState`) and component structure.  
At this stage, your app = simple editor + live preview.

---

## ✅ Level 2: Core Features
- [ ] Add layout toggle → "Write | Preview | Split"
- [ ] Dark mode toggle
- [ ] Use `remark-gfm` plugin for GitHub-style markdown (tables, task lists, strikethrough)
- [ ] Add syntax highlighting for code blocks (using `react-syntax-highlighter` or `prism-react-renderer`)

**Guidance:**  
Practice conditional rendering and passing props.  
Dark mode = good exercise in theme management.

---

## ✅ Level 3: Toolbar & Formatting
- [ ] Add toolbar with buttons: Bold, Italic, Headers, Code
- [ ] Make toolbar insert markdown syntax into textarea
- [ ] Add keyboard shortcuts (Ctrl+B, Ctrl+I) for formatting (optional)

**Guidance:**  
Good practice for working with **cursor positions** and string manipulation in React.

---

## ✅ Level 4: Persistence & Notes
- [ ] Save current note to `localStorage` (auto-save on change)
- [ ] Load note from `localStorage` on refresh
- [ ] Add support for multiple notes with a sidebar (bonus)

**Guidance:**  
Simulates "storage" without backend.  
Sidebar helps you practice managing **lists of data** in React.

---

## ✅ Level 5: Advanced Features (Optional)
- [ ] Export note as `.md` or `.html`
- [ ] Drag-and-drop image support (base64 preview only)
- [ ] Word count & character count
- [ ] Fullscreen writing mode (distraction-free)

**Guidance:**  
These are polish features. Add them only after core features are stable.

---

## 🛠️ Libraries to Explore
- Rendering: `react-markdown`, `remark-gfm`, `remark-emoji`
- Editing (if you want prebuilt): `@uiw/react-md-editor`, `react-simplemde-editor`
- Syntax highlighting: `react-syntax-highlighter`, `prism-react-renderer`
- UI: Tailwind CSS, Shadcn/UI, Radix UI

---

## ⚖️ Build From Scratch vs Prebuilt
- **From Scratch** → Better React practice (you build toolbar, formatting logic, etc.)
- **Prebuilt (e.g., `react-md-editor`)** → Faster, polished UI, but less React challenge

Recommendation: **Start from scratch, then try a prebuilt editor to compare.**

---

## 🚀 Final Milestone
Have a working **mini Obsidian/Notion-like markdown app**:
- Editor + Preview
- Toolbar
- Dark mode
- Persistence via localStorage
- Syntax highlighting
- Optional advanced features

