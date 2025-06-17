function showDeployAnimation() {
    const container = document.querySelector('.container');
    container.scrollTop = "500";
    document.getElementById('deploy-contract-form').style.display = "none";
    document.querySelector('.animation-container').classList.remove("hidden");
    animateDeployment();
}

function animateDeployment() {
    const container = document.querySelector('.fountain-container');
    setInterval(() => {
        const ticket = document.createElement('i');
        ticket.className = 'fa-solid fa-ticket ticket';
        const x = (Math.random() - 0.5) * 100;
        const y = -(Math.random() * 150 + 50);
        ticket.style.setProperty('--x', x + 'px');
        ticket.style.setProperty('--y', y + 'px');
        container.appendChild(ticket);
        ticket.addEventListener('animationend', () => ticket.remove());
    }, 200);
}

const quantitySelect = document.getElementById("quantity-select");
quantitySelect.addEventListener('change', (event) => {
    const container = document.querySelector('.guests-inputs');
    container.replaceChildren();

    for (let i = 0; i < event.target.value; i++) {
        const input = document.createElement('input');
        input.classList.add("participant-name-input");
        input.name = `participant${i + 1}`;
        input.placeholder = `Insert participant ${i + 1}'s full name`;
        container.appendChild(input);
    }

    if (event.target.value < 2) {
        document.getElementById('buy-ticket-button').style.display = "flex";
        document.getElementById('buy-tickets-button').style.display = "none";
    } else {
        document.getElementById('buy-tickets-button').style.display = "flex";
        document.getElementById('buy-ticket-button').style.display = "none";
    }
})

function showStepAnimation(index) {
    const steps = document.querySelectorAll('.step-bta');
    const participants = document.getElementById('quantity-select').value;
    const duration = 10000 * participants;
    steps[index].classList.add('visible');
    setTimeout(() => {
        steps[index].classList.remove('visible');
        if (index + 1 < steps.length) {
            showStepAnimation(index + 1);
        }
    }, duration);
}

function showBuyTicketAnimation() {
    const container = document.querySelector('.container');
    container.scrollTop = "2000";
    document.getElementById('buy-ticket-form').style.display = "none";
    document.querySelector('.buy-ticket-animation').classList.remove("hidden");
    showStepAnimation(0);
}

function showStepAnimationAlt(index) {
    const steps = document.querySelectorAll('.step-oma');
    const duration = 10000;
    steps[index].classList.add('visible');
    setTimeout(() => {
        steps[index].classList.remove('visible');
        if (index + 1 < steps.length) {
            showStepAnimationAlt(index + 1);
        }
    }, duration);
}

function showOrganizerMintAnimation() {
    const container = document.querySelector('.container');
    container.scrollTop = "3000";
    document.getElementById('organizer-tickets-form').style.display = "none";
    document.querySelector('.organizer-mint-animation').classList.remove("hidden");
    showStepAnimationAlt(0);
}

