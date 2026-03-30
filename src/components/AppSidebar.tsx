import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Users, Stethoscope, FileText, ClipboardList, Pill, UserCircle, Heart, Activity,
} from "lucide-react";

const menuMap = {
  admin: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "User Management", url: "/dashboard/users", icon: Users },
  ],
  doctor: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Patients", url: "/dashboard/patients", icon: Users },
    { title: "Medical Records", url: "/dashboard/records", icon: FileText },
    { title: "Prescriptions", url: "/dashboard/prescriptions", icon: Pill },
  ],
  patient: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Medical History", url: "/dashboard/history", icon: ClipboardList },
    { title: "Prescriptions", url: "/dashboard/my-prescriptions", icon: Pill },
    { title: "Profile", url: "/dashboard/profile", icon: UserCircle },
  ],
};

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const items = user ? menuMap[user.role] : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center shrink-0">
            <Heart className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-display font-bold text-sm text-foreground">HealthDB</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user?.role} Panel</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
