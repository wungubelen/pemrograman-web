import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email dan password wajib diisi"
        },
        {
          status: 400
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Email tidak ditemukan"
        },
        {
          status: 404
        }
      );
    }


    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );


    if (!passwordMatch) {
      return NextResponse.json(
        {
          message: "Password salah"
        },
        {
          status: 401
        }
      );
    }


    return NextResponse.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });


  } catch (error) {

    return NextResponse.json(
      {
        message: "Terjadi kesalahan server"
      },
      {
        status:500
      }
    );

  }
}