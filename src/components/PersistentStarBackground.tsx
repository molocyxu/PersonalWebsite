export default function PersistentStarBackground() {
  return (
    <div
      id="persistent-star-background"
      className="fixed inset-0 pointer-events-none"
      suppressHydrationWarning
      style={{
        background: '#000000',
        backgroundImage: 'var(--page-star-bg)',
        backgroundSize: 'auto 100%',
        backgroundPosition: 'var(--bg-pos-x, 50%) 50%',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'repeat-x',
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        opacity: 1,
        visibility: 'visible',
        display: 'block',
        // Ensure it covers the entire viewport and doesn't move
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    />
  );
}
