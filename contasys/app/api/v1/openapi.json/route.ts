import openApiSpec from "@/lib/openapi.json";

export async function GET() {
  return Response.json(openApiSpec, {
    headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
  });
}
