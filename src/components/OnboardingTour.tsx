'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

const STORAGE_KEY = 'logic_sim_onboarding_v3';

const STEPS = [
  { titleKey: 'tourStep0Title', bodyKey: 'tourStep0Body', icon: '🎓', targetAttr: null },
  { titleKey: 'tourStep1Title', bodyKey: 'tourStep1Body', icon: '📋', targetAttr: 'btn-prompt' },
  { titleKey: 'tourStep2Title', bodyKey: 'tourStep2Body', icon: '🤖', targetAttr: null },
  { titleKey: 'tourStep3Title', bodyKey: 'tourStep3Body', icon: '📄', targetAttr: null },
  { titleKey: 'tourStep4Title', bodyKey: 'tourStep4Body', icon: '⚡', targetAttr: 'paste-from-ai' },
  { titleKey: 'tourStep5Title', bodyKey: 'tourStep5Body', icon: '🔧', targetAttr: 'ikea-panel' },
  { titleKey: 'tourStep6Title', bodyKey: 'tourStep6Body', icon: '📐', targetAttr: 'ikea-panel' },
] as const;

type StepKey = typeof STEPS[number]['titleKey'];

function getTargetRect(attr: string | null) {
  if (!attr) return null;
  const el = document.querySelector(`[data-tour="${attr}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top - 10, left: r.left - 10, width: r.width + 20, height: r.height + 20 };
}

// ─── Step-specific visual illustrations ───────────────────────────────────────
function StepVisual({ step }: { step: number }) {
  const card: React.CSSProperties = {
    borderRadius: '12px', padding: '14px 16px', marginBottom: '16px',
    border: '1px solid #e8ecff', display: 'flex', alignItems: 'center',
    gap: '12px', fontSize: '13px', color: '#636e72', minHeight: '60px',
    background: 'linear-gradient(135deg, #f8f9ff, #eef1ff)',
  };

  if (step === 0) return (
    <div style={{ ...card, flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
        <div style={{ flex: 1, background: '#6c5ce715', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '22px', marginBottom: '4px' }}>🤖</div>
          <div style={{ fontFamily: 'sans-serif', fontSize: '11px', fontWeight: 700, color: '#6c5ce7' }}>Via IA</div>
          <div style={{ fontFamily: 'sans-serif', fontSize: '10px', color: '#888', marginTop: '2px' }}>Rápido</div>
        </div>
        <div style={{ fontSize: '24px', alignSelf: 'center', color: '#b2bec3' }}>|</div>
        <div style={{ flex: 1, background: '#00b89415', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '22px', marginBottom: '4px' }}>🔧</div>
          <div style={{ fontFamily: 'sans-serif', fontSize: '11px', fontWeight: 700, color: '#00b894' }}>Passo a Passo</div>
          <div style={{ fontFamily: 'sans-serif', fontSize: '10px', color: '#888', marginTop: '2px' }}>Para aprender</div>
        </div>
      </div>
    </div>
  );

  if (step === 1) return (
    <div style={card}>
      <div style={{ background: '#6c5ce7', color: 'white', borderRadius: '8px', padding: '8px 14px', fontFamily: 'sans-serif', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
        🤖 Prompt IA
      </div>
      <div style={{ fontSize: '18px', color: '#b2bec3' }}>→</div>
      <div style={{ background: '#e8f5e9', borderRadius: '8px', padding: '8px 12px', color: '#2e7d32', fontWeight: 700, fontFamily: 'sans-serif', fontSize: '12px' }}>
        ✅ Copiado!
      </div>
    </div>
  );

  if (step === 2) return (
    <div style={{ ...card, flexDirection: 'column', alignItems: 'flex-start', gap: '6px', padding: '12px 14px' }}>
      <div style={{ background: '#e3f2fd', borderRadius: '6px', padding: '7px 10px', color: '#1565c0', fontFamily: 'sans-serif', fontSize: '12px' }}>
        💬 &quot;Monta um latch SR com dois NAND gates&quot;
      </div>
      <div style={{ alignSelf: 'flex-end', background: '#f3e5f5', borderRadius: '6px', padding: '7px 10px', color: '#6a1b9a', fontFamily: 'sans-serif', fontSize: '12px' }}>
        🤖 {'{'}&quot;boards&quot;: 1, &quot;chips&quot;: [...]{'}'} 
      </div>
    </div>
  );

  if (step === 3) return (
    <div style={{ ...card, flexDirection: 'column', gap: '3px', alignItems: 'flex-start', padding: '10px 14px' }}>
      <div style={{ color: '#a29bfe', fontFamily: 'monospace', fontSize: '11px' }}>{'{'}</div>
      <div style={{ color: '#74b9ff', fontFamily: 'monospace', fontSize: '11px', paddingLeft: '12px' }}>&quot;boards&quot;: 1,</div>
      <div style={{ color: '#74b9ff', fontFamily: 'monospace', fontSize: '11px', paddingLeft: '12px' }}>&quot;chips&quot;: [ ... ],</div>
      <div style={{ color: '#55efc4', fontFamily: 'monospace', fontSize: '11px', paddingLeft: '12px' }}>&quot;wires&quot;: [ ... ]</div>
      <div style={{ color: '#a29bfe', fontFamily: 'monospace', fontSize: '11px' }}>{'}'}</div>
      <div style={{ alignSelf: 'flex-end', background: '#00b894', color: 'white', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontFamily: 'sans-serif', marginTop: '4px' }}>
        Ctrl+A → Ctrl+C ✓
      </div>
    </div>
  );

  if (step === 4) return (
    <div style={{ ...card, flexDirection: 'column', gap: '8px' }}>
      <div style={{ background: 'linear-gradient(90deg,#00b894,#00cec9)', color: 'white', borderRadius: '10px', padding: '12px 20px', fontFamily: 'sans-serif', fontWeight: 800, fontSize: '15px', width: '100%', textAlign: 'center', boxShadow: '0 4px 14px rgba(0,184,148,0.4)' }}>
        📥 COLAR DA IA
      </div>
      <div style={{ fontSize: '18px', color: '#b2bec3' }}>↓</div>
      <div style={{ background: '#e8f5e9', borderRadius: '8px', padding: '8px 14px', color: '#2e7d32', fontFamily: 'sans-serif', fontSize: '12px', fontWeight: 600 }}>
        🔌 Circuito aparece na protoboard!
      </div>
    </div>
  );

  if (step === 5) return (
    <div style={{ ...card, flexDirection: 'column', gap: '8px', padding: '12px 14px' }}>
      <div style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#636e72', textAlign: 'center', fontStyle: 'italic' }}>
        Como as instruções de uma caixa de LEGO 🧩
      </div>
      <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
        {['Fio 1 ✓', 'Fio 2 ✓', 'Fio 3...', '...'].map((label, i) => (
          <div key={i} style={{ flex: 1, background: i < 2 ? '#e8f5e9' : i === 2 ? '#fff3e0' : '#f5f5f5', border: `1px solid ${i < 2 ? '#a5d6a7' : i === 2 ? '#ffcc80' : '#e0e0e0'}`, borderRadius: '6px', padding: '6px 4px', textAlign: 'center', fontSize: '10px', fontFamily: 'sans-serif', color: i < 2 ? '#2e7d32' : i === 2 ? '#e65100' : '#9e9e9e', fontWeight: i === 2 ? 700 : 400 }}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );

  if (step === 6) return (
    <div style={{ ...card, flexDirection: 'column', gap: '6px', padding: '12px 14px' }}>
      {[
        { icon: '▶', label: 'Iniciar Montagem', color: '#6c5ce7', bg: '#6c5ce715', desc: 'Começar do fio 1' },
        { icon: '→', label: 'Próximo Fio', color: '#0984e3', bg: '#0984e315', desc: 'Ver fio seguinte' },
        { icon: '👀', label: 'Ver Todos', color: '#636e72', bg: '#63607215', desc: 'Mostrar tudo' },
        { icon: '⚡', label: 'Ligar Tudo', color: '#d63031', bg: '#d6303115', desc: 'Saltar etapas' },
      ].map(({ icon, label, color, bg, desc }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: bg, borderRadius: '8px', padding: '6px 10px' }}>
          <div style={{ background: color, color: 'white', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 700, fontFamily: 'sans-serif', minWidth: '36px', textAlign: 'center' }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'sans-serif', fontSize: '12px', fontWeight: 700, color }}>{label}</div>
            <div style={{ fontFamily: 'sans-serif', fontSize: '10px', color: '#999' }}>{desc}</div>
          </div>
        </div>
      ))}
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
    setHighlight(getTargetRect(STEPS[step]?.targetAttr ?? null));
  }, [step, open]);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false); setStep(0); onClose?.();
  };

  if (!open) return null;

  const cur = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // The card slides up from bottom when there's a highlight, otherwise stays centered
  const cardBottom = highlight ? '24px' : undefined;
  const cardTransform = highlight ? 'translateX(-50%)' : 'translate(-50%, -50%)';
  const cardTop = highlight ? undefined : '50%';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,30,0.72)', backdropFilter: 'blur(3px)' }} onClick={close} />

      {/* Highlight ring */}
      {highlight && (
        <div style={{
          position: 'absolute',
          top: highlight.top, left: highlight.left,
          width: highlight.width, height: highlight.height,
          borderRadius: '12px', pointerEvents: 'none', zIndex: 10000,
          boxShadow: '0 0 0 4px #a29bfe, 0 0 0 8px rgba(162,155,254,0.2), 0 0 40px rgba(162,155,254,0.4)',
          animation: 'tPulse 2s ease-in-out infinite',
        }} />
      )}

      {/* Card */}
      <div style={{
        position: 'absolute',
        bottom: cardBottom, top: cardTop,
        left: '50%', transform: cardTransform,
        background: '#fff', borderRadius: '20px',
        padding: '26px 26px 22px',
        width: 'min(460px, 92vw)',
        boxShadow: '0 32px 80px rgba(0,0,20,0.35), 0 0 0 1px rgba(0,0,0,0.05)',
        zIndex: 10001, animation: 'tSlide 0.3s ease',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Progress pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '18px' }}>
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} style={{
              width: i === step ? '24px' : '7px', height: '7px',
              borderRadius: '4px', border: 'none', cursor: 'pointer', padding: 0,
              background: i < step ? '#00b894' : i === step ? '#6c5ce7' : '#dfe6e9',
              transition: 'all 0.25s',
            }} />
          ))}
        </div>

        {/* Icon badge */}
        <div style={{
          width: '54px', height: '54px', borderRadius: '16px',
          background: step >= 5 ? 'linear-gradient(135deg,#00b894,#00cec9)' : 'linear-gradient(135deg,#6c5ce7,#a29bfe)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px', margin: '0 auto 12px',
          boxShadow: step >= 5 ? '0 6px 18px rgba(0,184,148,0.35)' : '0 6px 18px rgba(108,92,231,0.35)',
        }}>
          {cur.icon}
        </div>

        {/* Title */}
        <h2 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 800, color: '#1e272e', textAlign: 'center', lineHeight: 1.3 }}>
          {t[cur.titleKey] as string}
        </h2>

        {/* Illustration */}
        <StepVisual step={step} />

        {/* Body text */}
        <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#636e72', lineHeight: 1.75, textAlign: 'center' }}>
          {t[cur.bodyKey] as string}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={close} style={{ flex: 1, background: '#f8f9fa', border: '1px solid #e9ecef', color: '#868e96', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            {t.tourBtnSkip}
          </button>
          <button
            onClick={() => isLast ? close() : setStep(s => s + 1)}
            style={{
              flex: 2,
              background: isLast
                ? 'linear-gradient(90deg,#00b894,#00cec9)'
                : step >= 5
                ? 'linear-gradient(90deg,#00b894,#00cec9)'
                : 'linear-gradient(90deg,#6c5ce7,#a29bfe)',
              color: 'white', border: 'none',
              padding: '11px 20px', borderRadius: '10px',
              cursor: 'pointer', fontSize: '14px', fontWeight: 800,
              boxShadow: step >= 5 || isLast ? '0 4px 14px rgba(0,184,148,0.4)' : '0 4px 14px rgba(108,92,231,0.4)',
            }}
          >
            {isLast ? t.tourBtnDone : t.tourBtnNext}
          </button>
        </div>

        {/* Counter */}
        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: '#ced4da' }}>
          {step + 1} {t.tourProgress} {STEPS.length}
        </div>
      </div>

      <style>{`
        @keyframes tSlide {
          from { opacity: 0; transform: ${cardTransform} translateY(14px); }
          to   { opacity: 1; transform: ${cardTransform}; }
        }
        @keyframes tPulse {
          0%, 100% { box-shadow: 0 0 0 4px #a29bfe, 0 0 0 8px rgba(162,155,254,0.2); }
          50%       { box-shadow: 0 0 0 4px #a29bfe, 0 0 0 14px rgba(162,155,254,0.4); }
        }
      `}</style>
    </div>
  );
}
