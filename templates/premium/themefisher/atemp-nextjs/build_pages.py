#!/usr/bin/env python3
from build import page, write

# ---------------------------------------------------------------- HOME -----
home_body = """
<section class="hero">
  <img class="hero-shape" src="assets/images/svg/shapes/hero-shape-1.svg" style="top:-40px;right:60px;width:120px" alt="">
  <div class="container">
    <div data-aos>
      <div class="eyebrow">Welcome to Atemp</div>
      <h1>Bring Your Ideas To Life With Atemp - SaaS Multipurpose Template</h1>
      <p class="lead">Make better business decisions with a single, all-in-one platform that helps you plan, engage, and analyse easily.</p>
      <div class="hero-actions">
        <a href="pricing.html" class="btn btn-primary">Get Started Now</a>
        <a href="contact.html" class="btn btn-outline">Contact Sales</a>
      </div>
    </div>
    <div class="hero-art" data-aos>
      <img src="assets/images/build-and-launch.png" alt="Atemp dashboard mockup" style="border-radius:20px">
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <p class="eyebrow" style="justify-content:center;display:flex" data-aos>See Our Client's</p>
    <div class="logo-strip" data-aos>
      <img src="assets/images/company/company-1.png" alt="Client logo">
      <img src="assets/images/company/company-2.png" alt="Client logo">
      <img src="assets/images/company/company-3.png" alt="Client logo">
      <img src="assets/images/company/company-4.png" alt="Client logo">
      <img src="assets/images/company/company-5.png" alt="Client logo">
      <img src="assets/images/company/company-6.png" alt="Client logo">
    </div>
  </div>
</section>

<section class="section alt">
  <div class="container">
    <div class="section-head" data-aos>
      <div class="eyebrow" style="justify-content:center;display:flex">Main Features Of Atemp</div>
      <h2>Manage Your Social Media Doesn't Have To Be Hard (Atemp!)</h2>
      <p>Make better business decisions with a single, all-in-one platform that helps you plan, engage, and analyze easily to manage your social media, speed up tools.</p>
    </div>
    <div class="grid grid-3">
      <div class="card" data-aos>
        <div class="icon-badge"><img src="assets/images/svg/icons/audience.svg" alt=""></div>
        <h3>Understand Audience And Engage Them Effective.</h3>
        <p>You are wasting time creating reports manually juggling between 8 tools to manage your social media generated research reports that matter.</p>
        <img src="assets/images/features/best-time-to-post.png" alt="Best time to post chart" style="border-radius:14px;margin-top:16px">
      </div>
      <div class="card" data-aos>
        <div class="icon-badge"><img src="assets/images/svg/icons/workflow.svg" alt=""></div>
        <h3>Improve Your Workflow Save 12+ Hours Every Week</h3>
        <p>You are wasting time creating reports manually juggling between 8 tools to manage your social media speed up tools.</p>
        <img src="assets/images/features/follower-growth.png" alt="Follower growth chart" style="border-radius:14px;margin-top:16px">
      </div>
      <div class="card" data-aos style="background:var(--color-navy);color:#fff">
        <div class="icon-badge" style="background:rgba(255,255,255,.12);color:#fff"><img src="assets/images/svg/icons/write.svg" alt=""></div>
        <h3 style="color:#fff">Know What Audio Wants From Content. With The Rights</h3>
        <p style="color:rgba(255,255,255,.7)">Make better business decisions with a single, all-in-one platform to manage your social media.</p>
        <a href="features.html" class="btn btn-white btn-sm" style="margin-top:12px">View All Features</a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container" style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center">
    <div class="grid" style="gap:20px" data-aos>
      <div class="card" style="display:flex;gap:16px;align-items:center">
        <div class="icon-badge" style="margin:0;background:rgba(110,226,114,.15);color:var(--color-accent-dark)">3.5k</div>
        <div><strong style="font-size:22px;color:var(--color-heading)">3,524</strong><br><span style="color:var(--color-muted);font-size:14px">Total campaigns run</span></div>
      </div>
      <div class="card" style="display:flex;gap:16px;align-items:center">
        <div class="icon-badge" style="margin:0;background:rgba(37,99,235,.15);color:var(--color-link)">1.2%</div>
        <div><strong style="font-size:22px;color:var(--color-heading)">1.24%</strong><br><span style="color:var(--color-muted);font-size:14px">Average engagement rate</span></div>
      </div>
      <div class="card" style="display:flex;gap:16px;align-items:center">
        <div class="icon-badge" style="margin:0">652</div>
        <div><strong style="font-size:22px;color:var(--color-heading)">652</strong><br><span style="color:var(--color-muted);font-size:14px">Daily interactions tracked</span></div>
      </div>
    </div>
    <div data-aos>
      <div class="eyebrow">About Atemp Template</div>
      <h2>Build &amp; Launch without problems</h2>
      <p>Make better business decisions with a single, all-in-one platform that helps you plan, engage, and analyze easily.</p>
      <ul class="plan-list">
        <li>Make better business decisions with a single, all-in-one</li>
        <li>Create a social media strategy that works</li>
        <li>The secret to your growth is data you're overlooking</li>
      </ul>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="container" style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center">
    <div data-aos>
      <div class="eyebrow">Why Like Atemp Even?</div>
      <h2>Improve your and target the right</h2>
      <p>The secret to your growth is in the data you're overlooking. Reach and impact with detailed reports on content marketing and customer engagement.</p>
    </div>
    <div class="card" data-aos style="display:flex;gap:16px">
      <div class="team-card"><img src="assets/images/profile-1.png" alt="Tom Aniston"><strong>Tom Aniston</strong><br><span style="color:var(--color-muted);font-size:13px">1,356 followers · 4.2K likes</span></div>
      <div class="team-card"><img src="assets/images/profile-2.png" alt="Jennifer Roger"><strong>Jennifer Roger</strong><br><span style="color:var(--color-muted);font-size:13px">125 followers · 4.2K likes</span></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head" data-aos>
      <div class="eyebrow" style="justify-content:center;display:flex">Strategy Works Together</div>
      <h2>Don't Let Your Media Be Just Hunches And Guess</h2>
    </div>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:32px" data-aos>
      <span class="tag-pill">Understand Audience</span>
      <span class="tag-pill">Easy-To-Use Planner</span>
      <span class="tag-pill">Understand Audience</span>
    </div>
    <div class="card" data-aos style="max-width:760px;margin:0 auto">
      <h3>Customer Andrew Achieved 12s ROI In The First Month!</h3>
      <p>The secret to your growth is in the data you're overlooking maximize reach and impact with detailed reports on content marketing and customer engagement across your performance channels through tonnes of data with custom generated.</p>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="container">
    <div class="section-head" data-aos>
      <div class="eyebrow" style="justify-content:center;display:flex">Strategy Works Together</div>
      <h2>Seamless Integration With All Your Favorite Tools</h2>
    </div>
    <div class="grid grid-4" data-aos>
      <div class="card" style="text-align:center"><img src="assets/images/integration/shopify.png" alt="Shopify" style="height:32px;margin:0 auto"></div>
      <div class="card" style="text-align:center"><img src="assets/images/integration/invision.png" alt="InVision" style="height:32px;margin:0 auto"></div>
      <div class="card" style="text-align:center"><img src="assets/images/integration/component.png" alt="Component" style="height:32px;margin:0 auto"></div>
      <div class="card" style="text-align:center"><img src="assets/images/integration/amazon.png" alt="Amazon" style="height:32px;margin:0 auto"></div>
      <div class="card" style="text-align:center"><img src="assets/images/integration/zaipar.png" alt="Zapier" style="height:32px;margin:0 auto"></div>
      <div class="card" style="text-align:center"><img src="assets/images/integration/onebox.png" alt="Onebox" style="height:32px;margin:0 auto"></div>
      <div class="card" style="text-align:center"><img src="assets/images/integration/woocommerce.png" alt="WooCommerce" style="height:32px;margin:0 auto"></div>
      <div class="card" style="text-align:center"><img src="assets/images/integration/corporent.png" alt="Corporent" style="height:32px;margin:0 auto"></div>
    </div>
    <div style="text-align:center;margin-top:32px" data-aos><a href="integration.html" class="btn btn-primary">All Integrated Software</a></div>
  </div>
</section>

<section class="section" id="pricing-teaser">
  <div class="container">
    <div class="section-head" data-aos>
      <div class="eyebrow" style="justify-content:center;display:flex">Choose Best Plan For You</div>
      <h2>Try Atemp For Free Now</h2>
    </div>
    <div class="tab-toggle" style="display:flex;justify-content:center;margin-left:auto;margin-right:auto;width:max-content" data-aos>
      <button class="active" data-tab="monthly">Monthly Plan</button>
      <button data-tab="yearly">Yearly Plan</button>
    </div>
    <div class="pricing-tab-panel grid grid-3 active" data-panel="monthly">
      <div class="card" data-aos><span class="tag-pill">Perfect For Standard</span><h3>Professional</h3><div class="price-amount">$50<span>/Month</span></div><ul class="plan-list"><li>Only for 1 team</li><li>5 Projects</li><li>10 GB Storage</li><li>5 Projects</li><li>24/7 Support</li></ul><a href="pricing.html" class="btn btn-primary btn-sm" style="width:100%">Get Started Now</a></div>
      <div class="card" data-aos style="border:2px solid var(--color-accent)"><span class="tag-pill">Perfect For Business</span><h3>Professional</h3><div class="price-amount">$64<span>/Month</span></div><ul class="plan-list"><li>Only for 1 team</li><li>5 Projects</li><li>10 Projects</li><li>10 Projects</li><li>24/7 Support</li></ul><a href="pricing.html" class="btn btn-primary btn-sm" style="width:100%">Get Started Now</a></div>
      <div class="card" data-aos><span class="tag-pill">Perfect For Enterprise</span><h3>Enterprize</h3><div class="price-amount">$79<span>/Month</span></div><ul class="plan-list"><li>Only for 1 team</li><li>5 Projects</li><li>5 Projects</li><li>5 Projects</li><li>24/7 Support</li></ul><a href="pricing.html" class="btn btn-primary btn-sm" style="width:100%">Get Started Now</a></div>
    </div>
    <div class="pricing-tab-panel grid grid-3" data-panel="yearly">
      <div class="card" data-aos><span class="tag-pill">Perfect For Standard</span><h3>Professional</h3><div class="price-amount">$500<span>/Year</span></div><ul class="plan-list"><li>Only for 1 team</li><li>5 Projects</li><li>10 GB Storage</li><li>5 Projects</li><li>24/7 Support</li></ul><a href="pricing.html" class="btn btn-primary btn-sm" style="width:100%">Get Started Now</a></div>
      <div class="card" data-aos style="border:2px solid var(--color-accent)"><span class="tag-pill">Perfect For Business</span><h3>Professional</h3><div class="price-amount">$640<span>/Year</span></div><ul class="plan-list"><li>Only for 1 team</li><li>5 Projects</li><li>10 Projects</li><li>10 Projects</li><li>24/7 Support</li></ul><a href="pricing.html" class="btn btn-primary btn-sm" style="width:100%">Get Started Now</a></div>
      <div class="card" data-aos><span class="tag-pill">Perfect For Enterprise</span><h3>Enterprize</h3><div class="price-amount">$790<span>/Year</span></div><ul class="plan-list"><li>Only for 1 team</li><li>5 Projects</li><li>5 Projects</li><li>5 Projects</li><li>24/7 Support</li></ul><a href="pricing.html" class="btn btn-primary btn-sm" style="width:100%">Get Started Now</a></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="cta-band" data-aos style="display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:center">
      <div>
        <div class="eyebrow" style="color:var(--color-accent)">Your Call To Action Here</div>
        <h2>Build &amp; Launch Without Problems</h2>
        <div class="hero-actions">
          <a href="pricing.html" class="btn btn-primary">Get Started Now</a>
          <a href="contact.html" class="btn btn-outline" style="color:#fff;border-color:rgba(255,255,255,.3)">Contact Sales</a>
        </div>
      </div>
      <img src="assets/images/call-to-action.png" alt="Dashboard mockup" style="border-radius:16px">
    </div>
  </div>
</section>
"""
write("index.html", page("Atemp - SaaS Multipurpose Next.js Template", "Bring your ideas to life with Atemp, a SaaS multipurpose marketing template.", home_body, "", "home"))

