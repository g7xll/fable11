// Article detail content. Each block: {t:'p'|'h3'|'lead'|'quote'|'ul'|'code', ...}
window.ARTICLE_DETAIL = {
	"scaling-side-project": {
		title: "Scaling a side project to 10k users",
		blocks: [
			{
				t: "lead",
				v: "What started as a weekend idea slowly turned into a product used by thousands. Here's what I learned along the way.",
			},
			{
				t: "p",
				v: "The first version was embarrassingly simple — a single page app with a JSON file as a database. I deployed it on a free tier and shared it with a few friends. That was supposed to be the end of it.",
			},
			{
				t: "p",
				v: 'But then it got picked up on Twitter. And suddenly, my "weekend project" had real users with real expectations.',
			},
			{ t: "h3", v: "The First 100 Users" },
			{
				t: "p",
				v: "The first hundred users were easy. They were patient, forgiving, and mostly just curious. They sent feedback, reported bugs, and stuck around even when things broke.",
			},
			{ t: "p", v: "At this stage, I made one critical decision:" },
			{ t: "quote", v: "I listened more than I built." },
			{
				t: "p",
				v: "Instead of adding features I thought were cool, I focused on what users actually needed. A simpler onboarding. Faster load times. Better error messages. Small things that made a big difference.",
			},
			{
				t: "code",
				v: [
					{ cm: '// My first "analytics" — just logging to console' },
					{
						code: "window.<span class='fn'>addEventListener</span>(<span class='str'>'error'</span>, (e) <span class='kw'>=></span> {",
					},
					{
						code: "  console.<span class='fn'>log</span>(<span class='str'>'User hit an error:'</span>, e.message);",
					},
					{ code: "});" },
					{ cm: "// Later replaced with proper error tracking" },
				],
			},
			{ t: "h3", v: "The 1,000 User Problem" },
			{
				t: "p",
				v: "At around 1,000 users, everything started to break. The JSON file approach wasn't cutting it anymore. Response times climbed. The free tier hit its limits.",
			},
			{ t: "p", v: "I had to make real infrastructure decisions:" },
			{
				t: "ul",
				v: [
					"<strong>Database:</strong> Moved from JSON to PostgreSQL",
					"<strong>Hosting:</strong> Upgraded to a paid tier with auto-scaling",
					"<strong>Caching:</strong> Added Redis for frequently accessed data",
					"<strong>Monitoring:</strong> Set up alerts for downtime and slow queries",
				],
			},
			{
				t: "p",
				v: "The hardest part wasn't the technical migration — it was doing it without disrupting existing users. I learned to deploy changes incrementally, always with a rollback plan.",
			},
			{ t: "h3", v: "What 10,000 Users Taught Me" },
			{
				t: "p",
				v: "Reaching 10k users changed my perspective entirely. At this scale, you stop thinking about features and start thinking about systems.",
			},
			{
				t: "ul",
				v: [
					"<strong>Reliability matters more than novelty.</strong> Users don't care about your new feature if the app is down.",
					"<strong>Performance is a feature.</strong> Every 100ms of latency costs you engagement.",
					"<strong>Documentation saves time.</strong> When others join, they need to understand your decisions.",
					"<strong>Automation is essential.</strong> Manual deployments don't scale. CI/CD pipelines do.",
				],
			},
			{ t: "h3", v: "The Unexpected Challenges" },
			{ t: "p", v: "Some things surprised me:" },
			{
				t: "ul",
				v: [
					"<strong>Support requests multiply fast.</strong> Even a 1% issue rate means 100 tickets at 10k users.",
					"<strong>Edge cases become common cases.</strong> That bug you ignored? Someone will find it daily.",
					"<strong>People will use your product in ways you never imagined.</strong> Build for flexibility.",
				],
			},
			{ t: "h3", v: "Looking Back" },
			{
				t: "p",
				v: "Scaling from 0 to 10k wasn't about being clever — it was about being consistent. Showing up every day, fixing bugs, listening to feedback, and making incremental improvements.",
			},
			{
				t: "p",
				v: "The weekend project is now a real product. And the biggest lesson? <strong>Start simple, but build foundations that can grow.</strong>",
			},
			{
				t: "p",
				v: "If you're working on something small right now, don't over-engineer it — but don't ignore the future either. The best time to think about scale is before you need it.",
			},
		],
		related: ["vanilla-javascript", "thinking-in-components", null],
	},
	"vanilla-javascript": {
		title: "Why I still love writing vanilla JavaScript",
		blocks: [
			{
				t: "lead",
				v: "There's something deeply satisfying about writing plain JavaScript — no build tools, no dependencies, just a <code>&lt;script&gt;</code> tag and an idea.",
			},
			{
				t: "p",
				v: "In an age of complex frameworks and bundlers, it feels refreshing to open a blank file and start typing logic that runs everywhere. Vanilla JS reminds me why I started coding in the first place: to make things move, react, and feel alive on a screen.",
			},
			{
				t: "p",
				v: "When you work without abstractions, you're forced to really understand what's happening — the DOM, events, timing, scope. Every click handler or API call becomes a direct conversation with the browser. It sharpens your intuition for how the web actually works.",
			},
			{
				t: "p",
				v: "Here's a simple example I always come back to — no React, no frameworks, just JavaScript doing what it does best:",
			},
			{
				t: "code",
				v: [
					{
						code: "<span class='kw'>const</span> button = document.<span class='fn'>querySelector</span>(<span class='str'>'#btn'</span>);",
					},
					{
						code: "<span class='kw'>const</span> counter = document.<span class='fn'>querySelector</span>(<span class='str'>'#count'</span>);",
					},
					{ code: "<span class='kw'>let</span> count = 0;" },
					{ code: "" },
					{
						code: "button.<span class='fn'>addEventListener</span>(<span class='str'>'click'</span>, () <span class='kw'>=></span> {",
					},
					{ code: "  count++;" },
					{ code: "  counter.textContent = count;" },
					{ code: "});" },
				],
			},
			{ t: "h3", v: "Simplicity Is a Superpower" },
			{
				t: "p",
				v: "There's freedom in knowing that the code you write today will still run a decade from now. No deprecated APIs, no breaking changes, no migration guides. Just the platform, doing what it was designed to do.",
			},
			{
				t: "p",
				v: "Frameworks are wonderful tools — I use them every day. But every so often, I like to return to the basics. To remember that beneath all the layers, it's still just the browser and me.",
			},
			{ t: "quote", v: "Sometimes the best tool is no tool at all." },
			{
				t: "p",
				v: "So the next time you reach for a library, ask yourself: do I really need it? Or can I just write a few lines of JavaScript instead?",
			},
		],
		related: ["scaling-side-project", "thinking-in-components", null],
	},
	"thinking-in-components": {
		title: "Thinking in components",
		blocks: [
			{
				t: "lead",
				v: "Building modern interfaces isn't about pages anymore — it's about systems. Once you start thinking in components, everything changes.",
			},
			{
				t: "p",
				v: "I remember the first time it clicked for me. I was staring at a complex dashboard, trying to figure out why a small change broke three different sections. The code was tangled — styles leaked everywhere, logic was duplicated, and updating one thing meant hunting through dozens of files.",
			},
			{
				t: "p",
				v: "Then I rebuilt it as components. Suddenly, the chaos had structure.",
			},
			{ t: "h3", v: "What Is a Component, Really?" },
			{
				t: "p",
				v: "A component is a self-contained piece of UI that manages its own logic, styles, and state. It's like a LEGO brick — simple on its own, but powerful when combined with others.",
			},
			{
				t: "code",
				v: [
					{
						code: "<span class='kw'>function</span> <span class='fn'>Button</span>({ children, onClick, variant = <span class='str'>'primary'</span> }) {",
					},
					{ code: "  <span class='kw'>return</span> (" },
					{
						code: "    &lt;button className={`btn btn-${variant}`} onClick={onClick}&gt;",
					},
					{ code: "      {children}" },
					{ code: "    &lt;/button&gt;" },
					{ code: "  );" },
					{ code: "}" },
				],
			},
			{
				t: "p",
				v: "This button doesn't care where it lives. It works in a modal, a form, or a navbar — anywhere. That's the magic of composition.",
			},
			{ t: "h3", v: "Systems, Not Screens" },
			{
				t: "p",
				v: "When you think in components, you stop designing screens and start designing systems. A button isn't a one-off — it's a reusable primitive. A card becomes a pattern. Consistency emerges naturally because everything shares the same building blocks.",
			},
			{
				t: "quote",
				v: "Good components make the right thing easy and the wrong thing hard.",
			},
			{
				t: "p",
				v: "Once you get it, you'll never build the same way again. You'll see interfaces as compositions — small, focused pieces working together to create something greater than the sum of their parts.",
			},
		],
		related: ["scaling-side-project", "vanilla-javascript", null],
	},
};

