/**
 * Demo adding auto-zoom feature when scrolling the items of any category at Catawiki
 * 
 * Video preview: https://github.com/user-attachments/assets/f316bc99-cbb9-4a1b-a257-8f09f320c3c6
 */

// Configuration constants
const CONFIG = {
    FLEX_BASIS_INITIAL: 58.8235294118,
    FLEX_BASIS_FINAL: 81.82,
    PADDING_TOP_INITIAL: 125,
    PADDING_TOP_FINAL: 155, // 125 + 30
    SCROLL_SENSITIVITY: 0.5,
    MAX_TRANSITION_PERCENTAGE: 100
};

// CSS selectors
const SELECTORS = {
    SCROLLABLE_WRAPPER: '.ScrollabeWrapper_scrollableWrapper__zBEaA',
    SCROLLABLE_ITEM: '.ScrollableItem_item__mXfrR',
    CARD_IMAGE: '.c-lot-card__image',
    CONTENT: '.content1',
    NAV_BAR: '.FeedAndCategoryNavigation_container__9UnwL'
};

/**
 * Initialize auto-zoom functionality for scrollable wrappers
 */
function initializeAutoZoom() {
    const scrollableWrappers = document.querySelectorAll(SELECTORS.SCROLLABLE_WRAPPER);
    
    if (!scrollableWrappers.length) {
        console.warn('No scrollable wrappers found');
        return;
    }

    scrollableWrappers.forEach((scrollableWrapper) => {
        try {
            setupScrollableWrapper(scrollableWrapper);
        } catch (error) {
            console.error('Error setting up scrollable wrapper:', error);
        }
    });
}

/**
 * Setup auto-zoom functionality for a single scrollable wrapper
 * @param {HTMLElement} scrollableWrapper - The scrollable wrapper element
 */
function setupScrollableWrapper(scrollableWrapper) {
    // Initialize state variables
    const state = {
        flexBasisDiff: CONFIG.FLEX_BASIS_FINAL - CONFIG.FLEX_BASIS_INITIAL,
        paddingTopDiff: CONFIG.PADDING_TOP_FINAL - CONFIG.PADDING_TOP_INITIAL,
        percentageTransitioned: 0,
        isLocked: false,
        scrollStartPosition: -1,
        scrollDifference: -1,
        isTouchScrolling: false,
        lastKnownScrollPosition: 0
    };

    // Cache DOM elements
    const elements = {
        scrollableItems: scrollableWrapper.querySelectorAll(SELECTORS.SCROLLABLE_ITEM),
        cardImages: scrollableWrapper.querySelectorAll(SELECTORS.CARD_IMAGE),
        content: document.querySelector(SELECTORS.CONTENT),
        navBar: document.querySelector(SELECTORS.NAV_BAR),
        mobileScrollable: scrollableWrapper.firstElementChild?.firstElementChild
    };

    // Validate required elements
    if (!elements.content || !elements.navBar) {
        console.warn('Required elements not found for scrollable wrapper');
        return;
    }

    if (!elements.mobileScrollable) {
        console.warn('Mobile scrollable element not found');
        return;
    }

    // Setup event handlers
    setupDesktopScrolling(scrollableWrapper, elements, state);
    setupMobileScrolling(scrollableWrapper, elements, state);
}

/**
 * Setup desktop scrolling (pointer events)
 * @param {HTMLElement} scrollableWrapper - The scrollable wrapper element
 * @param {Object} elements - Cached DOM elements
 * @param {Object} state - State variables
 */
