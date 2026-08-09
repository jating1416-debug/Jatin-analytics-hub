'use client';

import { useEffect, useState } from 'react';

// SMART ASSISTANT - ADVANCED (Blogger wale se better)
// 20+ knowledge entries + blog post search + quick chips

const KB: { keys: string; answer: string }[] = [
  { keys: 'calculate dax filter context', answer: 'CALCULATE(SUM(Sales[Amount]), Region[Zone]="North") — current filter context badalta hai. DAX ka sabse important function!\n\n💡 Use: Measure ko filter karna ho, % of total, ya dynamic context.' },
  { keys: 'ytd mtd qtd totalytd datesytd', answer: 'TOTALYTD([Total Sales], Calendar[Date])\nTOTALQTD([Total Sales], Calendar[Date])\nTOTALMTD([Total Sales], Calendar[Date])\n\n💡 Pehle Date table banao + "Mark as Date Table" — warna galat result!' },
  { keys: 'yoy growth sameperiodlastyear mom', answer: 'YoY % =\nVAR Cur = SUM(Sales[Amount])\nVAR Prev = CALCULATE(SUM(Sales[Amount]), SAMEPERIODLASTYEAR(Calendar[Date]))\nRETURN DIVIDE(Cur - Prev, Prev, 0)\n\n💡 MoM ke liye PREVIOUSMONTH(Calendar[Date]) use karo.' },
  { keys: 'filter all dax percent total', answer: 'Total All = CALCULATE(SUM(Sales[Amount]), ALL(Region))\n% of Total = DIVIDE(SUM(Sales[Amount]), [Total All])\n\n💡 ALL() filter hata deta hai — percentage share ke liye perfect.' },
  { keys: 'rankx dense rank dax ranking', answer: 'Product Rank = RANKX(\n  ALL(Product[Name]),\n  [Total Sales],\n  , DESC, Dense\n)\n\n💡 Dense = bina gaps (1,2,2,3). Skip = gaps ke saath (1,2,2,4).' },
  { keys: 'switch true dax multiple conditions', answer: 'Band = SWITCH(TRUE(),\n  [Sales] > 100000, "High",\n  [Sales] > 50000, "Mid",\n  "Low"\n)\n\n💡 SWITCH(TRUE()) = Excel IFS jaisa.' },
  { keys: 'window function rank row_number lag sql', answer: '-- RANK (ties same)\nSELECT name, salary, RANK() OVER (ORDER BY salary DESC) FROM emp;\n\n-- ROW_NUMBER (unique)\nSELECT name, ROW_NUMBER() OVER (ORDER BY salary DESC) FROM emp;\n\n-- LAG (previous)\nSELECT name, LAG(salary) OVER (ORDER BY hire_date) FROM emp;\n\n-- Partition by dept\nRANK() OVER (PARTITION BY dept ORDER BY salary DESC)' },
  { keys: 'cte with recursive sql', answer: 'WITH monthly AS (\n  SELECT strftime(\'%Y-%m\', date) ym, SUM(amount) total\n  FROM sales GROUP BY ym\n)\nSELECT ym, total, total - LAG(total) OVER (ORDER BY ym) growth\nFROM monthly;\n\n💡 Recursive: WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n<10)' },
  { keys: 'join inner left right full sql', answer: 'INNER = sirf matching rows\nLEFT = left ki saari + matching right\nRIGHT = right ki saari + matching left\nFULL = dono ki saari\n\nSELECT e.name, d.dept_name\nFROM employees e\nLEFT JOIN departments d ON e.dept = d.dept_name;\n\n💡 JOIN se pehle ON condition zaroori!' },
  { keys: 'subquery exists in sql', answer: 'SELECT * FROM emp\nWHERE salary > (SELECT AVG(salary) FROM emp);\n\nSELECT * FROM dept d\nWHERE EXISTS (SELECT 1 FROM emp e WHERE e.dept = d.name);\n\n💡 EXISTS = correlated subquery ke liye fast.' },
  { keys: 'groupby pandas agg pivot', answer: 'df.groupby("dept")["salary"].sum()\ndf.groupby("dept")["salary"].agg(["sum","mean","count"])\ndf.pivot_table(index="dept", values="salary", aggfunc="mean")\n\n💡 reset_index() bhoolna mat!' },
  { keys: 'merge join concat pandas', answer: 'pd.merge(df1, df2, on="id", how="left")\ndf1.join(df2)  # index pe\npd.concat([df1, df2], axis=0)  # rows\n\n💡 how="inner/left/right/outer" — SQL JOIN jaisa.' },
  { keys: 'where select np.select np.where', answer: 'import numpy as np\ndf["status"] = np.where(df["score"] > 60, "Pass", "Fail")\n\nconds = [df["a"] > 10, df["a"] > 5]\nchoices = ["High", "Medium"]\ndf["band"] = np.select(conds, choices, default="Low")\n\n💡 np.select = multiple conditions ek saath.' },
  { keys: 'xlookup vlookup index match excel', answer: '=XLOOKUP(A2, B:B, C:C, "Not Found")\n=INDEX(C:C, MATCH(A2, B:B, 0))\n\n💡 XLOOKUP dono taraf search karta hai — VLOOKUP ka replacement.' },
  { keys: 'sumifs countifs ifs excel', answer: '=SUMIFS(Sales[Amt], Sales[Reg], "North", Sales[Year], 2025)\n=COUNTIFS(A:A, ">50", B:B, "<100")\n=IFS(A1>90,"A", A1>75,"B", TRUE,"C")\n\n💡 IFS = nested IF se better.' },
  { keys: 'unpivot power query m', answer: 'let\n  Source = Excel.CurrentWorkbook(){[Name="Data"]}[Content],\n  Unpivoted = Table.UnpivotOtherColumns(Source, {"Month"}, "Metric", "Value")\nin\n  Unpivoted\n\n💡 Wide → Long format — dashboards ke liye zaroori.' },
  { keys: 'selectrows groupby power query m', answer: 'Table.SelectRows(Source, each [Amount] > 50000)\n\nTable.Group(Source, {"Region"}, {{\n  "Total", each List.Sum([Amount]), type number\n}})\n\n💡 "each" = row shortcut, "type number" = column type.' },
  { keys: '2nd highest salary nth highest sql', answer: '-- 2nd highest\nSELECT MAX(salary) FROM emp\nWHERE salary < (SELECT MAX(salary) FROM emp);\n\n-- nth highest (OFFSET)\nSELECT DISTINCT salary FROM emp\nORDER BY salary DESC LIMIT 1 OFFSET 1;\n\n💡 Interview ka sabse common question!' },
  { keys: 'indexes performance sql optimize', answer: 'CREATE INDEX idx_dept ON employees(department);\nCREATE INDEX idx_dept_salary ON employees(department, salary);\n\n-- Check query plan\nEXPLAIN SELECT * FROM employees WHERE salary > 50000;\n\n💡 WHERE + JOIN columns pe index = 10x fast.' },
  { keys: 'data cleaning pandas missing', answer: 'df.isnull().sum()\ndf.dropna()\ndf.fillna(0)\ndf.drop_duplicates()\ndf["col"].str.strip()\ndf["col"].astype(int)\n\n💡 Cleaning = analysis ka 80% kaam!' },
];

