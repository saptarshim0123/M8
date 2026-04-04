import { useParams, useNavigate } from "react-router-dom";
import { getEntry } from "../api/entryAPI";
import { getAnalysis, runAnalysis } from "../api/analyzeAPI";
import { useEffect, useState } from "react";
import { LuSparkles, LuTriangleAlert, LuWandSparkles, LuX } from "react-icons/lu";
import toast from "react-hot-toast";

const ViewEntry = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const [entry, setEntry] = useState(null);
	const [analysis, setAnalysis] = useState(null);
	const [loading, setLoading] = useState(true);
	const [analyzing, setAnalyzing] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);

	const handleRunAnalysis = async () => {
		setAnalyzing(true);
		try {
			const res = await runAnalysis(id);
			setAnalysis(res.data);
			toast.success('Analysis complete!');
		} catch (error) {
			toast.error(error.response?.data?.message || 'Failed to run analysis');
		} finally {
			setAnalyzing(false);
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const [entryRes, analysisRes] = await Promise.allSettled([
					getEntry(id),
					getAnalysis(id)
				]);

				if (entryRes.status === 'fulfilled') {
					setEntry(entryRes.value.data);
				}

				if (analysisRes.status === 'fulfilled') {
					setAnalysis(analysisRes.value.data);
				}

			} catch (error) {
				toast.error("Error loading data");
				console.log(error);
			} finally {
				setLoading(false);
			}
		};
		if (id) fetchData();
	}, [id]);

	if (loading) {
		return (
			<div className="w-full min-h-screen flex items-center justify-center">
				<span className="loading loading-spinner loading-lg text-primary"></span>
			</div>
		);
	}

	if (!entry) {
		return (
			<div className="w-full min-h-screen flex flex-col items-center justify-center">
				<h2 className="text-2xl font-bold text-neutral">Entry not found</h2>
				<button
					onClick={() => navigate('/dashboard')}
					className="btn btn-ghost mt-4"
				>
					← Back to Dashboard
				</button>
			</div>
		);
	}

	return <>
		<div className="w-full px-6 py-6 max-w-7xl mx-auto">
			{/* Header / Back Button here */}
			<div className="flex items-center justify-between">
				<button
					onClick={() => navigate(-1)}
					className="btn btn-ghost gap-2"
				>
					← Back
				</button>
				<div className="flex gap-2">
					<button
						onClick={() => navigate(`/write/${entry._id}`)}
						className="btn btn-outline btn-sm"
					>
						Edit
					</button>
				</div>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
				{/* Left Column: Entry */}
				<div className="lg:col-span-2">
					<h1 className="italic text-dark-brown text-4xl font-heading font-bold mb-2">{entry.title}</h1>
					<p className="text-sm font-data text-primary mb-6">
						{new Date(entry.createdAt).toLocaleDateString('en-US', {
							weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
						})}
					</p>
					{entry.images && entry.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            {entry.images.map((img, i) => (
                                <img 
                                    key={i} 
                                    src={img} 
                                    alt={`entry-${i}`} 
                                    className="w-full h-48 object-cover rounded-xl shadow-sm border border-base-content/5 cursor-zoom-in hover:opacity-90 transition-opacity" 
                                    onClick={() => setSelectedImage(img)}
                                />
                            ))}
                        </div>
                    )}
					<div className="prose max-w-none text-neutral font-journal" dangerouslySetInnerHTML={{ __html: entry.text }} />
					<div className="flex flex-wrap gap-1 my-10">
						{entry.tags?.length > 0
							? entry.tags.map((tag) => (
								<span key={tag} className="badge badge-sm badge-ghost">{tag}</span>
							))
							: <span className="text-xs text-neutral/30">No tags yet</span>
						}
					</div>
				</div>

				{/* Cards column */}
				<aside className="w-full lg:col-span-1 space-y-6">
					{!analysis ? (
						// STATE: NO ANALYSIS RUN YET
						<div className="card bg-base-200 rounded-4xl border border-base-300">
							<div className="card-body text-center p-8">
								<h3 className="card-title justify-center text-lg font-heading">No Analysis Yet</h3>
								<p className="text-sm text-neutral mb-4 font-sans">
									Discover emotional insights, cognitive patterns, and coping strategies for this entry.
								</p>
								<button
									onClick={handleRunAnalysis}
									disabled={analyzing}
									className="btn btn-primary rounded-full w-full font-data tracking-widest uppercase text-xs"
								>
									{analyzing ? <span className="loading loading-spinner"></span> : 'Run AI Analysis'} <LuSparkles />
								</button>
							</div>
						</div>
					) : (
						// STATE: ANALYSIS DONE
						<>
							{/* Safety Banner (Only shows if crisisDetected is true) */}
							{analysis.crisisDetected && (
								<div className="alert alert-error shadow-sm mb-6 rounded-2xl border border-error/20 bg-error/10 text-error">
									<LuTriangleAlert />
									<div>
										<h3 className="font-data font-bold text-sm uppercase tracking-widest">Support is available</h3>
										<p className="font-sans text-sm mt-1 text-base-content/80">
											This entry suggests you might be going through a very difficult time. Please consider reaching out to a local crisis hotline or someone you trust. You are not alone.
										</p>
									</div>
								</div>
							)}
							{/* 1. Mood & Intensity Card */}
							<div className="card bg-base-200 rounded-4xl overflow-hidden">
								<div className="card-body p-6 md:p-8">
									<div className="flex justify-between items-start mb-6">
										<div>
											<h4 className="font-data uppercase tracking-widest text-secondary font-bold mb-2">Dominant Mood</h4>
											<div className="flex items-center gap-2 bg-base-100 w-fit px-4 py-2 rounded-full border border-base-content/5">
												<span className="font-heading font-bold text-primary">{analysis.mood}</span>
											</div>
										</div>
										<div className="text-right">
											<h4 className="font-data uppercase tracking-widest text-secondary font-bold mb-2">Intensity</h4>
											<span className="font-data font-black text-3xl text-primary italic">
												{analysis.intensityScore}<span className="text-lg opacity-40">/10</span>
											</span>
										</div>
									</div>
									<progress
										className="progress progress-primary w-full h-1.5"
										value={analysis.intensityScore}
										max="10"
									/>
								</div>
							</div>

							{/* 2. AI Insight Box */}
							<div className="card bg-primary/10 rounded-4xl border border-primary/20">
								<div className="card-body p-6 md:p-8">
									<div className="flex items-center gap-2 mb-4">
										<LuSparkles />
										<h4 className="font-data uppercase tracking-[0.15em] text-primary font-black">AI Insight</h4>
									</div>
									<blockquote className="font-journal text-lg text-base-content leading-snug italic">
										{analysis.aiResponse}
									</blockquote>
								</div>
							</div>

							{/* 3. Patterns & Keywords */}
							<div className="card bg-base-200 rounded-4xl">
								<div className="card-body p-6 md:p-8">
									<h4 className="font-data uppercase tracking-widest text-secondary font-bold mb-4">Patterns Identified</h4>

									{/* Standard Keywords */}
									<div className="flex flex-wrap gap-2 mb-4">
										{analysis.keywords?.map((kw, index) => (
											<span key={`kw-${index}`} className="px-3 py-1 bg-base-100 rounded-full font-data text-[10px] uppercase tracking-wider text-base-content border border-base-content/5">
												{kw}
											</span>
										))}
									</div>

									{/* Cognitive Distortions (Highlighted in Red/Error) */}
									{analysis.distortions?.length > 0 && (
										<div className="space-y-3 mt-4">
											{analysis.distortions.map((dist, index) => (
												<div key={`dist-${index}`} className="flex items-center gap-3 p-3 bg-error/10 rounded-xl border border-error/20">
													<LuTriangleAlert />
													<p className="font-data text-sm font-bold text-error">{dist}</p>
												</div>
											))}
										</div>
									)}
								</div>
							</div>

							{/* 4. Coping Suggestion CTA */}
							<div className="card bg-secondary/10 rounded-4xl border border-secondary/20">
								<div className="card-body p-6 md:p-8">
									<h4 className="font-data uppercase tracking-widest text-secondary font-bold mb-4">Suggested Practice</h4>
									<p className="font-journal text-lg text-neutral mb-6">{analysis.copingSuggestion}</p>
									<button className="flex items-center justify-center gap-3 w-full py-3 bg-neutral text-accent rounded-full font-data font-bold text-sm hover:opacity-90 transition-opacity">
										<LuWandSparkles />
										Try This Now
									</button>
								</div>
							</div>
						</>
					)}
				</aside>
			</div>

            {/* Image Maximize Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 cursor-zoom-out backdrop-blur-sm transition-opacity"
                    onClick={() => setSelectedImage(null)}
                >
                    <img 
                        src={selectedImage} 
                        alt="Enlarged" 
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
                    />
                    <button 
                        className="absolute top-6 right-6 btn btn-circle btn-ghost text-white"
                        onClick={() => setSelectedImage(null)}
                    >
                        <LuX size={24} />
                    </button>
                </div>
            )}
		</div>
	</>

}

export default ViewEntry