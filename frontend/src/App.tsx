import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import NotFoundPage from "./pages/NotFoundPage";
import RecommendPage from "./pages/RecommendPage";
import RecentPage from "./pages/RecentPage";
import SavedPage from "./pages/SavedPage";
import SearchPage from "./pages/SearchPage";
import SeasonalDetailPage from "./pages/SeasonalDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/seasonal/:keyword" element={<SeasonalDetailPage />} />
          <Route path="/recommend" element={<RecommendPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/recent" element={<RecentPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
