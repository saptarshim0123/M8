const testimonials = [
    {
        stars: 5,
        quote: "I never thought journaling would stick for me. equil makes it feel effortless. The mood trends helped me realise I need Sundays offline.",
        name: 'Sophie J.',
        role: 'Designer, Berlin',
        initials: 'SJ',
        bg: 'bg-primary/20',
        color: 'text-primary',
    },
    {
        stars: 5,
        quote: "The AI insights are wild — it connected my low-mood entries to late nights before I even noticed the pattern myself. Game-changer.",
        name: 'Marcus R.',
        role: 'Software engineer, London',
        initials: 'MR',
        bg: 'bg-success/20',
        color: 'text-success',
    },
    {
        stars: 5,
        quote: "I recommended equil to all my therapy clients. It bridges the gap between sessions beautifully. Private, thoughtful, effective.",
        name: 'Dr. Aisha K.',
        role: 'Psychotherapist, NYC',
        initials: 'AK',
        bg: 'bg-info/20',
        color: 'text-info',
    },
];

const Testimonials = () => {
    return (
        <section className="py-24 px-4 bg-neutral rounded-t-[2.5rem]">
            <div className="max-w-6xl mx-auto">
                <p className="font-sans text-xs font-semibold text-primary/80 uppercase tracking-widest mb-3">Testimonials</p>
                <h2 className="font-heading text-4xl md:text-5xl font-black text-neutral-content tracking-tight leading-tight mb-14">
                    People who found their <em className="text-primary not-italic">balance</em>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {testimonials.map(({ stars, quote, name, role, initials, bg, color }) => (
                        <div
                            key={name}
                            className="bg-neutral-content/5 border border-neutral-content/8 rounded-3xl p-8 flex flex-col gap-5 hover:border-primary/30 transition-colors"
                        >
                            <div className="flex gap-0.5">
                                {Array.from({ length: stars }).map((_, i) => (
                                    <span key={i} className="text-primary text-sm">★</span>
                                ))}
                            </div>

                            <p className="font-handwriting text-xl text-neutral-content/85 leading-relaxed flex-1">
                                "{quote}"
                            </p>

                            <div className="flex items-center gap-3 pt-2 border-t border-neutral-content/10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${bg} ${color}`}>
                                    {initials}
                                </div>
                                <div>
                                    <p className="font-sans text-sm font-semibold text-neutral-content">{name}</p>
                                    <p className="font-sans text-xs text-neutral-content/50">{role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;