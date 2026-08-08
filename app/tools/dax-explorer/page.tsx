'use client';

import { useState } from 'react';

const ITEMS = [
  { cat: 'DAX', title: 'CALCULATE — filter context change', code: 'Sales North =\nCALCULATE(\n    SUM(Sales[Amount]),\n    Region[Zone] = "North"\n)', note: 'CALCULATE hi DAX ka dil hai — filter context badalta hai.' },
  { cat: 'DAX', title: 'YTD / MTD / QTD', code: 'Sales YTD = TOTALYTD([Total Sales], Calendar[Date])\nSales QTD = TOTALQTD([Total Sales], Calendar[Date])\nSales MTD = TOTALMTD([Total Sales], Calendar[Date])', note: 'Pehle proper Date table banao + "Mark as Date Table".' },
  { cat: 'DAX', title: 'YoY Growth', code: 'YoY % =\nVAR CurrentYear = SUM(Sales[Amount])\nVAR PrevYear = CALCULATE(SUM(Sales[Amount]), SAMEPERIODLASTYEAR(Calendar[Date]))\nRETURN DIVIDE(CurrentYear - PrevYear, PrevYear, 0)', note: 'SAMEPERIODLASTYEAR se previous year compare.' },
  { cat: 'DAX', title: 'FILTER + ALL', code: 'Total All Regions = CALCULATE(SUM(Sales[Amount]), ALL(Region))\n% of Total = DIVIDE(SUM(Sales[Amount]), [Total All Regions])', note: 'ALL() filter hata deta hai — percentage share ke liye.' },
  { cat: 'DAX', title: 'RANKX', code: 'Sales Rank = RANKX(ALL(Product[Name]), [Total Sales], , DESC, Dense)', note: 'Product ranking ke liye — Dense = bina gaps.' },
  { cat: 'Power Query M', title: 'Table.SelectRows', code: 'let\n    Source = Excel.CurrentWorkbook(){[Name="Sales"]}[Content],\n    Filtered = Table.SelectRows(Source, each [Amount] > 50000)\nin\n    Filtered', note: 'Power Query filter — each row ka shortcut.' },
  { cat: 'Power Query M', title: 'Table.Group (GroupBy)', code: 'let\n    Source = Excel.CurrentWorkbook(){[Name="Sales"]}[Content],\n    Grouped = Table.Group(Source, {"Region"}, {{\n        "Total", each List.Sum([Amount]), type number\n    }})\nin\n    Grouped', note: 'SQL GROUP BY jaisa.' },
  { cat: 'Power Query M', title: 'Unpivot Columns', code: 'let\n    Source = Excel.CurrentWorkbook(){[Name="Data"]}[Content],\n    Unpivoted = Table.UnpivotOtherColumns(Source, {"Month"}, "Metric", "Value")\nin\n    Unpivoted', note: 'Wide → Long format — dashboard ke liye zaroori.' },
  { cat: 'Power Query M', title: 'Merge Tables (JOIN)', code: 'let\n    Orders = Excel.CurrentWorkbook(){[Name="Orders"]}[Content],\n    Cust = Excel.CurrentWorkbook(){[Name="Customers"]}[Content],\n    Merged = Table.NestedJoin(Orders, {"CustomerID"}, Cust, {"ID"}, "Cust", JoinKind.LeftOuter),\n    Expanded = Table.ExpandTableColumn(Merged, "Cust", {"Name"}, {"CustomerName"})\nin\n    Expanded', note: 'SQL JOIN jaisa — NestedJoin + ExpandTableColumn.' },
  { cat: 'Excel', title: 'XLOOKUP', code: '=XLOOKUP(A2, Customers[ID], Customers[Name], "Not Found")', note: 'VLOOKUP ka replacement — left/right dono taraf search.' },
  { cat: 'Excel', title: 'SUMIFS', code: '=SUMIFS(Sales[Amount], Sales[Region], "North", Sales[Year], 2025)', note: 'Multiple conditions ke saath sum.' },
  { cat: 'Excel', title: 'INDEX + MATCH', code: '=INDEX(Result[Column], MATCH(A2, Result[Lookup], 0))', note: 'Classic lookup — XLOOKUP se pehle ka king.' },
];

export default function DaxExplorer() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('ALL');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = ITEMS.filter((it) => {
    if (cat !== 'ALL' && it.cat !== cat) return false;
    if (!q.trim()) return true;
    return (it.title + ' ' + it.note).toLowerCase().includes(q.toLowerCase());
  });

  const sel = ITEMS.find((it) => it.title === selected);

  return (
    <div className="layout-wrapper">
      <main className="posts-section">
        <div className="post-content-wrapper" style={{ padding: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>📊 DAX & Power Query Explorer</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 20 }}>
            Formula chuno ya search karo — syntax + note turant.
          </p>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: CALCULATE, unpivot, XLOOKUP..."
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-dark)', marginBottom: 10, boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {['ALL', 'DAX', 'Power Query M', 'Excel'].map((c) => (
              <button key={c} onClick={() => setCat(c)}
                style={{ padding: '5px 14px', borderRadius: 16, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                  background: cat === c ? 'var(--gradient)' : 'var(--bg)', color: cat === c ? '#fff' : 'var(--text-dark)', border: '1px solid var(--border)' }}>
                {c}
              </button>
            ))}
          </div>

          <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 16 }}>
            {filtered.map((it) => (
              <div key={it.title} onClick={() => setSelected(it.title)}
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px', marginBottom: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
                <span style={{ background: 'rgba(102,126,234,0.12)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 10, fontSize: '0.68rem', fontWeight: 700, marginRight: 6 }}>{it.cat}</span>
                <b>{it.title}</b>
              </div>
            ))}
            {filtered.length === 0 && <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Kuch nahi mila — koi aur keyword try karo.</p>}
          </div>

          {sel && (
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
              <div style={{ marginBottom: 10 }}>
                <span style={{ background: 'rgba(102,126,234,0.12)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 10, fontSize: '0.68rem', fontWeight: 700 }}>{sel.cat}</span>
                <b style={{ marginLeft: 8 }}>{sel.title}</b>
              </div>
              <pre style={{ background: '#1e293b', color: '#e2e8f0', borderRadius: 8, padding: 12, overflowX: 'auto', fontSize: '0.78rem', lineHeight: 1.6, marginBottom: 10 }}>{sel.code}</pre>
              {sel.note && <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>💡 {sel.note}</p>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
