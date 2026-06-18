import { z } from 'zod';

export const livroSchema = z.object({
  titulo: z.string().min(1, 'O título é obrigatório'),
  autor: z.string().min(1, 'O autor é obrigatório'),
  genero: z.string().min(1, 'O gênero é obrigatório'),
  status: z.enum(['quero ler', 'lendo', 'lido']),
  avaliacao: z.coerce.number().int().min(1).max(5).optional().or(z.literal('')),
});
