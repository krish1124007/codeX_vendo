import { createGroq } from "@ai-sdk/groq";
import { streamText, tool, convertToModelMessages } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "MANAGER", "PROCUREMENT_OFFICER"].includes(user.role)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  console.log("CHAT BODY:", JSON.stringify(body, null, 2));
  const { messages } = body;

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    messages: await convertToModelMessages(messages),
    // @ts-ignore
    maxSteps: 5,

    system: `You are an AI assistant for the VendorBridge Procurement ERP.
You are helping a ${user.role} named ${user.name}.
You can answer questions about the dashboard, vendors, RFQs, quotations, and purchase orders.
If asked to "Give me a dummy answer", respond with "This is a dummy answer."
Use the tools provided to fetch data from the database. Be concise and helpful.`,
    tools: {
      getRFQs: tool({
        description: "Get a list of open RFQs (Request for Quotations)",
        parameters: z.object({
          limit: z.number().optional().default(5),
        }),
        // @ts-ignore - Prisma returns Decimals which fail AI SDK strict JSON constraints
        execute: async ({ limit }: { limit: number }) => {
          const rfqs = await prisma.rFQ.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
            include: { _count: { select: { quotations: true } } },
          });
          return rfqs;
        },
      }),
      getQuotations: tool({
        description: "Get quotations for a specific RFQ. You can use this to compare quotations and find the best one.",
        parameters: z.object({
          rfqId: z.string().describe("The ID of the RFQ"),
        }),
        // @ts-ignore
        execute: async ({ rfqId }: { rfqId: string }) => {
          const quotations = await prisma.quotation.findMany({
            where: { rfqId },
            include: { vendor: { select: { name: true, rating: true } }, items: true },
            orderBy: { grandTotal: "asc" },
          });
          return quotations;
        },
      }),
      getSystemStats: tool({
        description: "Get overall dashboard statistics (total POs, vendors, open RFQs)",
        parameters: z.object({}),
        // @ts-ignore
        execute: async () => {
          const [poCount, vendorCount, rfqCount] = await Promise.all([
            prisma.purchaseOrder.count(),
            prisma.vendor.count(),
            prisma.rFQ.count({ where: { status: "PUBLISHED" } }),
          ]);
          return { poCount, vendorCount, rfqCount };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
