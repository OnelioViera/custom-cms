import React from 'react';

export default function AdminSidebar() {
    return (
        <aside style={{ width: 240, background: '#f3f4f6', height: '100vh', padding: 24 }}>
            <h2 style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Admin Sidebar</h2>
            <nav>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: 12 }}><a href="/admin/dashboard">Dashboard</a></li>
                    <li style={{ marginBottom: 12 }}><a href="/admin/projects">Projects</a></li>
                    <li style={{ marginBottom: 12 }}><a href="/admin/submissions">Submissions</a></li>
                    <li style={{ marginBottom: 12 }}><a href="/admin/team">Team</a></li>
                    <li style={{ marginBottom: 12 }}><a href="/admin/testimonials">Testimonials</a></li>
                    <li style={{ marginBottom: 12 }}><a href="/admin/navbar">Navbar</a></li>
                    <li style={{ marginBottom: 12 }}><a href="/admin/content">Site Content</a></li>
                </ul>
            </nav>
        </aside>
    );
}
