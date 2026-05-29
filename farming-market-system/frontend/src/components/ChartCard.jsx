import { ResponsiveContainer, LineChart, Line, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';

export default function ChartCard({ title, data }) {
  return <div className="card p-4"><h3 className="font-semibold mb-3">{title}</h3><div className="h-60"><ResponsiveContainer><LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="value" stroke="#2f6f3e" strokeWidth={3} /></LineChart></ResponsiveContainer></div></div>;
}
