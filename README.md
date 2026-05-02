# 🌿 GreenPick — Nursery Management App

A modern, lightweight nursery management web application built with React and Supabase. GreenPick helps nursery staff manage plant inventory, generate reports, and streamline day-to-day operations.

**Live Demo:** [ssd-nursery.vercel.app](https://ssd-nursery.vercel.app)

---

## ✨ Features

- 🌱 **Plant Inventory Management** — Browse, add, and manage nursery plant stock
- 📄 **PDF Export** — Generate printable reports via jsPDF + html2canvas
- 📊 **Excel Export** — Export data to `.xlsx` for record keeping
- ☁️ **Supabase Backend** — Real-time database and authentication
- 🗃️ **State Management** — Powered by Zustand for fast, reactive UI
- 🌐 **Routing** — Multi-page navigation with React Router DOM
- 🌱 **Seed Script** — Populate the database with initial plant data via `npm run seed`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router DOM |
| Styling | Tailwind CSS |
| Build Tool | Vite |
| Backend/DB | Supabase |
| State | Zustand |
| PDF Export | jsPDF, html2canvas |
| Excel Export | xlsx |
| Icons | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- A [Supabase](https://supabase.com) project

### Installation

```bash
# Clone the repository
git clone https://github.com/00-Darshan/ssd-nursery.git
cd ssd-nursery

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the App

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Seed the Database

To populate Supabase with initial plant data:

```bash
npm run seed
```

---

## 📁 Project Structure

```
ssd-nursery/
├── public/
│   └── images/          # Static assets
├── scripts/
│   └── seedPlants.js    # Database seeding script
├── src/                 # React source code
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🌐 Deployment

This project is deployed on **Vercel**. To deploy your own instance:

1. Push your fork to GitHub
2. Import the repository on [vercel.com](https://vercel.com)
3. Add your Supabase environment variables in the Vercel dashboard
4. Deploy

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> Built by [Darshan Gowda V](https://github.com/00-Darshan)
