import { useSidebar } from "@/context/SidebarContext";
import { useCallback, useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
  BoxCubeIcon,
  BellAltIcon,
  ChatIcon,
  DocsIcon,
  DollarIcon,
  GridIcon,
  HorizontaLDots,
  LockIcon,
  ListIcon,
  PieChartIcon,
  TaskIcon,
  UserCircleIcon,
  TableIcon,
  UserMoneyIcon,
} from "../icons";
import { cn } from "../utils";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
};

const navItems: NavItem[] = [
  { icon: <GridIcon fontSize={24} />, name: "Dashboard", path: "/" },
  { icon: <UserCircleIcon fontSize={24} />, name: "Utilisateurs", path: "/users" },
  { icon: <UserMoneyIcon fontSize={24} />, name: "Vendeurs", path: "/sellers" },
  { icon: <BoxCubeIcon fontSize={24} />, name: "Produits", path: "/products" },
  { icon: <TableIcon fontSize={24} />, name: "Commandes", path: "/orders" },
];

const othersItems: NavItem[] = [
  { icon: <PieChartIcon fontSize={24} />, name: "Analytics", path: "/analytics" },
  { icon: <ChatIcon fontSize={24} />, name: "Messagerie", path: "/messages" },
  { icon: <TaskIcon fontSize={24} />, name: "Support & litiges", path: "/support" },
  { icon: <BellAltIcon fontSize={24} />, name: "Notifications", path: "/notifications" },
  { icon: <DocsIcon fontSize={24} />, name: "Journal d’audit", path: "/audit-logs" },
  { icon: <DollarIcon fontSize={24} />, name: "Finances", path: "/finance" },
  { icon: <LockIcon fontSize={24} />, name: "Sécurité", path: "/security" },
  { icon: <ListIcon fontSize={24} />, name: "Paramètres", path: "/settings" },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } = useSidebar();
  const location = useLocation();

  useEffect(() => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [location.pathname, isMobileOpen, setIsMobileOpen]);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-1">
      {items.map((nav) => (
        <li key={nav.name}>
          {nav.path && (
            <Link
              to={nav.path}
              className={cn(
                "menu-item",
                isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
              )}
            >
              <span
                className={cn(
                  "menu-item-icon-size",
                  isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                )}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={cn(
        "fixed inset-s-0 top-0 z-50 flex h-screen flex-col border-e border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out xl:translate-x-0 dark:border-gray-800 dark:bg-gray-900",
        isExpanded || isMobileOpen ? "w-72.5" : isHovered ? "w-72.5" : "w-22.5",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "flex py-8",
          !isExpanded && !isHovered ? "xl:justify-center" : "justify-start"
        )}
      >
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#FF6A00] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            M
          </div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="flex flex-col">
              <span className="font-bold text-sm text-gray-900 dark:text-white">
                MANDE SUGU
              </span>
              <span className="text-xs text-gray-500">Super Admin</span>
            </div>
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={cn(
                  "mb-4 flex text-xs leading-5 text-gray-400 uppercase",
                  !isExpanded && !isHovered ? "xl:justify-center" : "justify-start"
                )}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "PRINCIPAL"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems)}
            </div>

            <div>
              <h2
                className={cn(
                  "mb-4 flex text-xs leading-5 text-gray-400 uppercase",
                  !isExpanded && !isHovered ? "xl:justify-center" : "justify-start"
                )}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "SYSTEME"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(othersItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;