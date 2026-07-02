#!/usr/bin/env python3
from build import page, write

# ------------------------------------------------------------ FEATURES ----
features_body = """
<section class="page-header"><div class="container"><div class="breadcrumb"><a href="index.html">Home</a> / Features</div><h1>Everything You Need To Grow Your Social Media</h1></div></section>
<section class="section">
  <div class="container">
    <div class="grid grid-3">
      <div class="card" data-aos><div class="icon-badge"><img src="assets/images/svg/icons/audience.svg" alt=""></div><h3>Audience Insights</h3><p>Understand who engages with your content and when they're most active.</p></div>
      <div class="card" data-aos><div class="icon-badge"><img src="assets/images/svg/icons/workflow.svg" alt=""></div><h3>Workflow Automation</h3><p>Automate repetitive reporting tasks and save 12+ hours every week.</p></div>
      <div class="card" data-aos><div class="icon-badge"><img src="assets/images/svg/icons/write.svg" alt=""></div><h3>Content Planning</h3><p>Plan, schedule and publish content across every channel from one place.</p></div>
      <div class="card" data-aos><div class="icon-badge"><img src="assets/images/svg/icons/tag.svg" alt=""></div><h3>Custom Tagging</h3><p>Organize campaigns and creatives with flexible tags and filters.</p></div>
      <div class="card" data-aos><div class="icon-badge"><img src="assets/images/svg/icons/message.svg" alt=""></div><h3>Unified Inbox</h3><p>Reply to comments and DMs across every platform without switching tabs.</p></div>
      <div class="card" data-aos><div class="icon-badge"><img src="assets/images/svg/icons/pricing.svg" alt=""></div><h3>Budget Tracking</h3><p>Track ad spend and ROI in real time alongside organic performance.</p></div>
    </div>
  </div>
</section>
<section class="section alt">
  <div class="container" style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center">
    <div data-aos><div class="eyebrow">Deep Dive</div><h2>Improve Your Workflow, Save 12+ Hours Every Week</h2><p>Stop wasting time creating reports manually. Juggling between 8 tools to manage your social media speed up tools.</p></div>
    <img data-aos src="assets/images/features/follower-growth.png" alt="Follower growth" style="border-radius:16px">
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="cta-band" data-aos style="display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:center">
      <div><div class="eyebrow" style="color:var(--color-accent)">Your Call To Action Here</div><h2>Build &amp; Launch Without Problems</h2><div class="hero-actions"><a href="pricing.html" class="btn btn-primary">Get Started Now</a><a href="contact.html" class="btn btn-outline" style="color:#fff;border-color:rgba(255,255,255,.3)">Contact Sales</a></div></div>
      <img src="assets/images/call-to-action.png" alt="Dashboard mockup" style="border-radius:16px">
    </div>
  </div>
</section>
"""
write("features.html", page("Features - Atemp", "Explore every feature of the Atemp SaaS multipurpose template.", features_body, "", "features"))

