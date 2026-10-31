import { NavLink } from 'react-router-dom';
import { Flame, GraduationCap, BookText, NotebookPen, Languages } from 'lucide-react';
import { useA2 } from '@/lib/a2Progress';

const link = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`;

export default function AppNav() {
  const { streak, state, completed } = useA2();
  const mistakeCount = Object.values(state.mistakes).filter((m) => !m.key.startsWith('v#')).length;
  return (
    <nav className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-2">
        <NavLink to="/" end className={link}>
          <GraduationCap className="h-4 w-4" /> A2 in 30 Days
        </NavLink>
        <NavLink to="/grammar" className={link}>
          <BookText className="h-4 w-4" /> Grammar
        </NavLink>
        <NavLink to="/mistakes" className={link}>
          <NotebookPen className="h-4 w-4" /> Mistakes{mistakeCount ? ` (${mistakeCount})` : ''}
        </NavLink>
        <NavLink to="/vocabulary" className={link}>
          <Languages className="h-4 w-4" /> Vocabulary
        </NavLink>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 font-semibold text-orange-600" title="Days in a row with a passed quiz">
            <Flame className="h-4 w-4" /> {streak}
          </span>
          <span className="text-muted-foreground">{completed}/30 days</span>
        </div>
      </div>
    </nav>
  );
}
