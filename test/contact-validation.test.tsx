import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Contact from '../pages/Contact';

const renderContact = () =>
  render(
    <HelmetProvider>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Contact />
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('Contact form validation', () => {
  let now = 0;

  beforeEach(() => {
    now = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows anti-spam error when submitted too quickly', async () => {
    const user = userEvent.setup();
    const { container } = renderContact();

    const nameInput = container.querySelector('input[name="name"]');
    const emailInput = container.querySelector('input[name="email"]');
    const subjectSelect = container.querySelector('select[name="subject"]');
    const messageInput = container.querySelector('textarea[name="message"]');

    expect(nameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(subjectSelect).toBeTruthy();
    expect(messageInput).toBeTruthy();

    await user.type(nameInput as HTMLInputElement, 'Kamil');
    await user.type(emailInput as HTMLInputElement, 'kamil@example.com');
    await user.selectOptions(subjectSelect as HTMLSelectElement, 'Autre');
    await user.type(
      messageInput as HTMLTextAreaElement,
      'Message volontairement long pour depasser trente caracteres.',
    );

    now = 1000;
    await user.click(screen.getByRole('button', { name: /Envoyer le message/i }));

    expect(await screen.findByText(/Envoi impossible/i)).toBeTruthy();
  });

  it('shows a short message error when message is too short', async () => {
    const user = userEvent.setup();
    const { container } = renderContact();

    const nameInput = container.querySelector('input[name="name"]');
    const emailInput = container.querySelector('input[name="email"]');
    const subjectSelect = container.querySelector('select[name="subject"]');
    const messageInput = container.querySelector('textarea[name="message"]');

    expect(nameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(subjectSelect).toBeTruthy();
    expect(messageInput).toBeTruthy();

    await user.type(nameInput as HTMLInputElement, 'Kamil');
    await user.type(emailInput as HTMLInputElement, 'kamil@example.com');
    await user.selectOptions(subjectSelect as HTMLSelectElement, 'Autre');
    await user.type(messageInput as HTMLTextAreaElement, 'trop court');

    now = 4000;
    await user.click(screen.getByRole('button', { name: /Envoyer le message/i }));

    expect(await screen.findByText(/message est trop court/i)).toBeTruthy();
  });
});
