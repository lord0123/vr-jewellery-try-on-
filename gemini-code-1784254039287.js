// app.js - High-Fidelity Client-Side E-Commerce & AR Virtual Try-On Logic

// 1. Core Luxury Product Catalog Dataset (Using Primary IDs as Keys)
const productCatalog = [
    {
        id: "necklace_001",
        name: "Classic Diamond Collar",
        weight: 18.50, // grams
        wastage: 5.0,  // percentage
        makingCharge: 12.0, // percentage
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80", // Premium Placeholder
        modelPath: "catalog/models/necklace_001.glb", // Primary 3D GLB Asset
        description: "An exceptional collar necklace featuring alternating round and marquise brilliant-cut diamonds, set meticulously in handcrafted 18K white gold."
    },
    {
        id: "necklace_002",
        name: "Traditional Temple Haram",
        weight: 48.00, // grams
        wastage: 8.0,  // percentage
        makingCharge: 15.0, // percentage
        image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=400&q=80",
        modelPath: "catalog/models/necklace_002.glb",
        description: "A monumental South Asian long necklace (Haram) depicting traditional floral motifs, crafted in 22K yellow gold with antique kundan-cut stones."
    },
    {
        id: "necklace_003",
        name: "Emperor Emerald Choker",
        weight: 24.20, // grams
        wastage: 6.0,  // percentage
        makingCharge: 10.0, // percentage
        image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=400&q=80",
        modelPath: "catalog/models/necklace_003.glb",
        description: "A regal choker showcasing striking cushion-cut Colombian emeralds framed by halos of pave diamonds, mounted in 18K gold bands."
    },
    {
        id: "necklace_004",
        name: "Pearl Cascade Opera",
        weight: 32.10, // grams
        wastage: 4.0,  // percentage
        makingCharge: 8.0,  // percentage
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80",
        modelPath: "catalog/models/necklace_004.glb",
        description: "A fluid multi-strand opera necklace featuring hand-selected Japanese Akoya pearls, finished with an elegant floral filigree clasp."
    }
];

// 2. Global State Management Variable Pricing
let baseGoldPrice = 6200; // INR per Gram (Default daily gold price)
const gstRate = 3.0;       // Government GST Standard Percentage
let shoppingBag = [];     // Cart array
let activeProduct = null;  // For detail modal view

// 3. Mathematical Formula for Price Calculations
function calculateJewelryPrice(product, goldPrice) {
    const metalCost = product.weight * goldPrice;
    const wastageCost = metalCost * (product.wastage / 100);
    const makingChargeCost = metalCost * (product.makingCharge / 100);
    const subtotal = metalCost + wastageCost + makingChargeCost;
    const gstCost = subtotal * (gstRate / 100);
    const finalPrice = subtotal + gstCost;

    return {
        metalCost: Math.round(metalCost),
        wastageCost: Math.round(wastageCost),
        makingChargeCost: Math.round(makingChargeCost),
        gstCost: Math.round(gstCost),
        finalPrice: Math.round(finalPrice)
    };
}

