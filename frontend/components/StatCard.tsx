import Link from "next/link";

interface StatCardProps {
  title: string;
  value: number;
  href: string;
  thresholdGreen?: number;   // 0 or below → green
  thresholdYellow?: number; // between → yellow
  className?: string;
}

export default function StatCard({
  title,
  value,
  href,
  thresholdGreen = 0,
  thresholdYellow = 10,
  className = "",
}: StatCardProps) {
  const bgColor =
    value <= thresholdGreen
      ? "bg-green-200"
      : value <= thresholdYellow
      ? "bg-yellow-200"
      : "bg-red-200";

  return (
    <Link href={href} className={`card p-6 shadow hover:shadow-lg transition ${bgColor} ${className}`}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </Link>
  );
}
