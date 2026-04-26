import { LuSparkles, LuChartArea, LuLeaf, LuLock, LuFlame, LuBot, LuStethoscope } from 'react-icons/lu';

const features = [
    {
        icon: <LuSparkles />,
        title: 'AI-powered insights',
        desc: 'Pattern recognition that connects your journal entries to real behavioural trends you might not notice yourself.',
        extra: (
            <div className="flex flex-wrap gap-2 mt-6">
                {[
                    { label: 'Happy', cls: 'bg-primary/15 text-primary' },
                    { label: 'Calm', cls: 'bg-success/20 text-success' },
                    { label: 'Anxious', cls: 'bg-error/15 text-error' },
                    { label: 'Focused', cls: 'bg-info/15 text-info' },
                ].map(({ label, cls }) => (
                    <span key={label} className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{label}</span>
                ))}
            </div>
        ),
        wide: false,
        dark: false,
    },
    {
        icon: <LuChartArea />,
        title: 'Mood analytics dashboard',
        desc: 'See your emotional trends over days, weeks, and months. Spot what drains you and what brings you joy, backed by your own words.',
        extra: (
            <div className="flex items-end gap-1.5 mt-6 h-20">
                {[35, 55, 70, 50, 85, 60, 90, 65, 80].map((h, i) => (
                    <div key={i} className="flex-1 h-full flex flex-col justify-end">
                        <div
                            className={`rounded-t-md w-full ${h > 70 ? 'bg-primary' : h > 50 ? 'bg-primary/50' : 'bg-primary/20'}`}
                            style={{ height: `${h}%` }}
                        />
                    </div>
                ))}
            </div>
        ),
        wide: true,
        dark: true,
    },
    {
        icon: <LuLeaf />,
        title: 'Guided prompts',
        desc: 'Thoughtful daily prompts when you don\'t know where to start. Never stare at a blank page again.',
        wide: false,
        dark: false,
    },
    {
        icon: <LuBot />,
        title: 'AI Empath Chatbot',
        desc: 'Experience supportive, judgment-free conversations powered by intelligent AI. Get CBT-based action recommendations to help navigate difficult moments.',
        extra: (
            <div className="flex flex-col gap-2 mt-6">
                <div className="bg-primary/90 text-primary-content self-end px-4 py-2 rounded-2xl rounded-br-sm text-xs max-w-[85%] shadow-sm">
                    I've been feeling really overwhelmed with work lately.
                </div>
                <div className="bg-base-100/15 text-neutral-content self-start px-4 py-2 rounded-2xl rounded-bl-sm text-xs max-w-[85%] border border-base-100/20 backdrop-blur-sm">
                    It sounds like you have a lot on your plate. Let's break it down. What's causing the most stress right now?
                </div>
            </div>
        ),
        wide: true,
        dark: true,
    },
    {
        icon: <LuStethoscope />,
        title: 'Professional Support',
        desc: 'Connect with verified mental health professionals right from your dashboard. Share your journey securely and get clinical guidance.',
        wide: false,
        dark: false,
    },
    {
        icon: <LuLock />,
        title: 'Private by design',
        desc: 'End-to-end encryption. Your journal is yours alone, no ads, no data selling, no exceptions.',
        wide: false,
        dark: false,
    },
    {
        icon: <LuFlame />,
        title: 'Streaks & habits',
        desc: 'Build a reflective practice with gentle streak tracking and habit nudges that motivate, not guilt-trip.',
        wide: false,
        dark: false,
    },
];

const Features = () => {
    return (
        <section className="py-24 px-4 bg-base-200/40">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="text-center mb-16">
                    <p className="font-sans text-xs font-semibold text-primary uppercase tracking-widest mb-3">Features</p>
                    <h2 className="font-heading text-4xl md:text-5xl font-black text-neutral tracking-tight leading-tight">
                        Everything you need to <em className="text-primary not-italic">understand yourself</em>
                    </h2>
                    <p className="font-sans text-base text-neutral/60 mt-4 max-w-md mx-auto leading-relaxed">
                        More than a diary. equil is your emotional intelligence layer.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className={[
                                'rounded-3xl p-8 border transition-all hover:-translate-y-1 duration-300',
                                f.wide ? 'lg:col-span-2' : '',
                                f.dark
                                    ? 'bg-neutral text-neutral-content border-neutral'
                                    : 'bg-base-100 border-base-content/7 hover:border-primary/20',
                            ].join(' ')}
                        >
                            <div className={[
                                'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5',
                                f.dark ? 'bg-primary/20' : 'bg-primary/10',
                            ].join(' ')}>
                                {f.icon}
                            </div>
                            <h3 className={[
                                'font-heading text-xl font-bold mb-2 tracking-tight',
                                f.dark ? 'text-neutral-content' : 'text-neutral',
                            ].join(' ')}>
                                {f.title}
                            </h3>
                            <p className={[
                                'font-sans text-sm leading-relaxed',
                                f.dark ? 'text-neutral-content/60' : 'text-neutral/60',
                            ].join(' ')}>
                                {f.desc}
                            </p>
                            {f.extra && f.extra}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;