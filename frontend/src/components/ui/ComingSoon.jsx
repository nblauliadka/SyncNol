function ComingSoon({ icon, title, desc }) {
  return (
    <div
      style={{
        padding: 32,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "4rem", marginBottom: 20 }}>{icon}</div>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          marginBottom: 12,
        }}
      >
        {title}
      </h1>
      <p style={{ color: "var(--text-muted)", maxWidth: 400, lineHeight: 1.7 }}>
        {desc}
      </p>
      <div className="badge badge-accent" style={{ marginTop: 24 }}>
        Coming in Next Sprint
      </div>
    </div>
  );
}
export default ComingSoon;
