
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to DB...');
    // Use the ID found in previous steps
    const project = await prisma.project.findUnique({
        where: { id: 'cml6g3t7p0002c3x21193vwup' }
    });

    if (!project) {
        console.log('Project not found with ID cml6g3t7p0002c3x21193vwup. Listing all projects:');
        const all = await prisma.project.findMany();
        console.log(all);
        return;
    }

    console.log('Found project:', project.name);
    let targets = [];
    try {
        targets = JSON.parse(project.targetLanguages || '[]');
    } catch (e) {
        console.log('Failed to parse targetLanguages:', project.targetLanguages);
        return;
    }

    console.log('Original targets:', targets);
    const initialLen = targets.length;

    // Remove Base Language if present
    targets = targets.filter(t => t !== project.baseLanguage);

    if (targets.length !== initialLen) {
        console.log(`Removing ${project.baseLanguage} from target languages...`);
        await prisma.project.update({
            where: { id: project.id },
            data: {
                targetLanguages: JSON.stringify(targets)
            }
        });
        console.log('Updated target languages:', targets);
    } else {
        console.log('No duplicate language found to remove.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
