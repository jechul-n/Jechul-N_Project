import { Outlet, useLocation } from "react-router-dom";

import AppHeader from "./AppHeader";
import BottomNavigation from "./BottomNavigation";

function AppLayout() {
  const { pathname } = useLocation();
  const isFigmaDesignedPage =
    pathname === "/" ||
    pathname === "/saved" ||
    pathname === "/recent" ||
    pathname === "/search" ||
    pathname === "/recommend" ||
    pathname.startsWith("/seasonal/");

  return (
    <div className={isFigmaDesignedPage ? "app-shell app-shell--figma-screen" : "app-shell"}>
      {!isFigmaDesignedPage ? <AppHeader /> : null}
      <main className="app-main">
        <Outlet />
      </main>
      {!isFigmaDesignedPage ? <BottomNavigation /> : null}
    </div>
  );
}

export default AppLayout;
