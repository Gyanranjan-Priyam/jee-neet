"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// Hook to detect mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const isMobile = useIsMobile();

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-full px-4 py-4 hidden  md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] shrink-0",
          className
        )}
        animate={{
          width: animate ? (open ? "300px" : "60px") : "300px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden  items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <IconMenu2
            className="text-neutral-800 dark:text-neutral-200"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200"
                onClick={() => setOpen(!open)}
              >
                <IconX />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2  group/sidebar py-2",
        className
      )}
      {...props}
    >
      {link.icon}

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </a>
  );
};

// shadcn/ui compatible sidebar components
export const SidebarGroup = ({ className, children, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn("pb-4", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const SidebarGroupLabel = ({ className, children, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn("px-3 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const SidebarMenu = ({ className, children, ...props }: React.ComponentProps<"ul">) => {
  return (
    <ul
      className={cn("space-y-1", className)}
      {...props}
    >
      {children}
    </ul>
  );
};

export const SidebarMenuItem = ({ className, children, ...props }: React.ComponentProps<"li">) => {
  return (
    <li
      className={cn("", className)}
      {...props}
    >
      {children}
    </li>
  );
};

export const SidebarMenuButton = React.forwardRef<
  HTMLElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    tooltip?: string;
    size?: "sm" | "md" | "lg";
  }
>(({ className, asChild, tooltip, size = "md", children, ...props }, ref) => {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-3 py-3 text-sm"
  };

  if (asChild) {
    return (
      <div
        className={cn(
          "flex w-full items-center gap-2 rounded-md font-medium text-neutral-700 dark:text-neutral-200",
          "hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600",
          sizeClasses[size],
          className
        )}
      >
        {children}
      </div>
    );
  }
  
  return (
    <button
      ref={ref as React.ForwardedRef<HTMLButtonElement>}
      className={cn(
        "flex w-full items-center gap-2 rounded-md font-medium text-neutral-700 dark:text-neutral-200",
        "hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarMenuSub = ({ className, children, ...props }: React.ComponentProps<"ul">) => {
  return (
    <ul
      className={cn("space-y-1 pl-4 mt-1", className)}
      {...props}
    >
      {children}
    </ul>
  );
};

export const SidebarMenuSubItem = ({ className, children, ...props }: React.ComponentProps<"li">) => {
  return (
    <li
      className={cn("", className)}
      {...props}
    >
      {children}
    </li>
  );
};

export const SidebarMenuSubButton = React.forwardRef<
  HTMLElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  }
>(({ className, asChild, children, ...props }, ref) => {
  if (asChild) {
    return (
      <div
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-300",
          "hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600",
          className
        )}
      >
        {children}
      </div>
    );
  }
  
  return (
    <button
      ref={ref as React.ForwardedRef<HTMLButtonElement>}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-300",
        "hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
