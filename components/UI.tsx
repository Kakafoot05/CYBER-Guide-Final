import React, { useEffect, useId, useRef } from 'react';
import { Hash, X } from 'lucide-react';
import { motion, type HTMLMotionProps } from 'framer-motion';

// --- BUTTONS ---
interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size' | 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'tech';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ElementType;
  as?: 'button' | 'span';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  as = 'button',
  className = '',
  type = 'button',
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-display font-semibold transition-all duration-200 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide';

  const variants = {
    primary:
      'bg-gradient-to-br from-brand-steel to-brand-navy text-white hover:from-brand-navy hover:to-brand-steel focus:ring-brand-steel shadow-md border border-transparent',
    secondary:
      'bg-brand-navy text-white hover:bg-slate-900 focus:ring-brand-navy shadow-md border border-brand-steel/40',
    outline:
      'border border-brand-steel text-brand-navy hover:bg-brand-pale hover:text-brand-steel shadow-sm',
    ghost: 'text-brand-steel hover:text-brand-navy hover:bg-brand-pale/50',
    tech: 'bg-slate-900 text-brand-light border border-brand-steel/40 hover:border-brand-light hover:text-white font-mono text-[10px]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-6 py-3 text-xs',
    lg: 'px-8 py-4 text-sm',
  };

  if (as === 'span') {
    return (
      <motion.span
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
        {Icon && <Icon className={`ml-2 w-4 h-4 ${size === 'lg' ? 'w-5 h-5' : ''}`} />}
      </motion.span>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
      {Icon && <Icon className={`ml-2 w-4 h-4 ${size === 'lg' ? 'w-5 h-5' : ''}`} />}
    </motion.button>
  );
};

// --- BADGE ---
export type BadgeColor = 'navy' | 'gold' | 'steel' | 'mono' | 'alert' | 'success';

