import { Spinner } from './Spinner.jsx';

export function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px] gap-3 text-muted-foreground">
      <Spinner size="lg" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}

export default Loader;
