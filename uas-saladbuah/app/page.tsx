import { prisma } from '@/lib/prisma'; // Sudah diperbaiki (huruf kecil 'lib')
import { addBooking } from './action'; // Pastikan nama file adalah 'action.ts'

export default async function DashboardPage() {
  const lapangans = await prisma.lapangan.findMany();
  const bookings = await prisma.booking.findMany({ include: { lapangan: true } });

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">SaaS GOR Management</h1>
      
      {/* Form Booking */}
      <form action={addBooking} className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="font-bold mb-4">Buat Reservasi Baru</h2>
        <div className="grid grid-cols-2 gap-4">
          <input name="customerNama" placeholder="Nama Customer" className="border p-2 rounded" required />
          <select name="lapanganId" className="border p-2 rounded" required>
            {lapangans.map((l: any) => (
              <option key={l.id} value={l.id}>{l.nama}</option>
            ))}
          </select>
          <input name="tanggal" type="date" className="border p-2 rounded" required />
          <input name="jamMulai" type="number" placeholder="Jam (0-23)" className="border p-2 rounded" required />
        </div>
        <button className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded">Simpan Booking</button>
      </form>

      {/* List Booking */}
      <table className="w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="border-b">
            <th className="p-3">Customer</th>
            <th className="p-3">Jadwal</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b: any) => (
            <tr key={b.id} className="border-b text-center">
              <td className="p-3">{b.customerNama}</td>
              <td className="p-3">Jam {b.jamMulai} - {b.lapangan.nama}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}