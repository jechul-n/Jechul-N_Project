import { Outlet } from "react-router-dom";

import AppHeader from "./AppHeader";
import BottomNavigation from "./BottomNavigation";

function AppLayout() {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}

export default AppLayout;
