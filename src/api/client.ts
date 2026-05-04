import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { useOperatorStore } from '@/stores/operatorStore';
import { toast } from '@/stores/toastStore';
export const apiClient=axios.create({baseURL:import.meta.env.VITE_API_BASE_URL ?? '/api',timeout:30000});
apiClient.interceptors.request.use((config:InternalAxiosRequestConfig)=>{const token=useAuthStore.getState().accessToken; const tenant=useOperatorStore.getState().current?.id; if(token)config.headers.Authorization=`Bearer ${token}`; if(tenant)config.headers['X-Tenant-ID']=tenant; return config});
apiClient.interceptors.response.use(r=>r,(error:AxiosError)=>{if(error.response?.status===403)toast.error('No tenés permisos para hacer esto'); else if(error.response&&error.response.status>=500)toast.error('Error del servidor · intentá de nuevo en unos minutos'); else if(!error.response)toast.error('Sin conexión · revisá tu red'); return Promise.reject(error)});
