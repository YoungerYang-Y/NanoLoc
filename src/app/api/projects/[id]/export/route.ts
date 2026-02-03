
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { LANGUAGES } from '@/lib/constants/languages';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({
        where: { id },
        include: { keys: { include: { values: true } } }
    });

    if (!project) {
        return new NextResponse("Project not found", { status: 404 });
    }

    // Parse target languages
    let targetLangs: string[] = [];
    try {
        targetLangs = JSON.parse(project.targetLanguages || '[]');
    } catch (e) {
        targetLangs = [];
    }

    // CSV Header
    const header = ['Key', project.baseLanguage, ...targetLangs];

    // Rows
    const rows = project.keys.map(key => {
        const row: string[] = [];
        // Key
        row.push(key.stringName);

        // Base Value
        const baseVal = key.values.find(v => v.languageCode === project.baseLanguage)?.content || '';
        row.push(baseVal);

        // Target Values
        targetLangs.forEach(lang => {
            const val = key.values.find(v => v.languageCode === lang)?.content || '';
            row.push(val);
        });

        return row;
    });

    // Helper to escape CSV
    const escapeCsv = (str: string) => {
        if (str === null || str === undefined) return '';
        const stringVal = String(str);
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n') || stringVal.includes('\r')) {
            return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
    };

    try {
        // Construct CSV String
        let csvContent = '\uFEFF' + header.map(escapeCsv).join(',') + '\n';
        rows.forEach(r => {
            csvContent += r.map(escapeCsv).join(',') + '\n';
        });

        // Sanitize filename: remove non-alphanumeric (except space, dash, underscore, dot)
        const safeName = project.name.replace(/[^a-z0-9 \-_.]/gi, '_').trim();

        // Return response with headers for download
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${safeName}_export.csv"`
            }
        });
    } catch (error) {
        console.error("Export CSV Error:", error);
        return new NextResponse("Failed to generate CSV", { status: 500 });
    }
}
