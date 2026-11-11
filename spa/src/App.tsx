import { BrowserRouter, Link, Route, Routes } from "react-router";
import { SiteFooter } from "@/components/SiteFooter";
import { OfflineBanner } from "@/components/interactive/OfflineBanner";
import { AppHeader } from "./AppHeader";
import { AuthProvider } from "./auth";
import { ExplorePage } from "./pages/ExplorePage";
import { SavedPage } from "./pages/SavedPage";
import { TrailPage } from "./pages/TrailPage";

// Client-side routing: changing pages never asks the server for anything.
// Once this bundle has loaded, every route works offline (data comes from Firestore's cache).
export function App() {
  return (
    <BrowserRouter basename="/spa">
      <AuthProvider>
        <AppHeader />
        <OfflineBanner />
        <main className="page">
          <Routes>
            <Route index element={<ExplorePage />} />
            <Route path="saved" element={<SavedPage />} />
            <Route path="trails/:id" element={<TrailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <SiteFooter />
      </AuthProvider>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="empty">
      <h1>Page not found</h1>
      <p>
        <Link to="/">Back to all trails</Link>
      </p>
    </div>
  );
}
