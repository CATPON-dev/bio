document.addEventListener('DOMContentLoaded', () => {
    const targetUsername = 'EXPERT_CATPON';
    const profileApiUrl = `https://api.catpon.online/get-info?username=${targetUsername}`;
    const githubApiUrl = 'https://api.github.com/repos/CATPON-dev/bio/contents/info.json?ref=main';

    const loader = document.getElementById('loader');
    const mainContainer = document.getElementById('main-container');
    const nameEl = document.getElementById('profile-name');
    const descEl = document.getElementById('profile-desc');
    const avatarEl = document.getElementById('profile-avatar');

    const tgLink = document.getElementById('link-tg');
    const ghLink = document.getElementById('link-gh');
    const mailLink = document.getElementById('link-mail');
    
    const stackContainer = document.getElementById('stack-container');
    const hobbiesContainer = document.getElementById('hobbies-container');
    const projectsContainer = document.getElementById('projects-container');

    function decodeBase64UTF8(base64) {
        try {
            const cleanBase64 = base64.replace(/\s/g, '');
            const binaryString = window.atob(cleanBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return new TextDecoder().decode(bytes);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async function loadAllData() {
        try {
            fetch(profileApiUrl)
                .then(res => res.json())
                .then(data => {
                    if (data.nickname) nameEl.innerText = data.nickname;
                    if (data.description) descEl.innerText = data.description;
                    if (data.photo) avatarEl.src = data.photo;
                })
                .catch(err => console.error(err));

            const ghResponse = await fetch(githubApiUrl, {
                cache: "no-store"
            });

            if (ghResponse.ok) {
                const ghData = await ghResponse.json();
                
                if (ghData.content) {
                    const decodedString = decodeBase64UTF8(ghData.content);
                    
                    if (decodedString) {
                        const config = JSON.parse(decodedString);
                        applyConfig(config);
                    }
                }
            }

        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.classList.remove('loading');
                mainContainer.classList.add('loaded');
            }, 500);
        }
    }

    function applyConfig(config) {
        if (config.socials) {
            if (config.socials.telegram) tgLink.href = config.socials.telegram;
            if (config.socials.github) ghLink.href = config.socials.github;
            if (config.socials.email) mailLink.href = config.socials.email;
        }

        if (config.stack && Array.isArray(config.stack)) {
            stackContainer.innerHTML = '';
            config.stack.forEach(tech => {
                const span = document.createElement('span');
                span.className = 'tag-3d';
                span.textContent = tech;
                stackContainer.appendChild(span);
            });
        }

        if (config.hobbies && Array.isArray(config.hobbies)) {
            hobbiesContainer.innerHTML = '';
            config.hobbies.forEach(hobby => {
                const div = document.createElement('div');
                div.className = 'hobby-block';
                div.innerHTML = `
                    <div class="icon-box"><i class="${hobby.icon}"></i></div>
                    <span>${hobby.name}</span>
                `;
                hobbiesContainer.appendChild(div);
            });
        }

        if (config.projects && Array.isArray(config.projects)) {
            projectsContainer.innerHTML = '';
            config.projects.forEach(proj => {
                const article = document.createElement('article');
                article.className = 'project-block';
                
                let linksHtml = '';
                if (proj.links && Array.isArray(proj.links)) {
                    proj.links.forEach(link => {
                        linksHtml += `<a href="${link.url}" target="_blank" class="link-3d">${link.label}</a>`;
                    });
                }

                article.innerHTML = `
                    <div class="project-header">
                        <div class="project-icon-3d"><i class="${proj.icon}"></i></div>
                        <h3>${proj.name}</h3>
                    </div>
                    <p>${proj.desc}</p>
                    <div class="project-actions">
                        ${linksHtml}
                    </div>
                `;
                projectsContainer.appendChild(article);
            });
        }
    }

    loadAllData();

    const elD = document.getElementById('d');
    const elH = document.getElementById('h');
    const elM = document.getElementById('m');
    const elS = document.getElementById('s');
    const card = document.getElementById('timer-card');
    const copyBtn = document.getElementById('copy-feedback');

    let copyText = "";

    function updateTimer() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const nextYear = new Date(currentYear + 1, 0, 1);
        const diff = nextYear - now;

        if (diff <= 0) {
            elD.innerText = "00"; elH.innerText = "00";
            elM.innerText = "00"; elS.innerText = "00";
            return;
        }

        const d = Math.floor(diff / 1000 / 60 / 60 / 24);
        const h = Math.floor(diff / 1000 / 60 / 60) % 24;
        const m = Math.floor(diff / 1000 / 60) % 60;
        const s = Math.floor(diff / 1000) % 60;

        const fd = d < 10 ? '0' + d : d;
        const fh = h < 10 ? '0' + h : h;
        const fm = m < 10 ? '0' + m : m;
        const fs = s < 10 ? '0' + s : s;

        if(elD) elD.innerText = fd;
        if(elH) elH.innerText = fh;
        if(elM) elM.innerText = fm;
        if(elS) elS.innerText = fs;

        copyText = `${fd}д ${fh}ч ${fm}м ${fs}с`;
    }

    setInterval(updateTimer, 1000);
    updateTimer();

    if (card) {
        card.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            if (!navigator.clipboard) return;
            
            navigator.clipboard.writeText(copyText).then(() => {
                const icon = copyBtn.querySelector('i');
                const oldClass = icon.className;
                icon.className = 'fa-solid fa-check';
                copyBtn.classList.add('success');
                setTimeout(() => {
                    icon.className = oldClass;
                    copyBtn.classList.remove('success');
                }, 1000);
            }).catch(err => console.error(err));
        });
    }

    const cards = document.querySelectorAll('.tilt-effect');
    if (window.matchMedia("(min-width: 769px)").matches) {
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;
                const cardFace = card.querySelector('.card-face');
                if(cardFace) {
                    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                }
            });
            card.addEventListener('mouseleave', () => {
                const cardFace = card.querySelector('.card-face');
                if(cardFace) {
                    card.style.transform = `rotateX(0) rotateY(0)`;
                }
            });
        });
    }
});