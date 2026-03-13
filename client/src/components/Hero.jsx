const Hero = () => {
    return (
        <section className="min-h-[calc(100vh-64px)] flex items-center py-16 px-4">
            <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                {/* LEFT — copy */}
                <div className="flex flex-col space-y-6">
                    {/* Eyebrow tag */}
                    <div className="inline-flex items-center gap-2 self-start bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="font-sans text-xs font-semibold text-primary tracking-wide uppercase">
                            Your daily reflection space
                        </span>
                    </div>

                    <h1 className="font-heading text-5xl md:text-6xl font-black text-neutral leading-[1.05] tracking-tight">
                        Write your way<br />
                        to <em className="text-primary not-italic">clarity.</em>
                    </h1>

                    <p className="font-sans text-lg text-neutral/70 max-w-md leading-relaxed">
                        equil is a journaling app that learns how you feel. Track mood patterns, discover what lifts you, and finally understand yourself.
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <button className="btn btn-primary rounded-full font-heading text-base px-8 shadow-lg shadow-primary/30">
                            Start journaling free
                        </button>
                        <button className="btn btn-ghost rounded-full font-sans text-base gap-2">
                            See how it works
                            <span className="w-8 h-8 rounded-full border border-neutral/20 flex items-center justify-center text-sm">→</span>
                        </button>
                    </div>

                    {/* Social proof */}
                    <div className="flex items-center gap-4 pt-4 border-t border-base-content/10">
                        <div className="flex -space-x-2">
                            {['SJ', 'MR', 'TK', 'AL'].map((initials, i) => (
                                <div
                                    key={i}
                                    className="w-9 h-9 rounded-full border-2 border-base-100 flex items-center justify-center text-xs font-bold"
                                    style={{ background: ['#E8D5C4', '#C4D8E8', '#D4E8C4', '#E8C4D8'][i], color: ['#7A4F30', '#30587A', '#3A7A30', '#7A306A'][i] }}
                                >
                                    {initials}
                                </div>
                            ))}
                        </div>
                        <p className="font-sans text-sm text-neutral/60">
                            <strong className="text-neutral font-semibold">2,400+ people</strong> reflect daily with equil
                        </p>
                    </div>
                </div>

                {/* RIGHT — hero visual */}
                <div className="relative flex items-center justify-center h-120">

                    {/* Floating streak badge */}
                    <div className="absolute top-6 right-0 bg-base-100 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 z-10 border border-base-content/5">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">🔥</div>
                        <div>
                            <div className="font-data text-2xl font-bold text-neutral leading-none">14</div>
                            <div className="font-sans text-xs text-neutral/50 mt-0.5">day streak</div>
                        </div>
                    </div>

                    {/* Main journal card */}
                    <div className="relative z-20 bg-base-100 rounded-3xl shadow-2xl p-7 w-80">
                        <p className="font-data text-xs text-neutral/40 uppercase tracking-widest mb-4">
                            Thursday, March 12
                        </p>

                        {/* Mood chips */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            {[
                                { label: 'Happy', active: true, color: 'bg-primary text-primary-content' },
                                { label: 'Calm', active: true, color: 'bg-success text-success-content' },
                                { label: 'Anxious', active: false, color: 'bg-base-200 text-neutral/50' },
                            ].map(({ label, color }) => (
                                <span key={label} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}>
                                    {label}
                                </span>
                            ))}
                        </div>

                        <p className="font-handwriting text-lg text-neutral/80 leading-relaxed mb-5">
                            "Today felt lighter. Finished a project I'd been avoiding and took a long walk. The fresh air helped more than I expected..."
                        </p>

                        <div className="border-t border-base-content/8 mb-4" />

                        {/* AI Insight */}
                        <div className="bg-primary/6 rounded-xl p-4 border-l-4 border-primary">
                            <p className="font-sans text-[10px] font-bold text-primary uppercase tracking-widest mb-1">✦ AI Insight</p>
                            <p className="font-sans text-xs text-neutral/70 leading-relaxed">
                                You're 3× more likely to feel calm on days you go outside. Consider a daily walk.
                            </p>
                        </div>
                    </div>

                    {/* Floating mini chart */}
                    <div className="absolute bottom-10 -left-4 bg-base-100 rounded-2xl shadow-xl p-4 z-10 border border-base-content/5">
                        <p className="font-data text-xs text-neutral/50 font-medium mb-3">This week's mood</p>
                        <div className="flex items-end gap-1.5 mt-6 h-10">
                            {[35, 55, 70, 50, 85, 60, 90, 65, 80].map((h, i) => (
                                <div key={i} className="flex-1 h-full flex flex-col justify-end">
                                    <div
                                        className={`rounded-t-md w-full ${h > 70 ? 'bg-primary' : h > 50 ? 'bg-primary/50' : 'bg-primary/20'}`}
                                        style={{ height: `${h}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Subtle bg blob */}
                    <div className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-20 bg-primary scale-75" />
                </div>
            </div>
        </section>
    );
};

export default Hero;