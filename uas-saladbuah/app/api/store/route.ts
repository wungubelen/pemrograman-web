import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Slug tidak ditemukan' }, { status: 400 });
  }

  // Inisialisasi koneksi ke Neon
  const sql = neon(process.env.DATABASE_URL!);

  try {
    // 1. Cari data toko berdasarkan slug
    const stores = await sql`SELECT * FROM stores WHERE slug = ${slug} LIMIT 1`;
    
    if (stores.length === 0) {
      return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 });
    }

    const store = stores[0];

    // 2. Cari semua menu yang terhubung dengan toko tersebut
    const menus = await sql`SELECT * FROM menus WHERE store_id = ${store.id}`;

    return NextResponse.json({ store, menus });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal mengambil data dari Neon' }, { status: 500 });
  }
}