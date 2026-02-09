import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';

describe('App routing', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('shows the not found page for unknown routes', async () => {
    window.history.replaceState({}, '', '/route-inconnue');
    render(
      <HelmetProvider>
        <App />
      </HelmetProvider>,
    );

    expect(await screen.findByText(/Cette page n'existe pas/i)).toBeTruthy();
  });

  it('renders analyses page when route points to analyses', async () => {
    window.history.replaceState({}, '', '/analyses');
    render(
      <HelmetProvider>
        <App />
      </HelmetProvider>,
    );

    expect(await screen.findByText(/Dossiers d'Analyse/i)).toBeTruthy();
  });

  it('renders guides page when route points to guides', async () => {
    window.history.replaceState({}, '', '/guides');
    render(
      <HelmetProvider>
        <App />
      </HelmetProvider>,
    );

    expect(await screen.findByText(/Guides Piliers/i)).toBeTruthy();
  });

  it('renders playbooks page when route points to playbooks', async () => {
    window.history.replaceState({}, '', '/playbooks');
    render(
      <HelmetProvider>
        <App />
      </HelmetProvider>,
    );

    expect(await screen.findByText(/Procedures & Playbooks/i)).toBeTruthy();
  });
});
