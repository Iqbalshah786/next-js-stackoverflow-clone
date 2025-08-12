"use server";

import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "../action";
import handleError from "../error";
import User from "@/Database/user.modes";
import bcrypt from "bcryptjs";
import Account from "@/Database/account.models";
import { signIn } from "@/auth";
import mongoose from "mongoose";
import { SignInSchema, SignUpSchema } from "@/lib/validations";
import { NotFoundError } from "@/lib/http-errors";

export async function signUpWithCredentials(
  params: AuthCredentials
): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: SignUpSchema });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { name, username, email, password } = validationResult.params!;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findOne({ email }).session(session);

    if (existingUser) {
      throw new Error("User already exists.");
    }
    const existingUsername = await User.findOne({ username }).session(session);
    if (existingUsername) {
      throw new Error("Username already exists.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await User.create([{ name, username, email }], {
      session,
    });

    await Account.create([
      {
        userId: newUser._id,
        name,
        provider: "credentials",
        providerAccountId: email,
        password: hashedPassword,
      },
    ]);

    await session.commitTransaction();

    await signIn("credentials", { email, password, redirect: false });

    return { success: true };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function signInWithCredentials(
  params: Pick<AuthCredentials, "email" | "password">
): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: SignInSchema });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { email, password } = validationResult.params!;

  try {
    const existingUser = await User.findOne({ email });

    console.log(existingUser);
    if (!existingUser) throw new NotFoundError("User");

    const existingAccount = await Account.findOne({
      provider: "credentials",
      providerAccountId: email,
    });

    if (!existingAccount) throw new NotFoundError("Account");

    const passwordMached = await bcrypt.compare(
      password,
      existingAccount.password!
    );
    if (!passwordMached) throw new Error("Invalid credentials");

    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
