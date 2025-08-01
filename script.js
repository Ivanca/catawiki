
const pointerScroll = (elem) => {
    let percentageTransitioned = 0;
    let locked = false;
    let flexBasis = 58.8235294118;
    let flexDiff = 81.82 - flexBasis;
    let paddingTop = 125;
    let paddingDiff = 30;
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
        if (elem.hasPointerCapture(ev.pointerId)) {
            elem.scrollLeft -= ev.movementX;
            if (!locked) {
                elem.scrollLeft -= ev.movementX * 0.5;
                percentageTransitioned -= ev.movementX * 0.5;
                let f = percentageTransitioned / 100;
                if (percentageTransitioned > 100) {
                    locked = true;
                    f = 1;
                }
                let newFlexBasis = flexBasis + flexDiff * f;
                let newPaddingTop = paddingTop + paddingDiff * f;
                content.scrollTop = scrollStart + scrollDiff * f;
                cardImages.forEach(e => {
                    e.style.paddingTop = newPaddingTop + '%';
                });
                scrollableItems.forEach(e => {
                    e.style.flexBasis = newFlexBasis + '%';
                    e.style.maxWidth = e.style.flexBasis;
                });
            }
        }
    };
    elem.addEventListener("pointerdown", dragStart);
    elem.addEventListener("pointerup", dragEnd);
    elem.addEventListener("pointermove", drag);
};

document.querySelectorAll('.ScrollabeWrapper_scrollableWrapper__zBEaA').forEach(pointerScroll);
