
document.addEventListener('DOMContentLoaded', () => {

    // Check Auth Status immediately
    const user = netlifyIdentity.currentUser();
    if (!user) {
        window.location.href = "../login/";
        return;
    }

    // Sidebar Toggler
    const menuToggle = document.getElementById("menu-toggle");
    if (menuToggle) {
        menuToggle.onclick = function (e) {
            e.preventDefault();
            document.body.classList.toggle("sb-sidenav-toggled");
        };
    }

    // Navigation Logic
    const links = document.querySelectorAll('#sidebar-wrapper .list-group-item');
    const sections = document.querySelectorAll('.content-section');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active classes
            links.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.add('d-none'));

            // Activate clicked
            link.classList.add('active');
            const targetId = link.getAttribute('href').substring(1); // #hero -> hero
            const targetSection = document.getElementById(`section-${targetId}`);
            if (targetSection) targetSection.classList.remove('d-none');
        });
    });

    // Logout Handler (Add to identity menu logic)
    netlifyIdentity.on('logout', () => {
        window.location.href = "../login/";
    });

    // Load Data
    let currentData = {};
    fetch('../../../data/siteData.json')
        .then(res => res.json())
        .then(data => {
            currentData = data;
            populateForms(data);
        })
        .catch(err => console.error("Error loading admin data", err));

    // Populate Forms
    function populateForms(data) {
        // Hero
        const fHero = document.forms['form-hero'];
        if (fHero && data.hero) {
            fHero.subtitle.value = data.hero.subtitle || '';
            fHero.title.value = data.hero.title || '';
            fHero.roles.value = (data.hero.roles || []).join(', ');
            fHero.tagline.value = data.hero.tagline || '';
        }

        // About
        const fAbout = document.forms['form-about'];
        if (fAbout && data.about) {
            fAbout.title.value = data.about.title || '';
            fAbout.description.value = data.about.description || '';
            fAbout.subDescription.value = data.about.subDescription || '';
            fAbout.highlights.value = (data.about.highlights || []).join(', ');
        }

        // Skills (JSON)
        const fSkills = document.forms['form-skills'];
        if (fSkills && data.skills) {
            fSkills.skills_offensive.value = JSON.stringify(data.skills.offensive, null, 2);
            fSkills.skills_defensive.value = JSON.stringify(data.skills.defensive, null, 2);
        }
        if (fSkills && data.tools) {
            fSkills.tools.value = JSON.stringify(data.tools, null, 2);
        }

        // Projects (JSON)
        const fProjects = document.forms['form-projects'];
        if (fProjects && data.projects) {
            fProjects.projects.value = JSON.stringify(data.projects, null, 2);
        }

        // Experience (JSON)
        const fExp = document.forms['form-experience'];
        if (fExp && data.experience) {
            fExp.experience.value = JSON.stringify(data.experience, null, 2);
        }

        // Education (JSON)
        const fEdu = document.forms['form-education'];
        if (fEdu && data.education) {
            fEdu.education.value = JSON.stringify(data.education, null, 2);
        }

        // Resume
        const fResume = document.forms['form-resume'];
        if (fResume && data.resume) {
            fResume.name.value = data.resume.name || '';
            fResume.role.value = data.resume.role || '';
            fResume.summary.value = data.resume.summary || '';
            fResume.expList.value = JSON.stringify(data.resume.expList, null, 2);
            fResume.eduList.value = JSON.stringify(data.resume.eduList, null, 2);
            fResume.skillsList.value = JSON.stringify(data.resume.skillsList, null, 2);
        }

        // Contact
        const fContact = document.forms['form-contact'];
        if (fContact && data.contact) {
            fContact.email.value = data.contact.email || '';
            fContact.location.value = data.contact.location || '';
            fContact.linkedin.value = data.contact.linkedin || '';
            fContact.github.value = data.contact.github || '';
            fContact.twitter.value = data.contact.twitter || '';
        }
    }

    // Save Handlers
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const msg = form.querySelector('.status-msg');

            btn.disabled = true;
            btn.textContent = "Saving...";
            msg.textContent = "";
            msg.className = "status-msg mt-2";

            // Update currentData object based on form
            try {
                updateDataFromForm(form, currentData);

                // If this is the resume form and has a file
                /* Note: Standard Netlify Functions have body size limits (6MB). 
                   File upload via JSON is tricky. 
                   Ideally we use a specialized upload function or convert to Base64.
                   For this prompt, I'll assume we send it as base64 string in the JSON payload 
                   if a file is selected.
                */
                const fileInput = form.querySelector('input[type="file"]');
                let filePayload = null;

                if (fileInput && fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    // Read file as base64
                    const reader = new FileReader();
                    reader.onload = function (evt) {
                        const base64Data = evt.target.result.split(',')[1];
                        saveData(currentData, {
                            filename: "Karl_Seyram_CV.pdf",
                            content: base64Data,
                            role: 'cv_upload'
                        }, btn, msg);
                    };
                    reader.readAsDataURL(file);
                    return; // Wait for reader
                }

                saveData(currentData, null, btn, msg);

            } catch (err) {
                console.error(err);
                btn.disabled = false;
                btn.textContent = "Save Changes";
                msg.textContent = "Error: " + err.message;
                msg.classList.add('status-error');
            }
        });
    });

    function updateDataFromForm(form, data) {
        const id = form.id;
        const formData = new FormData(form);

        if (id === 'form-hero') {
            data.hero.subtitle = formData.get('subtitle');
            data.hero.title = formData.get('title');
            data.hero.tagline = formData.get('tagline');
            data.hero.roles = formData.get('roles').split(',').map(s => s.trim()).filter(s => s);
        } else if (id === 'form-about') {
            data.about.title = formData.get('title');
            data.about.description = formData.get('description');
            data.about.subDescription = formData.get('subDescription');
            data.about.highlights = formData.get('highlights').split(',').map(s => s.trim()).filter(s => s);
        } else if (id === 'form-skills') {
            data.skills.offensive = JSON.parse(formData.get('skills_offensive'));
            data.skills.defensive = JSON.parse(formData.get('skills_defensive'));
            data.tools = JSON.parse(formData.get('tools'));
        } else if (id === 'form-projects') {
            data.projects = JSON.parse(formData.get('projects'));
        } else if (id === 'form-experience') {
            data.experience = JSON.parse(formData.get('experience'));
        } else if (id === 'form-education') {
            data.education = JSON.parse(formData.get('education'));
        } else if (id === 'form-resume') {
            data.resume.name = formData.get('name');
            data.resume.role = formData.get('role');
            data.resume.summary = formData.get('summary');
            data.resume.expList = JSON.parse(formData.get('expList'));
            data.resume.eduList = JSON.parse(formData.get('eduList'));
            data.resume.skillsList = JSON.parse(formData.get('skillsList'));
        } else if (id === 'form-contact') {
            data.contact.email = formData.get('email');
            data.contact.location = formData.get('location');
            data.contact.linkedin = formData.get('linkedin');
            data.contact.github = formData.get('github');
            data.contact.twitter = formData.get('twitter');
        }
    }

    function saveData(jsonData, fileData, btn, msg) {
        // Prepare payload
        const payload = {
            siteData: jsonData
        };
        if (fileData) {
            payload.fileData = fileData;
        }

        // Get Netlify Identity Token
        const user = netlifyIdentity.currentUser();
        const token = user ? user.token.access_token : null;

        fetch('/.netlify/functions/updateContent', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(async res => {
                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(txt || res.statusText);
                }
                return res.json();
            })
            .then(result => {
                btn.disabled = false;
                btn.textContent = "Save Changes";
                msg.textContent = "Saved successfully!";
                msg.classList.add('status-success');
                setTimeout(() => msg.textContent = '', 3000);
            })
            .catch(err => {
                btn.disabled = false;
                btn.textContent = "Save Changes";
                msg.textContent = "Failed to save: " + err.message;
                msg.classList.add('status-error');
            });
    }

});
