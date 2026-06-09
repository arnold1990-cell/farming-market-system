import AppLayout from '../layouts/AppLayout';
import BrandLogo from '../components/BrandLogo';

const featureCards = [
  {
    title: 'Verified marketplace flow',
    copy: 'Pula Harvest connects buyers, farmers, admins, and delivery agents inside one branded marketplace experience.',
  },
  {
    title: 'Harvest visibility',
    copy: 'Field readiness, crop planning, and listing workflows stay aligned with the same farm-first brand identity.',
  },
  {
    title: 'Trusted local commerce',
    copy: 'The platform uses the official Pula Harvest mark as the single source of truth across every major customer touchpoint.',
  },
];

export default function AboutPage() {
  return (
    <AppLayout title="About Pula Harvest" subtitle="Official platform branding and marketplace mission">
      <div className="space-y-4">
        <section className="rounded-[30px] bg-white p-5 shadow-soft">
          <BrandLogo className="mx-auto shrink-0" priority />
          <div className="mt-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-farm-green">Official Application Logo</p>
            <h1 className="mt-3 text-2xl font-black text-slate-900">Pula Harvest</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Built for Botswana&apos;s agricultural marketplace with one consistent brand mark across onboarding, navigation,
              operations, and commerce.
            </p>
          </div>
        </section>

        <section className="grid gap-3">
          {featureCards.map((card) => (
            <article key={card.title} className="rounded-[26px] border border-emerald-100 bg-white/95 p-4 shadow-soft">
              <h2 className="text-base font-bold text-slate-900">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.copy}</p>
            </article>
          ))}
        </section>
      </div>
    </AppLayout>
  );
}
