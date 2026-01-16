/**
 * Content Loader
 * Fetches siteData.json and populates the website content dynamically.
 */

document.addEventListener('DOMContentLoaded', () => {
    fetch('data/siteData.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load site data");
            }
            return response.json();
        })
        .then(data => {
            populateContent(data);
        })
        .catch(error => {
            console.error('Error loading content:', error);
            // Optionally handle error (e.g., show a toast or fallback)
        });
});

function populateContent(data) {
    // Helper to safely set text
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el && text) el.textContent = text;
    };
    // Helper to safely set innerHTML
    const setHTML = (id, html) => {
        const el = document.getElementById(id);
        if (el && html) el.innerHTML = html;
    };
    // Helper to set href
    const setHref = (id, href) => {
        const el = document.getElementById(id);
        if (el && href) el.setAttribute('href', href);
    };

    // --- Hero Section ---
    if (data.hero) {
        setText('hero-title', data.hero.title);
        setText('hero-subtitle', data.hero.subtitle);
        setText('hero-tagline', data.hero.tagline);
        // Typewriter handled by main.js observing the element, 
        // but we can update Main.js or just set it here if Main.js uses textContent.
        // Actually main.js uses its own array. We might need to expose data.hero.roles globally
        // or re-initialize the typewriter.
        // For now, let's expose roles to the window object so main.js can use it if we modify main.js
        window.heroRoles = data.hero.roles;
        if (window.initTypewriter) {
            window.initTypewriter(data.hero.roles);
        }

        // Update CV download link in header
        const cvBtns = document.querySelectorAll('a[href$=".pdf"]');
        if (data.hero.cvLink) {
            cvBtns.forEach(btn => btn.setAttribute('href', data.hero.cvLink));
        }
    }

    // --- About Section ---
    if (data.about) {
        setHTML('about-title', data.about.title);
        setHTML('about-desc-1', data.about.description);
        setHTML('about-desc-2', data.about.subDescription);

        const highlightsContainer = document.getElementById('about-highlights');
        if (highlightsContainer && data.about.highlights) {
            highlightsContainer.innerHTML = data.about.highlights.map(item => `
                <div class="col-sm-6">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-check-circle text-success me-2"></i>
                        <span>${item}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // --- Skills Section ---
    if (data.skills) {
        // Offensive
        const offContainer = document.getElementById('skills-offensive');
        if (offContainer && data.skills.offensive) {
            offContainer.innerHTML = data.skills.offensive.map(skill => `
                <div class="mb-3">
                    <div class="d-flex justify-content-between mb-1">
                        <span>${skill.name}</span>
                        <span class="text-primary">${skill.percent}%</span>
                    </div>
                    <div class="progress dark-progress">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: ${skill.percent}%"></div>
                    </div>
                </div>
            `).join('');
        }
        // Defensive
        const defContainer = document.getElementById('skills-defensive');
        if (defContainer && data.skills.defensive) {
            defContainer.innerHTML = data.skills.defensive.map(skill => `
                <div class="mb-3">
                    <div class="d-flex justify-content-between mb-1">
                        <span>${skill.name}</span>
                        <span class="text-success">${skill.percent}%</span>
                    </div>
                    <div class="progress dark-progress">
                        <div class="progress-bar bg-success" role="progressbar" style="width: ${skill.percent}%"></div>
                    </div>
                </div>
            `).join('');
        }
    }

    // --- Tools Section ---
    if (data.tools) {
        const toolsContainer = document.getElementById('tools-container');
        if (toolsContainer) {
            toolsContainer.innerHTML = data.tools.map(tool => `
                <div class="col-auto">
                    <span class="badge tool-badge"><i class="${tool.icon} me-2"></i>${tool.name}</span>
                </div>
            `).join('');
        }
    }

    // --- Projects Section ---
    if (data.projects) {
        const projContainer = document.getElementById('projects-container');
        if (projContainer) {
            projContainer.innerHTML = data.projects.map((proj, index) => `
                <div class="col-md-6 col-lg-4" data-aos="flip-left" data-aos-delay="${(index + 1) * 100}">
                    <div class="card project-card h-100">
                        <div class="card-body">
                            <span class="badge ${proj.badgeClass || 'bg-primary'} mb-3">${proj.category}</span>
                            <h5 class="card-title">${proj.title}</h5>
                            <p class="card-text text-gray-400">${proj.description}</p>
                            <div class="mb-3">
                                ${proj.tags.map(tag => `<small class="text-primary me-2">${tag}</small>`).join('')}
                            </div>
                            <a href="${proj.link}" target="_blank" class="btn btn-outline-primary w-100">
                                <i class="${proj.icon || 'fab fa-github'} me-2"></i>${proj.linkText || 'View Project'}
                            </a>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // --- Experience Section ---
    if (data.experience) {
        const expContainer = document.getElementById('experience-timeline');
        if (expContainer) {
            expContainer.innerHTML = data.experience.map((exp, index) => {
                const side = index % 2 === 0 ? 'left' : 'right';
                // Only show company name if it exists and is different from role or description context
                return `
                <div class="timeline-item ${side}">
                    <div class="content">
                        <h4>${exp.role}</h4>
                        <span class="date">${exp.date}</span>
                        <p class="text-primary mb-1">${exp.company}</p>
                        <p class="mb-0">${exp.description}</p>
                    </div>
                </div>
                `;
            }).join('');
        }
    }

    // --- Education Section ---
    if (data.education) {
        const eduContainer = document.getElementById('education-list');
        if (eduContainer) {
            eduContainer.innerHTML = data.education.map((edu, index) => `
                <div class="list-group-item bg-transparent text-light ${index !== data.education.length - 1 ? 'border-bottom border-secondary' : ''} py-3 d-flex justify-content-between align-items-center"
                    data-aos="fade-up" data-aos-delay="${index * 100}">
                    <div>
                        <h5 class="mb-1">${edu.title}</h5>
                        <small class="text-muted">${edu.subtitle}</small>
                    </div>
                    <span class="badge ${edu.statusClass || 'bg-primary'} rounded-pill">${edu.status}</span>
                </div>
            `).join('');
        }
    }

    // --- Resume Section ---
    if (data.resume) {
        const r = data.resume;
        setText('resume-name', r.name);
        setText('resume-role', r.role);
        setHTML('resume-location', `<i class="fas fa-map-marker-alt me-2 text-primary"></i> ${r.location}`);
        setHTML('resume-email', `<i class="fas fa-envelope me-2 text-primary"></i> ${r.email}`);

        const ghLink = document.getElementById('resume-github');
        if (ghLink) {
            ghLink.href = r.github;
            ghLink.textContent = "GitHub"; // Simplified or extraction from URL
        }
        const liLink = document.getElementById('resume-linkedin');
        if (liLink) {
            liLink.href = r.linkedin;
            liLink.textContent = r.name;
        }

        setText('resume-summary', r.summary);

        const rSkills = document.getElementById('resume-skills-list');
        if (rSkills && r.skillsList) {
            rSkills.innerHTML = r.skillsList.map(item => `<li><i class="fas fa-check text-success me-2"></i>${item}</li>`).join('');
        }

        const rEdu = document.getElementById('resume-education-list');
        if (rEdu && r.eduList) {
            rEdu.innerHTML = r.eduList.map(item => `
                 <li class="mb-3"><strong>${item.name}</strong><br><small class="text-muted">${item.subtitle}</small></li>
            `).join('');
        }

        const rExp = document.getElementById('resume-experience-list');
        if (rExp && r.expList) {
            rExp.innerHTML = r.expList.map(item => `
                <div class="mb-3">
                    <h6 class="mb-0">${item.role}</h6>
                    <small class="text-primary">${item.date}</small>
                    <p class="text-gray-400 mt-1 sm-text">${item.desc}</p>
                </div>
            `).join('');
        }
    }

    // --- Contact Section ---
    if (data.contact) {
        setHTML('contact-email-display', `<i class="fas fa-envelope me-2 text-primary"></i> ${data.contact.email}`);
        setHTML('contact-location-display', `<i class="fas fa-map-marker-alt me-2 text-primary"></i> ${data.contact.location}`);

        const socialContainer = document.getElementById('contact-social-links');
        if (socialContainer) {
            socialContainer.innerHTML = `
                <a href="${data.contact.linkedin}" class="btn btn-outline-light btn-sm rounded-circle me-2"><i class="fab fa-linkedin-in"></i></a>
                <a href="${data.contact.github}" class="btn btn-outline-light btn-sm rounded-circle me-2"><i class="fab fa-github"></i></a>
                <a href="${data.contact.twitter}" class="btn btn-outline-light btn-sm rounded-circle"><i class="fab fa-twitter"></i></a>
            `;
        }
    }
}
