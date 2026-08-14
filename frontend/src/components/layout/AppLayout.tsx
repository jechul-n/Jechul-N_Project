import { Outlet, useLocation } from "react-router-dom";

import AppHeader from "./AppHeader";
import BottomNavigation from "./BottomNavigation";

function AppLayout() {
  const { pathname } = useLocation();
  const isMapPage = pathname === "/map";
  const isFigmaDesignedPage =
    pathname === "/" ||
    pathname === "/saved" ||
    pathname === "/recent" ||
    pathname === "/search" ||
    pathname === "/recommend" ||
    pathname.startsWith("/seasonal/");

  const shellClassName = isMapPage
    ? "app-shell app-shell--map-screen"
    : isFigmaDesignedPage
      ? "app-shell app-shell--figma-screen"
      : "app-shell";

  return (
    <div className={shellClassName}>
      {!isFigmaDesignedPage && !isMapPage ? <AppHeader /> : null}
      <main className={isMapPage ? "app-main app-main--map" : "app-main"}>
        <Outlet />
      </main>
      {!isFigmaDesignedPage ? <BottomNavigation /> : null}
    </div>
  );
}

export default AppLayout;
