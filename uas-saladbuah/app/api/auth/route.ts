import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 })
    }

    const cleanUsername = username.trim().toLowerCase()

    // 1. ALUR REGISTRASI
    if (action === 'register') {
      const existingUser = await prisma.user.findUnique({ where: { username: cleanUsername } })
      if (existingUser) {
        return NextResponse.json({ error: 'Username sudah terdaftar' }, { status: 400 })
      }

      const newUser = await prisma.user.create({
        data: { 
          username: cleanUsername, 
          password: password, 
          namaBisnis: null 
        },
      })
      return NextResponse.json({ message: 'Registrasi berhasil', user: { id: newUser.id, username: newUser.username } })
    }

    // 2. ALUR LOGIN
    if (action === 'login') {
      const user = await prisma.user.findUnique({ where: { username: cleanUsername } })
      if (!user || user.password !== password) {
        return NextResponse.json({ error: 'Username atau password salah' }, { status: 400 })
      }
      return NextResponse.json({
        message: 'Login berhasil',
        user: { id: user.id, username: user.username, namaBisnis: user.namaBisnis },
      })
    }

    return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Terjadi kesalahan server backend' }, { status: 500 })
  }
}