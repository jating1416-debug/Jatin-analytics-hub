// PREMIUM LOADING - FIXED OVERLAY (CLS = 0)
// Pehle skeleton (loading.tsx) page content ke SAME POSITION pe render
// hota tha -> content aate hi skeleton hat-ta tha -> BADA layout shift
// (CLS 1.43!). Ab ye FIXED overlay hai (position: fixed) -> content
// iske neeche load hota hai -> shift BILKUL ZERO.
export default function Loading() {
  return (
    <div className="route-loading-overlay" aria-hidden="true">
      <div className="route-loading-spinner">
        <div className="spinner-ring" />
        <span>Loading…</span>
      </div>
    </div>
  );
}
