interface Props {
  provider: string;
}

export function ProviderBadge({ provider }: Props) {
  return (
    <span className="px-2 py-1 text-xs bg-gray-200 rounded">{provider}</span>
  );
}
