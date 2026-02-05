import { prisma } from "@/lib/prisma";
import { AIConfig } from "./br-client";

export async function getProjectAIConfig(projectId: string): Promise<AIConfig> {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
            aiBaseUrl: true,
            aiApiKey: true,
            aiModelId: true,
            systemPrompt: true,
        }
    });

    if (!project) {
        throw new Error(`Project not found: ${projectId}`);
    }

    // Fallback to Env Vars if project config is missing
    const baseUrl = project.aiBaseUrl || process.env.bedrock_base_url;
    const apiKey = project.aiApiKey || process.env.bedrock_secret;
    const modelId = project.aiModelId || process.env.bedrock_model_id;

    if (!baseUrl || !apiKey || !modelId) {
        throw new Error("Missing AI configuration. Please configure Project AI settings or Environment variables.");
    }

    return {
        baseUrl,
        apiKey,
        modelId,
        systemPrompt: project.systemPrompt || undefined
    };
}