document.addEventListener("DOMContentLoaded", () => {
	const slug = document.body.dataset.slug;
	const a = window.ARTICLE_DETAIL[slug];
	if (!a) return;
	document.getElementById("a-title").textContent = a.title;
	document.title = a.title + " — Echo";

	const render = (b) => {
		switch (b.t) {
			case "lead":
				return `<p class="lead">${b.v}</p>`;
			case "p":
				return `<p>${b.v}</p>`;
			case "h3":
				return `<h3>${b.v}</h3>`;
			case "quote":
				return `<blockquote>${b.v}</blockquote>`;
			case "ul":
				return `<ul>${b.v.map((li) => `<li>${li}</li>`).join("")}</ul>`;
			case "code":
				return `<pre class="code-block"><code>${b.v
					.map((line) =>
						line.cm ? `<span class="cm">${line.cm}</span>` : line.code,
					)
					.join("\n")}</code></pre>`;
			default:
				return "";
		}
	};
	document.getElementById("a-body").innerHTML = a.blocks.map(render).join("");

	// related articles = the other 3 articles (different from current)
	const rel = window.DATA.articles.filter((x) => x.slug !== slug);
	// build write rows manually (one folder deep)
	const P = window.assetPrefix;
	const I = window.ICONS;
	const rowHTML = (x) => {
		const link = x.slug
			? P + "articles/" + x.slug + ".html"
			: "javascript:void(0)";
		const tag = x.slug ? "a" : "div";
		return `<${tag} class="write-row" ${x.slug ? `href="${link}"` : ""}>
      <div><div class="wr-title">${x.title}</div><div class="wr-excerpt">${x.excerpt}</div><div class="wr-date">${x.date}</div></div>
      <span class="wr-arrow">${I.arrow}</span></${tag}>`;
	};
	document.getElementById("a-related").innerHTML = rel.map(rowHTML).join("");
});
