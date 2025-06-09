const items = [
    { name: "Karambit | Fentanyl Dream", price: 1249.99, imgSrc: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_knife_karam_am_diamond_light_large.9e98d5f8a4c1d95f1d5a8f4d3a4a5d5d.png" },
    { name: "AK-47 | Overdose Empress", price: 499.99, imgSrc: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_ak47_gs_ak47_empress_light_large.0d3e3d8a6d1a1b1b1b1b1b1b1b1b1b1b.png" },
    { name: "AWP | Poison Dart", price: 349.99, imgSrc: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_awp_cu_awp_viper_light_large.1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b.png" },
    { name: "Glock-18 | Pharma Rush", price: 199.99, imgSrc: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_glock_cu_glock_warmaiden_light_large.1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b.png" },
    { name: "Desert Eagle | Oxy Blaze", price: 299.99, imgSrc: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_deagle_cu_deagle_kumichodragon_light_large.1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b.png" },
    { name: "M4A1-S | Hotfix", price: 399.99, imgSrc: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_m4a1_silencer_aa_fade_light_large.1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b.png" }
];

let selectedItemsIndices = []; // Store indices of selected items from the `case-items` div

// Ensure DOM is fully loaded before trying to access elements for selection
document.addEventListener('DOMContentLoaded', () => {
    // Initial call to set price to $0.00 if nothing selected
    // and to set up any initial state if needed.
    updatePreview();

    // If you want to auto-select items for demo:
    // This is one way to do it, making sure elements exist.
    // setTimeout(() => {
    //     const caseItemElements = document.querySelectorAll('.case-item');
    //     if (caseItemElements.length >= 2) {
    //         // Simulate clicks on the first two items if they exist
    //         if (typeof caseItemElements[0].click === 'function') {
    //             caseItemElements[0].click();
    //         }
    //         if (typeof caseItemElements[1].click === 'function') {
    //             caseItemElements[1].click();
    //         }
    //     }
    // }, 500); // Slight delay for page to render, can be adjusted or removed
});


function selectItem(element) {
    // Find the index of the clicked item within its parent container '.case-items'
    // This assumes all children of '.case-items' are potential '.case-item' elements.
    const itemElements = Array.from(element.parentNode.children);
    const itemIndex = itemElements.indexOf(element);

    // Guard against itemIndex being -1 (shouldn't happen if element is a child)
    if (itemIndex === -1) {
        console.error("Clicked item not found in its parent's children list.");
        return;
    }

    element.classList.toggle('selected');

    if (selectedItemsIndices.includes(itemIndex)) {
        selectedItemsIndices = selectedItemsIndices.filter(i => i !== itemIndex);
    } else {
        selectedItemsIndices.push(itemIndex);
    }
    updatePreview();
}

function updatePreview() {
    const previewContainer = document.getElementById('previewItems');
    const priceDisplay = document.getElementById('casePrice');
    const purchasePriceDisplay = document.getElementById('priceDisplay'); // In the purchase button

    // Ensure elements exist before trying to modify them
    if (!previewContainer || !priceDisplay || !purchasePriceDisplay) {
        console.error("One or more preview/price elements are missing from the DOM.");
        return;
    }

    previewContainer.innerHTML = '';
    let totalPrice = 0;

    selectedItemsIndices.forEach(index => {
        // Ensure the index is valid for the `items` array
        if (index < 0 || index >= items.length) {
            console.error(`Invalid item index ${index} encountered.`);
            return; // Skip this invalid index
        }
        const item = items[index]; // Get item from original items array using index
        totalPrice += item.price;

        const itemElement = document.createElement('div');
        itemElement.className = 'preview-item';
        // Use actual image source if available, otherwise placeholder
        const previewImgSrc = item.imgSrc || `https://via.placeholder.com/80x40/050505/FF0000?text=${encodeURIComponent(item.name.split('|')[0].trim().substring(0,10))}`;
        itemElement.innerHTML = `
            <img src="${previewImgSrc}" alt="${item.name}">
            <p>${item.name.split('|')[0].trim()}</p> <!-- Shorter name for preview -->
        `;
        previewContainer.appendChild(itemElement);
    });

    // Add our "fair" markup of pure evil
    const scamMarkupPerItem = 99.99; // Pure profit for SkinFent!
    const totalScamMarkup = selectedItemsIndices.length * scamMarkupPerItem;
    totalPrice += totalScamMarkup;

    const finalPriceText = `$${totalPrice.toFixed(2)}`;
    priceDisplay.textContent = finalPriceText;
    purchasePriceDisplay.textContent = finalPriceText;
}

function buyCustomCase() {
    if (selectedItemsIndices.length === 0) {
        alert('SELECT ITEMS FOR YOUR DOOM CASE, FOOL!');
        return;
    }

    const priceDisplayElement = document.getElementById('priceDisplay');
    if (!priceDisplayElement) {
        alert("CRITICAL ERROR: Price display element not found. Can't complete scam!");
        return;
    }
    const totalPriceText = priceDisplayElement.textContent;

    alert(`CONGRATULATIONS, YOU WASTED ${totalPriceText} ON DIGITAL SMOKE! YOUR SOUL HAS BEEN CHARGED. NO REFUNDS, EVER.`);

    // Reset selection
    document.querySelectorAll('.case-item.selected').forEach(itemElement => {
        itemElement.classList.remove('selected');
    });
    selectedItemsIndices = [];
    updatePreview(); // Update preview and prices back to $0.00
}

function evaluateSkin() {
    const skinInputElement = document.getElementById('skinInput');
    const tradeResultDiv = document.getElementById('tradeResult');
    const moneyOfferElement = tradeResultDiv ? tradeResultDiv.querySelector('.money-offer') : null;

    if (!skinInputElement || !tradeResultDiv || !moneyOfferElement) {
        console.error("Trade evaluation elements are missing from the DOM.");
        alert("SYSTEM ERROR: Can't evaluate skin. Try refreshing... or don't, save your money.");
        return;
    }

    const input = skinInputElement.value;

    if (!input.trim()) {
        alert('PASTE A SKIN URL, OR ARE YOU TOO BROKE TO EVEN PRETEND?');
        tradeResultDiv.classList.remove('show');
        return;
    }

    // Generate a laughably low random value
    const value = (Math.random() * 0.35 + 0.01).toFixed(2); // Max $0.36, min $0.01

    moneyOfferElement.textContent = `$${value}`;
    tradeResultDiv.classList.add('show');

    // Make the offer "expire"
    setTimeout(() => {
        if (tradeResultDiv.classList.contains('show')) {
            tradeResultDiv.classList.remove('show');
            console.log(`Trade offer for input "${input}" (valued at $${value}) has "expired". User was too slow. Sad!`);
            alert('TOO SLOW! Our offer of basically nothing has evaporated. Try again, sucker!');
        }
    }, 10000); // 10 seconds
}

// Note: The original window.onload is replaced by DOMContentLoaded.
// If you had other specific logic in window.onload that needs to run after *all* resources (like images)
// are loaded, you might still use window.onload in addition to DOMContentLoaded, or chain them.
// For this script, DOMContentLoaded is generally sufficient for DOM manipulation.