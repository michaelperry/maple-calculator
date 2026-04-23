interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (current / total) * 100));
  return (
    <div className="w-full space-y-2">
      <p className="text-sm text-maple-dark/60 font-body">
        {current} of {total}
      </p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-maple-dark/10">
        <div
          className="h-full rounded-full bg-maple-green transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
