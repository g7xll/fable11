#!/usr/bin/env python3
from build import page, write

POSTS = [
    (1, "How To Build A Social Media Strategy That Works", "Strategy", "Jan 12, 2026", "assets/images/blog/1.jpg"),
    (2, "Understanding Audience Insights Through Data", "Analytics", "Jan 18, 2026", "assets/images/blog/2.jpg"),
    (3, "5 Ways To Save 12+ Hours On Reporting Every Week", "Productivity", "Feb 02, 2026", "assets/images/blog/3.jpg"),
    (4, "Why Every Growth Team Needs A Unified Dashboard", "Growth", "Feb 14, 2026", "assets/images/blog/4.jpg"),
    (5, "The Secret To ROI Is In The Data You're Overlooking", "Strategy", "Feb 27, 2026", "assets/images/blog/5.jpg"),
]

def blog_card(n, title, cat, date, img):
    return f"""<div class="blog-card" data-aos>
      <a href="blog/post-{n}.html"><img src="{img}" alt="{title}"></a>
      <div class="body"><span class="tag-pill">{cat}</span><h3><a href="blog/post-{n}.html">{title}</a></h3><div class="blog-meta"><span>By Admin</span><span>{date}</span></div></div>
    </div>"""

def blog_index_body(page_num):
    cards = "\n".join(blog_card(*p) for p in POSTS)
    pages = [1, 2, 3]
    pag = "".join(
        f'<a href="{"blog.html" if p == 1 else f"blog-page-{p}.html"}" class="{"active" if p == page_num else ""}">{p}</a>'
        for p in pages
    )
    return f"""
<section class="page-header"><div class="container"><div class="breadcrumb"><a href="index.html">Home</a> / Blog</div><h1>Insights &amp; Stories From Our Team</h1></div></section>
<section class="section">
  <div class="container">
    <div class="grid grid-3">{cards}</div>
    <div class="pagination">{pag}</div>
  </div>
</section>
"""

# blog index (depth "")
write("blog.html", page("Blog - Atemp", "Insights and stories on social media growth from the Atemp team.", blog_index_body(1), "", "blog"))
# pagination pages 2 & 3 (also at root depth, separate file names to keep no-build-step simplicity)
write("blog-page-2.html", page("Blog - Page 2 - Atemp", "Insights and stories on social media growth from the Atemp team.", blog_index_body(2), "", "blog"))
write("blog-page-3.html", page("Blog - Page 3 - Atemp", "Insights and stories on social media growth from the Atemp team.", blog_index_body(3), "", "blog"))

# blog posts live under blog/ subfolder -> depth "../"
def post_body(n, title, cat, date, img):
    others = [p for p in POSTS if p[0] != n][:3]
    related = "\n".join(blog_card(*p) for p in others)
    return f"""
<section class="page-header"><div class="container"><div class="breadcrumb"><a href="../index.html">Home</a> / <a href="../blog.html">Blog</a> / Post {n}</div><h1>{title}</h1><p style="color:var(--color-muted)">By Admin · {date} · {cat}</p></div></section>
<section class="section">
  <div class="container" style="max-width:820px">
    <article class="prose" data-aos>
      <img src="../{img}" alt="{title}">
      <p>Make better business decisions with a single, all-in-one platform that helps you plan, engage, and analyse easily juggling between 8 tools to manage your social media, speed up collect.</p>
      <h2>Why This Matters</h2>
      <p>Stop wasting time creating reports manually. Juggling between 8 tools to manage your social media generated research reports that matter to your growth strategy.</p>
      <h2>Getting Started</h2>
      <p>The secret to your growth is in the data you're overlooking. Maximize reach and impact with detailed reports on content marketing and customer engagement.</p>
      <ul class="plan-list">
        <li>Make better business decisions with a single, all-in-one platform</li>
        <li>Create a social media strategy that works</li>
        <li>Track performance across every channel through tonnes of data</li>
      </ul>
      <h2>Wrapping Up</h2>
      <p>With Atemp, understanding your audience and engaging them effectively no longer means juggling a dozen spreadsheets — it means one dashboard, one workflow, and hours of time saved every week.</p>
    </article>
    <div style="margin-top:32px;display:flex;gap:10px;flex-wrap:wrap" data-aos>
      <span class="tag-pill">{cat}</span><span class="tag-pill">Social Media</span><span class="tag-pill">Growth</span>
    </div>
  </div>
</section>
<section class="section alt">
  <div class="container">
    <div class="section-head" data-aos><h2>Related Posts</h2></div>
    <div class="grid grid-3">{related}</div>
  </div>
</section>
"""

for p in POSTS:
    n = p[0]
    write(f"blog/post-{n}.html", page(f"{p[1]} - Atemp Blog", f"{p[1]} — insights from the Atemp blog.", post_body(*p), "../", "blog"))

print("blog pages done")
