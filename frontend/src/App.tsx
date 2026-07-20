import { BrowserRouter, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import SearchPage from "./pages/SearchPage";
import RecommendPage from "./pages/RecommendPage";
import MyPage from "./pages/MyPage";
import BottomNavigation from "./components/layout/BottomNavigation";

function App() {
  return (
    <BrowserRouter>
      <div style={{ paddingBottom: "80px" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/recommend" element={<RecommendPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </div>

      <BottomNavigation />
    </BrowserRouter>
  );
}

export default App;