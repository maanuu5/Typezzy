<p align="center">
  <h1 align="center">typezzy</h1>
  <p align="center">A clean, minimal typing speed test built for focus and flow.</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
</p>

---

## Features

| Feature | Description |
|---------|-------------|
| **Timed Tests** | Choose between 15 s, 30 s, 60 s, or 120 s sessions |
| **Live Stats** | Real-time WPM, accuracy, and countdown while you type |
| **Interactive Keyboard** | On-screen keyboard that highlights every keypress |
| **WPM Graph** | Post-test SVG chart with color-coded error segments and hover tooltips |
| **Detailed Results** | WPM, accuracy, raw speed, and consistency score on a polished results screen |
| **Keystroke Sounds** | Optional mechanical keyboard audio feedback (toggle on/off) |
| **Share on X** | One-click share your score to X (Twitter) |
| **Smooth Transitions** | Fade animations between typing, results, and reset states |
| **Fully Responsive** | Works on any screen size with a dark, distraction-free UI |

---

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org/) (App Router)
- **UI** — [React 19](https://react.dev/) with the React Compiler enabled
- **Styling** — [Tailwind CSS 4](https://tailwindcss.com/) via PostCSS
- **Language** — [TypeScript 5](https://www.typescriptlang.org/)
- **Icons** — [Tabler Icons](https://tabler.io/icons) (React)
- **Utilities** — [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge)

---

## Project Structure

```
typezzy/
├── public/
│   └── sounds/
│       └── sound.ogg          # Keystroke audio
├── src/
│   ├── app/
│   │   ├── globals.css        # Global styles & Tailwind imports
│   │   ├── layout.tsx         # Root layout (metadata, fonts)
│   │   └── page.tsx           # Home page — renders <TypingTest />
│   ├── components/
│   │   ├── typing-test.tsx    # Core typing test logic & UI
│   │   └── ui/
│   │       └── keyboard.tsx   # Interactive on-screen keyboard
│   └── lib/
│       └── utils.ts           # Shared utility functions (cn, etc.)
├── eslint.config.mjs
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| **Node.js** | 18.18 or later ([download](https://nodejs.org/)) |
| **npm** | Comes with Node.js (or use **pnpm** / **yarn**) |
| **Git** | Any recent version ([download](https://git-scm.com/)) |

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/typezzy.git
cd typezzy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser — the app hot-reloads on every save.

### 4. Build for production (optional)

```bash
npm run build
npm start
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Create an optimized production build |
| `npm start` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## Contributing

Contributions are welcome! Whether it's a bug fix, new feature, or UI improvement — all help is appreciated.

### Setup for Contributors

1. **Fork** this repository (click the Fork button at the top right).

2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/<your-username>/typezzy.git
   cd typezzy
   ```

3. **Create a new branch** for your change:

   ```bash
   git checkout -b feat/your-feature-name
   ```

   Use a descriptive branch name:
   - `feat/...` for new features
   - `fix/...` for bug fixes
   - `docs/...` for documentation changes
   - `refactor/...` for code refactors

4. **Install dependencies:**

   ```bash
   npm install
   ```

5. **Run the dev server** and verify everything works:

   ```bash
   npm run dev
   ```

6. **Make your changes.** Keep commits small and focused.

7. **Lint your code** before committing:

   ```bash
   npm run lint
   ```

8. **Build** to make sure nothing is broken:

   ```bash
   npm run build
   ```

9. **Commit** with a clear message:

   ```bash
   git add .
   git commit -m "feat: add dark mode toggle"
   ```

10. **Push** your branch and open a Pull Request:

    ```bash
    git push origin feat/your-feature-name
    ```

    Then go to the original repo and click **"Compare & pull request"**.

### Contribution Guidelines

- **One feature per PR** — keep pull requests focused and reviewable.
- **No unnecessary dependencies** — keep the bundle light.
- **Follow existing code style** — TypeScript, functional components, Tailwind utility classes.
- **Test in the browser** — make sure the typing test works end-to-end before submitting.
- **Write clear PR descriptions** — explain *what* you changed and *why*.

---

## License

This project is open source and available under the [MIT License](LICENSE).
