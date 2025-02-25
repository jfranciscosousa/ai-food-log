import {
  type ActionFunction,
  type LoaderFunction,
  redirect,
} from "react-router";
import { logout } from "~/server/auth.server";

export const action: ActionFunction = async () => logout();

export const loader: LoaderFunction = () => redirect("/", { status: 404 });
