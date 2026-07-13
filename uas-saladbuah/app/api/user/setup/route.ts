import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, namaBisnis } = body

    if (!userId || !namaBisnis) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { namaBisnis: namaBisnis.trim() }
    })

    return NextResponse.json({ 
      message: 'Nama bisnis berhasil disimpan', 
      user: { id: updatedUser.id, username: updatedUser.username, namaBisnis: updatedUser.namaBisnis } 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengatur nama bisnis' }, { status: 500 })
  }
}