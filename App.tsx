import React, { Suspense } from 'react';
import { BrowserRouter, HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';

const Home = React.lazy(() => import('./pages/Home'));
const Analyses = React.lazy(() => import('./pages/Analyses'));
const AnalysisDetail = React.lazy(() => import('./pages/AnalysisDetail'));
const Tools = React.lazy(() => import('./pages/Tools'));
const Projects = React.lazy(() => import('./pages/Projects'));
const Guides = React.lazy(() => import('./pages/Guides'));
const GuideDetail = React.lazy(() => import('./pages/GuideDetail'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Templates = React.lazy(() => import('./pages/Templates'));
const Playbooks = React.lazy(() => import('./pages/Playbooks'));
const Sources = React.lazy(() => import('./pages/Sources'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogDetail = React.lazy(() => import('./pages/BlogDetail'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// ScrollToTop component to fix scroll position on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

const RouteLoading: React.FC = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="rounded-sm border border-slate-200 bg-white px-4 py-2 text-xs font-mono uppercase tracking-wider text-slate-500">
      Chargement...
    </div>
  </div>
);

const AppRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const useHashRouter = import.meta.env.VITE_USE_HASH_ROUTER === 'true';
  const futureFlags = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

  return useHashRouter ? (
    <HashRouter future={futureFlags}>{children}</HashRouter>
  ) : (
    <BrowserRouter future={futureFlags}>{children}</BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <AppRouter>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyses" element={<Analyses />} />
            <Route path="/analyses/:slug" element={<AnalysisDetail />} />
            <Route path="/projets" element={<Projects />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/guides/:slug" element={<GuideDetail />} />
            <Route path="/outils" element={<Tools />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/templates/:id" element={<Templates />} />
            <Route path="/playbooks" element={<Playbooks />} />
            <Route path="/playbooks/:id" element={<Playbooks />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </AppRouter>
  );
};

export default App;
