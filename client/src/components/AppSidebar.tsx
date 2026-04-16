import {
  LayoutDashboard,
  ArrowLeftRight,
  Brain,
  History,
  Settings,
  Bot,
  Zap,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
import { botStatus } from "@/lib/mock-data";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Trading", url: "/trading", icon: ArrowLeftRight },
  { title: "Análise IA", url: "/analysis", icon: Brain },
  { title: "Estratégias", url: "/strategies", icon: Zap },
  { title: "Histórico", url: "/history", icon: History },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

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
              <span className={`ml-auto h-2 w-2 rounded-full ${botStatus.active ? 'bg-profit animate-pulse-glow' : 'bg-loss'}`} />
            </div>
            <p className="text-xs text-muted-foreground">Uptime: {botStatus.uptime}</p>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <span className={`h-2.5 w-2.5 rounded-full ${botStatus.active ? 'bg-profit animate-pulse-glow' : 'bg-loss'}`} />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
