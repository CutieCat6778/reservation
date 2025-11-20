// app/admin/dashboard/[slug]/page.tsx
import ReservationSlugPageClient from './ReservationSlugPageClient';
import { Suspense } from "react"

type Props = {
  params: Promise<{ slug: string }>;
}

export default async function ReservationSlugPage({ params }: Props) {

  const { slug } = await params

  // Pass slug directly to client component
  return (
    <Suspense>
      <ReservationSlugPageClient slug={slug} />;
    </Suspense>
  )
}


