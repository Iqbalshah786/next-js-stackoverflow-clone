import User from "@/Database/user.modes";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/monoose";
import { UserSchema } from "@/lib/validations";
import { APIErrorResponse } from "@/types/global";
import { NextResponse } from "next/server";

export async function Get() {
  try {
    await dbConnect();
    const users = await User.find();

    return NextResponse.json(
      {
        success: true,
        data: users,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const validadatedData = UserSchema.safeParse(body);
    if (!validadatedData.success) {
      throw new ValidationError(validadatedData.error.flatten().fieldErrors);
    }

    const { email, username } = validadatedData.data;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email already exists.");
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new Error("Username already exists.");
    }
    const newUser = await User.create(validadatedData.data);
    return NextResponse.json(
      {
        success: true,
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
