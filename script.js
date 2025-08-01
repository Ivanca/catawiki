const scrollableWrappers = document.querySelectorAll('.ScrollabeWrapper_scrollableWrapper__zBEaA');

scrollableWrappers.forEach((elem) => {
    const flexBasis = 58.8235294118;
    const flexDiff = 81.82 - flexBasis;
    const paddingTop = 125;
    const paddingDiff = 30;
    let percentageTransitioned = 0;
    let locked = false;
    let scrollStart = -1;
    let scrollDiff = -1;
    const scrollableItems = elem.querySelectorAll('.ScrollableItem_item__mXfrR');
    const cardImages = elem.querySelectorAll('.c-lot-card__image');
    const content = document.querySelector('.content1');
    const navBar = document.querySelector('.FeedAndCategoryNavigation_container__9UnwL');
    const dragStart = (ev) => {
        elem.setPointerCapture(ev.pointerId);
        scrollStart = content.scrollTop;
        scrollDiff = elem.parentElement.getBoundingClientRect().top - navBar.getBoundingClientRect().bottom;
        document.body.style.cursor = 'grabbing';
    };
    const dragEnd = (ev) => {
        elem.releasePointerCapture(ev.pointerId);
        document.body.style.cursor = '';
    }
    const drag = (ev) => {
        if (elem.hasPointerCapture(ev.pointerId) && !isTouchScroll) {
            elem.scrollLeft -= ev.movementX;
            handleDelta(-ev.movementX, content);
        }
    };

    elem.addEventListener("pointerdown", dragStart);
    elem.addEventListener("pointerup", dragEnd);
    elem.addEventListener("pointermove", drag);

    let isTouchScroll = false;
    elem.addEventListener('touchstart', (e) => {
        isTouchScroll = true;
        scrollStart = document.body.parentElement.scrollTop;
        scrollDiff = elem.parentElement.getBoundingClientRect().top - navBar.getBoundingClientRect().bottom;
    });

    let lastKnownScrollPosition = 0;
    const mobileScrollable = elem.firstElementChild.firstElementChild;
    mobileScrollable.addEventListener('scroll', function(e) {
        let ticking = false;
        if (!ticking && isTouchScroll) {
            window.requestAnimationFrame(function() {
                let deltaX = mobileScrollable.scrollLeft - lastKnownScrollPosition;
                lastKnownScrollPosition = mobileScrollable.scrollLeft;
                handleDelta(deltaX, document.body.parentElement);
                ticking = false;
            });
            ticking = true;
        }
    });
    
    const handleDelta = (delta, scrollingWrapper) => {
        if (!locked) {
            percentageTransitioned += delta * 0.5;
            let f = percentageTransitioned / 100;
            if (percentageTransitioned > 100) {
                locked = true;
                f = 1;
            }
            let newFlexBasis = flexBasis + flexDiff * f;
            let newPaddingTop = paddingTop + paddingDiff * f;
            scrollingWrapper.scrollTop = scrollStart + scrollDiff * f;
            cardImages.forEach(e => {
                e.style.paddingTop = newPaddingTop + '%';
            });
            scrollableItems.forEach(e => {
                e.style.flexBasis = newFlexBasis + '%';
                e.style.maxWidth = e.style.flexBasis;
            });
        }
    }
});

