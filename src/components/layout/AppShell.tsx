import { Outlet } from 'react-router-dom'; import { Sidebar } from './Sidebar'; import { Topbar } from './Topbar';
export function AppShell(){return <div className="grid min-h-screen grid-cols-[240px_1fr] bg-bg-primary"><Sidebar/><div className="flex min-w-0 flex-col"><Topbar/><main className="flex-1 overflow-auto"><div className="max-w-[1600px] px-7 py-7"><Outlet/></div></main></div></div>}
