export interface AIConfig {
    baseUrl: string;
    apiKey: string;
    modelId: string;
    systemPrompt?: string;
}

export class BRClient {
    private config: AIConfig;

    constructor(config: AIConfig) {
        this.config = config;
    }

    private get defaultSystemPrompt() {
        return this.config.systemPrompt || `你是一个专业的多语言翻译专家。在处理批量翻译时请注意：
1. 每个文本都必须翻译，保持原有顺序
2. 占位符（如 {name}, %s, %1$s 等）和换行符(\\n)保持原样不翻译
3. 标点符号要符合目标语言的使用习惯和位置
4. 保持简洁准确，不要添加任何额外的解释或标记
5. 使用 ### 分隔每个翻译结果`;
    }

    async translateBatch(texts: string[], targetLang: string): Promise<string[]> {
        if (texts.length === 0) return [];

        // Filter non-empty texts for the prompt logic to match python script behavior
        // The python script creates prompt entries only for non-empty text.
        const nonEmptyItems = texts
            .map((text, index) => ({ text, index }))
            .filter((item) => item.text && item.text.trim().length > 0);

        if (nonEmptyItems.length === 0) {
            return texts.map(() => "");
        }

        let prompt = `请将以下文本翻译成${targetLang}。注意事项：
1. 每个翻译后的文本用 ### 分隔
2. 按顺序翻译每个文本
3. 不要在翻译结果中包含序号
4. 不要遗漏任何文本
5. 不要合并或拆分文本

需要翻译的文本：

`;

        nonEmptyItems.forEach((item, i) => {
            prompt += `[${i + 1}] ${item.text}\n`;
        });

        try {
            const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    model: this.config.modelId,
                    messages: [
                        { role: 'system', content: this.defaultSystemPrompt },
                        { role: 'user', content: prompt }
                    ]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`AI API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content?.trim() || '';

            // Post-processing
            // 1. Split by ###
            let parts = content.split('###').map((t: string) => t.trim()).filter((t: string) => t.length > 0);

            // 2. Cleanup indices like "[1] " or "1. "
            parts = parts.map((t: string) => {
                return t.replace(/^\[?\d+\]?\.?\s*/, '').trim();
            });

            // 3. Map back to original array
            // We expect parts.length to match nonEmptyItems.length
            // If mismatch, we might have issues.

            const results: string[] = new Array(texts.length).fill("");

            let partIndex = 0;
            for (const item of nonEmptyItems) {
                if (partIndex < parts.length) {
                    results[item.index] = parts[partIndex];
                    partIndex++;
                } else {
                    // Missing translation from AI
                    console.warn(`Missing translation for item ${item.index} ("${item.text}")`);
                    results[item.index] = "[Translation Error]";
                }
            }

            return results;

        } catch (error) {
            console.error("Translation error:", error);
            throw error;
        }
    }
}
