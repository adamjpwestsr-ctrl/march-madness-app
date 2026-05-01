interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
