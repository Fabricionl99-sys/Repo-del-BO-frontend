import { ReactNode } from 'react'; import { cn } from '@/lib/cn';
export function Card({children,className}:{children:ReactNode;className?:string}){return <div className={cn('card',className)}>{children}</div>}
export function CardHeader({title,subtitle,actions}:{title:string;subtitle?:string;actions?:ReactNode}){return <header className="section-head"><div><h2 className="section-title">{title}</h2>{subtitle&&<p className="section-help">{subtitle}</p>}</div>{actions}</header>}
