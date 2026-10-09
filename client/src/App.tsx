import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Languages,
  Sparkles,
  Zap,
  Copy,
  Volume2,
  Smartphone,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';
import { Header } from './components/Header';
import { TranslationWorkspace } from './components/TranslationWorkspace';
import { FeatureCard } from './components/FeatureCard';
import { Footer } from './components/Footer';
import { fetchBackendHealth } from './services/translationService';
import { BackendHealthResponse } from './types/translation';

export const App: React.FC = () => {
  const [backendHealth, setBackendHealth] = useState<BackendHealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  const checkHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const data = await fetchBackendHealth();
      setBackendHealth(data);
    } catch {
      setBackendHealth(null);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const features = [
    {
      icon: Globe,
      title: 'Multiple Languages',
      description:
        'Translate seamlessly across popular global and major Indian regional languages including Telugu, Hindi, Tamil, Kannada, and Malayalam.',
    },
    {
      icon: Sparkles,
      title: 'Automatic Language Detection',
      description:
        'Unsure of the source language? Let the translation engine identify the input language automatically.',
    },
    {
      icon: Zap,
      title: 'Instant Text Translation',
      description:
        'Powered directly by the official Google Cloud Translation API for fast, natural, and reliable translations.',
    },
    {
      icon: Copy,
      title: 'Copy Translated Text',
      description:
        'Copy translations to your system clipboard with a single click, accompanied by clear visual confirmation.',
    },
    {
      icon: Volume2,
      title: 'Text-to-Speech',
      description:
        'Listen to source and translated texts with speech synthesis using native browser voices and locale matching.',
    },
    {
      icon: Smartphone,
      title: 'Responsive Design',
      description:
        'Fully adaptive user experience tailored specifically for desktop workstations, laptops, tablets, and mobile screens.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Enter your text',
      description: 'Type or paste the phrase or text you wish to translate into the source input panel.',
    },
    {
      number: '02',
      title: 'Select languages',
      description: 'Pick your source and target languages, or choose Auto Detect for source language identification.',
    },
    {
      number: '03',
      title: 'Receive translation',
      description: 'Click Translate Text or press Ctrl+Enter to generate your translation, then listen or copy.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-500 selection:text-white">
      {/* Sticky Header with Backend Status */}
      <Header
        backendHealth={backendHealth}
        healthLoading={healthLoading}
        onRefreshHealth={checkHealth}
      />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section id="home" className="pt-12 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-semibold mb-6 shadow-2xs">
            <Languages className="w-3.5 h-3.5" />
            <span>Break Language Barriers. Connect the World.</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-none">
            Translate Any Language,{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
              Instantly.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Communicate without boundaries. Translate text between languages with a simple, fast, and intuitive translation experience.
          </p>

          {/* Call to Action Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#workspace"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 active:scale-98"
            >
              <span>Start Translating</span>
              <ArrowDown className="w-4 h-4" />
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all shadow-xs"
            >
              <span>See How It Works</span>
            </a>
          </div>

          {/* Global Communication Pill Highlights */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Official Google Cloud API</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Indian &amp; Global Languages</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Web Speech Audio Output</span>
            </div>
          </div>
        </section>

        {/* TRANSLATION WORKSPACE SECTION */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TranslationWorkspace apiKeyConfigured={backendHealth?.googleTranslateApiKeyConfigured} />
        </div>

        {/* FEATURES SECTION */}
        <section id="features" className="scroll-mt-20 py-20 bg-slate-100/50 border-t border-slate-200/60 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
                Core Capabilities
              </h2>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Designed for Effortless Communication
              </p>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Everything you need to translate text quickly and accurately, built with modern web technologies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <FeatureCard
                  key={idx}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="scroll-mt-20 py-20 bg-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
                Simple Workflow
              </h2>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                How LinguaFlow Works
              </p>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Three straightforward steps to translate any sentence or paragraph.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80 relative flex flex-col justify-between hover:border-indigo-300 transition-colors shadow-2xs"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                      {step.number}
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default App;
