import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      where: { userId }
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil produk' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nama, harga, stok, gambarUrl, userId } = body

    const newProduct = await prisma.product.create({
      data: {
        nama,
        harga: Number(harga),
        stok: Number(stok),
        gambarUrl: gambarUrl || null,
        userId
      }
    })
    return NextResponse.json(newProduct)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah produk' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, nama, harga, stok, gambarUrl } = body

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        nama,
        harga: Number(harga),
        stok: Number(stok),
        gambarUrl: gambarUrl || null
      },
    })
    return NextResponse.json(updatedProduct)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengubah produk' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 })

    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ message: 'Produk berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 })
  }
}