import {
  Sheet, Rocket, BarChart3, Settings2, BookOpenCheck, LibraryBig, FileCode2, Puzzle, Palette, Braces, Atom,
  Coffee, Layers, Server, Database, Leaf, Zap, Code2, Table2, FlaskConical, Globe, Plug, Cpu, Boxes, Bot, BrainCircuit,
  GraduationCap, Wrench,
} from 'lucide-react';

// Professional icon per course (falls back to a generic book icon)
export const TRACK_ICONS = {
  excel: Sheet, extra: Rocket, powerbi: BarChart3, pbiextra: Settings2, guides: BookOpenCheck, pbiguides: LibraryBig,
  html: FileCode2, htmlextra: Puzzle, css: Palette, js: Braces, react: Atom,
  corejava: Coffee, collections: Layers, advjava: Server, hibernate: Database, spring: Leaf, springboot: Zap, javatech: Wrench,
  python: Code2, sql: Table2, flask: FlaskConical, django: Globe, drf: Plug,
  mysql: Database, dotnet: Cpu, dotnetextra: Boxes, ai: BrainCircuit,
};

export function TrackIcon({ track, size = 22, ...rest }) {
  const I = TRACK_ICONS[track] || GraduationCap;
  return <I size={size} strokeWidth={1.8} {...rest} />;
}
export { Bot };
