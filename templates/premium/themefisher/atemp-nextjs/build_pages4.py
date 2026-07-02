#!/usr/bin/env python3
from build import page, write

INTEGRATIONS = [
    ("mailchimp", "Mailchimp", "assets/images/svg/brands/mailchimp.svg", "Sync your subscriber lists and trigger campaigns automatically from Atemp."),
    ("airtable", "Airtable", "assets/images/svg/brands/airtable.svg", "Push your analytics data straight into Airtable bases for custom reporting."),
    ("discord", "Discord", "assets/images/svg/brands/discord.svg", "Get real-time alerts and engagement summaries posted to your Discord server."),
    ("gmail", "Gmail", "assets/images/svg/brands/gmail.svg", "Send weekly performance digests straight to your team's inbox."),
    ("google-meet", "Google Meet", "assets/images/svg/brands/google-meet.svg", "Auto-generate meeting briefs from your latest campaign performance."),
    ("slack", "Slack", "assets/images/svg/brands/slack.svg", "Drop daily and weekly growth reports directly into any Slack channel."),
    ("stripe", "Stripe", "assets/images/svg/brands/stripe.svg", "Correlate revenue events with campaign performance in one dashboard."),
    ("zoom", "Zoom", "assets/images/svg/brands/zoom.svg", "Share live dashboards during stand-ups and client calls in Zoom."),
]

def integration_card(slug, name, icon, blurb):
    return f"""<div class="card integration-card" data-aos>
      <img src="assets/images/svg/brands/{slug}.svg" alt="{name} logo">
      <div><h3 style="margin-bottom:6px">{name}</h3><p style="margin:0;color:var(--color-muted);font-size:14px">{blurb}</p></div>
    </div>"""

cards = "\n".join(integration_card(s, n, i, b) for s, n, i, b in INTEGRATIONS)
index_body = f"""
<section class="page-header"><div class="container"><div class="breadcrumb"><a href="index.html">Home</a> / Integration</div><h1>Seamless Integration With All Your Favorite Tools</h1></div></section>
<section class="section">
  <div class="container">
    <div class="grid grid-2">
      {"".join(f'''<a href="integration/{s}.html" style="display:block">{integration_card(s,n,i,b)}</a>''' for s,n,i,b in INTEGRATIONS)}
    </div>
  </div>
</section>
"""
write("integration.html", page("Integrations - Atemp", "Connect Atemp with all your favorite tools.", index_body, "", "integration"))

def detail_body(slug, name, icon, blurb):
    others = [x for x in INTEGRATIONS if x[0] != slug][:3]
    related = "\n".join(f'<a href="{s}.html" style="display:block">{integration_card(s,n,i,b)}</a>' for s, n, i, b in others)
    return f"""
<section class="page-header"><div class="container"><div class="breadcrumb"><a href="../index.html">Home</a> / <a href="../integration.html">Integration</a> / {name}</div><h1>{name} Integration</h1></div></section>
<section class="section">
  <div class="container" style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center">
    <div data-aos>
      <img src="../assets/images/svg/brands/{slug}.svg" alt="{name} logo" style="width:64px;height:64px;margin-bottom:20px">
      <h2>Connect Atemp With {name}</h2>
      <p>{blurb}</p>
      <a href="../contact.html" class="btn btn-primary">Connect {name}</a>
    </div>
    <img data-aos src="../assets/images/chrome-images.png" alt="{name} integration preview" style="border-radius:16px">
  </div>
</section>
<section class="section alt">
  <div class="container">
    <div class="section-head" data-aos><h2>What You Get</h2></div>
    <div class="grid grid-3">
      <div class="card" data-aos><div class="icon-badge"><img src="../assets/images/svg/icons/workflow.svg" alt=""></div><h3>Automated Sync</h3><p>Data flows between Atemp and {name} automatically, no manual exports.</p></div>
      <div class="card" data-aos><div class="icon-badge"><img src="../assets/images/svg/icons/tag.svg" alt=""></div><h3>Custom Triggers</h3><p>Set up rules so the right people get notified at the right time.</p></div>
      <div class="card" data-aos><div class="icon-badge"><img src="../assets/images/svg/icons/message.svg" alt=""></div><h3>Two-Way Updates</h3><p>Changes in {name} reflect back in your Atemp dashboard instantly.</p></div>
    </div>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="section-head" data-aos><h2>Related Integrations</h2></div>
    <div class="grid grid-3">{related}</div>
  </div>
</section>
"""

for slug, name, icon, blurb in INTEGRATIONS:
    write(f"integration/{slug}.html", page(f"{name} Integration - Atemp", f"Connect Atemp with {name}.", detail_body(slug, name, icon, blurb), "../", "integration"))

print("integration pages done")