# ------------------------------------------------------------- ELEMENTS ---
elements_body = """
<section class="page-header"><div class="container"><div class="breadcrumb"><a href="index.html">Home</a> / Elements</div><h1>Elements &amp; Components</h1></div></section>
<section class="section">
  <div class="container">
    <div class="section-head" data-aos><h2>Typography</h2></div>
    <div data-aos style="margin-bottom:48px">
      <h1>Heading One</h1><h2>Heading Two</h2><h3>Heading Three</h3>
      <p>Body paragraph text set in Montserrat — the quick brown fox jumps over the lazy dog.</p>
    </div>
    <div class="section-head" data-aos><h2>Buttons</h2></div>
    <div data-aos style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:48px">
      <a href="#" class="btn btn-primary">Primary Button</a>
      <a href="#" class="btn btn-outline">Outline Button</a>
      <a href="#" class="btn btn-dark">Dark Button</a>
    </div>
    <div class="section-head" data-aos><h2>Color Palette</h2></div>
    <div data-aos style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:48px">
      <div style="width:100px"><div style="height:60px;border-radius:12px;background:var(--color-accent)"></div><small>Accent</small></div>
      <div style="width:100px"><div style="height:60px;border-radius:12px;background:var(--color-navy)"></div><small>Navy</small></div>
      <div style="width:100px"><div style="height:60px;border-radius:12px;background:var(--color-surface);border:1px solid var(--color-border)"></div><small>Surface</small></div>
      <div style="width:100px"><div style="height:60px;border-radius:12px;background:var(--color-muted)"></div><small>Muted</small></div>
    </div>
    <div class="section-head" data-aos><h2>Cards</h2></div>
    <div class="grid grid-3" data-aos>
      <div class="card"><h3>Card Title</h3><p>Card supporting copy goes here.</p></div>
      <div class="card"><h3>Card Title</h3><p>Card supporting copy goes here.</p></div>
      <div class="card"><h3>Card Title</h3><p>Card supporting copy goes here.</p></div>
    </div>
    <div class="section-head" data-aos style="margin-top:48px"><h2>Form Elements</h2></div>
    <form onsubmit="return false" data-aos style="max-width:480px">
      <div style="margin-bottom:16px"><label style="display:block;margin-bottom:8px;font-weight:600">Text input</label><input type="text" placeholder="Placeholder" style="width:100%;padding:12px 16px;border-radius:10px;border:1px solid var(--color-border);background:var(--color-card);color:var(--color-text)"></div>
      <div style="margin-bottom:16px"><label style="display:block;margin-bottom:8px;font-weight:600">Message</label><textarea placeholder="Your message" rows="4" style="width:100%;padding:12px 16px;border-radius:10px;border:1px solid var(--color-border);background:var(--color-card);color:var(--color-text)"></textarea></div>
      <button class="btn btn-primary" type="submit">Submit</button>
    </form>
  </div>
</section>
"""
write("elements.html", page("Elements - Atemp", "UI kit and component reference for the Atemp template.", elements_body, "", "elements"))

# --------------------------------------------------------------- CAREER ---
def job(title, dept, loc):
    return f"""<div class="card" data-aos style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div><h3 style="margin-bottom:6px">{title}</h3><span style="color:var(--color-muted);font-size:14px">{dept} · {loc}</span></div>
      <a href="contact.html" class="btn btn-outline btn-sm">Apply Now</a>
    </div>"""

career_body = f"""
<section class="page-header"><div class="container"><div class="breadcrumb"><a href="index.html">Home</a> / Career</div><h1>Join Our Growing Team</h1></div></section>
<section class="section">
  <div class="container" style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center">
    <div data-aos><div class="eyebrow">Why Work With Us</div><h2>We Are Like An Extension Of Your Career</h2><p>We're a distributed team building tools that help marketers make better decisions with data. Join us and help shape the future of social analytics.</p><a href="#openings" class="btn btn-primary">View Open Roles</a></div>
    <img data-aos src="assets/images/career-play-thumb.png" alt="Team culture" style="border-radius:16px">
  </div>
</section>
<section class="section alt" id="openings">
  <div class="container" style="max-width:800px">
    <div class="section-head" data-aos><div class="eyebrow" style="justify-content:center;display:flex">Open Positions</div><h2>Current Openings</h2></div>
    {job('Senior Product Designer','Design','Remote')}
    {job('Growth Marketing Manager','Marketing','Sydney, AU')}
    {job('Backend Engineer','Engineering','Remote')}
    {job('Customer Success Lead','Support','France')}
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="cta-band" data-aos style="display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:center">
      <div><div class="eyebrow" style="color:var(--color-accent)">Your Call To Action Here</div><h2>Build &amp; Launch Without Problems</h2><div class="hero-actions"><a href="pricing.html" class="btn btn-primary">Get Started Now</a><a href="contact.html" class="btn btn-outline" style="color:#fff;border-color:rgba(255,255,255,.3)">Contact Sales</a></div></div>
      <img src="assets/images/call-to-action.png" alt="Dashboard mockup" style="border-radius:16px">
    </div>
  </div>
</section>
"""
write("career.html", page("Career - Atemp", "Open positions and career opportunities at Atemp.", career_body, "", "career"))

