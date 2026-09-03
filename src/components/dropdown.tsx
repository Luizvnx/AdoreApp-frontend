import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface DropdownContextType {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    toggleOpen: () => void;
    close: () => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export function useDropdown() {
    const context = useContext(DropdownContext);
    if (!context) {
        throw new Error('useDropdown must be used within a Dropdown component');
    }
    return context;
}

export interface DropdownProps {
    children: React.ReactNode;
    className?: string;
}

export function Dropdown({ children, className = '' }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => setIsOpen(prev => !prev);
    const close = () => setIsOpen(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    return (
        <DropdownContext.Provider value={{ isOpen, setIsOpen, toggleOpen, close }}>
            <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
                {children}
            </div>
        </DropdownContext.Provider>
    );
}

export interface DropdownButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    outline?: boolean;
    plain?: boolean;
    color?: 'blue' | 'slate' | 'red' | 'emerald' | 'amber';
    children: React.ReactNode;
    className?: string;
}

export function DropdownButton({
    outline = false,
    plain = false,
    color = 'slate',
    children,
    className = '',
    onClick,
    ...props
}: DropdownButtonProps) {
    const { toggleOpen, isOpen } = useDropdown();

    let baseStyles = "inline-flex items-center justify-between gap-2 text-xs font-semibold rounded-xl px-3.5 py-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:scale-95";

    if (outline) {
        baseStyles += " bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-200 shadow-sm shadow-slate-950/50";
    } else if (plain) {
        baseStyles += " hover:bg-slate-800/60 text-slate-300 hover:text-white";
    } else {
        switch (color) {
            case 'blue':
                baseStyles += " bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20";
                break;
            case 'red':
                baseStyles += " bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20";
                break;
            case 'emerald':
                baseStyles += " bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20";
                break;
            case 'amber':
                baseStyles += " bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20";
                break;
            default:
                baseStyles += " bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/80 shadow-md";
        }
    }

    return (
        <button
            type="button"
            aria-expanded={isOpen}
            onClick={(e) => {
                if (onClick) onClick(e);
                toggleOpen();
            }}
            className={`${baseStyles} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export interface DropdownMenuProps {
    children: React.ReactNode;
    align?: 'left' | 'right';
    className?: string;
}

export function DropdownMenu({ children, align = 'right', className = '' }: DropdownMenuProps) {
    const { isOpen } = useDropdown();

    if (!isOpen) return null;

    const alignmentClass = align === 'left' ? 'left-0 origin-top-left' : 'right-0 origin-top-right';

    return (
        <div
            className={`absolute ${alignmentClass} mt-2 w-56 z-50 rounded-2xl bg-slate-900/95 border border-slate-800 p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-100 ${className}`}
            role="menu"
        >
            {children}
        </div>
    );
}

export interface DropdownItemProps extends React.HTMLAttributes<HTMLElement> {
    href?: string;
    onClick?: (e: React.MouseEvent) => void;
    disabled?: boolean;
    destructive?: boolean;
    children: React.ReactNode;
    className?: string;
}

export function DropdownItem({
    href,
    onClick,
    disabled = false,
    destructive = false,
    children,
    className = '',
    ...props
}: DropdownItemProps) {
    const { close } = useDropdown();

    const handleClick = (e: React.MouseEvent) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        if (onClick) {
            onClick(e);
        }
        close();
    };

    const itemStyles = `group flex w-full items-center justify-start gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer select-none ${disabled
            ? 'opacity-40 cursor-not-allowed text-slate-500'
            : destructive
                ? 'text-red-400 hover:bg-red-500/15 hover:text-red-300'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
        } ${className}`;

    if (href && !disabled) {
        const isExternal = href.startsWith('http') || href.startsWith('mailto:');
        if (isExternal) {
            return (
                <a
                    href={href}
                    onClick={handleClick}
                    className={itemStyles}
                    role="menuitem"
                    {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
                >
                    {children}
                </a>
            );
        }
        return (
            <Link
                to={href}
                onClick={handleClick}
                className={itemStyles}
                role="menuitem"
                {...(props as any)}
            >
                {children}
            </Link>
        );
    }

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={handleClick}
            className={itemStyles}
            role="menuitem"
            {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
            {children}
        </button>
    );
}

export function DropdownSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`py-1 ${className}`}>{children}</div>;
}

export function DropdownHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 ${className}`}>{children}</div>;
}

export function DropdownDivider({ className = '' }: { className?: string }) {
    return <div className={`my-1 h-px bg-slate-800/80 ${className}`} />;
}

export function DropdownLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <span className={`truncate ${className}`}>{children}</span>;
}

export function DropdownDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <span className={`text-[11px] text-slate-500 group-hover:text-slate-400 ${className}`}>{children}</span>;
}
