import { useEffect, useRef, useState } from 'react';

const defaultCopy = 'Saya Mengerti & Berjanji Tidak Mengulangi';

function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

function formatWarningDate(value) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(value));
}

export default function WarningGuard({ children }) {
  const messageRef = useRef(null);
  const [warnings, setWarnings] = useState([]);
  const [activeWarning, setActiveWarning] = useState(null);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadWarnings() {
      const response = await fetch('/user/warnings/unread', {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) return;

      const data = await response.json();
      const unreadWarnings = Array.isArray(data.warnings) ? data.warnings : [];

      if (isMounted) {
        setWarnings(unreadWarnings);
        setActiveWarning(unreadWarnings[0] || null);
      }
    }

    loadWarnings();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setHasScrolledToEnd(false);

    window.setTimeout(() => {
      const node = messageRef.current;
      if (node && node.scrollHeight <= node.clientHeight + 4) {
        setHasScrolledToEnd(true);
      }
    }, 0);
  }, [activeWarning]);

  function handleScroll() {
    const node = messageRef.current;
    if (!node) return;

    const reachedEnd = node.scrollTop + node.clientHeight >= node.scrollHeight - 8;
    if (reachedEnd) setHasScrolledToEnd(true);
  }

  async function markAsRead() {
    if (!activeWarning || !hasScrolledToEnd || isSubmitting) return;

    setIsSubmitting(true);
    const response = await fetch(`/user/read-warning/${activeWarning.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-csrf-token': getCsrfToken()
      }
    });

    if (!response.ok) {
      setIsSubmitting(false);
      return;
    }

    const remainingWarnings = warnings.filter((warning) => warning.id !== activeWarning.id);
    setWarnings(remainingWarnings);
    setActiveWarning(remainingWarnings[0] || null);
    setIsSubmitting(false);
  }

  return (
    <>
      {children}

      {activeWarning && (
        <div
          aria-modal="true"
          role="dialog"
          aria-labelledby="warning-guard-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            background: 'rgba(0, 0, 0, 0.72)'
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <div
            style={{
              width: 'min(560px, 100%)',
              maxHeight: '90vh',
              overflow: 'hidden',
              border: '2px solid #ffc107',
              borderRadius: 8,
              background: '#fff',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.35)'
            }}
          >
            <div style={{ background: '#ffc107', padding: '22px 26px', color: '#000' }}>
              <div
                style={{
                  display: 'inline-block',
                  marginBottom: 8,
                  padding: '4px 10px',
                  borderRadius: 4,
                  background: '#000',
                  color: '#ffc107',
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 0.6
                }}
              >
                OFFICIAL NOTICE
              </div>
              <h2 id="warning-guard-title" style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
                Peringatan Pelanggaran Akun
              </h2>
            </div>

            <div style={{ padding: 26 }}>
              <p style={{ margin: '0 0 8px', color: '#555', fontSize: 14 }}>
                Tanggal: <strong>{formatWarningDate(activeWarning.created_at)}</strong>
              </p>
              <p style={{ margin: '0 0 18px', color: '#333' }}>
                Anda wajib membaca peringatan resmi berikut sebelum melanjutkan penggunaan dashboard.
              </p>

              <div
                ref={messageRef}
                onScroll={handleScroll}
                style={{
                  maxHeight: 220,
                  overflowY: 'auto',
                  padding: 18,
                  borderLeft: '6px solid #ffc107',
                  borderRadius: 6,
                  background: '#fff9e6',
                  color: '#3f3f46',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {activeWarning.message}
              </div>

              <div
                style={{
                  margin: '18px 0',
                  padding: 14,
                  border: '1px solid #f5c6cb',
                  borderRadius: 6,
                  background: '#f8d7da',
                  color: '#721c24',
                  fontSize: 13
                }}
              >
                <strong>PERHATIAN:</strong> Pelanggaran berulang dapat menyebabkan pembatasan fitur
                atau pemblokiran akun permanen.
              </div>

              <button
                type="button"
                disabled={!hasScrolledToEnd || isSubmitting}
                onClick={markAsRead}
                style={{
                  width: '100%',
                  minHeight: 48,
                  border: 0,
                  borderRadius: 6,
                  background: hasScrolledToEnd && !isSubmitting ? '#000' : '#9ca3af',
                  color: '#fff',
                  cursor: hasScrolledToEnd && !isSubmitting ? 'pointer' : 'not-allowed',
                  fontWeight: 800,
                  fontSize: 14
                }}
              >
                {isSubmitting ? 'Memproses...' : defaultCopy}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
