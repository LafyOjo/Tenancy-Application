export function StatusChip({ text, color = 'gray' }: { text: string; color?: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-200 text-green-800',
    yellow: 'bg-yellow-200 text-yellow-800',
    red: 'bg-red-200 text-red-800',
    gray: 'bg-gray-200 text-gray-800',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs ${colors[color] || colors.gray}`}>
      {text}
    </span>
  );
}
