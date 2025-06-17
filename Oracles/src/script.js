function deployAnimation() {
    const animation = document.getElementById("deploy-animation");
    document.getElementById("deploy-contract-form").style.display = "none";
    animation.classList.remove("hidden");
}

function purchaseAnimation() {
    const animation = document.getElementById("purchase-animation");
    document.getElementById("purchase-policy-form").style.display = "none";
    animation.classList.remove("hidden");
    
    const cartContainer = animation.querySelector('.cart-container');
    cartContainer.classList.add('animate');
}

function rainfallAnimation1() {
    const animation = document.getElementById("rainfall-animation-1");
    document.getElementById("process-rainfall-form-1").style.display = "none";
    animation.classList.remove("hidden");
    animation.classList.add('animate-r');
    
    setTimeout(() => {
        const water = animation.querySelector('.water');
        water.classList.add('fill');
    }, 500);
}

function rainfallAnimation2() {
    const animation = document.getElementById("rainfall-animation-2");
    document.getElementById("process-rainfall-form-2").style.display = "none";
    animation.classList.remove("hidden");
    animation.classList.add('animate-r');
    
    setTimeout(() => {
        const water = animation.querySelector('.water');
        water.classList.add('fill');
    }, 500);
}

function withdrawAnimation() {
    const animation = document.getElementById("withdraw-animation");
    const toPopulate = document.getElementById("withdraw-animation-icons");
    document.getElementById("withdraw-form").style.display = "none";
    animation.classList.remove("hidden");
    
    const numCoins = 5;
    
    for (let i = 0; i < numCoins; i++) {
        setTimeout(() => {
            const coin = document.createElement("div");
            coin.className = "ethereum-coin";
            coin.innerHTML = '<i class="fa-brands fa-ethereum"></i>';
            toPopulate.appendChild(coin);
            
            coin.style.animation = `moveEther 2s ease-in-out forwards`;
            
            setTimeout(() => {
                coin.remove();
                if (i === numCoins - 1) {
                    const successMessage = document.querySelector('.success-message');
                    successMessage.style.opacity = '1';
                }
            }, 2000);
        }, i * 400);
    }
}
