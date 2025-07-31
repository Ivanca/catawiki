/*
// from:

.ScrollableItem_item__mXfrR {
    max-width: 58.8235294118%;
    flex-basis: 58.8235294118%;
}

.c-lot-card__image {
    position: relative;
    overflow: hidden;
    padding-top: 125%
}

// to: 

.ScrollableItem_item__mXfrR {
    max-width: 91.8235294118% !important;
    flex-basis: 91.8235294118% !important;
}

.c-lot-card__image {
    position: relative !important;
    overflow: hidden !important;
    padding-top: 155% !important;
}
*/
let mouseDown = false;
let startX, scrollLeft;
const pointerScroll = (elem) => {
    let percentageTransitioned = 0;
    let locked = false;
    let flexBasis = 58.8235294118;
    let flexDiff = 81.82 - flexBasis;
    let paddingTop = 125;
    let paddingDiff = 30;
    const scrollableItems = elem.querySelectorAll('.ScrollableItem_item__mXfrR');
    const cardImages = elem.querySelectorAll('.c-lot-card__image');
    console.log(scrollableItems, cardImages)
    const dragStart = (ev) => elem.setPointerCapture(ev.pointerId);
    const dragEnd = (ev) => elem.releasePointerCapture(ev.pointerId);
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
                cardImages.forEach(e => {
                    e.style.paddingTop = newPaddingTop + '%';
                    // console.log(e, e.style.paddingTop);
                });
                scrollableItems.forEach(e => {
                    e.style.flexBasis = newFlexBasis + '%';
                    e.style.maxWidth = e.style.flexBasis;
                    // console.log(e, e.style.flexBasis)
                });
                console.log(newFlexBasis, newPaddingTop)
            }
        }
    };

    elem.addEventListener("pointerdown", dragStart);
    elem.addEventListener("pointerup", dragEnd);
    elem.addEventListener("pointermove", drag);
};

document.querySelectorAll('.ScrollabeWrapper_scrollableWrapper__zBEaA').forEach(pointerScroll);