// 4. Dynamic Storefront Renderer (Flipkart / Amazon style 2-column mobile grid)
function renderStorefront() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;
    grid.innerHTML = "";

    productCatalog.forEach(product => {
        const pricing = calculateJewelryPrice(product, baseGoldPrice);
        
        // Amazon/Flipkart style responsive e-commerce card
        const card = document.createElement("div");
        card.className = "product-card bg-white border border-stone-200/65 rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between";
        card.onclick = () => openDetailsModal(product);

        card.innerHTML = `
            <div class="bg-stone-50 aspect-square w-full flex items-center justify-center p-6 relative overflow-hidden group">
                <img src="${product.image}" alt="${product.name}" class="h-44 object-contain transition-transform duration-500 group-hover:scale-105">
                <span class="absolute top-3 left-3 bg-stone-900/10 text-stone-700 text-[9px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-full">${product.weight}g</span>
            </div>
            <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                    <h3 class="font-['Cormorant_Garamond'] text-lg font-bold text-stone-800 line-clamp-1 leading-tight hover:text-amber-600 transition-colors">${product.name}</h3>
                    <p class="text-[10px] text-stone-400 mt-1 uppercase tracking-widest">${product.id}</p>
                </div>
                <div class="mt-4 flex items-center justify-between">
                    <span class="text-sm font-semibold text-stone-800">₹${pricing.finalPrice.toLocaleString('en-IN')}</span>
                    <span class="text-[10px] text-amber-600 font-semibold tracking-wide uppercase"><i class="fa-solid fa-camera mr-1"></i>Try-On</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    document.getElementById("display-gold-price").innerText = `₹${baseGoldPrice.toLocaleString('en-IN')} /g`;
}

// 5. Admin Settings Panel Controls
const adminToggle = document.getElementById("admin-toggle-btn");
const adminPanel = document.getElementById("admin-panel");
const adminClose = document.getElementById("admin-close-btn");
const saveSettings = document.getElementById("save-settings-btn");
const inputGoldPrice = document.getElementById("input-gold-price");

adminToggle.onclick = () => {
    adminPanel.classList.toggle("translate-y-20");
    adminPanel.classList.toggle("opacity-0");
    adminPanel.classList.toggle("pointer-events-none");
};
adminClose.onclick = () => {
    adminPanel.classList.add("translate-y-20", "opacity-0", "pointer-events-none");
};
saveSettings.onclick = () => {
    const parsedPrice = parseFloat(inputGoldPrice.value);
    if (!isNaN(parsedPrice) && parsedPrice > 0) {
        baseGoldPrice = parsedPrice;
        renderStorefront();
        if (activeProduct) {
            updateModalDetails(activeProduct);
        }
        adminPanel.classList.add("translate-y-20", "opacity-0", "pointer-events-none");
    }
};

// 6. Product Detail View & Price Breakdown Sheet Controllers
const modal = document.getElementById("details-modal");
const modalClose = document.getElementById("modal-close-btn");
const modalBox = document.getElementById("details-modal-box");

function openDetailsModal(product) {
    activeProduct = product;
    updateModalDetails(product);
    modal.classList.remove("hidden");
    setTimeout(() => {
        modalBox.classList.remove("scale-95", "opacity-0");
    }, 50);
}

function updateModalDetails(product) {
    const pricing = calculateJewelryPrice(product, baseGoldPrice);
    document.getElementById("modal-img").src = product.image;
    document.getElementById("modal-pk").innerText = `PK: ${product.id}`;
    document.getElementById("modal-name").innerText = product.name;
    document.getElementById("modal-desc").innerText = product.description;
    document.getElementById("modal-weight").innerText = `${product.weight.toFixed(2)}g`;
    document.getElementById("modal-wastage").innerText = `${product.wastage}% (₹${pricing.wastageCost.toLocaleString('en-IN')})`;
    document.getElementById("modal-making").innerText = `${product.makingCharge}% (₹${pricing.makingChargeCost.toLocaleString('en-IN')})`;
    document.getElementById("modal-gst").innerText = `₹${pricing.gstCost.toLocaleString('en-IN')}`;
    document.getElementById("modal-price").innerText = `₹${pricing.finalPrice.toLocaleString('en-IN')}`;

    // Update Action Button Hookups
    document.getElementById("modal-try-btn").onclick = () => startVirtualTryOn(product);
    document.getElementById("modal-bag-btn").onclick = () => {
        addToShoppingBag(product);
        closeDetailsModal();
    };
}

modalClose.onclick = closeDetailsModal;

function closeDetailsModal() {
    modalBox.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
        modal.classList.add("hidden");
    }, 300);
}

// 7. Shopping Bag Drawer Controllers
const bagDrawer = document.getElementById("bag-drawer");
const bagClose = document.getElementById("bag-close-btn");
const bagBtn = document.getElementById("bag-btn");
const bagItems = document.getElementById("bag-items");
const bagSubtotal = document.getElementById("bag-subtotal");
const bagCountBadge = document.getElementById("bag-count");
const bagEmptyState = document.getElementById("bag-empty");

bagBtn.onclick = () => bagDrawer.classList.remove("hidden", "translate-x-full");
bagClose.onclick = () => bagDrawer.classList.add("translate-x-full");

function addToShoppingBag(product) {
    const pricing = calculateJewelryPrice(product, baseGoldPrice);
    shoppingBag.push({
        ...product,
        calculatedPrice: pricing.finalPrice
    });
    updateBagDrawer();
}

// Put global context binding for removal trigger
window.removeFromBag = function(index) {
    shoppingBag.splice(index, 1);
    updateBagDrawer();
};

function updateBagDrawer() {
    bagItems.innerHTML = "";
    if (shoppingBag.length === 0) {
        bagItems.appendChild(bagEmptyState);
        bagCountBadge.classList.add("opacity-0");
        bagSubtotal.innerText = "₹0";
        return;
    }
    bagEmptyState.remove();
    bagCountBadge.innerText = shoppingBag.length;
    bagCountBadge.classList.remove("opacity-0");

    let subtotal = 0;
    shoppingBag.forEach((item, index) => {
        subtotal += item.calculatedPrice;
        const itemEl = document.createElement("div");
        itemEl.className = "flex items-center justify-between border-b border-stone-100 pb-4";
        itemEl.innerHTML = `
            <div class="flex items-center space-x-4">
                <img src="${item.image}" alt="${item.name}" class="w-14 h-14 object-contain bg-stone-50 rounded-lg p-1 border border-stone-100">
                <div>
                    <h4 class="font-medium text-stone-800 text-sm leading-tight line-clamp-1">${item.name}</h4>
                    <p class="text-[10px] text-stone-400 mt-1 uppercase tracking-wider">${item.id} | ${item.weight}g</p>
                </div>
            </div>
            <div class="text-right">
                <span class="text-sm font-semibold text-stone-800 block">₹${item.calculatedPrice.toLocaleString('en-IN')}</span>
                <button onclick="removeFromBag(${index})" class="text-[10px] text-red-500 hover:text-red-700 font-semibold tracking-wider uppercase mt-1">Remove</button>
            </div>
        `;
        bagItems.appendChild(itemEl);
    });
    bagSubtotal.innerText = `₹${subtotal.toLocaleString('en-IN')}`;
}

// =========================================================================
// 8. REAL-TIME CLIENT-SIDE AR ENGINE (Three.js & MediaPipe Integration)
// =========================================================================

const videoElement = document.getElementById("webcam");
const canvasElement = document.getElementById("ar-canvas");
const arModal = document.getElementById("ar-modal");
const arLoading = document.getElementById("ar-loading");
const arClose = document.getElementById("ar-close-btn");
const arCapture = document.getElementById("ar-capture-btn");
const arEnhance = document.getElementById("ar-enhance-btn");

let threeScene, threeCamera, threeRenderer, loadedModel, faceMeshTracker, cameraHelper;
let activeVTOProduct = null;
const scaleFactorFactor = 1.3; // Calibrated size scaler

// A. SVG Video Enhancement Toggler (Enhance video feed sharpness/clarity)
let videoEnhanced = false;
arEnhance.onclick = () => {
    videoEnhanced = !videoEnhanced;
    if (videoEnhanced) {
        videoElement.classList.add("enhanced");
        arEnhance.classList.add("bg-amber-600", "text-white");
        arEnhance.classList.remove("text-amber-400");
    } else {
        videoElement.classList.remove("enhanced");
        arEnhance.classList.remove("bg-amber-600", "text-white");
        arEnhance.classList.add("text-amber-400");
    }
};

// B. Setup and Build the Three.js Overlay Layer
function initThreeJS() {
    threeScene = new THREE.Scene();
    
    // Set up Perspective Camera mirroring MediaPipe's intrinsic configurations
    const aspect = window.innerWidth / window.innerHeight;
    threeCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    threeCamera.position.set(0, 0, 0); // Position at origin

    threeRenderer = new THREE.WebGLRenderer({
        canvas: canvasElement,
        alpha: true,
        antialias: true
    });
    threeRenderer.setSize(window.innerWidth, window.innerHeight);
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Studio lighting mapping for high jewelry shine
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    threeScene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(2, 5, 5);
    threeScene.add(keyLight);

    const bounceLight = new THREE.DirectionalLight(0xfff5e6, 0.8); // Warm jewelry bounce
    bounceLight.position.set(-2, -3, 3);
    threeScene.add(bounceLight);
}

// C. Load Selected Product Model onto Scene
function load3DAsset(product) {
    // Clear previous model from scene
    if (loadedModel) {
        threeScene.remove(loadedModel);
        loadedModel = null;
    }

    // Since we may not have GLB files in a local test, we construct a 2D transparent sprite fallback
    // inside the 3D canvas so that the program ALWAYS runs without crashing.
    const loader = new THREE.GLTFLoader();
    loader.load(
        product.modelPath,
        (gltf) => {
            loadedModel = gltf.scene;
            threeScene.add(loadedModel);
            arLoading.classList.add("hidden");
        },
        undefined,
        (error) => {
            console.log("3D GLTF asset not found. Initializing 2D Fallback plane in 3D Canvas context.");
            // 2D High-Fidelity Transparent Layer Fallback
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(product.image, (texture) => {
                const material = new THREE.SpriteMaterial({ map: texture });
                loadedModel = new THREE.Sprite(material);
                // Align size
                loadedModel.scale.set(4, 4, 1);
                threeScene.add(loadedModel);
                arLoading.classList.add("hidden");
            });
        }
    );
}

// D. MediaPipe Coordinate Alignment & Stabilized Vector Calculations
function onFaceTrackerResults(results) {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        if (loadedModel) loadedModel.visible = false;
        return;
    }

    if (arLoading.classList.contains("hidden") === false) {
        arLoading.classList.add("hidden");
    }

    const landmarks = results.multiFaceLandmarks[0];
    if (loadedModel) loadedModel.visible = true;

    // Anchor Math coordinates reference mapping
    const leftJaw = landmarks[234];   // Left structural cheek/jaw oval
    const rightJaw = landmarks[454];  // Right structural cheek/jaw oval
    const chin = landmarks[152];      // Chin tip anchor
    const noseBridge = landmarks[168];// Center nose bridge pivot

    // 1. Calculate Face Scale (distance between jaws)
    const dx_jaw = rightJaw.x - leftJaw.x;
    const dy_jaw = rightJaw.y - leftJaw.y;
    const dz_jaw = rightJaw.z - leftJaw.z;
    const faceWidth = Math.sqrt(dx_jaw*dx_jaw + dy_jaw*dy_jaw + dz_jaw*dz_jaw);

    // 2. Align Z-Depth Position relative to face size
    const zOffsetMultiplier = -5.0; // Distance calibration multiplier
    const depthPos = zOffsetMultiplier / faceWidth;

    // 3. Project Position below chin (Y offset)
    const chinToNoseY = chin.y - noseBridge.y;
    const chinToNoseX = chin.x - noseBridge.x;
    
    // Project the anchor point downward along the face Y orientation vector
    const neckProjFactor = 0.55; // Vertical drape height multiplier
    const neckNormalizedX = chin.x + (chinToNoseX * neckProjFactor);
    const neckNormalizedY = chin.y + (chinToNoseY * neckProjFactor);

    // Convert normalized coordinates back to Metric Three.js projection coordinates
    const clipX = (neckNormalizedX * 2) - 1;
    const clipY = -(neckNormalizedY * 2) + 1;

    // Unproject to map screen-space vector to world coordinates
    const targetPos = new THREE.Vector3(clipX, clipY, 0.5);
    targetPos.unproject(threeCamera);
    
    // Scale coordinate projection outward along the Z depth vector
    const targetDistance = depthPos - threeCamera.position.z;
    targetPos.sub(threeCamera.position).normalize().multiplyScalar(targetDistance).add(threeCamera.position);

    // Smooth position using Lerp to eliminate frame-rate jittering
    loadedModel.position.lerp(targetPos, 0.22);

    // 4. Scale Object dynamically to fit face width
    const currentScale = faceWidth * scaleFactorFactor;
    loadedModel.scale.set(currentScale * 14, currentScale * 14, currentScale * 14);

    // 5. Rotation Math (Roll, Pitch, Yaw)
    // Z-Roll (tilt side-to-side)
    const rollAngle = Math.atan2(dy_jaw, dx_jaw);
    
    // Simple Yaw (turn side-to-side)
    const yawAngle = Math.asin(rightJaw.z - leftJaw.z) / faceWidth;

    // Construct Euler orientation mapping
    const targetRotation = new THREE.Euler(0, yawAngle, rollAngle, "YXZ");
    
    // Slerp rotation mapping for smooth transition feel
    const currentQuaternion = new THREE.Quaternion().setFromEuler(loadedModel.rotation);
    const targetQuaternion = new THREE.Quaternion().setFromEuler(targetRotation);
    currentQuaternion.slerp(targetQuaternion, 0.2);
    loadedModel.rotation.setFromQuaternion(currentQuaternion);
}

// E. Video capture loop & Frame handler pipeline
function startVirtualTryOn(product) {
    activeVTOProduct = product;
    closeDetailsModal();
    arModal.classList.remove("hidden");
    arLoading.classList.remove("hidden");

    // Populate AR HUD specifications card details
    const pricing = calculateJewelryPrice(product, baseGoldPrice);
    document.getElementById("ar-hud-img").src = product.image;
    document.getElementById("ar-hud-name").innerText = product.name;
    document.getElementById("ar-hud-specs").innerText = `${product.weight}g | Price: ₹${pricing.finalPrice.toLocaleString('en-IN')}`;

    // Initialize Camera and ML Tracking
    navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
        },
        audio: false
    }).then(stream => {
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
            videoElement.play();
            videoElement.classList.remove("opacity-0");
            initThreeJS();
            load3DAsset(product);

            // Initialize MediaPipe FaceMesh Tracker from local WebAssembly CDN package
            faceMeshTracker = new FaceMesh({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
            });

            faceMeshTracker.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            faceMeshTracker.onResults(onFaceTrackerResults);

            cameraHelper = new Camera(videoElement, {
                onFrame: async () => {
                    await faceMeshTracker.send({ image: videoElement });
                },
                width: 1280,
                height: 720
            });
            cameraHelper.start();
        };
    }).catch(err => {
        alert("Camera permission denied or camera not found. Cannot launch live try-on.");
        closeAR();
    });
}

// F. VTO Stop & Session Disconnect
arClose.onclick = closeAR;

function closeAR() {
    arModal.classList.add("hidden");
    if (cameraHelper) cameraHelper.stop();
    if (faceMeshTracker) faceMeshTracker.close();
    if (videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
    }
    if (loadedModel) {
        threeScene.remove(loadedModel);
        loadedModel = null;
    }
    videoElement.classList.add("opacity-0");
}

// G. VTO Screenshot Capture Handler
arCapture.onclick = () => {
    // Canvas dimensions mapping
    const combinedCanvas = document.createElement("canvas");
    combinedCanvas.width = videoElement.videoWidth;
    combinedCanvas.height = videoElement.videoHeight;
    const ctx = combinedCanvas.getContext("2d");

    // Draw background webcam stream frame
    ctx.translate(combinedCanvas.width, 0);
    ctx.scale(-1, 1); // Mirror correction draw pass
    ctx.drawImage(videoElement, 0, 0, combinedCanvas.width, combinedCanvas.height);
    ctx.translate(combinedCanvas.width, 0);
    ctx.scale(-1, 1); // Reset scale transform

    // Draw overlaid Three.js canvas layer
    ctx.drawImage(canvasElement, 0, 0, combinedCanvas.width, combinedCanvas.height);

    // Trigger visual capture download link instantly
    const link = document.createElement("a");
    link.download = `${activeVTOProduct ? activeVTOProduct.id : 'try_on'}_snapshot.png`;
    link.href = combinedCanvas.toDataURL("image/png");
    link.click();
};

// Render Three.js WebGL frames in loop
function animateThreeScene() {
    requestAnimationFrame(animateThreeScene);
    if (threeScene && threeCamera && threeRenderer) {
        threeRenderer.render(threeScene, threeCamera);
    }
}
animateThreeScene();

// 9. Initial Load Trigger
window.onload = () => {
    renderStorefront();
    updateBagDrawer();
};