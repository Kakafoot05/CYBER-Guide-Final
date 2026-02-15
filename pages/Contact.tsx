import React, { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldHeader, BlueprintPanel, Button } from '../components/UI';
import { Mail, Send, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Seo } from '../components/Seo';
import { buildLocalizedPath, getLocaleFromPathname } from '../utils/locale';

const FORM_TIMEOUT_MS = 10000;

const Contact: React.FC = () => {
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname);
  const isEnglish = locale === 'en';
  const localizedPath = (path: string): string => buildLocalizedPath(path, locale);

  const copy = isEnglish
    ? {
        seoTitle: 'Contact Cyber Guide',
        seoDescription:
          'Contact Cyber Guide for questions about analyses, templates, and defensive tooling.',
        headerSubtitle: 'Communication',
        sectionTitle: 'Contact us',
        sectionBody:
          'For any question about analyses, issue reporting, or access requests for complete tooling.',
        noteTitle: 'Note:',
        noteBody:
          'No commercial prospecting. Non-professional requests will not be processed.',
        firstName: 'First name *',
        lastName: 'Last name *',
        email: 'Email *',
        subject: 'Subject *',
        message: 'Message',
        messagePlaceholder: 'Your detailed message (min. 30 characters)...',
        subjectPlaceholder: 'Select a subject...',
        subjectDemo: 'Demo request / Tooling',
        subjectAnalysis: 'Question about an analysis',
        subjectBug: 'Issue report',
        subjectOther: 'Other request',
        sending: 'Sending',
        send: 'Send message',
        sentTitle: 'Message sent',
        sentBody: 'The Cyber Guide team will reply within 48 business hours.',
        sendAnother: 'Send another message',
        openEmail: 'Open email',
        invalidFirstName: 'First name is required.',
        invalidLastName: 'Last name is required.',
        invalidEmail: 'Invalid email address.',
        invalidMessage: 'Message is too short (min. 30 characters).',
        spamRejected: 'Submission blocked (detected as spam).',
        invalidEndpoint: "Invalid Formspree endpoint. Replace '<id>' with your real form ID.",
        timeoutError: 'Form service timeout. Retry or use direct email.',
        unavailableError: 'Form service unavailable. Retry or use direct email.',
        endpointMissing: 'Form is not configured. Add VITE_FORMSPREE_ENDPOINT or use direct email.',
        genericError: 'An error occurred.',
      }
    : {
        seoTitle: 'Contact Cyber Guide',
        seoDescription:
          'Contactez Cyber Guide pour une question sur les analyses, templates ou outils defensifs.',
        headerSubtitle: 'Communication',
        sectionTitle: 'Nous contacter',
        sectionBody:
          "Pour toute question relative aux analyses, signalement d'erreur ou demande d'accès aux outils complets.",
        noteTitle: 'Note :',
        noteBody:
          'Pas de démarchage commercial. Les demandes non professionnelles ne seront pas traitées.',
        firstName: 'Prénom *',
        lastName: 'Nom *',
        email: 'Email *',
        subject: 'Sujet *',
        message: 'Message',
        messagePlaceholder: 'Votre message détaillé (min. 30 caractères)...',
        subjectPlaceholder: 'Sélectionner un sujet...',
        subjectDemo: 'Demande de démo / Outils',
        subjectAnalysis: 'Question sur une analyse',
        subjectBug: "Signalement d'erreur",
        subjectOther: 'Autre demande',
        sending: 'Envoi en cours',
        send: 'Envoyer le message',
        sentTitle: 'Message transmis',
        sentBody: "L'équipe Cyber Guide vous répondra sous 48h ouvrées.",
        sendAnother: 'Envoyer un autre message',
        openEmail: 'Ouvrir email',
        invalidFirstName: 'Le prénom est requis.',
        invalidLastName: 'Le nom est requis.',
        invalidEmail: 'Adresse email invalide.',
        invalidMessage: 'Le message est trop court (min. 30 caractères).',
        spamRejected: 'Envoi impossible (détecté comme spam).',
        invalidEndpoint: "Endpoint Formspree invalide. Remplacez '<id>' par votre ID réel.",
        timeoutError:
          "Le service de formulaire ne répond pas (timeout). Réessayez ou utilisez l'email direct.",
        unavailableError:
          "Le service de formulaire est indisponible. Réessayez ou utilisez l'email direct.",
        endpointMissing:
          "Le formulaire n'est pas configuré. Ajoutez VITE_FORMSPREE_ENDPOINT ou utilisez l'email direct.",
        genericError: 'Une erreur est survenue.',
      };

  const [formData, setFormData] = useState({
    firstName: '',
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const mountTime = useRef(Date.now());

  const buildMailtoUrl = () => {
    const fullName = `${formData.firstName} ${formData.name}`.trim();
    return `mailto:contact@cyber-guide.fr?subject=[CONTACT] ${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(formData.message)}%0A%0ADe: ${encodeURIComponent(fullName)} (${encodeURIComponent(formData.email)})`;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (status === 'error') {
      setStatus('idle');
    }
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const validateForm = (): boolean => {
    if (formData.firstName.trim().length < 2) {
      setErrorMessage(copy.invalidFirstName);
      return false;
    }
    if (formData.name.trim().length < 2) {
      setErrorMessage(copy.invalidLastName);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMessage(copy.invalidEmail);
      return false;
    }
    if (formData.message.trim().length < 30) {
      setErrorMessage(copy.invalidMessage);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    if (formData.honeypot) {
      return;
    }

    if (Date.now() - mountTime.current < 3000) {
      setErrorMessage(copy.spamRejected);
      setStatus('error');
      return;
    }

    if (!validateForm()) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT?.trim();

    if (endpoint) {
      if (endpoint.includes('<id>')) {
        setStatus('error');
        setErrorMessage(copy.invalidEndpoint);
        return;
      }

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), FORM_TIMEOUT_MS);

      try {
        const payload = new FormData();
        payload.append('firstName', formData.firstName);
        payload.append('name', formData.name);
        payload.append('email', formData.email);
        payload.append('subject', formData.subject);
        payload.append('message', formData.message);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
          body: payload,
        });

        if (response.ok) {
          setStatus('success');
          setFormData({
            firstName: '',
            name: '',
            email: '',
            subject: '',
            message: '',
            honeypot: '',
          });
          return;
        }

        let formspreeError = '';
        try {
          const responseData: unknown = await response.json();
          if (responseData && typeof responseData === 'object') {
            const withErrors = responseData as {
              errors?: Array<{ message?: string }>;
              error?: string;
            };

            if (Array.isArray(withErrors.errors) && withErrors.errors[0]?.message) {
              formspreeError = withErrors.errors[0].message;
            } else if (typeof withErrors.error === 'string') {
              formspreeError = withErrors.error;
            }
          }
        } catch {
          // Ignore response parsing issues and fallback to status text.
        }

        throw new Error(formspreeError || `Form error (${response.status})`);
      } catch (error) {
        const timeoutError = error instanceof DOMException && error.name === 'AbortError';
        setStatus('error');
        setErrorMessage(
          timeoutError
            ? copy.timeoutError
            : error instanceof Error && error.message
              ? `${copy.unavailableError} (${error.message})`
              : copy.unavailableError,
        );
      } finally {
        window.clearTimeout(timeoutId);
      }
    } else {
      setStatus('error');
      setErrorMessage(copy.endpointMissing);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <Seo
        title={copy.seoTitle}
        description={copy.seoDescription}
        path={localizedPath('/contact')}
        image="/assets/og/contact.svg"
        keywords={
          isEnglish
            ? ['cyber contact', 'operational cybersecurity', 'cyber guide support']
            : ['contact cyber', 'cybersecurite operationnelle', 'support cyber guide']
        }
        schema={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: copy.seoTitle,
          url: `https://cyber-guide.fr${localizedPath('/contact')}`,
        }}
      />
      <ShieldHeader title="Contact" subtitle={copy.headerSubtitle} align="center" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlueprintPanel label="SECURE_CHANNEL_FORM" className="py-12">
          {status === 'success' ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-display font-bold text-brand-navy mb-2">{copy.sentTitle}</h2>
              <p className="text-slate-600">{copy.sentBody}</p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-8 text-sm font-bold text-brand-steel underline"
              >
                {copy.sendAnother}
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-12 gap-12">
              <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-slate-200 pb-8 md:pb-0 md:pr-8">
                <h2 className="text-xl font-display font-bold text-brand-navy mb-4">{copy.sectionTitle}</h2>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">{copy.sectionBody}</p>

                <div className="flex items-center gap-3 text-sm font-mono text-brand-navy mb-2">
                  <Mail size={16} className="text-brand-steel" />
                  contact@cyber-guide.fr
                </div>

                <div className="mt-8 p-4 bg-slate-100 border-l-4 border-brand-steel text-xs text-slate-500">
                  <strong>{copy.noteTitle}</strong> {copy.noteBody}
                </div>
              </div>

              <div className="md:col-span-7">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="hidden">
                    <input
                      type="text"
                      name="honeypot"
                      value={formData.honeypot}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-brand-navy uppercase mb-1">
                        {copy.firstName}
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        autoComplete="given-name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:border-brand-steel focus:ring-1 focus:ring-brand-steel outline-none text-sm"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-navy uppercase mb-1">
                        {copy.lastName}
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        autoComplete="family-name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:border-brand-steel focus:ring-1 focus:ring-brand-steel outline-none text-sm"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-brand-navy uppercase mb-1">
                        {copy.email}
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:border-brand-steel focus:ring-1 focus:ring-brand-steel outline-none text-sm"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-navy uppercase mb-1">
                        {copy.subject}
                      </label>
                      <select
                        name="subject"
                        className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:border-brand-steel outline-none text-sm bg-white"
                        value={formData.subject}
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, subject: event.target.value }))
                        }
                        required
                      >
                        <option value="">{copy.subjectPlaceholder}</option>
                        <option value={copy.subjectDemo}>{copy.subjectDemo}</option>
                        <option value={copy.subjectAnalysis}>{copy.subjectAnalysis}</option>
                        <option value={copy.subjectBug}>{copy.subjectBug}</option>
                        <option value={copy.subjectOther}>{copy.subjectOther}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-navy uppercase mb-1">
                      {copy.message}
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:border-brand-steel focus:ring-1 focus:ring-brand-steel outline-none text-sm resize-none"
                      placeholder={copy.messagePlaceholder}
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  {status === 'error' && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 rounded-sm"
                    >
                      <AlertTriangle size={14} />
                      <span>{errorMessage || copy.genericError}</span>
                      <button
                        type="button"
                        className="ml-auto font-bold underline"
                        onClick={() => window.location.assign(buildMailtoUrl())}
                      >
                        {copy.openEmail}
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full flex justify-center mt-2"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? (
                      <>
                        {copy.sending} <Loader2 size={16} className="ml-2 animate-spin" />
                      </>
                    ) : (
                      <>
                        {copy.send} <Send size={16} className="ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </BlueprintPanel>
      </div>
    </div>
  );
};

export default Contact;
