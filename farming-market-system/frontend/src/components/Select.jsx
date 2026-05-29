export default function Select({ children, ...props }) { return <select className="w-full rounded-xl border border-gray-200 px-3 py-2 bg-white" {...props}>{children}</select>; }
