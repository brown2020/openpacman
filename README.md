# OpenPacman 🎮

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-blue.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-blue.svg)](https://tailwindcss.com/)

A modern, open-source implementation of the classic Pac-Man game built with Next.js, TypeScript, and TailwindCSS. Play it now at [openpacman.vercel.app](https://openpacman.vercel.app/)!

![OpenPacman Screenshot](public/screenshot.png)

## 🎮 Features

- 🕹️ Classic Pac-Man gameplay mechanics
- 🎵 Web Audio API sound effects
- 📱 Responsive design with touch controls for mobile
- 🏆 Local high score system
- 🎨 Clean, modern UI with TailwindCSS
- 👾 Multiple ghost behaviors and AI patterns
- 🔄 Multiple levels with increasing difficulty
- ⌨️ Keyboard and touch controls
- 🎨 Smooth animations and transitions

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/brown2020/openpacman.git
cd openpacman
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎮 How to Play

- Use arrow keys to move Pac-Man
- Eat all dots to complete the level
- Avoid ghosts
- Touch controls available on mobile devices
- Collect power pellets to turn the tables on ghosts
- Complete all levels to win!

## 🛠️ Tech Stack

- [Next.js 14](https://nextjs.org/) - React Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - Sound Effects
- [Vercel](https://vercel.com/) - Deployment

## 🏗️ Project Structure

```
openpacman/
├── src/
│   ├── components/     # React components
│   │   ├── GameBoard.tsx
│   │   ├── Ghost.tsx
│   │   ├── Pacman.tsx
│   │   ├── PacmanGame.tsx
│   │   └── StartScreen.tsx
│   ├── constants/     # Game constants
│   ├── levels/        # Level definitions
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── public/           # Static assets
└── styles/          # Global styles
```

## 🎮 Game Mechanics

### Ghost Behavior

- Ghosts use different AI patterns to chase Pac-Man
- Each ghost has unique movement characteristics
- Ghost speed increases with each level

### Scoring System

- Dots: 10 points
- Power Pellets: 50 points
- Ghosts: 200 points
- Bonus points for completing levels

## 🔜 Roadmap

- [ ] Add power pellets
- [ ] Implement fruit bonuses
- [ ] Add ghost vulnerability states
- [ ] Create more levels
- [ ] Add sound effects for all actions
- [ ] Implement global high score system
- [ ] Add customizable mazes
- [ ] Create level editor

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

Stephen Brown - [info@ignitechannel.com](mailto:info@ignitechannel.com)

Website: [https://ignite.me](https://ignite.me)

Project Link: [https://github.com/brown2020/openpacman](https://github.com/brown2020/openpacman)

Live Demo: [https://openpacman.vercel.app/](https://openpacman.vercel.app/)

## 🙏 Acknowledgments

- Original Pac-Man game by Namco
- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- Inspired by the classic arcade gaming era
