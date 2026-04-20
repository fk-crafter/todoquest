import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: StatCardProps) {
  return (
    <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-3 border border-gray-600">
      <div className={`p-2 bg-gray-800 rounded ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 uppercase">{label}</p>
        <p className="font-bold text-lg">{value}</p>
      </div>
    </div>
  );
}
