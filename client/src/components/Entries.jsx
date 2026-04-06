import { useEffect, useState, useCallback } from "react";
import { deleteEntry, getEntries } from "../api/entryAPI";
import { useNavigate } from "react-router-dom";
import { LuTrash2, LuPencil, LuSearch, LuX } from 'react-icons/lu';
import toast from "react-hot-toast";

const Entries = () => {
	const navigate = useNavigate();
	const [entries, setEntries] = useState([]);
	const [allTags, setAllTags] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [entryToDelete, setEntryToDelete] = useState(null);

	const [search, setSearch] = useState('');
	const [sort, setSort] = useState('newest');
	const [activeTag, setActiveTag] = useState('');

	const fetchEntries = useCallback(async (s, t, o) => {
		setLoading(true);
		try {
			const res = await getEntries(s, t, o);
			setEntries(res.data);
			// collect all unique tags from full fetch (no tag filter) for the tag bar
			if (!t) {
				const tags = [...new Set(res.data.flatMap(e => e.tags || []))];
				setAllTags(tags);
			}
		} catch (err) {
			console.error("Error fetching entries:", err);
			setError("Failed to load entries.");
		} finally {
			setLoading(false);
		}
	}, []);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => fetchEntries(search, activeTag, sort), 300);
		return () => clearTimeout(timer);
	}, [search, activeTag, sort, fetchEntries]);

	// Keep tag list fresh when tag filter is cleared
	useEffect(() => {
		if (!activeTag) fetchEntries(search, '', sort);
	}, [activeTag]); // eslint-disable-line

	const openDelModal = (id, e) => {
		e.stopPropagation();
		setEntryToDelete(id);
		document.getElementById('delete_modal').showModal();
	};

	const handleDelete = async () => {
		if (!entryToDelete) return;
		const idToDelete = entryToDelete;
		const originalEntries = [...entries];
		setEntries(entries.filter(entry => entry._id !== idToDelete));
		document.getElementById('delete_modal').close();
		setEntryToDelete(null);
		try {
			await deleteEntry(idToDelete);
			toast.success('Deleted Successfully!');
		} catch (err) {
			console.error("Delete failed:", err);
			toast.error("Could not delete the entry.");
			setEntries(originalEntries);
		}
	};

	const clearFilters = () => {
		setSearch('');
		setActiveTag('');
		setSort('newest');
	};

	const hasFilters = search || activeTag || sort !== 'newest';

	return (
		<div className="p-4">
			{/* Controls */}
			<div className="flex flex-col gap-3 mb-5">
				<div className="flex flex-col sm:flex-row gap-2">
					{/* Search */}
					<label className="input input-bordered flex items-center gap-2 flex-1">
						<LuSearch className="opacity-50" />
						<input
							type="text"
							placeholder="Search entries..."
							value={search}
							onChange={e => setSearch(e.target.value)}
							className="grow"
						/>
						{search && (
							<button onClick={() => setSearch('')} className="opacity-50 hover:opacity-100">
								<LuX size={14} />
							</button>
						)}
					</label>

					{/* Sort */}
					<select
						className="select select-bordered w-full sm:w-40"
						value={sort}
						onChange={e => setSort(e.target.value)}
					>
						<option value="newest">Newest first</option>
						<option value="oldest">Oldest first</option>
					</select>
				</div>

				{/* Tag filter pills */}
				{allTags.length > 0 && (
					<div className="flex flex-wrap gap-2 items-center">
						<span className="text-xs text-neutral/40 font-data">Filter by tag:</span>
						{allTags.map(tag => (
							<button
								key={tag}
								onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
								className={`badge badge-sm cursor-pointer transition-all ${activeTag === tag ? 'badge-primary' : 'badge-ghost hover:badge-primary/40'}`}
							>
								{tag}
							</button>
						))}
					</div>
				)}

				{/* Clear filters */}
				{hasFilters && (
					<button onClick={clearFilters} className="btn btn-ghost btn-xs self-start text-neutral/50">
						<LuX size={12} /> Clear filters
					</button>
				)}
			</div>

			{/* Loading skeleton */}
			{loading && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="card bg-base-100 border shadow-xl">
							<div className="card-body gap-3">
								<div className="skeleton h-6 w-3/4" />
								<div className="skeleton h-4 w-1/3" />
								<div className="flex gap-2 mt-2">
									<div className="skeleton h-5 w-16 rounded-full" />
									<div className="skeleton h-5 w-16 rounded-full" />
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Error */}
			{error && <div className="alert alert-error">{error}</div>}

			{/* Empty state */}
			{!loading && !error && entries.length === 0 && (
				<div className="flex flex-col items-center justify-center py-16 gap-4">
					{hasFilters ? (
						<>
							<p className="font-heading text-2xl text-neutral/40">No entries found</p>
							<p className="font-sans text-sm text-neutral/40">Try adjusting your search or filters.</p>
							<button onClick={clearFilters} className="btn btn-ghost btn-sm rounded-full">Clear filters</button>
						</>
					) : (
						<>
							<p className="font-heading text-2xl text-neutral/40">No entries yet</p>
							<p className="font-sans text-sm text-neutral/40">Your journal is empty. Start writing today.</p>
							<button onClick={() => navigate('/write')} className="btn btn-primary btn-sm rounded-full">
								Write first entry
							</button>
						</>
					)}
				</div>
			)}

			{/* Entry grid */}
			{!loading && !error && entries.length > 0 && (
				<>
					<h2 className="text-2xl font-bold font-data mb-4">
						Your Entries
						{hasFilters && <span className="text-sm font-normal text-neutral/40 ml-2">({entries.length} result{entries.length !== 1 ? 's' : ''})</span>}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{entries.map((entry) => (
							<div
								key={entry._id}
								className="card bg-base-100 shadow-xl border overflow-hidden cursor-pointer hover:border-primary/30 transition-all"
								onClick={() => navigate(`/entry/${entry._id}`)}
							>
								<div className="card-body">
									<div className="flex justify-between items-start">
										<h3 className="card-title font-heading">{entry.title || 'Untitled'}</h3>
										<div className="flex gap-2">
											<button
												className="btn btn-outline btn-sm"
												onClick={(e) => { e.stopPropagation(); navigate(`/write/${entry._id}`); }}
											>
												<LuPencil />
											</button>
											<button
												className="btn btn-outline btn-warning btn-sm"
												onClick={(e) => openDelModal(entry._id, e)}
											>
												<LuTrash2 />
											</button>
										</div>
									</div>

									<p className="text-sm text-neutral/50 font-data">
										{new Date(entry.createdAt).toLocaleDateString('en-IN', {
											day: 'numeric', month: 'long', year: 'numeric'
										})}
									</p>

									<div className="flex flex-wrap gap-1 mt-2">
										{entry.tags?.length > 0
											? entry.tags.map((tag) => (
												<span
													key={tag}
													className={`badge badge-sm cursor-pointer ${activeTag === tag ? 'badge-primary' : 'badge-ghost'}`}
													onClick={(e) => { e.stopPropagation(); setActiveTag(activeTag === tag ? '' : tag); }}
												>
													{tag}
												</span>
											))
											: <span className="text-xs text-neutral/30">No tags yet</span>
										}
									</div>
								</div>
							</div>
						))}
					</div>
				</>
			)}

			{/* Delete modal */}
			<dialog id="delete_modal" className="modal modal-bottom sm:modal-middle">
				<div className="modal-box">
					<h3 className="font-bold font-data text-lg">Are you sure you want to delete this memory?</h3>
					<p className="py-4 text-sm opacity-80">This action cannot be undone.</p>
					<div className="modal-action">
						<form method="dialog">
							<button className="btn" onClick={() => setEntryToDelete(null)}>Cancel</button>
						</form>
						<button className="btn btn-error text-accent" onClick={handleDelete}>Delete</button>
					</div>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button onClick={() => setEntryToDelete(null)}>close</button>
				</form>
			</dialog>
		</div>
	);
};

export default Entries;
