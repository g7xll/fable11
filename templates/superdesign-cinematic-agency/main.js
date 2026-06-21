// ============ PRICE CALCULATOR ============
const slider = document.getElementById("slider");
const priceEl = document.getElementById("price");
const perEl = document.getElementById("per");
const subEl = document.getElementById("priceSub");
const segs = document.querySelectorAll(".seg");

let mode = "monthly"; // 'monthly' | 'yearly'

// $0.28 per 1K events after the first 1M free. value is in millions of events.
function computePrice(millions) {
	const billable = Math.max(0, millions - 1); // first 1M free
	const events1k = billable * 1000; // thousands of events
	let monthly = events1k * 0.28;
	// floor for display parity with reference baseline
	if (millions <= 1)
		monthly = 125; // base Growth seat starts at $125
	else monthly = 125 + monthly;
	return monthly;
}

function fmt(n) {
	return "$" + Math.round(n).toLocaleString("en-US");
}

function render() {
	const millions = parseFloat(slider.value);
	let monthly = computePrice(millions);

	if (mode === "yearly") {
		const yearly = monthly * 12 * 0.8; // 20% annual discount
		priceEl.textContent = fmt(yearly);
		perEl.textContent = "/ year";
	} else {
		priceEl.textContent = fmt(monthly);
		perEl.textContent = "/ month";
	}

	const billable = Math.max(0, millions - 1);
	const per1k = billable === 0 ? 0 : 0.28;
	subEl.textContent = "$" + per1k.toFixed(2) + " per 1K events";

	// fill track left of thumb with purple
	const pct = ((millions - 1) / (20 - 1)) * 100;
	slider.style.background = `linear-gradient(to right, #7C3AED ${pct}%, #374151 ${pct}%)`;
}

slider.addEventListener("input", render);

segs.forEach((seg) => {
	seg.addEventListener("click", () => {
		segs.forEach((s) => s.classList.remove("active"));
		seg.classList.add("active");
		mode = seg.dataset.mode;
		render();
	});
});

render();

// ============ NAV: subtle shrink on scroll ============
const nav = document.getElementById("nav");
window.addEventListener(
	"scroll",
	() => {
		nav.style.padding = window.scrollY > 40 ? "1rem 2rem" : "1.5rem 2rem";
	},
	{ passive: true },
);
