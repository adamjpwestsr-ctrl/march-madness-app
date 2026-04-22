export default function TopNav() {
  return (
    <nav
      className="
        fixed top-0 left-0 w-full z-50
        bg-black/20 backdrop-blur-xl
        border-b border-white/5
        fade-in-soft
      "
    >
      <div className="max-w-5xl mx-auto px-6 sm:px-10 h-14 flex items-center justify-between">
        
        {/* LEFT — LOGO + WORDMARK */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
            {/* Simple BB Logo */}
            <span className="text-emerald-300 font-bold text-sm tracking-tight">
              BB
            </span>
          </div>

          <span className="text-white font-semibold tracking-wide text-sm sm:text-base">
            BracketBoss
          </span>
        </div>

        {/* RIGHT — Reserved for future avatar */}
        <div className="h-8 w-8"></div>
      </div>
    </nav>
  );
}
