function showDeployAnimation() {
    const container = document.querySelector('.container');
    container.scrollTop = "500";
    document.getElementById('deploy-contract-form').style.display = "none";
    document.querySelector('.animation-container').classList.remove("hidden");
}

function startPayShareAnimation() {
    document.getElementById('pay-share-1').style.display = "none";
    document.querySelector('.pay-share-animation').classList.remove("hidden");
    startAnimation();
}

function showPayBillAnimation() {
    document.getElementById('pay-bill-form').style.display = "none";
    document.getElementById('pay-bill-animation').style.display = "block";
    startAnimationPay();
}

function startAnimationPay() {
    const container = document.getElementById('pay-bill-animation');
    const user = document.getElementById('phone');
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
}

function startAnimation() {
    const user = document.querySelector('.user-pay-share');
    const ether = document.querySelector('.ether-pay-share');
    hand.classList.remove('animate');
    ether.classList.remove('animate');
    void hand.offsetWidth;
    void ether.offsetWidth;
    hand.classList.add('animate');
    ether.classList.add('animate');
}

function showParticipantsAnimation() {
    document.getElementById('pay-share-2').style.display = "none";
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

    text.classList.remove('visible');
    container.querySelectorAll('.ether, .ticket').forEach(el => el.remove());

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
}


function showWithdrawAnimation() {
    console.log("animation tigger");
    document.getElementById('withdraw-form').style.display = "none";
    document.getElementById('withdraw-animation').style.display = "block";
    const users = Array.from(document.querySelectorAll('.user-3'));
    positionUsersWithdraw(users);

    const count = users.length;
    const etherPhase = (count - 1) * 500 + 2000;
    const loopDuration = etherPhase + 1000;
    runLoopWithdraw(users);
    setInterval(() => runLoopWithdraw(users), loopDuration);
}

function positionUsersWithdraw(users) {
    const container = document.getElementById('withdraw-animation');
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

function runLoopWithdraw(users) {
    const container = document.getElementById('withdraw-animation');
    const contract = document.getElementById('contract-3');
    const text = document.getElementById('text-withdraw-funds');

    text.classList.remove('visible');
    container.querySelectorAll('.ether, .ticket').forEach(el => el.remove());

    users.forEach((user, idx) => {
        setTimeout(() => {
            const ether = document.createElement('i');
            ether.className = 'fa-brands fa-ethereum ether';
            container.appendChild(ether);

            const startX = contract.offsetLeft + contract.offsetWidth / 2 - 12;
            const startY = contract.offsetTop + contract.offsetHeight / 2 - 12;
            ether.style.left = startX + 'px';
            ether.style.top = startY + 'px';

            const endX = user.offsetLeft + user.offsetWidth / 2 - 12;
            const endY = user.offsetTop + user.offsetHeight / 2 - 12;
            ether.style.setProperty('--dx', (endX - startX) + 'px');
            ether.style.setProperty('--dy', (endY - startY) + 'px');

            requestAnimationFrame(() => ether.classList.add('fly-to-user-2'));
            ether.addEventListener('animationend', () => ether.remove());
        }, idx * 500);
    });
}