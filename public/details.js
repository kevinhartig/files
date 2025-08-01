export function showDetails() {
    console.log('Files DApp Details showing...');

    // Create a modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: flex-start;
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        padding: 1rem;
        box-sizing: border-box;
        overflow-y: auto;
    `;

    // Create the main container
    const container = document.createElement('div');
    container.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 1rem;
        max-width: 600px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        position: relative;
        margin: 2rem auto;
        min-height: auto;
        max-height: calc(100vh - 4rem);
        overflow-y: auto;
        box-sizing: border-box;
    `;

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        color: #666;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
        z-index: 1;
    `;

    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.backgroundColor = '#f3f4f6';
    });

    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.backgroundColor = 'transparent';
    });

    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = `
        padding: 0.5rem 2rem 1rem 2rem;
        box-sizing: border-box;
    `;

    // Create content
    const title = document.createElement('h1');
    title.textContent = 'Encrypted Files 🔐';
    title.style.cssText = `
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        margin: 0 0 0.75rem 0;
        color: #1f2937;
        font-weight: bold;
    `;

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Secure Decentralized Data Storage';
    subtitle.style.cssText = `
        font-size: clamp(1rem, 3vw, 1.25rem);
        margin: 0 0 1rem 0;
        color: #6b7280;
    `;

    const description = document.createElement('p');
    description.textContent = 'This DApp provides secure, encrypted storage for your files using decentralized technology. Your data is encrypted before being distributed across the network, ensuring maximum privacy and security.';
    description.style.cssText = `
        font-size: clamp(0.875rem, 2.5vw, 1rem);
        margin: 0 0 1.5rem 0;
        color: #4b5563;
        line-height: 1.6;
    `;

    const featuresContainer = document.createElement('div');
    featuresContainer.style.cssText = `
        background: #f9fafb;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1.5rem;
        text-align: left;
    `;

    featuresContainer.innerHTML = `
        <h3 style="margin: 0 0 1rem 0; color: #1f2937; font-size: clamp(1rem, 2.5vw, 1.1rem); font-weight: 600; text-align: center;">Key Features:</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; font-size: clamp(0.75rem, 2vw, 0.875rem); color: #4b5563;">
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 0.5rem; font-size: 1rem;">🔒</span>
                <span>End-to-end encryption</span>
            </div>
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 0.5rem; font-size: 1rem;">🌐</span>
                <span>Decentralized storage</span>
            </div>
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 0.5rem; font-size: 1rem;">🗝️</span>
                <span>Private key control</span>
            </div>
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 0.5rem; font-size: 1rem;">📱</span>
                <span>Cross-platform access</span>
            </div>
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 0.5rem; font-size: 1rem;">⚡</span>
                <span>Fast file retrieval</span>
            </div>
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 0.5rem; font-size: 1rem;">🔄</span>
                <span>Managed data sharing</span>
            </div>
        </div>
    `;

    const statusContainer = document.createElement('div');
    statusContainer.style.cssText = `
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1.5rem;
        border-left: 4px solid #f59e0b;
    `;

    statusContainer.innerHTML = `
        <div style="display: flex; align-items: center; color: #92400e;">
            <span style="margin-right: 0.5rem; font-size: 1.2rem;">⚠️</span>
            <span style="font-weight: 600; font-size: clamp(0.8rem, 2vw, 0.9rem);">Development Status: Coming Soon</span>
        </div>
        <p style="margin: 0.5rem 0 0 1.7rem; font-size: clamp(0.75rem, 2vw, 0.875rem); color: #92400e; line-height: 1.4;">
            This DApp is currently under development. Full encryption and decentralized storage functionality will be available in future releases.
        </p>
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        justify-content: center;
        margin-top: 1.5rem;
        padding-bottom: 1rem;
    `;

    const learnMoreButton = document.createElement('button');
    learnMoreButton.textContent = 'Learn More 📚';
    learnMoreButton.style.cssText = `
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border: none;
        padding: 0.875rem 1.5rem;
        border-radius: 8px;
        font-size: clamp(0.875rem, 2.5vw, 1rem);
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        width: 100%;
        min-height: 44px;
    `;

    const notifyButton = document.createElement('button');
    notifyButton.textContent = 'Notify Me 🔔';
    notifyButton.style.cssText = `
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        border: none;
        padding: 0.875rem 1.5rem;
        border-radius: 8px;
        font-size: clamp(0.875rem, 2.5vw, 1rem);
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        width: 100%;
        min-height: 44px;
    `;

    // Add hover effects (only on non-touch devices)
    const addHoverEffects = (button) => {
        if (!('ontouchstart' in window)) {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = 'none';
            });
        }
    };

    addHoverEffects(learnMoreButton);
    addHoverEffects(notifyButton);

    learnMoreButton.addEventListener('click', () => {
        alert('🔐 Encrypted Files DApp will provide:\n\n• Data streamed encryption using AES-256\n• IPFS distributed storage\n• Managed file sharing\n• Secure data access from everywhere\n\nStay tuned for updates!');
    });

    notifyButton.addEventListener('click', () => {
        alert('🔔 Great! You\'ll be notified when the Encrypted Files DApp launches.\n\nExpected features:\n• Secure file upload/download\n• Folder organization\n• Managed data sharing\n• Access control management');
    });

    // Assemble the UI
    container.appendChild(closeButton);
    contentWrapper.appendChild(title);
    contentWrapper.appendChild(subtitle);
    contentWrapper.appendChild(description);
    contentWrapper.appendChild(featuresContainer);
    contentWrapper.appendChild(statusContainer);
    buttonContainer.appendChild(learnMoreButton);
    buttonContainer.appendChild(notifyButton);
    contentWrapper.appendChild(buttonContainer);
    container.appendChild(contentWrapper);

    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // Responsive breakpoint handling
    const handleResize = () => {
        if (window.innerWidth < 640) {
            // Mobile styles
            container.style.margin = '1rem auto';
            container.style.maxHeight = 'calc(100vh - 2rem)';
            contentWrapper.style.padding = '0.5rem 1rem 1rem 1rem';
            buttonContainer.style.flexDirection = 'column';
        } else {
            // Desktop styles
            container.style.margin = '2rem auto';
            container.style.maxHeight = 'calc(100vh - 4rem)';
            contentWrapper.style.padding = '0.5rem 2rem 1rem 2rem';
            if (window.innerWidth > 480) {
                buttonContainer.style.flexDirection = 'row';
            }
        }
    };

    // Initial resize check
    handleResize();
    window.addEventListener('resize', handleResize);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            window.removeEventListener('resize', handleResize);
            document.body.removeChild(overlay);
        }
    });

    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            window.removeEventListener('resize', handleResize);
            document.body.removeChild(overlay);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Cleanup function to restore body scroll
    const cleanup = () => {
        document.body.style.overflow = '';
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('keydown', handleEscape);
    };

    // Store cleanup function for potential external access
    overlay._cleanup = cleanup;

    console.log('Encrypted Files DApp details loaded successfully!');
}

export default { showDetails };