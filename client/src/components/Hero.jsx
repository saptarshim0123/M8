import heroImg from '../assets/hero-img.png'

const Hero = () => {
    return (
        <section className="flex items-center justify-center">
            <div className="max-w-[80%] w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col space-y-6 justify-center">
                    <h1 className="font-heading text-5xl md:text-6xl font-extrabold text-neutral">
                        Track your mood. <br />
                        <span className="text-primary">Free up your mind.</span>
                    </h1>

                    <p className="font-sans text-lg text-neutral/80 max-w-md">
                        Your personal space to write, reflect, and uncover the patterns behind your daily emotions.
                    </p>

                    <div className="pt-4">
                        <button className="btn btn-primary font-heading text-lg px-8 rounded-full">
                            Start Journaling
                        </button>
                    </div>
                </div>
                
                <div className="w-full h-full flex items-center justify-center">
                    <img
                        src={heroImg}
                        alt="Girl journaling"
                        className="w-full max-w-xl h-auto object-contain drop-shadow-md" 
                    />
                </div>
            </div>
        </section>
    );
}

export default Hero;