type Props = { children: string; className?: string };

export default function SectionEyebrow({ children, className = "" }: Props) {
  return (
    <p className={`text-eyebrow mb-2 ${className}`}>{children}</p>
  );
}