export const Badge: React.FC<{
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}> = ({ children, color = 'navy', className = '' }) => {
  const colors = {
    navy: 'bg-brand-navy/10 text-brand-navy border-brand-navy/25',
    gold: 'bg-brand-gold/10 text-brand-gold border-brand-gold/35',
    steel: 'bg-brand-steel/10 text-brand-steel border-brand-steel/25',
    mono: 'bg-slate-100 text-slate-600 border-slate-200 font-mono',
    alert: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${colors[color]} ${className}`}
    >
      {children}
    </span>
  );
};

// --- TECH BADGE (Optimized) ---
export const TechBadge: React.FC<{ tech: string; className?: string }> = ({
  tech,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`
      group inline-flex items-center gap-2.5 px-3 py-2 
      bg-white border border-slate-200 rounded-sm 
      hover:border-brand-steel hover:shadow-md
      transition-all duration-300 cursor-default select-none
      ${className}
    `}
    >
      {/* Icon Placeholder / Avatar */}
      <div
        className="
        w-6 h-6 rounded-sm flex-shrink-0 flex items-center justify-center 
        bg-slate-50 border border-slate-100 
        text-[9px] font-bold font-mono text-slate-500 uppercase tracking-tight 
        group-hover:bg-brand-steel group-hover:text-white group-hover:border-transparent 
        transition-colors duration-300 shadow-sm
      "
      >
        {tech.substring(0, 2)}
      </div>

      {/* Label */}
      <span className="text-xs font-semibold text-slate-600 group-hover:text-brand-navy transition-colors whitespace-nowrap">
        {tech}
      </span>
    </motion.div>
  );
};

// --- BLUEPRINT PANEL (Core Platform Component) ---
interface BlueprintPanelProps {
  title?: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
  grid?: boolean;
}

export const BlueprintPanel: React.FC<BlueprintPanelProps> = ({
  title,
  label,
  children,
  className = '',
  grid = false,
}) => {
  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
      initial={{ y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden bg-white border border-slate-200 shadow-panel transition-colors duration-300 group ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-steel/[0.03] via-transparent to-brand-gold/[0.03]" />
      {/* Blueprint Corners */}
      <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-brand-steel opacity-60"></div>
      <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-brand-steel opacity-60"></div>
      <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-brand-steel opacity-60"></div>
      <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-2 border-r-2 border-brand-steel opacity-60"></div>

      {/* Technical Header */}
      {(title || label) && (
        <div className="flex justify-between items-center border-b border-slate-100 px-6 py-3 bg-slate-50/50">
          {title && (
            <h3 className="font-display font-bold text-brand-navy uppercase tracking-tight text-sm">
              {title}
            </h3>
          )}
          {label && (
            <span className="font-mono text-[10px] text-brand-steel/70 flex items-center gap-1">
              <Hash size={10} /> {label}
            </span>
          )}
        </div>
      )}

      {/* Content Area */}
      <div className={`relative p-6 ${grid ? 'bg-tech-grid' : ''}`}>{children}</div>
    </motion.div>
  );
};

// --- SHIELD HEADER (Platform Header) ---
interface ShieldHeaderProps {
  title: string;
  subtitle: string;
  meta?: string[];
  align?: 'left' | 'center';
}

export const ShieldHeader: React.FC<ShieldHeaderProps> = ({
  title,
  subtitle,
  meta,
  align = 'center',
}) => {
  return (
    <div className="relative bg-brand-navy text-white pt-32 pb-16 overflow-hidden -mt-20 mb-12">
      {/* Watermark Pattern */}
      <div className="absolute inset-0 bg-shield-lines opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy to-brand-steel/40 pointer-events-none"></div>
      <div className="absolute -left-20 -top-12 h-56 w-56 rounded-full bg-brand-steel/20 blur-[80px] pointer-events-none"></div>
      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-brand-gold/15 blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-steel to-transparent opacity-50"></div>

      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ${align === 'center' ? 'text-center' : 'text-left'}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`flex items-center gap-2 mb-4 text-brand-light/90 font-mono text-xs uppercase tracking-widest ${align === 'center' ? 'justify-center' : ''}`}
        >
          <div className="w-2 h-2 bg-brand-gold rounded-full animate-pulse"></div>
          <span>{subtitle}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight mb-6 text-white"
        >
          {title}
        </motion.h1>

        {meta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`flex flex-wrap gap-3 mt-6 ${align === 'center' ? 'justify-center' : ''}`}
          >
            {meta.map((m, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded-sm text-xs font-mono text-brand-pale"
              >
                {m}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// --- TECH SEPARATOR ---
export const TechSeparator: React.FC = () => (
  <div className="flex items-center py-8 opacity-40 max-w-7xl mx-auto px-4">
    <div className="h-px bg-slate-300 flex-grow"></div>
    <div className="px-4 flex gap-1">
      <div className="w-1.5 h-1.5 bg-brand-steel transform rotate-45"></div>
      <div className="w-1.5 h-1.5 bg-brand-navy transform rotate-45"></div>
      <div className="w-1.5 h-1.5 bg-brand-steel transform rotate-45"></div>
    </div>
    <div className="h-px bg-slate-300 flex-grow"></div>
  </div>
);

// --- DRAWER ---
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
  variant?: 'overlay' | 'inline';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'overlay',
}) => {
  const titleId = useId();
  const drawerPanelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const isInline = variant === 'inline';

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const sizeClass =
    size === 'xl'
      ? 'max-w-[min(1200px,96vw)]'
      : size === 'lg'
        ? 'max-w-[min(980px,94vw)]'
        : 'max-w-lg';

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
      }
    };

    const previousOverflow = document.body.style.overflow;
    if (!isInline) {
      document.body.style.overflow = 'hidden';
    }
    window.addEventListener('keydown', closeOnEscape);
    drawerPanelRef.current?.focus();

    return () => {
      if (!isInline) {
        document.body.style.overflow = previousOverflow;
      }
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen, isInline]);

  if (!isOpen) return null;

  return (
    <div
      className={
        isInline
          ? 'relative z-10 mt-2 print:mt-0'
          : 'fixed inset-0 z-50 flex justify-end print:static print:inset-auto print:block'
      }
    >
      {/* Backdrop */}
      {!isInline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-brand-navy/80 backdrop-blur-sm print:hidden"
          onClick={onClose}
        ></motion.div>
      )}

      {/* Panel */}
      <motion.div
        initial={isInline ? { opacity: 0, y: 8 } : { x: '100%' }}
        animate={isInline ? { opacity: 1, y: 0 } : { x: 0 }}
        exit={isInline ? { opacity: 0, y: 8 } : { x: '100%' }}
        transition={
          isInline
            ? { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
            : { type: 'spring', damping: 25, stiffness: 200 }
        }
        className={`relative w-full ${sizeClass} ${
          isInline
            ? 'mx-auto h-auto rounded-sm border border-slate-200 shadow-panel print:max-w-none print:rounded-none print:border-0 print:shadow-none'
            : 'h-full shadow-2xl'
        } bg-white flex flex-col transform print:h-auto print:transform-none`}
        role="dialog"
        aria-modal={isInline ? undefined : true}
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        ref={drawerPanelRef}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 print:hidden">
          <h3
            id={titleId}
            className="font-display font-bold text-brand-navy uppercase tracking-tight text-sm"
          >
            {title || 'Details'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-brand-navy hover:bg-slate-200/50 rounded-full transition-all"
            aria-label="Fermer les details"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className={`${
            isInline ? 'p-6 md:p-8 overflow-visible' : 'p-8 overflow-y-auto flex-grow'
          } bg-white print:p-0 print:overflow-visible`}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
};
