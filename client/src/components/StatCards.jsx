const stats = [
	{
		id: 0,
		title: "Current Streak",
		value: 0,
		unit: "days",
	},
	{
		id: 1,
		title: "Total Entries",
		value: 0,
		unit: "all time",
	},
	{
		id: 2,
		title: "AVG Mood",
		value: "-",
		unit: "this week"
	},
	{
		id: 3,
		title: "Longest Streak",
		value: 0,
		unit: "days"
	},
];

const StatCards = () => {
	return <>
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full font-data px-4">
			{stats.map((stat) => (
				<div key={stat.id} className="stat bg-base-200 shadow rounded-box">
					<div className="stat-title text-xs md:text-sm">{stat.title}</div>
					<div className="stat-value text-2xl md:text-4xl">{stat.value}</div>
					<div className="stat-desc">{stat.unit}</div>
				</div>
			))}
		</div>
	</>
}

export default StatCards