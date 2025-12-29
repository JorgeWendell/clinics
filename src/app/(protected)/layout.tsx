import { Sidebar, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "./components/sidebar/app-sidebar";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
   return (
     <SidebarProvider>
       <AppSidebar />
       <main className="w-full">
         <SidebarTrigger />
         {children}
         <Toaster position="bottom-center" richColors theme="light" />
       </main>
     </SidebarProvider>
   );
};

export default ProtectedLayout;
