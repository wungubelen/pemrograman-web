import { NextResponse } from 'next/server';
import { prisma } from '@/Lib/prisma';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID dibutuhkan' }, { status: 400 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: userId },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal memuat transaksi' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { totalHarga, statusPembayaran, tanggalManual, userId } = body;

    const newTransaction = await prisma.transaction.create({
      data: {
        totalHarga,
        statusPembayaran,
        tanggalManual,
        userId,
      },
    });

    return NextResponse.json(newTransaction);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal menyimpan transaksi' }, { status: 500 });
  }
}


export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, totalHarga, statusPembayaran, tanggalManual } = body;

    const updatedTransaction = await prisma.transaction.update({
      where: { id: id },
      data: {
        totalHarga,
        statusPembayaran,
        tanggalManual,
      },
    });

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal memperbarui transaksi' }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID transaksi tidak ditemukan' }, { status: 400 });
    }

    await prisma.transaction.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal menghapus transaksi' }, { status: 500 });
  }
}