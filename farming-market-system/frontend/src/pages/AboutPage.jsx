import AppLayout from '../layouts/AppLayout';
import BrandLogo from '../components/BrandLogo';

const communityCards = [
  {
    title: 'Local farmers first',
    copy: 'We believe Botswana\'s growers are the backbone of healthy communities, local jobs, and dependable food access.'
  },
  {
    title: 'Shorter path to your table',
    copy: 'Pula Harvest reduces the distance between the soil and your supper so families can buy real food with more confidence.'
  },
  {
    title: 'Stronger neighborhoods',
    copy: 'Real-time harvest visibility helps prevent waste, support livelihoods, and keep food spending circulating locally.'
  }
];

export default function AboutPage() {
  return (
    <AppLayout title="About" subtitle="Rooted in community, grown for Botswana">
      <div className="space-y-4">
        <section className="rounded-[32px] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-4">
            <BrandLogo className="shrink-0" priority />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-farm-green">About Pula Harvest</p>
              <h1 className="mt-2 text-2xl font-black leading-tight text-slate-900">Rooted in Community, Grown for Botswana</h1>
            </div>
          </div>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
            <p>Pula Harvest is built by the community, for the community. We believe that our local farmers are heroes, and every family deserves access to real, nutrient-rich food.</p>
            <p>Our platform removes the distance between the soil and your table, keeping food money within our neighborhoods.</p>
            <p>By helping farmers share what they are growing in real time, we prevent food waste, support livelihoods, and build a stronger, self-reliant Botswana together.</p>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {communityCards.map((card) => (
            <article key={card.title} className="rounded-[26px] border border-emerald-100 bg-white/95 p-4 shadow-soft transition-transform duration-300 hover:-translate-y-1">
              <h2 className="text-base font-bold text-slate-900">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.copy}</p>
            </article>
          ))}
        </section>
      </div>
    </AppLayout>
  );
}