# --------------------------------------------------------------- ABOUT -----
about_body = """
<section class="page-header"><div class="container"><div class="breadcrumb"><a href="index.html">Home</a> / About Us</div><h1>A Dedicated Team Of Marketing Experts</h1></div></section>
<section class="section">
  <div class="container" style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center">
    <img src="assets/images/about-banner.png" alt="Office desk" style="border-radius:20px" data-aos>
    <div data-aos>
      <p class="lead">Make better business decisions with a single, all-in-one platform that helps you plan, engage, and analyse easily juggling to between 8 tools to manage your social media, speed up collect.</p>
      <div class="hero-actions"><a href="career.html" class="btn btn-primary">Join Our Team</a><a href="contact.html" class="btn btn-outline">Learn More Details</a></div>
    </div>
  </div>
</section>
<section class="section alt">
  <div class="container grid grid-4" style="text-align:center">
    <div data-aos><h2 style="font-size:36px">94%</h2><p style="color:var(--color-muted)">Client Retention</p></div>
    <div data-aos><h2 style="font-size:36px">70M+</h2><p style="color:var(--color-muted)">Emails Per Month</p></div>
    <div data-aos><h2 style="font-size:36px">10K+</h2><p style="color:var(--color-muted)">Monthly Campaigns</p></div>
    <div data-aos><h2 style="font-size:36px">500+</h2><p style="color:var(--color-muted)">Regular Clients</p></div>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="section-head" data-aos><div class="eyebrow" style="justify-content:center;display:flex">Why You Should Join Us?</div><h2>We Are Like An Extension Of Your Marketing Team</h2></div>
    <div class="grid grid-3">
      <div class="card" data-aos style="text-align:center"><div class="icon-badge" style="margin:0 auto 16px"><img src="assets/images/svg/icons/account.svg" alt=""></div><h3>Accountability</h3><p>Stop wasting time creating reports and juggling multiple tools. We can manage your social media effectively.</p></div>
      <div class="card" data-aos style="text-align:center"><div class="icon-badge" style="margin:0 auto 16px"><img src="assets/images/svg/icons/circle-dots.svg" alt=""></div><h3>Commitment</h3><p>Stop wasting time creating reports and juggling multiple tools. We can manage your social media effectively.</p></div>
      <div class="card" data-aos style="text-align:center"><div class="icon-badge" style="margin:0 auto 16px"><img src="assets/images/svg/icons/audience.svg" alt=""></div><h3>Teamwork</h3><p>Stop wasting time creating reports and juggling multiple tools. We can manage your social media effectively.</p></div>
      <div class="card" data-aos style="text-align:center"><div class="icon-badge" style="margin:0 auto 16px"><img src="assets/images/svg/icons/water-drop.svg" alt=""></div><h3>Awareness</h3><p>Stop wasting time creating reports and juggling multiple tools. We can manage your social media effectively.</p></div>
      <div class="card" data-aos style="text-align:center"><div class="icon-badge" style="margin:0 auto 16px"><img src="assets/images/svg/icons/efficiency.svg" alt=""></div><h3>Extraordinary</h3><p>Stop wasting time creating reports and juggling multiple tools. We can manage your social media effectively.</p></div>
      <div class="card" data-aos style="text-align:center"><div class="icon-badge" style="margin:0 auto 16px"><img src="assets/images/svg/icons/multi-windows.svg" alt=""></div><h3>Efficiency</h3><p>Stop wasting time creating reports and juggling multiple tools. We can manage your social media effectively.</p></div>
    </div>
  </div>
</section>
<section class="section alt">
  <div class="container" style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center">
    <div data-aos><div class="eyebrow">Our Valuable Client Feedback</div><h2>We started a single mission Help grow</h2><p>Make better business decisions with a single, all-in-one platform that helps you plan, engage, and analyze easily.</p><a href="contact.html" class="btn btn-primary">Join Our Team</a></div>
    <div class="card" data-aos><img src="assets/images/client-profile.png" alt="Guy Hawkins" style="border-radius:14px;margin-bottom:16px"><p>"Make better business decisions with a single, all-in-one platform that helps you plan, engage, and analyze easily."</p><strong>Guy Hawkins</strong><br><span style="color:var(--color-muted);font-size:13px">CEO, The Northeast Ltd</span></div>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="section-head" data-aos><div class="eyebrow" style="justify-content:center;display:flex">We Are Like An Extension Of Your Marketing Team</div><h2>Why You Should Join Us?</h2></div>
    <div class="grid grid-3">
      <img data-aos src="assets/images/office-desk-1.png" alt="Office" style="border-radius:16px">
      <img data-aos src="assets/images/office-desk-2.png" alt="Office" style="border-radius:16px">
      <img data-aos src="assets/images/office-desk-3.png" alt="Office" style="border-radius:16px">
    </div>
  </div>
</section>
<section class="section alt">
  <div class="container">
    <div class="section-head" data-aos><div class="eyebrow" style="justify-content:center;display:flex">We Are Like An Extension Of Your Marketing Team</div><h2>Why You Should Join Us?</h2></div>
    <div class="grid grid-3">
      <div class="team-card card" data-aos><img src="assets/images/profile-image-1.png" alt="Jane Cooper"><strong>Jane Cooper</strong><br><span style="color:var(--color-muted);font-size:13px">UI Designer</span><div class="social-row" style="justify-content:center;margin-top:14px"><a href="#" style="border-color:var(--color-border);color:var(--color-muted)">f</a><a href="#" style="border-color:var(--color-border);color:var(--color-muted)">x</a><a href="#" style="border-color:var(--color-border);color:var(--color-muted)">in</a></div></div>
      <div class="team-card card" data-aos><img src="assets/images/profile-image-2.png" alt="Robert Fox"><strong>Robert Fox</strong><br><span style="color:var(--color-muted);font-size:13px">Marketing Head</span><div class="social-row" style="justify-content:center;margin-top:14px"><a href="#" style="border-color:var(--color-border);color:var(--color-muted)">f</a><a href="#" style="border-color:var(--color-border);color:var(--color-muted)">x</a><a href="#" style="border-color:var(--color-border);color:var(--color-muted)">in</a></div></div>
      <div class="team-card card" data-aos><img src="assets/images/profile-image-3.png" alt="Ralph Edwards"><strong>Ralph Edwards</strong><br><span style="color:var(--color-muted);font-size:13px">Product Designer</span><div class="social-row" style="justify-content:center;margin-top:14px"><a href="#" style="border-color:var(--color-border);color:var(--color-muted)">f</a><a href="#" style="border-color:var(--color-border);color:var(--color-muted)">x</a><a href="#" style="border-color:var(--color-border);color:var(--color-muted)">in</a></div></div>
    </div>
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
write("about.html", page("About Us - Atemp", "A dedicated team of marketing experts behind the Atemp SaaS template.", about_body, "", "about"))

# ------------------------------------------------------------- PRICING -----
def plan_cards(period, suffix, mult=1):
    return f"""<div class="pricing-tab-panel grid grid-3{' active' if period=='monthly' else ''}" data-panel="{period}">
      <div class="card" data-aos><span class="tag-pill">Perfect For Standard</span><h3>Professional</h3><div class="price-amount">${50*mult}<span>/{suffix}</span></div><ul class="plan-list"><li>Only for 1 team</li><li>5 Projects</li><li>10 GB Storage</li><li>Priority support</li><li>24/7 Support</li></ul><a href="contact.html" class="btn btn-primary btn-sm" style="width:100%">Get Started Now</a></div>
      <div class="card" data-aos style="border:2px solid var(--color-accent)"><span class="tag-pill">Perfect For Business</span><h3>Professional</h3><div class="price-amount">${64*mult}<span>/{suffix}</span></div><ul class="plan-list"><li>Only for 1 team</li><li>10 Projects</li><li>50 GB Storage</li><li>Priority support</li><li>24/7 Support</li></ul><a href="contact.html" class="btn btn-primary btn-sm" style="width:100%">Get Started Now</a></div>
      <div class="card" data-aos><span class="tag-pill">Perfect For Enterprise</span><h3>Enterprize</h3><div class="price-amount">${79*mult}<span>/{suffix}</span></div><ul class="plan-list"><li>Unlimited teams</li><li>Unlimited Projects</li><li>500 GB Storage</li><li>Priority support</li><li>24/7 Support</li></ul><a href="contact.html" class="btn btn-primary btn-sm" style="width:100%">Get Started Now</a></div>
    </div>"""

pricing_body = f"""
<section class="page-header"><div class="container"><div class="breadcrumb"><a href="index.html">Home</a> / Pricing</div><h1>Try Atemp For Free Now</h1></div></section>
<section class="section">
  <div class="container">
    <div class="tab-toggle" style="display:flex;justify-content:center;margin:0 auto 40px;width:max-content" data-aos>
      <button class="active" data-tab="monthly">Monthly Plan</button>
      <button data-tab="yearly">Yearly Plan</button>
    </div>
    {plan_cards('monthly','Month',1)}
    {plan_cards('yearly','Year',10)}
  </div>
