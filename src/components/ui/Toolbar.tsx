import { ReactNode } from 'react';
export function Toolbar({search,filters,right}:{search?:ReactNode;filters?:ReactNode;right?:ReactNode}){return <div className="mb-5 flex flex-wrap items-center gap-4">{search&&<div className="max-w-md flex-1">{search}</div>}{filters&&<div className="flex flex-wrap items-center gap-2">{filters}</div>}{right&&<div className="ml-auto">{right}</div>}</div>}
