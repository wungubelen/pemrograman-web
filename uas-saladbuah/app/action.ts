'use server'
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addBooking(formData: FormData) {
  const customerNama = formData.get('customerNama') as string;
  const jamMulai = parseInt(formData.get('jamMulai') as string);
  const lapanganId = formData.get('lapanganId') as string;
  const tanggal = new Date(formData.get('tanggal') as string);

  try {
    await prisma.booking.create({
      data: { customerNama, jamMulai, lapanganId, tanggal, durasi: 1, totalBayar: 100000 }
    });
    revalidatePath('/dashboard');
  } catch (error) {
    throw new Error("Jadwal bentrok atau gagal booking!");
  }
}