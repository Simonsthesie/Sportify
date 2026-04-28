interface Props {
  type?: 'error' | 'success' | 'info';
  children: React.ReactNode;
}

export default function Alert({ type = 'info', children }: Props) {
  const colors = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  } as const;

  return (
    <div className={'rounded-lg border px-4 py-3 text-sm ' + colors[type]}>
      {children}
    </div>
  );
}
