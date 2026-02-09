import React, { useState, useRef } from 'react';
import { ShieldHeader, BlueprintPanel, Button } from '../components/UI';
import { Mail, Send, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Seo } from '../components/Seo';

const FORM_TIMEOUT_MS = 10000;

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '', // Anti-spam hidden field
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Anti-spam time check: reject if submitted too fast (< 3 seconds)
  const mountTime = useRef(Date.now());

  const buildMailtoUrl = () => {
    const fullName = `${formData.firstName} ${formData.name}`.trim();
    return `mailto:contact@cyber-guide.fr?subject=[CONTACT] ${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(formData.message)}%0A%0ADe: ${encodeURIComponent(fullName)} (${encodeURIComponent(formData.email)})`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (status === 'error') {
      setStatus('idle');
    }
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = (): boolean => {
    if (formData.firstName.trim().length < 2) {
      setErrorMessage('Le prénom est requis.');
      return false;
    }
    if (formData.name.trim().length < 2) {
      setErrorMessage('Le nom est requis.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMessage('Adresse email invalide.');
      return false;
    }
    if (formData.message.trim().length < 30) {
      setErrorMessage('Le message est trop court (min. 30 caractères).');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Anti-spam Checks
    if (formData.honeypot) {
      return;
    }
    if (Date.now() - mountTime.current < 3000) {
      setErrorMessage('Envoi impossible (détecté comme spam).');
      setStatus('error');
      return;
    }

    // 2. Validation
    if (!validateForm()) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    // 3. Submission logic
    const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT?.trim();

    if (endpoint) {
      if (endpoint.includes('<id>')) {
        setStatus('error');
        setErrorMessage("Endpoint Formspree invalide. Remplacez '<id>' par votre ID réel.");
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
          // Ignore body parsing issue and keep status fallback.
        }

        throw new Error(formspreeError || `Erreur formulaire (${response.status})`);
      } catch (error) {
        const timeoutError = error instanceof DOMException && error.name === 'AbortError';
        setStatus('error');
        setErrorMessage(
          timeoutError
            ? "Le service de formulaire ne répond pas (timeout). Réessayez ou utilisez l'email direct."
            : error instanceof Error && error.message
              ? `Envoi impossible: ${error.message}`
              : "Le service de formulaire est indisponible. Réessayez ou utilisez l'email direct.",
        );
      } finally {
        window.clearTimeout(timeoutId);
      }
    } else {
      setStatus('error');
      setErrorMessage(
        "Le formulaire n'est pas configuré. Ajoutez VITE_FORMSPREE_ENDPOINT ou utilisez l'email direct.",
      );
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <Seo
        title="Contact Cyber Guide"
        description="Contactez Cyber Guide pour une question sur les analyses, templates ou outils defensifs."
        path="/contact"
        image="/assets/og/contact.svg"
        keywords={['contact cyber', 'cybersecurite operationnelle', 'support cyber guide']}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact Cyber Guide',
          url: 'https://cyber-guide.fr/contact',
        }}
      />
      <ShieldHeader title="Contact" subtitle="Communication" align="center" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlueprintPanel label="SECURE_CHANNEL_FORM" className="py-12">
          {status === 'success' ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-display font-bold text-brand-navy mb-2">
                Message Transmis
              </h2>
              <p className="text-slate-600">L'équipe Cyber Guide vous répondra sous 48h ouvrées.</p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-8 text-sm font-bold text-brand-steel underline"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-12 gap-12">
              {/* Info Column */}
              <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-slate-200 pb-8 md:pb-0 md:pr-8">
                <h2 className="text-xl font-display font-bold text-brand-navy mb-4">
                  Nous contacter
                </h2>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Pour toute question relative aux analyses, signalement d'erreur ou demande d'accès
                  aux outils complets.
                </p>

                <div className="flex items-center gap-3 text-sm font-mono text-brand-navy mb-2">
                  <Mail size={16} className="text-brand-steel" />
                  contact@cyber-guide.fr
                </div>

                <div className="mt-8 p-4 bg-slate-100 border-l-4 border-brand-steel text-xs text-slate-500">
                  <strong>Note :</strong> Pas de démarchage commercial. Les demandes non
                  professionnelles ne seront pas traitées.
                </div>
              </div>

              {/* Form Column */}
              <div className="md:col-span-7">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot Field (Hidden) */}
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
                        Prénom *
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
                        Nom *
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
                        Email *
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
                        Sujet *
                      </label>
                      <select
                        name="subject"
                        className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:border-brand-steel outline-none text-sm bg-white"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, subject: e.target.value }))
                        }
                        required
                      >
                        <option value="">Sélectionner un sujet...</option>
                        <option value="Demande de démo">Demande de démo / Outils</option>
                        <option value="Question Analyse">Question sur une analyse</option>
                        <option value="Erreur / Bug">Signalement d'erreur</option>
                        <option value="Autre">Autre demande</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-navy uppercase mb-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:border-brand-steel focus:ring-1 focus:ring-brand-steel outline-none text-sm resize-none"
                      placeholder="Votre message détaillé (min. 30 caractères)..."
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
                      <span>{errorMessage || 'Une erreur est survenue.'}</span>
                      <button
                        type="button"
                        className="ml-auto font-bold underline"
                        onClick={() => window.location.assign(buildMailtoUrl())}
                      >
                        Ouvrir email
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
                        Envoi en cours <Loader2 size={16} className="ml-2 animate-spin" />
                      </>
                    ) : (
                      <>
                        Envoyer le message <Send size={16} className="ml-2" />
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
