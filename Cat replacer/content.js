console.log("🐱 Cat Replacer script loaded!");

// =============================================
// Generates a UNIQUE cat URL every time
// (prevents caching issues)
// =============================================
function getRandomCatUrl() {
    // Use Cat API with a random query param to force unique URLs
    const width = Math.floor(Math.random() * 300) + 200; // 200-500px
    const height = Math.floor(Math.random() * 300) + 200;
    // The Cat API (cataas.com) is more reliable and supports random + cache busting
    return `https://cataas.com/cat?width=${width}&height=${height}&t=${Date.now()}&${Math.random()}`;
}

// Fallback static cat (just in case)
const FALLBACK_CAT = 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=300';

// =============================================
// Replace a single image
// =============================================
function replaceImageWithCat(imgElement) {
    // Skip if already replaced
    if (imgElement.dataset.catReplaced === 'true') return;
    
    // Mark as replaced immediately to prevent loops
    imgElement.dataset.catReplaced = 'true';
    
    // Generate a unique cat URL
    const catUrl = getRandomCatUrl();
    
    // Set the src AND also store it as a data attribute to detect external changes
    imgElement.src = catUrl;
    imgElement.dataset.originalCatUrl = catUrl;
    
    console.log('🐱 Replaced:', imgElement.src.substring(0, 60));
}

// =============================================
// Replace all existing images
// =============================================
function replaceAllImages() {
    const images = document.querySelectorAll('img:not([data-cat-replaced="true"])');
    console.log(`Found ${images.length} images to replace`);
    images.forEach(img => replaceImageWithCat(img));
}

// =============================================
// Watch for new images AND changes to src attribute
// =============================================
function startObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // Handle newly added nodes
            mutation.addedNodes.forEach((node) => {
                if (node.nodeName === 'IMG') {
                    replaceImageWithCat(node);
                }
                if (node.querySelectorAll) {
                    node.querySelectorAll('img:not([data-cat-replaced="true"])').forEach(img => replaceImageWithCat(img));
                }
            });
            
            // Handle attribute changes (e.g., src changed by lazy loading)
            if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                const img = mutation.target;
                if (img.nodeName === 'IMG' && !img.dataset.catReplaced) {
                    replaceImageWithCat(img);
                }
                // If it WAS replaced but the site changed src back, re-replace it
                if (img.dataset.catReplaced === 'true' && img.src !== img.dataset.originalCatUrl) {
                    console.log('Re-replacing hijacked image');
                    const newCatUrl = getRandomCatUrl();
                    img.src = newCatUrl;
                    img.dataset.originalCatUrl = newCatUrl;
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,      // watch for added/removed nodes
        subtree: true,        // watch all descendants
        attributes: true,     // watch for attribute changes
        attributeFilter: ['src'] // only care about src changes
    });
    
    console.log('👀 Observer active – watching for new images and src changes');
}

// =============================================
// Also run periodically as a fallback (every 2 seconds)
// =============================================
setInterval(() => {
    const missedImages = document.querySelectorAll('img:not([data-cat-replaced="true"])');
    if (missedImages.length > 0) {
        console.log(`Fallback: replacing ${missedImages.length} missed images`);
        missedImages.forEach(img => replaceImageWithCat(img));
    }
}, 2000);

// =============================================
// START EVERYTHING
// =============================================
replaceAllImages();
startObserver();