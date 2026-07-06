import os
import re

# Categorized titles
CATEGORIES = {
    "Beginner Guides": [
        "How to Build an AI App Without Coding in 2026",
        "The Ultimate Guide to No-Code AI Software Generation",
        "Can You Really Build an AI App in 10 Minutes?",
        "AI App Development for Complete Beginners",
        "From Idea to Launch: AI App Creation Simplified",
        "Best No-Code Platforms for AI Integration",
        "The Future of Software: No-Code AI"
    ],
    "Business & Agency": [
        "Stop Paying Developers: Create Your Own AI Tools",
        "Starting an AI Agency with Zero Coding Skills",
        "The Economics of No-Code AI Development",
        "The AI Gold Rush: Why Non-Technical Founders are Winning"
    ],
    "Monetization & Sales": [
        "How to Make Money Selling Custom AI Apps",
        "Top 10 AI Micro-SaaS Ideas You Can Build Today",
        "Passive Income Strategies Using AI Software",
        "Case Study: Earning with Simple AI Tools",
        "Licensing Your AI Apps: A Beginner's Guide",
        "How to Package and Sell AI Prompts as Software"
    ],
    "Industry Solutions": [
        "Top 5 AI Apps Real Estate Agents Need Right Now",
        "How Digital Marketers are Automating with Custom AI Apps",
        "Essential AI Tools for Content Creators & Influencers",
        "Building AI Assistants for E-commerce Stores",
        "How Local Businesses Can Leverage Custom AI Software",
        "Custom AI Apps for Fitness Coaches and Trainers",
        "AI Solutions for Online Course Creators",
        "Automating Customer Service with No-Code AI",
        "AI for Copywriters: Building Your Own Generation Tool"
    ],
    "Marketing & Lead Gen": [
        "AI Lead Generation Tools for B2B Sales",
        "How to Create High-Converting Lead Magnets with AI",
        "The VIBE-RC Prompting Method Explained",
        "How to Turn ChatGPT Prompts into Standalone Apps"
    ]
}

def slugify(title):
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug + ".html"

def generate_content(title):
    return f"""
        <p>Welcome to our comprehensive guide on <strong>{title}</strong>. If you've been watching the AI space, you already know how quickly things are moving. The good news? You don't need a computer science degree to participate in this revolution.</p>
        
        <h2>Why This Matters Now</h2>
        <p>In the past, building any type of software required either deep technical knowledge or a massive budget to hire developers. Today, thanks to breakthrough frameworks like VIBE-RC, non-technical founders and marketers are launching profitable AI applications in mere minutes.</p>
        
        <h2>How AI App Alchemy Changes the Game</h2>
        <p>With AI App Alchemy, you are equipped with the exact step-by-step video training and done-for-you prompts needed to build standalone AI software. By simply copying and pasting instructions into a proprietary framework, you can dictate exactly what the AI should build.</p>
        
        <ul>
            <li>No coding experience required.</li>
            <li>Launch in as little as 10 minutes.</li>
            <li>Full commercial rights to sell what you build.</li>
        </ul>
        
        <h2>Taking the Next Step</h2>
        <p>If you are serious about capitalizing on this trend, the best time to start was yesterday. The second best time is today. Grab your access to AI App Alchemy while the launch special is still active, and start building your own portfolio of custom AI tools.</p>
        
        <p><a href="https://warriorplus.com/o2/a/hn1qv73/0" class="btn btn-primary" style="display:inline-block; margin-top:1rem; padding: 10px 20px;">Get Started with AI App Alchemy Now</a></p>
    """

def main():
    template_path = "blog-template.html"
    out_dir = "articles"
    
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
        
    with open(template_path, 'r', encoding='utf-8') as f:
        template = f.read()
        
    all_links = {}

    for cat_name, titles in CATEGORIES.items():
        cat_slug = slugify(cat_name)
        all_links[cat_name] = {"slug": cat_slug, "links": []}
        
        for title in titles:
            slug = slugify(title)
            content = generate_content(title)
            
            html = template.replace("{{TITLE}}", title)
            html = html.replace("{{DESCRIPTION}}", f"Learn all about {title} with our in-depth guide on no-code AI app creation.")
            html = html.replace("{{DATE}}", "July 2026")
            html = html.replace("{{CONTENT}}", content)
            
            out_path = os.path.join(out_dir, slug)
            with open(out_path, 'w', encoding='utf-8') as f:
                f.write(html)
                
            all_links[cat_name]["links"].append(f'<li><a href="{slug}">{title}</a></li>')
            print(f"Generated {slug}")
        
        # Generate category index page
        cat_html = template.replace("{{TITLE}}", f"{cat_name} Articles | AI App Alchemy")
        cat_html = cat_html.replace("{{DESCRIPTION}}", f"Browse our collection of articles on {cat_name} for AI app creation.")
        cat_html = cat_html.replace("{{DATE}}", "July 2026")
        
        cat_content = f"<h2>{cat_name}</h2><ul style='list-style-type:none; padding-left:0;'>"
        for link in all_links[cat_name]["links"]:
            styled_link = link.replace("<a href=", "<a style='color:var(--accent);text-decoration:none;font-weight:600;font-size:1.1rem;' href=")
            cat_content += f"<li style='margin-bottom:10px; padding:15px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.1); border-radius:8px;'>{styled_link}</li>"
        cat_content += "</ul>"
        
        cat_html = cat_html.replace("{{CONTENT}}", cat_content)
        with open(os.path.join(out_dir, cat_slug), 'w', encoding='utf-8') as f:
            f.write(cat_html)
        print(f"Generated category page: {cat_slug}")
            
    # Generate main index.html for the articles folder
    index_html = template.replace("{{TITLE}}", "AI App Development Blog & Resources")
    index_html = index_html.replace("{{DESCRIPTION}}", "Browse our collection of 30+ articles on how to build, launch, and monetize AI apps without coding.")
    index_html = index_html.replace("{{DATE}}", "July 2026")
    
    index_content = "<h2>All Categories</h2>"
    for cat_name, data in all_links.items():
        index_content += f"<h3 style='margin-top:2rem;'><a style='color:var(--accent);text-decoration:none;' href='{data['slug']}'>{cat_name}</a></h3>"
        index_content += "<ul style='list-style-type:none; padding-left:0;'>"
        for link in data["links"]:
            styled_link = link.replace("<a href=", "<a style='color:white;text-decoration:none;font-size:1rem;' href=")
            index_content += f"<li style='margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05);'>{styled_link}</li>"
        index_content += "</ul>"
        
    index_html = index_html.replace("{{CONTENT}}", index_content)
    
    with open(os.path.join(out_dir, "index.html"), 'w', encoding='utf-8') as f:
        f.write(index_html)
        
    print("Generated articles/index.html")

if __name__ == "__main__":
    main()
