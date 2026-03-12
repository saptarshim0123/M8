const Footer = () => {
    const cols = [
        {
            title: 'Product',
            links: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
        },
        {
            title: 'Company',
            links: ['About', 'Blog', 'Careers', 'Contact'],
        },
        {
            title: 'Support',
            links: ['Help center', 'Privacy', 'Terms', 'Status'],
        },
    ];

    return (
        <footer className="bg-neutral pt-16 pb-8 px-4">
            <div className="max-w-6xl mx-auto">

                {/* CTA banner */}
                <div className="bg-white/10 border border-primary/20 rounded-3xl p-10 mb-16 text-center">
                    <h2 className="font-heading text-4xl md:text-5xl font-black text-neutral-content tracking-tight mb-4">
                        Your mind deserves a <em className="text-accent not-italic">quiet place.</em>
                    </h2>
                    <p className="font-sans text-base text-neutral-content/60 mb-8 max-w-md mx-auto leading-relaxed">
                        Join thousands already building a more mindful relationship with themselves. Free forever to start.
                    </p>
                    <button className="btn btn-primary rounded-full font-heading text-base px-10 shadow-lg shadow-primary/30">
                        Start journaling — it's free
                    </button>
                    <p className="font-sans text-xs text-neutral-content/40 mt-4">No credit card required · Cancel any time</p>
                </div>

                {/* Footer grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <div className="font-heading text-2xl font-black text-neutral-content mb-3">
                            equil<span className="text-primary">.</span>
                        </div>
                        <p className="font-sans text-sm text-neutral-content/40 leading-relaxed max-w-50">
                            Your personal space to write, reflect, and understand yourself.
                        </p>
                    </div>

                    {cols.map(({ title, links }) => (
                        <div key={title}>
                            <p className="font-sans text-xs font-semibold text-neutral-content/40 uppercase tracking-widest mb-4">{title}</p>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a className="font-sans text-sm text-neutral-content/60 hover:text-neutral-content transition-colors cursor-pointer">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="border-t border-neutral-content/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="font-sans text-xs text-neutral-content/30">© 2026 equil. All rights reserved.</p>
                    <div className="flex gap-6">
                        {['Privacy Policy', 'Terms of Service', 'Cookies'].map((item) => (
                            <a key={item} className="font-sans text-xs text-neutral-content/30 hover:text-neutral-content/60 transition-colors cursor-pointer">
                                {item}
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;