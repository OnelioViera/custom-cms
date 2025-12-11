const API_URL = 'http://localhost:3000/api';
const SITE_ID = 'lindsayprecast';

const projectsContentType = {
    contentTypeId: 'projects',
    name: 'Projects',
    description: 'Project portfolio items',
    fields: [
        { fieldId: 'client', name: 'client', type: 'text', required: true },
        { fieldId: 'location', name: 'location', type: 'text', required: false },
        { fieldId: 'projectSize', name: 'projectSize', type: 'text', required: false },
        { fieldId: 'capacity', name: 'capacity', type: 'text', required: false },
        { fieldId: 'shortDescription', name: 'shortDescription', type: 'textarea', required: true },
        { fieldId: 'description', name: 'description', type: 'textarea', required: false },
        { fieldId: 'challenges', name: 'challenges', type: 'textarea', required: false },
        { fieldId: 'results', name: 'results', type: 'textarea', required: false },
        { fieldId: 'projectImage', name: 'projectImage', type: 'url', required: false }
    ]
};

const testimonialsContentType = {
    contentTypeId: 'testimonials',
    name: 'Testimonials',
    description: 'Client testimonials',
    fields: [
        { fieldId: 'quote', name: 'quote', type: 'textarea', required: true },
        { fieldId: 'authorName', name: 'authorName', type: 'text', required: true },
        { fieldId: 'authorTitle', name: 'authorTitle', type: 'text', required: true }
    ]
};

async function createContentType(contentType) {
    try {
        const response = await fetch(`${API_URL}/cms/${SITE_ID}/content-types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contentType)
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ Created content type: ${contentType.name}`);
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.error(`❌ Failed to create ${contentType.name}:`, data.error);
        }
    } catch (error) {
        console.error(`❌ Error creating ${contentType.name}:`, error.message);
    }
}

async function main() {
    console.log('Creating content types...\n');

    await createContentType(projectsContentType);
    console.log('\n');
    await createContentType(testimonialsContentType);

    console.log('\n✅ Done!');
}

main();
