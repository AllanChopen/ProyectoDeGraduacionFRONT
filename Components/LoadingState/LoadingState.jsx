import './LoadingState.css';

function LoadingState({ label = 'Cargando...' }) {
  return (
    <section className="bp-section loading-state" aria-label={label}>
      <div className="bp-section-header loading-state-wrap" role="status" aria-live="polite">
        <span className="loading-state-spinner" aria-hidden="true" />
        <p className="loading-state-text">{label}</p>
      </div>
    </section>
  );
}

export default LoadingState;
