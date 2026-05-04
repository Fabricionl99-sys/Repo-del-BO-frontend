import { ReactNode } from 'react'; import { Modal } from './Modal';
/** Drawer reutiliza Modal para edición lateral simple en Tier 1. Uso: <Drawer open title onClose>contenido</Drawer>. */
export function Drawer({open,onClose,title,children}:{open:boolean;onClose:()=>void;title:string;children:ReactNode}){return <Modal open={open} onClose={onClose} title={title} size="lg">{children}</Modal>}
