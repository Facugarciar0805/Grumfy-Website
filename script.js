const currency = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
});

const cards = Array.from(document.querySelectorAll(".cookie-card"));
const summaryItems = document.querySelector("#summary-items");
const summaryTotal = document.querySelector("#summary-total");
const orderButton = document.querySelector("#order-button");
const orderLimitMessage = document.querySelector("#order-limit-message");
const pickupForm = document.querySelector("#pickup");
const ORDER_DRAFT_KEY = "grumfyOrderDraft";
const ORDER_DRAFT_ID_KEY = "grumfyOrderDraftId";
const WEEKLY_LIMIT_KEY = "grumfyWeeklyCookieOrders";
const WEEKLY_COOKIE_LIMIT = 100;
const ORDER_COOKIE_LIMIT = 24;
const DISCOUNT_THRESHOLD = 12;
const DISCOUNT_RATE = 0.1;
let isRestoringDraft = false;

function getDraftId() {
    try {
        const existingId = localStorage.getItem(ORDER_DRAFT_ID_KEY);

        if (existingId) {
            return existingId;
        }

        const newId = `order-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        localStorage.setItem(ORDER_DRAFT_ID_KEY, newId);
        return newId;
    } catch {
        return `order-${Date.now()}`;
    }
}

const draftId = getDraftId();

function getCurrentWeekStart() {
    const now = new Date();
    const weekStart = new Date(now);
    const daysSinceSaturday = (now.getDay() + 1) % 7;
    weekStart.setDate(now.getDate() - daysSinceSaturday);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart.toISOString().slice(0, 10);
}

function readWeeklyState() {
    const emptyState = {
        weekStart: getCurrentWeekStart(),
        ordered: 0,
        orders: {}
    };

    try {
        const storedState = JSON.parse(localStorage.getItem(WEEKLY_LIMIT_KEY) || "null");

        if (!storedState || storedState.weekStart !== emptyState.weekStart) {
            localStorage.setItem(WEEKLY_LIMIT_KEY, JSON.stringify(emptyState));
            return emptyState;
        }

        return {
            weekStart: storedState.weekStart,
            ordered: Number(storedState.ordered) || 0,
            orders: storedState.orders || {}
        };
    } catch {
        return emptyState;
    }
}

function saveWeeklyState(state) {
    try {
        localStorage.setItem(WEEKLY_LIMIT_KEY, JSON.stringify(state));
    } catch {
        return;
    }
}

function getAvailableCookiesForDraft() {
    const weeklyState = readWeeklyState();
    const currentDraftReservation = Number(weeklyState.orders[draftId]) || 0;
    return Math.max(0, WEEKLY_COOKIE_LIMIT - weeklyState.ordered + currentDraftReservation);
}

function reserveWeeklyCookies(quantity) {
    const weeklyState = readWeeklyState();
    const previousQuantity = Number(weeklyState.orders[draftId]) || 0;
    weeklyState.ordered = Math.max(0, weeklyState.ordered - previousQuantity + quantity);
    weeklyState.orders[draftId] = quantity;
    saveWeeklyState(weeklyState);
}

function calculateOrderTotals(selected) {
    const itemCount = selected.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = selected.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = itemCount > DISCOUNT_THRESHOLD ? Math.round(subtotal * DISCOUNT_RATE) : 0;

    return {
        itemCount,
        subtotal,
        discount,
        total: subtotal - discount
    };
}

function updateQuantityOptions(availableCookies) {
    const maximumSelectable = Math.min(ORDER_COOKIE_LIMIT, availableCookies);

    cards.forEach((card) => {
        const select = card.querySelector(".quantity-input");
        const currentQuantity = Number(select.value) || 0;
        const otherQuantity = cards.reduce((sum, otherCard) => {
            if (otherCard === card) {
                return sum;
            }

            return sum + (Number(otherCard.querySelector(".quantity-input").value) || 0);
        }, 0);

        Array.from(select.options).forEach((option) => {
            const optionQuantity = Number(option.value) || 0;
            option.disabled = optionQuantity !== currentQuantity && optionQuantity + otherQuantity > maximumSelectable;
        });
    });
}

function readOrderDraft() {
    try {
        return JSON.parse(localStorage.getItem(ORDER_DRAFT_KEY) || "null");
    } catch {
        return null;
    }
}

function saveOrderDraft() {
    if (isRestoringDraft) {
        return;
    }

    const draft = {
        quantities: cards.map((card) => card.querySelector(".quantity-input").value),
        name: document.querySelector('[name="name"]').value,
        phone: document.querySelector('[name="phone"]').value,
        email: document.querySelector('[name="email"]').value,
        pickup: document.querySelector('[name="pickup"]').value
    };

    try {
        localStorage.setItem(ORDER_DRAFT_KEY, JSON.stringify(draft));
    } catch {
        return;
    }
}

function restoreOrderDraft() {
    const draft = readOrderDraft();

    if (!draft) {
        return;
    }

    isRestoringDraft = true;
    cards.forEach((card, index) => {
        const input = card.querySelector(".quantity-input");
        input.value = draft.quantities?.[index] || "0";
    });

    document.querySelector('[name="name"]').value = draft.name || "";
    document.querySelector('[name="phone"]').value = draft.phone || "";
    document.querySelector('[name="email"]').value = draft.email || "";
    document.querySelector('[name="pickup"]').value = draft.pickup || "Colegio Grumfy";
    isRestoringDraft = false;
}

function formatPhoneInput(input) {
    const digits = input.value.replace(/\D/g, "").slice(0, 10);
    const parts = [];

    if (digits.length > 0) {
        parts.push(digits.slice(0, 2));
    }

    if (digits.length > 2) {
        parts.push(digits.slice(2, 6));
    }

    if (digits.length > 6) {
        parts.push(digits.slice(6, 10));
    }

    input.value = parts.filter(Boolean).join(" ");
}

function getSelectedItems() {
    return cards
        .map((card) => {
            const input = card.querySelector(".quantity-input");
            const quantity = Math.max(0, Number(input.value) || 0);
            const price = Number(card.dataset.price);

            return {
                name: card.querySelector("h3").textContent,
                price,
                quantity,
                subtotal: quantity * price
            };
        })
        .filter((item) => item.quantity > 0);
}

function updateSummary() {
    const selected = getSelectedItems();
    const totals = calculateOrderTotals(selected);
    const availableCookies = getAvailableCookiesForDraft();
    const exceedsOrderLimit = totals.itemCount > ORDER_COOKIE_LIMIT;
    const exceedsWeeklyLimit = totals.itemCount > availableCookies;

    updateQuantityOptions(availableCookies);
    summaryItems.innerHTML = "";
    orderLimitMessage.textContent = "";
    orderLimitMessage.classList.remove("is-warning", "is-ok");

    if (selected.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-message";
        empty.textContent = "No cookies selected yet.";
        summaryItems.append(empty);
    } else {
        selected.forEach((item) => {
            const line = document.createElement("div");
            line.className = "summary-line";
            line.innerHTML = `<span>${item.quantity} x ${item.name}</span><strong>${currency.format(item.subtotal)}</strong>`;
            summaryItems.append(line);
        });
    }

    if (selected.length > 0) {
        const subtotalLine = document.createElement("div");
        subtotalLine.className = "summary-line";
        subtotalLine.innerHTML = `<span>Subtotal</span><strong>${currency.format(totals.subtotal)}</strong>`;
        summaryItems.append(subtotalLine);

        if (totals.discount > 0) {
            const discountLine = document.createElement("div");
            discountLine.className = "summary-line discount-line";
            discountLine.innerHTML = `<span>Descuento 10%</span><strong>-${currency.format(totals.discount)}</strong>`;
            summaryItems.append(discountLine);
        }
    }

    summaryTotal.textContent = currency.format(totals.total);

    if (selected.length > 0 && !exceedsOrderLimit && !exceedsWeeklyLimit) {
        orderLimitMessage.textContent = `Disponibles esta semana: ${availableCookies} cookies. Maximo por pedido: ${ORDER_COOKIE_LIMIT}.`;
        orderLimitMessage.classList.add("is-ok");
    }

    if (exceedsOrderLimit) {
        orderLimitMessage.textContent = `El maximo por pedido es ${ORDER_COOKIE_LIMIT} cookies.`;
        orderLimitMessage.classList.add("is-warning");
    } else if (exceedsWeeklyLimit) {
        orderLimitMessage.textContent = `Quedan ${availableCookies} cookies disponibles esta semana.`;
        orderLimitMessage.classList.add("is-warning");
    }

    orderButton.hidden = selected.length === 0 || exceedsOrderLimit || exceedsWeeklyLimit;
    saveOrderDraft();
}

cards.forEach((card) => {
    const input = card.querySelector(".quantity-input");
    input.addEventListener("input", updateSummary);
    input.addEventListener("change", updateSummary);
});

pickupForm.addEventListener("input", (event) => {
    if (event.target.name === "phone" || event.target === document.querySelector('[name="phone"]')) {
        formatPhoneInput(event.target);
    }

    saveOrderDraft();
});

pickupForm.addEventListener("change", saveOrderDraft);

orderButton.addEventListener("click", () => {
    if (!pickupForm.reportValidity()) {
        return;
    }

    const selected = getSelectedItems();
    const totals = calculateOrderTotals(selected);
    const availableCookies = getAvailableCookiesForDraft();

    if (totals.itemCount > ORDER_COOKIE_LIMIT) {
        orderLimitMessage.textContent = `El maximo por pedido es ${ORDER_COOKIE_LIMIT} cookies.`;
        orderLimitMessage.classList.add("is-warning");
        return;
    }

    if (totals.itemCount > availableCookies) {
        orderLimitMessage.textContent = `Quedan ${availableCookies} cookies disponibles esta semana.`;
        orderLimitMessage.classList.add("is-warning");
        return;
    }

    const orderData = {
        items: selected,
        itemCount: totals.itemCount,
        subtotal: totals.subtotal,
        discount: totals.discount,
        total: totals.total,
        name: document.querySelector('[name="name"]').value,
        phone: `+54 9 ${document.querySelector('[name="phone"]').value}`,
        email: document.querySelector('[name="email"]').value,
        pickup: document.querySelector('[name="pickup"]').value
    };

    reserveWeeklyCookies(totals.itemCount);
    saveOrderDraft();
    const encodedOrder = encodeURIComponent(JSON.stringify(orderData));
    window.location.href = `pedido.html?order=${encodedOrder}`;
});

restoreOrderDraft();
updateSummary();
