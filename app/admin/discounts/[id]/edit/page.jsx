'use client'

import Link from 'next/link'
import AdminHeader from '@/admin/components/AdminHeader'

export default function EditDiscountPage({ params }) {
  return (
    <>
      <AdminHeader title="Edit Discount" />
      <div className="p-6 max-w-xl">
        <Link href="/admin/discounts" className="text-xs text-gray-400 hover:text-nb-blue transition-colors mb-6 inline-block">
          ← Discounts
        </Link>
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm text-sm text-gray-500">
          Edit form coming soon.
        </div>
      </div>
    </>
  )
}