const CHIPS = ['CALCULATE', 'YTD', 'window function', 'groupby', 'XLOOKUP', 'JOIN', '2nd highest salary', 'np.where', 'unpivot'];

export default function SmartAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<{ user: boolean; text: string }[]>([
    { user: false, text: '👋 Hello! Main aapka Data Assistant hoon — DAX, SQL, Python, Excel, Power Query ke 20+ topics mein help kar sakta hoon. Koi bhi concept poochho ya neeche chips pe click karo!' },
  ]);

  // VOICE INPUT - browser ki free speech-to-text (koi API cost nahi)
  const startVoice = () => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { alert('Aapka browser voice support nahi karta (Chrome try karo)'); return; }
    try {
      const rec = new SR();
      rec.lang = 'en-IN';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      setListening(true);
      rec.onresult = (e: any) => {
        const text = e.results?.[0]?.[0]?.transcript || '';
        setInput(text);
        if (text.trim()) ask(text);
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      rec.start();
    } catch { setListening(false); }
  };

  const ask = (q: string) => {
    const query = q.trim();
    if (!query) return;
    setMessages((m) => [...m, { user: true, text: query }]);
    const low = query.toLowerCase();

    // 1. Knowledge base match (multi-word)
    let found: string | null = null;
    for (const item of KB) {
      const keys = item.keys.split(' ');
      if (keys.some((k) => low.includes(k)) && keys.filter((k) => low.includes(k)).length >= 1) {
        // best match: most keys matched
        const score = keys.filter((k) => low.includes(k)).length;
        if (score >= 1) { found = item.answer; }
        if (score >= 2) break;
      }
    }

    // 2. Blog post search
    let postLinks = '';
    if (query.length >= 3) {
      fetch(`/api/search?q=${encodeURIComponent(query)}&limit=3`)
        .then((r) => r.json())
        .then((d) => {
          const results = d.results || [];
          if (results.length > 0) {
            const links = results.map((r: any) => `<a href="${r.url}" style="color:var(--primary);font-weight:600">📄 ${r.title}</a>`).join('<br/>');
            setMessages((m) => [...m, { user: false, text: `📚 Blog posts mile:\n${links}` }]);
          }
        })
        .catch(() => {});
    }

    setMessages((m) => [...m, {
      user: false,
      text: found
        ? found
        : `Is topic ka answer knowledge base mein nahi hai. Try karo: ${CHIPS.join(', ')} — ya maine upar blog posts dhundh diye hain! 🔍`,
    }]);
    setInput('');
  };

  useEffect(() => {
    if (!open) return;
    const el = document.getElementById('sa-msg-box');
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', right: 20, bottom: 20, width: 56, height: 56, borderRadius: '50%',
          background: 'var(--gradient)', color: '#fff', border: 'none', fontSize: '1.3rem',
          cursor: 'pointer', zIndex: 9999, boxShadow: '0 8px 24px rgba(102,126,234,0.45)',
        }}
        title="Ask Data Assistant"
      >
        {open ? <i className="fas fa-times" /> : <i className="fas fa-robot" />}
      </button>

      {open && (
        <div style={{
          position: 'fixed', right: 20, bottom: 88, width: 'min(380px, calc(100vw - 30px))', height: 500,
          background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 18,
          boxShadow: '0 24px 60px rgba(2,6,23,0.28)', zIndex: 9998, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ background: 'var(--gradient)', color: '#fff', padding: '14px 16px', fontWeight: 700 }}>
            🤖 Data Assistant <span style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.9 }}>— 20+ topics</span>
          </div>

          {/* Quick chips */}
          <div style={{ display: 'flex', gap: 5, padding: '8px 12px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
            {CHIPS.map((c) => (
              <button key={c} onClick={() => ask(c)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-dark)', padding: '4px 10px', borderRadius: 14, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
                {c}
              </button>
            ))}
          </div>

          <div id="sa-msg-box" style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg)' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                padding: '9px 13px', borderRadius: 12, fontSize: '0.83rem', lineHeight: 1.6, maxWidth: '94%',
                background: m.user ? 'var(--gradient)' : 'var(--card-bg)', color: m.user ? '#fff' : 'var(--text-dark)',
                alignSelf: m.user ? 'flex-end' : 'flex-start', border: m.user ? 'none' : '1px solid var(--border)',
                whiteSpace: 'pre-wrap',
              }}
              dangerouslySetInnerHTML={{ __html: m.text }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, padding: 10, borderTop: '1px solid var(--border)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ask(input)}
              placeholder="Ask: CALCULATE, window function, groupby..."
              style={{ flex: 1, padding: '9px 14px', border: '1px solid var(--border)', borderRadius: 20, background: 'var(--bg)', color: 'var(--text-dark)', outline: 'none', fontSize: '0.85rem' }}
            />
            <button
              aria-label="Voice input"
              onClick={startVoice}
              title="Voice se pucho (free speech-to-text)"
              style={{
                width: 42, borderRadius: '50%', border: '1px solid var(--border)',
                background: listening ? 'rgba(239,68,68,0.15)' : 'var(--card-bg)',
                color: listening ? '#ef4444' : 'var(--text-dark)', cursor: 'pointer',
                animation: listening ? 'pulseRed 1.2s infinite' : 'none',
              }}
            >
              <i className="fas fa-microphone" />
            </button>
            <button onClick={() => ask(input)} style={{ width: 42, borderRadius: '50%', background: 'var(--gradient)', color: '#fff', border: 'none', cursor: 'pointer' }}>
              <i className="fas fa-paper-plane" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
