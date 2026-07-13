import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = parseInt(searchParams.get('userId') || '0');

  const lapangans = await prisma.lapangan.findMany({
    where: { user_id: userId }
  });
  return Response.json(lapangans);
}
export async function PUT(request: Request) {
  const body = await request.json();
  const updatedLapangan = await prisma.lapangan.update({
    where: { id: body.id }, // Cari berdasarkan ID
    data: {
      nama: body.nama,
      tipe: body.tipe,
      harga_per_jam: parseInt(body.harga_per_jam),
    }
  });
  return Response.json(updatedLapangan);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newLapangan = await prisma.lapangan.create({
    data: {
      user_id: body.user_id,
      nama: body.nama,
      tipe: body.tipe,
      harga_per_jam: parseInt(body.harga_per_jam),
    }
  });
  return Response.json(newLapangan);
}