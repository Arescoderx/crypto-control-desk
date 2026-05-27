import {
  LayoutDashboard,
  ArrowLeftRight,
  ClipboardList,
  FileText,
  History,
  Settings,
  Bot,
  Zap,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { getDB } from "@/lib/db";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Trading", url: "/trading", icon: ArrowLeftRight },
  { title: "Sinais", url: "/analysis", icon: ClipboardList },
  { title: "Estrategias", url: "/strategies", icon: Zap },
  { title: "Historico", url: "/history", icon: History },
  { title: "Relatorios", url: "/reports", icon: FileText },
  { title: "Configuracoes", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const db = getDB();
  const botActive = db.bot?.active || false;
  const pendingSignals = (db.signals || []).filter((signal) => signal.status === "pending").length;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-6">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="font-display text-lg font-bold text-foreground">CriptoBot</span>
              </div>
            )}
            {collapsed && <Zap className="h-5 w-5 text-primary mx-auto" />}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-accent/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium border-l-2 border-primary"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="rounded-lg bg-secondary p-3 space-y-1">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">Bot Status</span>
              <span
                className={`ml-auto h-2 w-2 rounded-full ${
                  botActive ? "bg-profit animate-pulse-glow" : "bg-loss"
                }`}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingSignals} {pendingSignals === 1 ? "sinal pendente" : "sinais pendentes"}
            </p>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                botActive ? "bg-profit animate-pulse-glow" : "bg-loss"
              }`}
            />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
