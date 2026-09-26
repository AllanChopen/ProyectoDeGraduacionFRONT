const moneyFormatter = new Intl.NumberFormat('es-GT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat('es-GT', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const scientificFormatter = new Intl.NumberFormat('es-GT', {
  notation: 'scientific',
  maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat('es-GT', {
  style: 'percent',
  maximumFractionDigits: 1,
});

const safeAmount = (value) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

const money = (value) => `Q${moneyFormatter.format(value)}`;

const shortMoney = (value) => {
  if (value >= 1e15) return `Q${scientificFormatter.format(value)}`;
  if (value >= 1e6) return `Q${compactFormatter.format(value)}`;
  return money(value);
};

function scaleMaximum(value) {
  const magnitude = 10 ** Math.floor(Math.log10(value));
  if (!Number.isFinite(magnitude) || magnitude === 0) return value;
  const normalized = value / magnitude;
  const step = [1, 2, 5, 10].find((candidate) => candidate >= normalized) ?? 10;
  const maximum = step * magnitude;
  return Number.isFinite(maximum) ? maximum : value;
}

export function RevenueComparison({ current, previous }) {
  const currentAmount = safeAmount(current);
  const previousAmount = safeAmount(previous);
  const hasRevenue = currentAmount > 0 || previousAmount > 0;
  const maximum = hasRevenue ? scaleMaximum(Math.max(currentAmount, previousAmount)) : 1;
  const chartBottom = 212;
  const chartHeight = 176;
  const months = [
    { label: 'Mes anterior', amount: previousAmount, tone: 'previous', x: 179 },
    { label: 'Mes actual', amount: currentAmount, tone: 'current', x: 409 },
  ];

  return (
    <div className="dashboard-revenue-comparison">
      {hasRevenue ? (
        <svg
          className="dashboard-bar-chart"
          viewBox="0 0 640 260"
          role="img"
          aria-label={`Ingresos: mes anterior ${money(previousAmount)}; mes actual ${money(currentAmount)}. Ambas barras usan la misma escala.`}
        >
          {[1, 0.5, 0].map((fraction) => {
            const y = chartBottom - fraction * chartHeight;
            return (
              <g key={fraction}>
                <line x1="110" x2="615" y1={y} y2={y} stroke="var(--dashboard-rule, #393237)" strokeDasharray={fraction === 0 ? undefined : '3 5'} />
                <text x="94" y={y + 4} textAnchor="end" fill="var(--dashboard-muted, #b8aeb5)" fontSize="11">{shortMoney(maximum * fraction)}</text>
              </g>
            );
          })}
          {months.map((month) => {
            const height = (month.amount / maximum) * chartHeight;
            return (
              <g key={month.tone}>
                {month.amount > 0 ? <rect x={month.x} y={chartBottom - height} width="116" height={height} rx="5" fill={`var(--dashboard-chart-${month.tone}, ${month.tone === 'current' ? '#e9e4e6' : '#7d5d6d'})`} /> : null}
                <text x={month.x + 58} y={chartBottom - height - 12} textAnchor="middle" fill="var(--dashboard-chart-current, #e9e4e6)" fontSize="13" fontWeight="600">{shortMoney(month.amount)}</text>
                <text x={month.x + 58} y="242" textAnchor="middle" fill="var(--dashboard-muted, #b8aeb5)" fontSize="12">{month.label}</text>
              </g>
            );
          })}
        </svg>
      ) : (
        <div className="dashboard-chart-empty">
          <span className="dashboard-chart-empty-mark" aria-hidden="true">↗</span>
          <strong>Aún no hay ingresos para comparar</strong>
          <p>Las ventas de este mes y del anterior aparecerán aquí.</p>
        </div>
      )}
      <dl className="dashboard-chart-values">
        {months.map((month) => (
          <div className={`dashboard-chart-value is-${month.tone}`} key={month.tone}>
            <dt><span className="dashboard-chart-swatch" aria-hidden="true" />{month.label}</dt>
            <dd>{money(month.amount)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function RevenueSources({ merch, events }) {
  const merchAmount = safeAmount(merch);
  const eventsAmount = safeAmount(events);
  const maximum = Math.max(merchAmount, eventsAmount);
  const hasRevenue = maximum > 0;
  // Normalizing first keeps proportions finite even for very large amounts.
  const normalizedTotal = hasRevenue ? merchAmount / maximum + eventsAmount / maximum : 0;
  const merchShare = hasRevenue ? (merchAmount / maximum) / normalizedTotal : 0;
  const eventsShare = hasRevenue ? (eventsAmount / maximum) / normalizedTotal : 0;
  const sum = merchAmount + eventsAmount;
  const total = Number.isFinite(sum) ? sum : BigInt(merchAmount) + BigInt(eventsAmount);
  const circumference = 2 * Math.PI * 76;
  const sources = [
    { label: 'Merchandising', amount: merchAmount, share: merchShare, tone: 'merch' },
    { label: 'Eventos', amount: eventsAmount, share: eventsShare, tone: 'events' },
  ];

  return (
    <div className="dashboard-revenue-sources">
      <div className="dashboard-donut-wrap">
        <svg className="dashboard-donut" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
          <circle cx="100" cy="100" r="76" fill="none" stroke="var(--dashboard-rule, #393237)" strokeWidth="20" />
          {hasRevenue ? (
            <g transform="rotate(-90 100 100)" fill="none" strokeWidth="20">
              {merchShare > 0 ? <circle cx="100" cy="100" r="76" stroke="var(--dashboard-chart-current, #e9e4e6)" strokeDasharray={`${merchShare * circumference} ${circumference}`} /> : null}
              {eventsShare > 0 ? <circle cx="100" cy="100" r="76" stroke="var(--dashboard-chart-events, #b8a8ca)" strokeDasharray={`${eventsShare * circumference} ${circumference}`} strokeDashoffset={-merchShare * circumference} /> : null}
            </g>
          ) : null}
        </svg>
        <div className="dashboard-donut-center">
          <span>Total del mes</span>
          <strong title={money(total)}>{shortMoney(total)}</strong>
          <small>{hasRevenue ? 'Merch + eventos' : 'Sin ventas aún'}</small>
        </div>
      </div>
      <ul className="dashboard-source-legend" aria-label="Distribución de ingresos del mes">
        {sources.map((source) => (
          <li className={`is-${source.tone}`} key={source.tone}>
            <span className="dashboard-source-label"><span className="dashboard-chart-swatch" aria-hidden="true" />{source.label}</span>
            <strong>{money(source.amount)}</strong>
            <span className="dashboard-source-percent">{percentFormatter.format(source.share)}</span>
          </li>
        ))}
      </ul>
      {!hasRevenue ? <p className="dashboard-source-empty">La distribución aparecerá con las primeras ventas del mes.</p> : null}
    </div>
  );
}
