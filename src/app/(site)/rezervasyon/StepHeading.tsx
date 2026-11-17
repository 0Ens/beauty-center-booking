/** "① İşlem seçin" başlığı. Hook kullanmadığı için hem sunucu hem tarayıcı bileşenlerinde kullanılabilir. */
export default function StepHeading({ n, title, as: Tag = "h2" }: { n: number; title: string; as?: "h2" | "legend" }) {
  return (
    <Tag className="mb-4 flex items-center gap-3 font-serif text-2xl font-semibold">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-700 font-sans text-sm text-white">
        {n}
      </span>
      {title}
    </Tag>
  );
}
