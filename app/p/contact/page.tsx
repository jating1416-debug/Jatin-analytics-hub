import { redirect } from 'next/navigation';

// /p/contact - footer se click -> asli contact page (misc/contact - article form)
export const dynamic = 'force-dynamic';

export default function Page() {
  redirect('/misc/contact');
}
