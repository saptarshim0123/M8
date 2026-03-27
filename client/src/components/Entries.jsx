import { useEffect, useState } from "react";
import { deleteEntry, getEntries } from "../api/entryAPI";
import { useNavigate } from "react-router-dom";
import { LuTrash2, LuPencil } from 'react-icons/lu';
import toast from "react-hot-toast";

const Entries = () => {
	const navigate = useNavigate();
	const [entries, setEntries] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [entryToDelete, setEntryToDelete] = useState(null);

	useEffect(() => {
		const fetchEntries = async () => {
			try {
				const res = await getEntries();
				setEntries(res.data);
				setLoading(false)
			} catch (err) {
				console.error("Error fetching entries:", err);
				setError("Failed to load entries.");
				setLoading(false);
			}
		};
		fetchEntries();
	}, []);

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
			toast.success('Deleted Successfully!')
		} catch (err) {
			console.error("Delete failed:", err);
			toast.error("Could not delete the entry.");
			setEntries(originalEntries);
		}
	};

	// Skeleton loading
	if (loading) return (
		<div className="p-4">
			<div className="skeleton h-8 w-40 mb-4" />
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
		</div>
	)
	if (error) return <div className="alert alert-error">{error}</div>;

	if (entries.length === 0) {
		return <>
			<div className="flex flex-col items-center justify-center py-16 gap-4">
				<p className="font-heading text-2xl text-neutral/40">No entries yet</p>
				<p className="font-sans text-sm text-neutral/40">Your journal is empty. Start writing today.</p>
				<button
					onClick={() => navigate('/write')}
					className="btn btn-primary btn-sm rounded-full"
				>
					Write first entry
				</button>
			</div>
		</>
	}


	return <>
		<div className="p-4">
			<h2 className="text-2xl font-bold font-data mb-4">Your Entries</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{entries.map((entry) => (
						<div key={entry._id} className="card bg-base-100 shadow-xl border overflow-hidden cursor-pointer hover:border-primary/30 transition-all" onClick={() => navigate(`/entry/${entry._id}`)}>
							<div className="card-body">
								<div className="flex justify-between items-start">
									<h3 className="card-title font-heading">{entry.title || 'Untitled'}</h3>
									<div className="flex gap-2">
										<button
											className="btn btn-outline btn-sm"
											onClick={(e) => {
												e.stopPropagation()
												navigate(`/write/${entry._id}`)
											}}
										>
											<LuPencil />
										</button>
										<button
											className="btn btn-outline btn-warning btn-sm"
											onClick={(e) => {openDelModal(entry._id, e)}}
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
											<span key={tag} className="badge badge-sm badge-ghost">{tag}</span>
										))
										: <span className="text-xs text-neutral/30">No tags yet</span>
									}
								</div>
							</div>
						</div>
					))}
				<dialog id="delete_modal" className="modal modal-bottom sm:modal-middle">
					<div className="modal-box">
						<h3 className="font-bold font-data text-lg">Are you sure you want to delete this memory?</h3>
						<p className="py-4 text-sm opacity-80">This action cannot be undone.</p>

						<div className="modal-action">
							<form method="dialog">
								<button className="btn" onClick={() => setEntryToDelete(null)}>Cancel</button>
							</form>

							<button className="btn btn-error text-accent" onClick={handleDelete}>
								Delete
							</button>
						</div>
					</div>

					<form method="dialog" className="modal-backdrop">
						<button onClick={() => setEntryToDelete(null)}>close</button>
					</form>
				</dialog>
			</div>
		</div>
	</>
}

export default Entries