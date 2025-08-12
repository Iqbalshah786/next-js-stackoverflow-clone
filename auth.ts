import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { SignInSchema } from "./lib/validations";
import { IUserDoc } from "./Database/user.modes";
import { api } from "./lib/api";
import bcrypt from "bcryptjs";
import { IAccountDoc } from "./Database/account.models";
import Credentials from "next-auth/providers/credentials";
import { ActionResponse } from "./types/global";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Google,
    Credentials({
      async authorize(credentials) {
        const validatedFields = SignInSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const { data: existingAccount } = (await api.accounts.getByProvider(
            email
          )) as ActionResponse<IAccountDoc>;

          if (!existingAccount) return null;

          const { data: existingUser } = (await api.users.getById(
            existingAccount.userId.toString()
          )) as ActionResponse<IUserDoc>;

          if (!existingUser) return null;

          const isValidPassword = await bcrypt.compare(
            password,
            existingAccount.password!
          );

          if (isValidPassword) {
            return {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              image: existingUser.image,
            };
          }
        }
        return null;
      },
    }),
  ],
});
