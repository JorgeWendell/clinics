import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permissions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const permissions = await getUserPermissions(session.user.id);

    if (!permissions) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("Erro ao buscar permissões:", error);
    return NextResponse.json(
      { error: "Erro ao buscar permissões" },
      { status: 500 }
    );
  }
}
