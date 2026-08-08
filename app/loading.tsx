// Premium loading state - shimmer skeletons
export default function Loading() {
  return (
    <div className="loading-screen">
      <div className="skel" style={{ height: 30, width: '30%', marginBottom: 20 }} />
      <div className="post-card" style={{ marginBottom: 16 }}>
        <div className="skel" style={{ height: 90, borderRadius: '18px 18px 0 0' }} />
        <div className="post-body">
          <div className="skel" style={{ height: 14, width: '40%', marginBottom: 12 }} />
          <div className="skel" style={{ height: 22, width: '80%', marginBottom: 12 }} />
          <div className="skel" style={{ height: 12, width: '100%' }} />
        </div>
      </div>
      <div className="post-card" style={{ marginBottom: 16 }}>
        <div className="skel" style={{ height: 90, borderRadius: '18px 18px 0 0' }} />
        <div className="post-body">
          <div className="skel" style={{ height: 14, width: '40%', marginBottom: 12 }} />
          <div className="skel" style={{ height: 22, width: '75%', marginBottom: 12 }} />
          <div className="skel" style={{ height: 12, width: '90%' }} />
        </div>
      </div>
      <div className="post-card">
        <div className="skel" style={{ height: 90, borderRadius: '18px 18px 0 0' }} />
        <div className="post-body">
          <div className="skel" style={{ height: 14, width: '40%', marginBottom: 12 }} />
          <div className="skel" style={{ height: 22, width: '70%', marginBottom: 12 }} />
          <div className="skel" style={{ height: 12, width: '85%' }} />
        </div>
      </div>
    </div>
  );
}