</section>
<section class="section alt">
  <div class="container" style="max-width:800px">
    <div class="section-head" data-aos><div class="eyebrow" style="justify-content:center;display:flex">FAQ</div><h2>Frequently Asked Questions</h2></div>
    <div data-aos>
      <div class="accordion-item open"><button class="accordion-trigger">Can I change my plan later?</button><div class="accordion-panel" style="max-height:200px"><p>Yes, you can upgrade or downgrade your plan at any time from your account settings.</p></div></div>
      <div class="accordion-item"><button class="accordion-trigger">Is there a free trial available?</button><div class="accordion-panel"><p>Yes, every plan includes a 14-day free trial, no credit card required.</p></div></div>
      <div class="accordion-item"><button class="accordion-trigger">What payment methods do you accept?</button><div class="accordion-panel"><p>We accept all major credit cards as well as PayPal and bank transfer for annual plans.</p></div></div>
      <div class="accordion-item"><button class="accordion-trigger">Can I cancel anytime?</button><div class="accordion-panel"><p>Absolutely — cancel your subscription at any time with no hidden fees.</p></div></div>
    </div>
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
write("pricing.html", page("Pricing - Atemp", "Simple, transparent pricing plans for the Atemp SaaS template.", pricing_body, "", "pricing"))

print("core pages done")
