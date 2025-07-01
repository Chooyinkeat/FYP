"use server";

import { NextResponse, NextRequest } from "next/server";
import pool from "@/lib/db";
import { jwtDecode } from "jwt-decode";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const decoded: any = jwtDecode(token); // Already verified by middleware
  const userId = decoded.userId;
  try {
    const [rows] = await pool.query(
      `
SELECT *,
  CASE 
    WHEN c.sender_id = ? THEN c.receiver_id
    ELSE c.sender_id
  END AS contact_id,

  u.username AS contact_username,
  u.profile AS contact_profile_picture,

  MAX(c.created_date) AS last_message_date,

  (
    SELECT message 
    FROM chat 
    WHERE 
      (sender_id = ? AND receiver_id = CASE WHEN c.sender_id = ? THEN c.receiver_id ELSE c.sender_id END)
      OR 
      (receiver_id = ? AND sender_id = CASE WHEN c.sender_id = ? THEN c.receiver_id ELSE c.sender_id END)
    ORDER BY created_date DESC 
    LIMIT 1
  ) AS last_message_content

FROM 
  chat c

JOIN 
  user u 
  ON u.user_id = CASE 
      WHEN c.sender_id = ? THEN c.receiver_id
      ELSE c.sender_id
    END

WHERE 
  c.sender_id = ? OR c.receiver_id = ?

GROUP BY 
  contact_id,
  u.username,
  u.profile

ORDER BY 
  last_message_date DESC;
`,
      [userId, userId, userId, userId, userId, userId, userId, userId],
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "No chats found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Chat list fetched successfully",
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching chat list:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
