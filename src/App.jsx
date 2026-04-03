import { useState } from 'react';
import questions, { sections } from './questions';
import './App.css';

function App() {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const sectionQuestions = questions.filter(q => q.section === sections[currentSection]);
  const progress = sections.length <= 1 ? 100 : Math.round((currentSection / (sections.length - 1)) * 100);
  const answeredCount = Object.keys(answers).filter(k => {
    const v = answers[k];
    if (Array.isArray(v)) return v.length > 0;
    return typeof v === 'string' && v.trim().length > 0;
  }).length;

  const handleChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleMulti = (id, option) => {
    setAnswers(prev => {
      const current = prev[id] || [];
      if (current.includes(option)) {
        return { ...prev, [id]: current.filter(o => o !== option) };
      }
      return { ...prev, [id]: [...current, option] };
    });
  };

  const goTo = (idx) => {
    setCurrentSection(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = () => {
    if (currentSection < sections.length - 1) goTo(currentSection + 1);
  };

  const prev = () => {
    if (currentSection > 0) goTo(currentSection - 1);
  };

  const buildEmailBody = () => {
    let body = '【和泉出版印刷 HP制作ヒアリングシート】\n\n';
    body += `回答数: ${answeredCount} / ${questions.length}\n`;
    body += `送信日時: ${new Date().toLocaleString('ja-JP')}\n`;
    body += '━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    sections.forEach(section => {
      body += `■ ${section}\n${'─'.repeat(30)}\n`;
      questions.filter(q => q.section === section).forEach(q => {
        const a = answers[q.id];
        const display = Array.isArray(a) ? a.join(', ') : (a || '未回答');
        body += `Q${q.id}. ${q.q}\n→ ${display}\n\n`;
      });
      body += '\n';
    });

    return body;
  };

  const handleSubmit = async () => {
    const body = buildEmailBody();
    const encoded = encodeURIComponent(body);
    if (encoded.length > 1800) {
      await handleCopyToClipboard();
      setSent(true);
      return;
    }
    setSending(true);
    const mailtoLink = `mailto:komedorobouinuzini@yahoo.co.jp?subject=${encodeURIComponent('【和泉出版印刷】HP制作ヒアリングシート回答')}&body=${encoded}`;
    window.location.href = mailtoLink;
    setSending(false);
    setSent(true);
  };

  const handleCopyToClipboard = async () => {
    const body = buildEmailBody();
    try {
      await navigator.clipboard.writeText(body);
      alert('回答内容をクリップボードにコピーしました！\nメールに貼り付けて komedorobouinuzini@yahoo.co.jp へお送りください。');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = body;
      document.body.appendChild(ta);
      ta.select();
      const success = document.execCommand('copy');
      document.body.removeChild(ta);
      if (success) {
        alert('回答内容をクリップボードにコピーしました！\nメールに貼り付けて komedorobouinuzini@yahoo.co.jp へお送りください。');
      } else {
        alert('コピーに失敗しました。お手数ですが手動で選択してコピーしてください。');
      }
    }
  };

  if (sent) {
    return (
      <div className="app">
        <div className="sent-screen">
          <div className="sent-icon">✓</div>
          <h1>送信完了</h1>
          <p>ヒアリングシートの回答ありがとうございました。</p>
          <p className="sent-sub">メールアプリが開かなかった場合は「回答をコピー」ボタンをご利用ください。</p>
          <div className="sent-actions">
            <button className="btn btn--primary" onClick={handleCopyToClipboard}>回答をコピー</button>
            <button className="btn btn--secondary" onClick={() => { setSent(false); goTo(0); }}>最初に戻る</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <h1 className="logo">和泉出版印刷<span>HP制作ヒアリングシート</span></h1>
          <div className="header-stats">{answeredCount}/{questions.length} 回答済み</div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="layout">
        <nav className="sidebar">
          <ul>
            {sections.map((s, i) => {
              const sQs = questions.filter(q => q.section === s);
              const sAns = sQs.filter(q => {
                const v = answers[q.id];
                if (Array.isArray(v)) return v.length > 0;
                return typeof v === 'string' && v.trim().length > 0;
              }).length;
              return (
                <li key={s}>
                  <button
                    className={`sidebar-btn ${i === currentSection ? 'active' : ''} ${sAns === sQs.length && sQs.length > 0 ? 'complete' : ''}`}
                    onClick={() => goTo(i)}
                    data-label={s}
                  >
                    <span className="sidebar-num">{i + 1}</span>
                    <span className="sidebar-label">{s}</span>
                    <span className="sidebar-count">{sAns}/{sQs.length}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="main">
          <div className="section-header">
            <span className="section-num">SECTION {currentSection + 1} / {sections.length}</span>
            <h2 className="section-title">{sections[currentSection]}</h2>
          </div>

          <div className="questions">
            {sectionQuestions.map(q => (
              <div className="q-card" key={q.id}>
                <label className="q-label" htmlFor={`q-${q.id}`}>
                  <span className="q-num">Q{q.id}</span>
                  {q.q}
                </label>

                {q.type === 'text' && (
                  <input
                    id={`q-${q.id}`}
                    type="text"
                    className="q-input"
                    placeholder={q.placeholder}
                    value={answers[q.id] || ''}
                    onChange={e => handleChange(q.id, e.target.value)}
                  />
                )}

                {q.type === 'textarea' && (
                  <textarea
                    id={`q-${q.id}`}
                    className="q-textarea"
                    placeholder={q.placeholder}
                    value={answers[q.id] || ''}
                    onChange={e => handleChange(q.id, e.target.value)}
                    rows={3}
                  />
                )}

                {q.type === 'select' && (
                  <div className="q-options">
                    {q.options.map(opt => (
                      <button
                        key={opt}
                        className={`q-option ${answers[q.id] === opt ? 'selected' : ''}`}
                        onClick={() => handleChange(q.id, answers[q.id] === opt ? '' : opt)}
                        type="button"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'multi' && (
                  <div className="q-options">
                    {q.options.map(opt => (
                      <button
                        key={opt}
                        className={`q-option ${(answers[q.id] || []).includes(opt) ? 'selected' : ''}`}
                        onClick={() => handleMulti(q.id, opt)}
                        type="button"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="nav-buttons">
            <button className="btn btn--secondary" onClick={prev} disabled={currentSection === 0}>
              ← 前へ
            </button>
            {currentSection < sections.length - 1 ? (
              <button className="btn btn--primary" onClick={next}>
                次へ →
              </button>
            ) : (
              <div className="submit-area">
                <button className="btn btn--submit" onClick={handleSubmit} disabled={sending}>
                  {sending ? '送信中...' : 'メールで送信'}
                </button>
                <button className="btn btn--copy" onClick={handleCopyToClipboard}>
                  回答をコピー
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