function setupDesktopScrolling(scrollableWrapper, elements, state) {
    const handlePointerStart = (event) => {
        scrollableWrapper.setPointerCapture(event.pointerId);
        state.scrollStartPosition = elements.content.scrollTop;
        state.scrollDifference = scrollableWrapper.parentElement.getBoundingClientRect().top - 
                                elements.navBar.getBoundingClientRect().bottom;
        document.body.style.cursor = 'grabbing';
    };

    const handlePointerEnd = (event) => {
        scrollableWrapper.releasePointerCapture(event.pointerId);
        document.body.style.cursor = '';
    };

    const handlePointerMove = (event) => {
        if (scrollableWrapper.hasPointerCapture(event.pointerId) && !state.isTouchScrolling) {
            scrollableWrapper.scrollLeft -= event.movementX;
            handleDelta(-event.movementX, elements.content, elements, state);
        }
    };

    scrollableWrapper.addEventListener('pointerdown', handlePointerStart);
    scrollableWrapper.addEventListener('pointerup', handlePointerEnd);
    scrollableWrapper.addEventListener('pointermove', handlePointerMove);
}

/**
 * Setup mobile scrolling (touch events)
 * @param {HTMLElement} scrollableWrapper - The scrollable wrapper element
 * @param {Object} elements - Cached DOM elements
 * @param {Object} state - State variables
 */
function setupMobileScrolling(scrollableWrapper, elements, state) {
    scrollableWrapper.addEventListener('touchstart', () => {
        state.isTouchScrolling = true;
        state.scrollStartPosition = document.body.parentElement.scrollTop;
        state.scrollDifference = scrollableWrapper.parentElement.getBoundingClientRect().top - 
                                elements.navBar.getBoundingClientRect().bottom;
    });

    let isScrollEventPending = false;
    
    elements.mobileScrollable.addEventListener('scroll', () => {
        if (!isScrollEventPending && state.isTouchScrolling) {
            window.requestAnimationFrame(() => {
                const deltaX = elements.mobileScrollable.scrollLeft - state.lastKnownScrollPosition;
                state.lastKnownScrollPosition = elements.mobileScrollable.scrollLeft;
                handleDelta(deltaX, document.body.parentElement, elements, state);
                isScrollEventPending = false;
            });
            isScrollEventPending = true;
        }
    });
}

/**
 * Handle scroll delta and update visual effects
 * @param {number} delta - The scroll delta
 * @param {HTMLElement} scrollingWrapper - The scrolling wrapper element
 * @param {Object} elements - Cached DOM elements
 * @param {Object} state - State variables
 */
function handleDelta(delta, scrollingWrapper, elements, state) {
    if (state.isLocked) {
        return;
    }

    // Update transition percentage
    state.percentageTransitioned += delta * CONFIG.SCROLL_SENSITIVITY;
    let transitionFactor = Math.min(state.percentageTransitioned / CONFIG.MAX_TRANSITION_PERCENTAGE, 1);
    
    // Lock when transition is complete
    if (state.percentageTransitioned >= CONFIG.MAX_TRANSITION_PERCENTAGE) {
        state.isLocked = true;
        transitionFactor = 1;
    }

    // Calculate new values
    const newFlexBasis = CONFIG.FLEX_BASIS_INITIAL + state.flexBasisDiff * transitionFactor;
    const newPaddingTop = CONFIG.PADDING_TOP_INITIAL + state.paddingTopDiff * transitionFactor;
    
    // Update scroll position
    scrollingWrapper.scrollTop = state.scrollStartPosition + state.scrollDifference * transitionFactor;
    
    // Apply visual changes
    applyVisualChanges(elements, newFlexBasis, newPaddingTop);
}

/**
 * Apply visual changes to card images and scrollable items
 * @param {Object} elements - Cached DOM elements
 * @param {number} flexBasis - New flex basis value
 * @param {number} paddingTop - New padding top value
 */
function applyVisualChanges(elements, flexBasis, paddingTop) {
    // Update card images padding
    elements.cardImages.forEach(cardImage => {
        cardImage.style.paddingTop = `${paddingTop}%`;
    });

    // Update scrollable items flex basis
    elements.scrollableItems.forEach(scrollableItem => {
        const flexBasisValue = `${flexBasis}%`;
        scrollableItem.style.flexBasis = flexBasisValue;
        scrollableItem.style.maxWidth = flexBasisValue;
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAutoZoom);
} else {
    initializeAutoZoom();
}

