"use client";

interface ShareButtonsProps {
  url: string;
  text: string;
}

export default function ShareButtons({ url, text }: ShareButtonsProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-8">

      {/* Copy Link */}
      <button
        onClick={() => navigator.clipboard.writeText(url)}
        className="
          px-6 py-3 rounded-xl bg-slate-800 text-white
          border border-slate-700 hover:border-emerald-500
          shadow-[0_0_15px_rgba(16,185,129,0.7)]
        "
      >
        Copy Link
      </button>

      {/* SMS */}
      <a
        href={`sms:?body=${encodeURIComponent(text + " " + url)}`}
        className="
          px-6 py-3 rounded-xl bg-slate-800 text-white
          border border-slate-700 hover:border-cyan-500
          shadow-[0_0_15px_rgba(34,211,238,0.7)]
        "
      >
        Text
      </a>

      {/* Email */}
      <a
        href={`mailto:?subject=Trivia Score&body=${encodeURIComponent(
          text + " " + url
        )}`}
        className="
          px-6 py-3 rounded-xl bg-slate-800 text-white
          border border-slate-700 hover:border-purple-500
          shadow-[0_0_15px_rgba(168,85,247,0.7)]
        "
      >
        Email
      </a>

      {/* Social */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text + " " + url
        )}`}
        target="_blank"
        className="
          px-6 py-3 rounded-xl bg-slate-800 text-white
          border border-slate-700 hover:border-yellow-500
          shadow-[0_0_15px_rgba(234,179,8,0.7)]
        "
      >
        Tweet
      </a>
    </div>
  );
}
