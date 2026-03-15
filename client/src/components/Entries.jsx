import { useEffect, useState } from "react";
import { deleteEntry, getEntries } from "../api/entryAPI";
import { useNavigate } from "react-router-dom";
import { LuTrash2 } from 'react-icons/lu';
import toast from "react-hot-toast";

const Entries = () => {
	const navigate = useNavigate();
	const [entries, setEntries] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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
	}, [])

	const handleDelete = async (id) => {

		const originalEntries = [...entries];
		setEntries(entries.filter(entry => entry._id !== id));

		try {
			await deleteEntry(id);
			toast.success('Deleted Successfully!')
		} catch (err) {
			console.error("Delete failed:", err);
			toast.error("Could not delete the entry.");
			setEntries(originalEntries);
		}
	};

	if (loading) return <span className="loading loading-dots loading-lg"></span>;
	if (error) return <div className="alert alert-error">{error}</div>;

	return <>
		<div className="p-4">
			<h2 className="text-2xl font-bold font-data mb-4">Your Entries</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{entries.length === 0 ? (
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
				) : (
					entries.map((entry) => (
						<div key={entry._id} className="card bg-base-100 shadow-xl border">
							<div className="card-body">
								<div className="flex justify-between">
									<h3 className="card-title">{entry.title}</h3>
									<div>
										<button className="btn btn-outline btn-warning" onClick={()=>document.getElementById(`modal-${entry._id}`).showModal()}><LuTrash2 /></button>
									</div>
									<dialog id={`modal-${entry._id}`} className="modal modal-bottom sm:modal-middle">
										<div className="modal-box">
											<h3 className="font-bold font-data text-lg">Are you sure you wanna delete this memory?</h3>
											<div className="modal-action">
												<form method="dialog" className="flex gap-2">
													<button className="btn btn-warning" onClick={() => handleDelete(entry._id)}>Delete</button>
													<button className="btn">Close</button>
												</form>
											</div>
										</div>
									</dialog>
								</div>
								<p>{entry.encryptedText.substring(0, 100)}...</p>
							</div>
						</div>
					)))}
			</div>
		</div>
	</>
}

export default Entries