# -------------------------------------------------------------- CONTACT ---
contact_body = """
<section class="page-header"><div class="container"><div class="breadcrumb"><a href="index.html">Home</a> / Contact</div><h1>Get In Touch With Us</h1></div></section>
<section class="section">
  <div class="container" style="display:grid;grid-template-columns:1fr 1fr;gap:48px">
    <div class="card" data-aos>
      <h3>Send Us A Message</h3>
      <form onsubmit="return false">
        <div style="margin-bottom:16px"><label style="display:block;margin-bottom:8px;font-weight:600">Full Name</label><input type="text" required placeholder="Your name" style="width:100%;padding:12px 16px;border-radius:10px;border:1px solid var(--color-border);background:var(--color-body);color:var(--color-text)"></div>
        <div style="margin-bottom:16px"><label style="display:block;margin-bottom:8px;font-weight:600">Email Address</label><input type="email" required placeholder="you@example.com" style="width:100%;padding:12px 16px;border-radius:10px;border:1px solid var(--color-border);background:var(--color-body);color:var(--color-text)"></div>
        <div style="margin-bottom:16px"><label style="display:block;margin-bottom:8px;font-weight:600">Subject</label><input type="text" placeholder="Subject" style="width:100%;padding:12px 16px;border-radius:10px;border:1px solid var(--color-border);background:var(--color-body);color:var(--color-text)"></div>
        <div style="margin-bottom:16px"><label style="display:block;margin-bottom:8px;font-weight:600">Message</label><textarea rows="5" placeholder="Your message" style="width:100%;padding:12px 16px;border-radius:10px;border:1px solid var(--color-border);background:var(--color-body);color:var(--color-text)"></textarea></div>
        <button class="btn btn-primary" type="submit" style="width:100%">Send Message</button>
      </form>
    </div>
    <div style="display:flex;flex-direction:column;gap:24px">
      <div class="card" data-aos><h3>Sydney Office</h3><p>380 George Street, Sydney NSW 2000<br>+61 2 9200 6009<br>sydney@atemp.com</p><img src="assets/images/google-building.png" alt="Sydney office" style="border-radius:14px;margin-top:12px"></div>
      <div class="card" data-aos><h3>France Office</h3><p>65 rue Ernest Renan, Chatillon 92320<br>+33 4 22 09 99<br>france@atemp.com</p><img src="assets/images/google-phone.png" alt="France office" style="border-radius:14px;margin-top:12px"></div>
    </div>
  </div>
</section>
"""
write("contact.html", page("Contact - Atemp", "Get in touch with the Atemp team.", contact_body, "", "contact"))

# ------------------------------------------------------ TERMS & CONDITIONS
terms_body = """
<section class="page-header"><div class="container"><div class="breadcrumb"><a href="index.html">Home</a> / Terms &amp; Conditions</div><h1>Terms &amp; Conditions</h1></div></section>
<section class="section">
  <div class="container" style="max-width:820px">
    <article class="prose" data-aos>
      <p>Last updated: January 2026. Please read these terms and conditions carefully before using the Atemp template or associated services.</p>
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing this template and its demo content you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the service.</p>
      <h2>2. License</h2>
      <p>Unless otherwise stated, Atemp and its licensors own the intellectual property rights for all material within this template. You are granted a limited license only for viewing the material.</p>
      <h2>3. User Content</h2>
      <p>You retain ownership of any content you submit, post or display through the service, but you grant us a license to use, reproduce and distribute that content.</p>
      <h2>4. Limitation of Liability</h2>
      <p>In no event shall Atemp or its suppliers be liable for any damages arising out of the use or inability to use the materials, even if notified of the possibility of such damage.</p>
      <h2>5. Governing Law</h2>
      <p>Any claim relating to this template shall be governed by the laws of the jurisdiction in which the company is registered, without regard to conflict of law provisions.</p>
      <h2>6. Changes</h2>
      <p>We reserve the right to revise these terms at any time. By using this template you agree to be bound by the current version.</p>
    </article>
  </div>
</section>
"""
write("terms-conditions.html", page("Terms & Conditions - Atemp", "Terms and conditions for using the Atemp template.", terms_body, "", "terms"))

print("secondary pages done")
