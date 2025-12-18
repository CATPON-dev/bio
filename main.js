document.addEventListener('DOMContentLoaded', () => {
    const config = {
        username: 'EXPERT_CATPON',
        api: `https://api.catpon.online/get-info?username=`,
        github: 'https://api.github.com/repos/CATPON-dev/bio/contents/info.json?ref=main'
    };

    const DOM = {
        loader: document.getElementById('loader'),
        main: document.getElementById('main-container'),
        name: document.getElementById('profile-name'),
        desc: document.getElementById('profile-desc'),
        avatar: document.getElementById('profile-avatar'),
        stack: document.getElementById('stack-container'),
        projects: document.getElementById('projects-container'),
        timerCard: document.getElementById('timer-card'),
        timer: { d: document.getElementById('d'), h: document.getElementById('h'), m: document.getElementById('m'), s: document.getElementById('s') },
        copy: document.getElementById('copy-feedback')
    };

    const safe = (s) => {
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    };

    const decode = (b) => {
        try { return new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\s/g, '')), c => c.charCodeAt(0))); }
        catch (e) { return null; }
    };

    async function init() {
        try {
            const [pRes, gRes] = await Promise.allSettled([
                fetch(config.api + config.username).then(r => r.json()),
                fetch(config.github, { cache: "no-store" }).then(r => r.json())
            ]);

            let githubData = null;
            if (gRes.status === 'fulfilled' && gRes.value.content) {
                githubData = JSON.parse(decode(gRes.value.content));
            }

            if (pRes.status === 'fulfilled') {
                const d = pRes.value;
                DOM.name.textContent = d.nickname || 'CATPON';
                DOM.desc.textContent = d.description || 'Developer';
                if (d.photo) DOM.avatar.src = d.photo;
            }

            if (githubData) render(githubData);

        } finally {
            DOM.loader.style.opacity = '0';
            setTimeout(() => {
                DOM.loader.style.display = 'none';
                document.body.classList.remove('loading');
                DOM.main.classList.add('loaded');
            }, 500);
        }
    }

    function render(cfg) {
        if (cfg.settings && cfg.settings.newYearTimer) {
            if (cfg.settings.newYearTimer.enabled === false) {
                DOM.timerCard.classList.add('hidden');
            } else {
                startTimer();
            }
        } else {
            startTimer();
        }

        if (cfg.stack) {
            DOM.stack.innerHTML = cfg.stack.map(s => `
                <span class="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-300">
                    ${safe(s)}
                </span>
            `).join('');
        }

        if (cfg.projects) {
            DOM.projects.innerHTML = cfg.projects.map(p => `
                <div class="project-item">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                                <i class="${safe(p.icon)}"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-base">${safe(p.name)}</h3>
                                ${p.role ? `<span class="text-[9px] bg-accent/20 text-accent px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">${safe(p.role)}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <p class="text-xs text-gray-500 mb-2 leading-relaxed">${safe(p.desc)}</p>
                    
                    ${p.alert && p.alert.enabled ? `
                        <div class="bg-red-500/10 border border-red-500/20 p-2 rounded-lg mb-4 text-[10px] text-red-400 font-bold flex items-center gap-2">
                            <i class="${safe(p.alert.icon || 'fa-solid fa-circle-exclamation')} animate-pulse"></i>
                            ${safe(p.alert.text)}
                        </div>
                    ` : ''}

                    <div class="flex gap-2">
                        ${(p.links || []).map(l => `<a href="${l.url}" target="_blank" class="text-[10px] font-black uppercase bg-accent px-3 py-1.5 rounded-lg transition-transform active:scale-95">${safe(l.label)}</a>`).join('')}
                    </div>
                </div>
            `).join('');
        }
    }

    function startTimer() {
        let text = "";
        const update = () => {
            const diff = new Date(new Date().getFullYear() + 1, 0, 1) - new Date();
            if (diff <= 0) return;
            const d = Math.floor(diff / 86400000), h = Math.floor((diff / 3600000) % 24), m = Math.floor((diff / 60000) % 60), s = Math.floor((diff / 1000) % 60);
            const p = n => n.toString().padStart(2, '0');
            if (DOM.timer.d) {
                DOM.timer.d.innerText = p(d); DOM.timer.h.innerText = p(h);
                DOM.timer.m.innerText = p(m); DOM.timer.s.innerText = p(s);
            }
            text = `${d}d ${h}h ${m}m ${s}s`;
        };
        setInterval(update, 1000); update();
        if (DOM.copy) {
            DOM.copy.onclick = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(text);
                const i = DOM.copy.querySelector('i'); i.className = 'fa-solid fa-check text-green-500';
                setTimeout(() => i.className = 'fa-regular fa-copy', 2000);
            };
        }
    }

    init();
});