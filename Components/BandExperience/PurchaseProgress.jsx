export default function PurchaseProgress({ confirmed = false }) {
  return (
    <ol className="experience-progress" aria-label="Proceso de compra">
      <li className="is-complete"><span aria-hidden="true">01</span> Selección</li>
      <li className={confirmed ? 'is-complete' : 'is-current'} aria-current={!confirmed ? 'step' : undefined}><span aria-hidden="true">02</span> Compra</li>
      <li className={confirmed ? 'is-current' : ''} aria-current={confirmed ? 'step' : undefined}><span aria-hidden="true">03</span> Confirmación</li>
    </ol>
  );
}
