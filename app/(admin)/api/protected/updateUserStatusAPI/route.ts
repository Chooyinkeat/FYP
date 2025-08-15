"use server";
import pool from "@/lib/db";
import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request, NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 },
        );
    }
    const decoded: any = jwtDecode(token);

    const { userId } = await request.json();
    if (!userId) {
        return NextResponse.json(
            {
                success: false,
                message:
                    "User Id is required",
            },
            { status: 400 },
        );
    }

    try {
        const [userResult] = await pool.query(
            "UPDATE user SET status = ? WHERE user_id = ?",
            [0, userId],
        );
        if ((userResult as any).affectedRows === 0) {
            return NextResponse.json({
                success: false,
                message: "User not found or no changes made",
                status: 404,
            });
        }

        return NextResponse.json({
            success: true,
            message: "User status updated successfully",
            status: 200,
          });
    } catch (error) { 
        return NextResponse.json(
            { success: false, message: "Failed to update user status" },
            { status: 500 },
          );
    }
}