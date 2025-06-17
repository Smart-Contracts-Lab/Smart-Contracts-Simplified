function showDeployAnimation() {
    document.getElementById('deploy-contract-form').style.display = "none";
    document.querySelector('.animation-container').classList.remove('hidden');
}

function showEnterAnimation() {
    document.getElementById('user-enter-form').style.display = "none";
    document.getElementById('animation-enter-container').style.display = "block";
    startAnimation();
}

function showParticipantsAnimation() {
    document.getElementById('participant-enter-form').style.display = "none";
    document.getElementById('animation-participants-container').style.display = "block";
    const users = Array.from(document.querySelectorAll('.user-2'));
    positionUsers(users);

    const count = users.length;
    const etherPhase = (count - 1) * 500 + 2000;
    const ticketPhase = etherPhase + (count - 1) * 500 + 2000;
    const loopDuration = ticketPhase + 1000;
    runLoop(users);
    setInterval(() => runLoop(users), loopDuration);
}

function showDrawingAnimation() {
    document.getElementById('draw-winner-form').style.display = "none";
    document.getElementById('draw-winner-animation').style.display = "block";
}

function startAnimation() {
    const container = document.getElementById('animation-enter-container');
    const user = document.getElementById('user');
    const contract = document.getElementById('contract');
    const text = document.querySelector('.text-entered');

    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const ether = document.createElement('i');
            ether.className = 'fa-brands fa-ethereum ether';
            container.appendChild(ether);

            const startX = user.offsetLeft + user.offsetWidth/2 - 12;
            const startY = user.offsetTop + user.offsetHeight/2 - 12;
            ether.style.left = startX + 'px';
            ether.style.top = startY + 'px';

            const endX = contract.offsetLeft + contract.offsetWidth/2 - 12;
            const endY = contract.offsetTop + contract.offsetHeight/2 - 12;
            ether.style.setProperty('--dx', (endX-startX) + 'px');
            ether.style.setProperty('--dy', (endY-startY) + 'px');

            requestAnimationFrame(() => ether.classList.add('fly-to-contract'));
            ether.addEventListener('animationend', () => ether.remove());
        }, i * 300);
    }

    setTimeout(() => {
        const ticket = document.createElement('i');
        ticket.className = 'fa-solid fa-ticket-alt ticket';
        container.appendChild(ticket);

        const startX = contract.offsetLeft + contract.offsetWidth/2 - 12;
        const startY = contract.offsetTop + contract.offsetHeight/2 - 12;
        ticket.style.left = startX + 'px';
        ticket.style.top = startY + 'px';

        const endX = user.offsetLeft + user.offsetWidth/2 - 12;
        const endY = user.offsetTop + user.offsetHeight/2 - 12;
        ticket.style.setProperty('--dx', (endX-startX) + 'px');
        ticket.style.setProperty('--dy', (endY-startY) + 'px');

        requestAnimationFrame(() => ticket.classList.add('fly-to-user'));
        ticket.addEventListener('animationend', () => {
            ticket.remove();
            text.classList.add('visible');
        });
    }, 6*300 + 500);
}



function positionUsers(users) {
    const container = document.getElementById('animation-participants-container');
    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;
    const radius = Math.min(centerX, centerY) - 100;

    users.forEach((user, i) => {
        const angle = (2 * Math.PI / users.length) * i - Math.PI / 2;
        const ux = centerX + radius * Math.cos(angle) - user.offsetWidth / 2;
        const uy = centerY + radius * Math.sin(angle) - user.offsetHeight / 2;
        user.style.left = ux + 'px';
        user.style.top = uy + 'px';
    });
}

function runLoop(users) {
    const container = document.getElementById('animation-participants-container');
    const contract = document.getElementById('contract-2');
    const text = document.getElementById('text-entered-participants');

    // Reset
    text.classList.remove('visible');
    container.querySelectorAll('.ether, .ticket').forEach(el => el.remove());

    // Phase 1: users send ether
    users.forEach((user, idx) => {
        setTimeout(() => {
            const ether = document.createElement('i');
            ether.className = 'fa-brands fa-ethereum ether';
            container.appendChild(ether);

            const startX = user.offsetLeft + user.offsetWidth / 2 - 12;
            const startY = user.offsetTop + user.offsetHeight / 2 - 12;
            ether.style.left = startX + 'px';
            ether.style.top = startY + 'px';

            const endX = contract.offsetLeft + contract.offsetWidth / 2 - 12;
            const endY = contract.offsetTop + contract.offsetHeight / 2 - 12;
            ether.style.setProperty('--dx', (endX - startX) + 'px');
            ether.style.setProperty('--dy', (endY - startY) + 'px');

            requestAnimationFrame(() => ether.classList.add('fly-to-contract-2'));
            ether.addEventListener('animationend', () => ether.remove());
        }, idx * 500);
    });

    const etherPhase = (users.length - 1) * 500 + 2000;
    setTimeout(() => {
        users.forEach((user, idx) => {
            setTimeout(() => {
                const ticket = document.createElement('i');
                ticket.className = 'fa-solid fa-ticket-alt ticket';
                container.appendChild(ticket);

                const startX = contract.offsetLeft + contract.offsetWidth / 2 - 12;
                const startY = contract.offsetTop + contract.offsetHeight / 2 - 12;
                ticket.style.left = startX + 'px';
                ticket.style.top = startY + 'px';

                const endX = user.offsetLeft + user.offsetWidth / 2 - 12;
                const endY = user.offsetTop + user.offsetHeight / 2 - 12;
                ticket.style.setProperty('--dx', (endX - startX) + 'px');
                ticket.style.setProperty('--dy', (endY - startY) + 'px');

                requestAnimationFrame(() => ticket.classList.add('fly-to-user-2'));
                ticket.addEventListener('animationend', () => ticket.remove());
            }, idx * 500);
        });
        setTimeout(() => users.length * 500 + 500);
    }, etherPhase);
}
