/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Cores de logs
    'text-cyan-400', 'text-green-400', 'text-red-400', 'text-yellow-400', 'text-purple-400', 'text-gray-300',
    // Pills e backgrounds com alpha
    'bg-slate-900/95', 'bg-slate-900/80', 'bg-slate-900/70',
    'bg-slate-800/80', 'bg-slate-800/70',
    // Rings translúcidos
    'ring-blue-400/30', 'ring-purple-400/30', 'ring-emerald-400/30', 'ring-orange-400/30', 'ring-red-400/30', 'ring-slate-600/40', 'ring-green-500/40', 'ring-slate-500/30',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
