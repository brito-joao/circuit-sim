'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

const STORAGE_KEY = 'logic_sim_onboarding_v2';

// Step targets — data-tour attributes on the real elements
const STEPS = [
  { titleKey: 'tourStep1Title', bodyKey: 'tourStep1Body', icon: '👋', emoji: '🤖', targetAttr: null },
  { titleKey: 'tourStep2Title', bodyKey: 'tourStep2Body', icon: '📋', emoji: '🤖', targetAttr: 'btn-prompt' },
  { titleKey: 'tourStep3Title', bodyKey: 'tourStep3Body', icon: '🤖', emoji: '💬', targetAttr: null },
  { titleKey: 'tourStep4Title', bodyKey: 'tourStep4Body', icon: '📄', emoji: '📋', targetAttr: null },
  { titleKey: 'tourStep5Title', bodyKey: 'tourStep5Body', icon: '⚡', emoji: '📥', targetAttr: 'paste-from-ai' },
] as const;

function getTargetRect(attr: string | null) {
  if (!attr) return null;
  const el = document.querySelector(`[data-tour="${attr}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top - 10, left: r.left - 10, width: r.width + 20, height: r.height + 20 };
}

// Visual illustrations for each step
function StepVisual({ step }: { step: number }) {
  const style: React.CSSProperties = {
    background: 'linear-gradient(135deg, #f8f9ff 0%, #eef1ff 100%)',
    borderRadius: '12px', padding: '16px', marginBottom: '16px',
    border: '1px solid #e0e4ff', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '12px', fontSize: '13px', color: '#636e72',
    fontFamily: 'monospace', minHeight: '56px',
  };

  if (step === 0) return (
    <div style={{ ...style, gap: '20px', fontSize: '32px', background: 'linear-gradient(135deg, #6c5ce710, #a29bfe20)' }}>
      🔌 → 🤖 → ⚡
    </div>
  );
  if (step === 1) return (
    <div style={style}>
      <div style={{ background: '#6c5ce7', color: 'white', borderRadius: '8px', padding: '8px 14px', fontFamily: 'sans-serif', fontWeight: 700, fontSize: '13px' }}>
        🤖 Prompt IA
      </div>
      <div style={{ fontSize: '20px' }}>→</div>
      <div style={{ background: '#e8f5e9', borderRadius: '8px', padding: '8px 14px', color: '#2e7d32', fontWeight: 700, fontFamily: 'sans-serif' }}>
        ✅ Copiado!
      </div>
    </div>
  );
  if (step === 2) return (
    <div style={{ ...style, flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
      <div style={{ background: '#e3f2fd', borderRadius: '6px', padding: '6px 10px', color: '#1565c0', fontFamily: 'sans-serif', fontSize: '12px' }}>
        💬 &quot;Monte um latch SR com dois NAND gates&quot;
      </div>
      <div style={{ alignSelf: 'flex-end', background: '#f3e5f5', borderRadius: '6px', padding: '6px 10px', color: '#6a1b9a', fontFamily: 'sans-serif', fontSize: '12px' }}>
        🤖 {'{'} &quot;boards&quot;: 1, &quot;chips&quot;: [...] {'}'}
      </div>
    </div>
  );
  if (step === 3) return (
    <div style={{ ...style, flexDirection: 'column', gap: '4px', alignItems: 'flex-start', padding: '10px 14px' }}>
      <div style={{ color: '#a29bfe', fontSize: '11px' }}>{'{'}</div>
      <div style={{ color: '#74b9ff', fontSize: '11px', paddingLeft: '12px' }}>&quot;boards&quot;: 1,</div>
      <div style={{ color: '#74b9ff', fontSize: '11px', paddingLeft: '12px' }}>&quot;chips&quot;: [ ... ],</div>
      <div style={{ color: '#55efc4', fontSize: '11px', paddingLeft: '12px' }}>&quot;wires&quot;: [ ... ]</div>
      <div style={{ color: '#a29bfe', fontSize: '11px' }}>{'}'}</div>
      <div style={{ alignSelf: 'flex-end', background: '#00b894', color: 'white', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontFamily: 'sans-serif', marginTop: '4px' }}>
        Ctrl+A → Ctrl+C ✓
      </div>
    </div>
  );
  if (step === 4) return (
    <div style={{ ...style, flexDirection: 'column', gap: '8px' }}>
      <div style={{
        background: 'linear-gradient(90deg, #00b894, #00cec9)',
        color: 'white', borderRadius: '10px',
        padding: '12px 20px', fontFamily: 'sans-serif',
        fontWeight: 800, fontSize: '15px', width: '100%', textAlign: 'center',
        boxShadow: '0 4px 16px rgba(0,184,148,0.4)',
      }}>
        📥 COLAR DA IA
      </div>
      <div style={{ fontSize: '20px' }}>↓</div>
      <div style={{ background: '#e3f2fd', borderRadius: '8px', padding: '6px 12px', color: '#1565c0', fontFamily: 'sans-serif', fontSize: '12px' }}>
        🔌 Circuito aparece na protoboard!
      </div>
    </div>
  );
  return null;
}

export function OnboardingTour({ forceOpen = false, onClose }: { forceOpen?: boolean; onClose?: () => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [highlight, setHighlight] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (forceOpen) { setOpen(true); setStep(0); return; }
    if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
  }, [forceOpen]);

  useEffect(() => {
    if (!open) return;
    const rect = getTargetRect(STEPS[step]?.targetAttr ?? null);
    setHighlight(rect);
  }, [step, open]);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
    setStep(0);
    onClose?.();
  };

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      {/* Dim overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(10,10,30,0.72)',
        backdropFilter: 'blur(3px)',
      }} onClick={close} />

      {/* Highlight ring on targeted element */}
      {highlight && (
        <div style={{
          position: 'absolute',
          top: highlight.top, left: highlight.left,
          width: highlight.width, height: highlight.height,
          borderRadius: '12px', pointerEvents: 'none', zIndex: 10000,
          boxShadow: '0 0 0 4px #a29bfe, 0 0 0 8px rgba(162,155,254,0.25), 0 0 40px rgba(162,155,254,0.4)',
          animation: 'tPulse 2s ease-in-out infinite',
        }} />
      )}

      {/* Card — positioned low when there's a highlighted element to show it without covering it */}
      <div style={{
        position: 'absolute',
        bottom: highlight ? '30px' : '50%',
        left: '50%',
        transform: highlight ? 'translateX(-50%)' : 'translate(-50%, 50%)',
        background: '#ffffff',
        borderRadius: '20px',
        padding: '28px 28px 24px',
        width: 'min(440px, 92vw)',
        boxShadow: '0 32px 80px rgba(0,0,20,0.35), 0 0 0 1px rgba(0,0,0,0.06)',
        zIndex: 10001,
        animation: 'tSlide 0.3s ease',
      }}>
        {/* Step pills / progress */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} style={{
              width: i === step ? '28px' : '8px',
              height: '8px', borderRadius: '4px', border: 'none',
              cursor: 'pointer',
              background: i < step ? '#00b894' : i === step ? '#6c5ce7' : '#e0e0e0',
              transition: 'all 0.25s',
              padding: 0,
            }} />
          ))}
        </div>

        {/* Icon badge */}
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px', margin: '0 auto 14px', boxShadow: '0 8px 20px rgba(108,92,231,0.3)',
        }}>
          {current.icon}
        </div>

        {/* Title */}
        <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#1e272e', textAlign: 'center', lineHeight: 1.3 }}>
          {t[current.titleKey] as string}
        </h2>

        {/* Illustration */}
        <StepVisual step={step} />

        {/* Body */}
        <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#636e72', lineHeight: 1.75, textAlign: 'center' }}>
          {t[current.bodyKey] as string}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={close} style={{
            flex: 1, background: '#f8f9fa', border: '1px solid #e9ecef',
            color: '#868e96', padding: '10px', borderRadius: '10px',
            cursor: 'pointer', fontSize: '13px', fontWeight: 600,
          }}>
            {t.tourBtnSkip}
          </button>
          <button
            onClick={() => isLast ? close() : setStep(s => s + 1)}
            style={{
              flex: 2, background: isLast
                ? 'linear-gradient(90deg, #00b894, #00cec9)'
                : 'linear-gradient(90deg, #6c5ce7, #a29bfe)',
              color: 'white', border: 'none',
              padding: '11px 20px', borderRadius: '10px',
              cursor: 'pointer', fontSize: '14px', fontWeight: 800,
              boxShadow: isLast ? '0 4px 14px rgba(0,184,148,0.4)' : '0 4px 14px rgba(108,92,231,0.4)',
              transition: 'transform 0.1s',
            }}
          >
            {isLast ? t.tourBtnDone : t.tourBtnNext}
          </button>
        </div>

        {/* Counter */}
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: '#ced4da' }}>
          {step + 1} {t.tourProgress} {STEPS.length}
        </div>
      </div>

      <style>{`
        @keyframes tSlide {
          from { opacity: 0; transform: ${highlight ? 'translateX(-50%) translateY(16px)' : 'translate(-50%, calc(50% + 16px))'}; }
          to   { opacity: 1; transform: ${highlight ? 'translateX(-50%)' : 'translate(-50%, 50%)'}; }
        }
        @keyframes tPulse {
          0%, 100% { box-shadow: 0 0 0 4px #a29bfe, 0 0 0 8px rgba(162,155,254,0.25); }
          50%       { box-shadow: 0 0 0 4px #a29bfe, 0 0 0 14px rgba(162,155,254,0.45); }
        }
      `}</style>
    </div>
  );
}
