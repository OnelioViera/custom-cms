// Run this script to set up the site content type and initial content
// Usage: node setup-site-content.js

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const SITE_ID = process.env.SITE_ID || 'lindsayprecast';

const siteContentType = {
    contentTypeId: 'site-content',
    name: 'Site Content',
    description: 'Editable text content for the website sections',
    fields: [
        { fieldId: 'heroTitle', name: 'heroTitle', type: 'text', required: true },
        { fieldId: 'heroSubtitle', name: 'heroSubtitle', type: 'textarea', required: false },
        { fieldId: 'heroDescription', name: 'heroDescription', type: 'textarea', required: false },
        { fieldId: 'projectsTitle', name: 'projectsTitle', type: 'text', required: false },
        { fieldId: 'projectsSubtitle', name: 'projectsSubtitle', type: 'textarea', required: false },
        { fieldId: 'testimonialsTitle', name: 'testimonialsTitle', type: 'text', required: false },
        { fieldId: 'testimonialsSubtitle', name: 'testimonialsSubtitle', type: 'textarea', required: false },
        { fieldId: 'contactTitle', name: 'contactTitle', type: 'text', required: false },
        { fieldId: 'contactSubtitle', name: 'contactSubtitle', type: 'textarea', required: false },
        { fieldId: 'ctaTitle', name: 'ctaTitle', type: 'text', required: false },
        { fieldId: 'ctaSubtitle', name: 'ctaSubtitle', type: 'textarea', required: false },
    ]
};

const initialContent = {
    title: 'Homepage Content',
    status: 'published',
    data: {
        heroTitle: 'Premium Precast Concrete Solutions for Infrastructure',
        heroSubtitle: 'Engineering excellence meets manufacturing precision. From BESS foundations to custom grade beams, we deliver infrastructure components that power renewable energy and modern utilities.',
        heroDescription: 'Serving solar farms, battery storage facilities, and utility systems across North America.',
        projectsTitle: 'Featured Projects',
        projectsSubtitle: 'Recent infrastructure solutions delivering impact across North America',
        testimonialsTitle: 'Client Testimonials',
        testimonialsSubtitle: 'Trusted by leading companies',
        contactTitle: 'Get in Touch',
        contactSubtitle: "Have a project in mind? Let's discuss how we can deliver precision-engineered solutions.",
        ctaTitle: 'Ready for Your Project?',
        ctaSubtitle: "Let's discuss how Lindsay Precast can deliver precision-engineered solutions",
    }
};

async function setup() {
    console.log('Setting up site content...\n');

    // Step 1: Create content type
    console.log('1. Creating site-content content type...');
    try {
        const typeRes = await fetch(`${API_URL}/cms/${SITE_ID}/content-types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(siteContentType)
        });

        const typeData = await typeRes.json();
        if (typeRes.ok) {
            console.log('   ✅ Content type created');
        } else if (typeData.error?.includes('already exists')) {
            console.log('   ⚠️  Content type already exists (skipping)');
        } else {
            console.log('   ❌ Error:', typeData.error);
        }
    } catch (error) {
        console.log('   ❌ Error:', error.message);
    }

    // Step 2: Create initial content
    console.log('\n2. Creating initial site content...');
    try {
        const contentRes = await fetch(`${API_URL}/cms/${SITE_ID}/content/site-content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(initialContent)
        });

        const contentData = await contentRes.json();
        if (contentRes.ok) {
            console.log('   ✅ Initial content created');
            console.log('   Content ID:', contentData.data?.contentId);
        } else {
            console.log('   ❌ Error:', contentData.error);
        }
    } catch (error) {
        console.log('   ❌ Error:', error.message);
    }

    console.log('\n✅ Setup complete!');
    console.log('\nYou can now edit the site content from the admin dashboard.');
}

setup();

