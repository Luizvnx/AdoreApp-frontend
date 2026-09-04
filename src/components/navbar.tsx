import React from 'react';

export function Navbar({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <nav className={`flex items-center gap-2 ${className}`}>
      {children}
    </nav>
  );
}

export function NavbarDivider({ className = '' }: { className?: string }) {
  return <div className={`h-6 w-px bg-slate-800 ${className}`} />;
}

export function NavbarItem({
  children,
  href,
  onClick,
  current,
  className = '',
  as: Component,
  ...props
}: {
  children?: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  current?: boolean;
  className?: string;
  as?: React.ElementType;
  [key: string]: any;
}) {
  const baseClasses = `inline-flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all ${
    current ? 'text-cyan-400 bg-cyan-500/10' : ''
  } ${className}`;

  if (Component) {
    return (
      <Component className={baseClasses} onClick={onClick} {...props}>
        {children}
      </Component>
    );
  }

  if (href) {
    return (
      <a href={href} onClick={onClick} className={baseClasses} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={baseClasses} {...props}>
      {children}
    </button>
  );
}

export function NavbarLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-xs font-semibold truncate ${className}`}>{children}</span>;
}

export function NavbarSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-center gap-1 sm:gap-2 ${className}`}>{children}</div>;
}

export function NavbarSpacer({ className = '' }: { className?: string }) {
  return <div className={`flex-1 ${className}`} />;
}
