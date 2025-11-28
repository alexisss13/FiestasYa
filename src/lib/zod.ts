import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(3, { message: 'El título debe tener al menos 3 caracteres' }),
  slug: z.string().min(3, { message: 'El slug es obligatorio' }).regex(/^[a-z0-9-]+$/, { message: 'El slug solo puede tener letras minúsculas, números y guiones' }),
  description: z.string().min(10, { message: 'La descripción es muy corta' }),
  price: z.coerce.number().min(0, { message: 'El precio no puede ser negativo' }),
  stock: z.coerce.number().int().min(0, { message: 'El stock debe ser un entero positivo' }),
  categoryId: z.string().min(1, { message: 'Debes seleccionar una categoría' }),
  images: z.array(z.string()).min(1, { message: 'Debes subir al menos una imagen' }),
  isAvailable: z.boolean().default(true),
});