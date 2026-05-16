import { Stats } from "../types";

interface Props {
  stats: Stats;
  connected: boolean;
}

export default function StatsBar({ stats, connected }: Props) {
  return (
    <div className="flex items-center gap-4 px-5 py-2 border-b border-gray-100 bg-white text-xs text-gray-500">
      <span className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
        {connected ? "Connected" : "Offline"}
      </span>
      <span className="text-gray-300">·</span>
      <span><span className="text-gray-700 font-medium">{stats.totalUsers}</span> total users</span>
      <span className="text-gray-300">·</span>
      <span><span className="text-gray-700 font-medium">{stats.totalMessages}</span> messages</span>
    </div>
  );
}