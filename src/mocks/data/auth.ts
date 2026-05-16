import type { User } from '@/types/shared';
export const operators=[{id:'op_casino_astral',name:'Casino Astral',tier:'growth' as const,locale:'es-AR',timezone:'America/Argentina/Buenos_Aires'},{id:'op_pampa_bet',name:'PampaBet',tier:'starter' as const,locale:'es-AR',timezone:'America/Mexico_City'}];
export const mockLogin:{accessToken:string;refreshToken:string;user:User;operators:User['operators']}={accessToken:'mock_access_token',refreshToken:'mock_refresh_token',user:{id:'user_fl',name:'Fabricio Lasagna',email:'fabricionl99@icloud.com',role:'admin',initials:'FL',operators},operators};
