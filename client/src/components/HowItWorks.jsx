const steps = [
    {
        num: '01',
        title: 'Write freely',
        desc: "Open equil, write whatever's on your mind. There's no right way — a sentence is enough.",
    },
    {
        num: '02',
        title: 'Tag your mood',
        desc: 'Select how you feel from our mood palette, or let AI detect it from your writing automatically.',
    },
    {
        num: '03',
        title: 'Discover your patterns',
        desc: 'Watch your dashboard come alive. equil surfaces insights, trends, and correlations over time.',
    },
];

const bars = [
    { h: 45, label: 'M' },
    { h: 60, label: 'T' },
    { h: 55, label: 'W' },
    { h: 80, label: 'T' },
    { h: 65, label: 'F' },
    { h: 90, label: 'S' },
    { h: 75, label: 'S' },
];

const HowItWorks = () => {
    return (
        <section className="py-24 px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                {/* Left — steps */}
                <div>
                    <p className="font-sans text-xs font-semibold text-primary uppercase tracking-widest mb-3">How it works</p>
                    <h2 className="font-heading text-4xl md:text-5xl font-black text-neutral tracking-tight leading-tight mb-10">
                        Three steps to <em className="text-primary not-italic">know yourself</em>
                    </h2>

                    <div className="flex flex-col divide-y divide-base-content/8">
                        {steps.map(({ num, title, desc }) => (
                            <div key={num} className="flex gap-5 py-7 group">
                                <div className="font-data text-sm font-bold text-primary pt-0.5 min-w-7">{num}</div>
                                <div>
                                    <h3 className="font-heading text-lg font-bold text-neutral mb-2 group-hover:text-primary transition-colors">
                                        {title}
                                    </h3>
                                    <p className="font-sans text-sm text-neutral/60 leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right — analytics card */}
                <div className="bg-base-100 rounded-3xl shadow-2xl shadow-base-content/10 p-7 border border-base-content/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-heading text-lg font-bold text-neutral">Your mood this month</h3>
                        <span className="badge badge-success badge-sm font-data font-bold gap-1">↑ 12%</span>
                    </div>

                    {/* Chart */}
                    <div className="flex items-end gap-2 h-28 mb-2">
                        {bars.map(({ h }, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end h-full">
                                <div
                                    className={`w-full rounded-t-lg transition-all ${h > 75 ? 'bg-primary' : h > 55 ? 'bg-primary/50' : 'bg-primary/20'
                                        }`}
                                    style={{ height: `${h}%` }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 mb-6">
                        {bars.map(({ label }, i) => (
                            <div key={i} className="flex-1 text-center font-data text-[11px] text-neutral/40">{label}</div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { val: '14', lbl: 'Day streak' },
                            { val: '87%', lbl: 'Happy days' },
                            { val: '26', lbl: 'Entries' },
                        ].map(({ val, lbl }) => (
                            <div key={lbl} className="bg-primary/6 rounded-2xl p-4">
                                <div className="font-data text-2xl font-bold text-neutral">{val}</div>
                                <div className="font-sans text-xs text-neutral/50 mt-1">{lbl}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default HowItWorks;