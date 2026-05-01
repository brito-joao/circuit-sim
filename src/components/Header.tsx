'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { OnboardingTour } from './OnboardingTour';
import { getAIPrompt } from '@/lib/aiPrompt';

interface HeaderProps {
  isRunning: boolean;
  onToggleSimulation: () => void;
  onCompile: () => void;
  compileError: string | null;
}

export default function Header({ isRunning, onToggleSimulation, onCompile, compileError }: HeaderProps) {
  const { t, lang, setLang } = useI18n();
  const [tourOpen, setTourOpen] = useState(false);

  const copyAIPrompt = () => {
    // AI prompt is always in English for best AI model compatibility
    const prompt = getAIPrompt();
    navigator.clipboard.writeText(prompt);
    alert(lang === 'pt' ? 'Prompt IA copiado!' : 'AI Prompt copied!');
  };

  return (
    <>
      <header data-tour="header">
        <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
          {t.appTitle}
        </h1>

        <div className="controls">
          {/* Status indicator */}
          <span style={{
            fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '12px',
            background: compileError ? 'rgba(214,48,49,0.2)' : isRunning ? 'rgba(0,184,148,0.2)' : 'rgba(255,255,255,0.1)',
            color: compileError ? '#ff7675' : isRunning ? '#55efc4' : '#b2bec3',
            border: `1px solid ${compileError ? '#d63031' : isRunning ? '#00b894' : 'rgba(255,255,255,0.1)'}`,
          }}>
            {compileError ? `${t.statusError}: ${compileError.slice(0, 30)}` : isRunning ? t.statusRunning : t.statusStopped}
          </span>

          <button id="btn-prompt" data-tour="btn-prompt" onClick={copyAIPrompt} style={{ background: '#6c5ce7', color: 'white' }}>
            {t.btnAIPrompt}
          </button>

          <button id="btn-compile" onClick={onCompile}>
            {t.btnCompile}
          </button>

          <button
            id="btn-play"
            className={isRunning ? 'active' : ''}
            onClick={onToggleSimulation}
          >
            {isRunning ? t.btnStop : t.btnRun}
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'pt' : 'en')}
            title="Toggle language / Alternar idioma"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', borderRadius: '6px',
              padding: '6px 10px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 700,
            }}
          >
            {t.langToggle}
          </button>

          {/* Help button */}
          <button
            id="btn-help"
            onClick={() => setTourOpen(true)}
            title={t.btnHelp}
            style={{
              background: 'rgba(162,155,254,0.2)',
              border: '1px solid rgba(162,155,254,0.4)',
              color: '#a29bfe', borderRadius: '6px',
              padding: '6px 12px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700,
            }}
          >
            {t.btnHelp}
          </button>
        </div>
      </header>

      {/* Onboarding tour — forced open when user clicks Help */}
      {tourOpen && <OnboardingTour forceOpen onClose={() => setTourOpen(false)} />}

      {/* Auto-shown on first visit (forceOpen = false) */}
      {!tourOpen && <OnboardingTour />}
    </>
  );
}
