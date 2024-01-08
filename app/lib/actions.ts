'use server'; // mark all the functions here as server functions, even if imported into Client components.

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod'; // type validation library to automatically validate data types:

// First, we define the schema and types:
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.', // message when customerId != string
  }),
  amount: z.coerce
    .number() // coerce change from string to number (but it'll default to zero if the string is empty) => handle if 0:
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.', // message when status != 'pending' | 'paid'
  }),
  date: z.string(),
});
const validateInvoice = FormSchema.omit({ id: true, date: true }); // id of the invoice is created in the DB. Data is created below

// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

/* */
/* */
/*********    CREATE INVOICE     ******************/

export async function createInvoice(prevState: State, formData: FormData) {
  // Second, we validate form fields using Zod:
  // safeParse() return an object containing either a success or error field. This will help handle validation without manual try/catch logic:
  const validatedFields = validateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    console.log(validatedFields);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Rest of the code will only execute if validatedFields.success (return if != -see block above-):
  // Prepare data for insertion into the database:
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100; // invoice amounts are stored in cents in the DB
  const date = new Date().toISOString().split('T')[0]; // creates a new date with the format "YYYY-MM-DD" (invoice's creation date)

  // Insert data into the database:
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // Test it out:
  console.log(validatedFields);

  // Revalidate the cache for the invoices page and redirect the user:
  revalidatePath('/dashboard/invoices'); // path will be revalidated, and fresh data will be fetched from the server
  redirect('/dashboard/invoices'); // eAfter invoice created, back to /dashboard/invoices (I can't use Link like for cancel, because form submit action only accepts button -not even if I wrap the button on a Link-).
}

/* */
/* */
/*********     UPDATE INVOICE     ******************/

// Use Zod to update the expected types
const validateUpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  // safeParse() return an object containing either a success or error field. This will help handle validation without manual try/catch logic:
  const validatedFields = validateUpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    console.log(validatedFields);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  // Rest of the code will only execute if validatedFields.success (return if != -see block above-):
  // Prepare data for insertion into the database:
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100; // invoice amounts are stored in cents in the DB

  // Update data in the database:
  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

/* */
/* */
/*********     DELETE INVOICE     ******************/

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

/* */
/* */
/*********     AUTHENTICATE USER     ******************/

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

// ...

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    console.log('trying to authenticate user...');
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
