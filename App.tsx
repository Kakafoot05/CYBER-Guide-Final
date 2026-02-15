import React, { Suspense } from 'react';
import {
  BrowserRouter,
  HashRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Layout } from './components/Layout';
import {
  buildLocalizedPath,
  getLocaleFromPathname,
  getPathWithQueryHash,
  getStoredLocale,
  setStoredLocale,
} from './utils/locale';

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

const LocaleSync: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeLocale = getLocaleFromPathname(location.pathname);

  React.useEffect(() => {
    if (activeLocale === 'en') {
      setStoredLocale('en');
    }
  }, [activeLocale]);

  React.useEffect(() => {
    if (activeLocale === 'en') {
      return;
    }

    const preferredLocale = getStoredLocale();
    if (preferredLocale !== 'en') {
      return;
    }

    const currentPath = getPathWithQueryHash(location);
    const localizedPath = buildLocalizedPath(currentPath, 'en');
    if (localizedPath !== currentPath) {
      navigate(localizedPath, { replace: true });
    }
  }, [activeLocale, location, navigate]);

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
  const routeDefinitions: Array<{ path: string; element: React.ReactElement }> = [
    { path: '/', element: <Home /> },
    { path: '/analyses', element: <Analyses /> },
    { path: '/analyses/:slug', element: <AnalysisDetail /> },
    { path: '/projets', element: <Projects /> },
    { path: '/guides', element: <Guides /> },
    { path: '/guides/:slug', element: <GuideDetail /> },
    { path: '/outils', element: <Tools /> },
    { path: '/templates', element: <Templates /> },
    { path: '/templates/:id', element: <Templates /> },
    { path: '/playbooks', element: <Playbooks /> },
    { path: '/playbooks/:id', element: <Playbooks /> },
    { path: '/a-propos', element: <About /> },
    { path: '/sources', element: <Sources /> },
    { path: '/contact', element: <Contact /> },
    { path: '/blog', element: <Blog /> },
    { path: '/blog/:slug', element: <BlogDetail /> },
  ];

  const renderLocalizedRoutes = (localePrefix: '' | '/en') =>
    routeDefinitions.map((routeDefinition) => {
      const localizedPath =
        localePrefix === ''
          ? routeDefinition.path
          : routeDefinition.path === '/'
            ? '/en'
            : `/en${routeDefinition.path}`;

      return (
        <Route
          key={`${localePrefix || 'fr'}-${routeDefinition.path}`}
          path={localizedPath}
          element={routeDefinition.element}
        />
      );
    });

  return (
    <AppRouter>
      <LocaleSync />
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            {renderLocalizedRoutes('')}
            {renderLocalizedRoutes('/en')}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </AppRouter>
  );
};

export default App;
