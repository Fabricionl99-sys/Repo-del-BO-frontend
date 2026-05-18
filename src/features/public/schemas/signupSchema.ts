import { z } from 'zod';

export const signupSchema = z
  .object({
    email: z.string().email('email inválido'),
    password: z
      .string()
      .min(8, 'mínimo 8 caracteres')
      .regex(/[A-Z]/, 'incluí al menos una mayúscula')
      .regex(/[0-9]/, 'incluí al menos un número'),
    confirmPassword: z.string(),
    company_name: z.string().min(2, 'nombre de empresa requerido'),
    country: z.string().min(1, 'seleccioná un país'),
    terms: z.literal(true, { message: 'debés aceptar los términos' }),
    newsletter: z.boolean().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
