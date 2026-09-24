import { Link } from 'react-router-dom';

export default function PageIntro({ eyebrow, title, accent, description, backTo, backLabel = 'Volver a la banda' }) {
  return (
    <header className="experience-intro">
      <div className="experience-intro-top">
        <span className="experience-eyebrow">{eyebrow}</span>
        {backTo ? <Link className="experience-back" to={backTo}>← {backLabel}</Link> : null}
      </div>
      <h1>{title}{accent ? <><br /><em>{accent}</em></> : null}</h1>
      {description ? <p>{description}</p> : null}
    </header>
  );
}
