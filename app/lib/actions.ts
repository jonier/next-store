'use server'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
//Marcar que todas la funciones que se exportan en este archivo son de servidor y por lo tanto no se ejecutan ni se envian al cliente
import { z } from 'zod'

const CreateInvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string()
})

const CreateInvoiceFormSchema = CreateInvoiceSchema.omit({
  id:true,
  date: true
})

export async function createInvoice (formData: FormData){
    const { customerId, amount, status } = CreateInvoiceFormSchema.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    })

    //transformamos para evitar errores de rendondeo
    const amountIncents = amount * 100

    //creamos la fecha acutal 2021-11-25
    const [date] = new Date().toISOString().split('T')

    console.log('Estos son los datos: ', { customerId, amountIncents, date })

    await sql `
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES(${customerId}, ${amountIncents}, ${status}, ${date})
    `

    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
}