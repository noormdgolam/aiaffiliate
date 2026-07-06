import os
import re

CATEGORIES = {
    "Beginners": [
        "How to Build an AI App Without Coding in 2026",
        "The Ultimate Guide to No-Code AI Software Generation",
        "Can You Really Build an AI App in 10 Minutes?",
        "AI App Development for Complete Beginners",
        "From Idea to Launch: AI App Creation Simplified",
        "Best No-Code Platforms for AI Integration",
        "The Future of Software: No-Code AI"
    ],
    "Business": [
        "Stop Paying Developers: Create Your Own AI Tools",
        "Starting an AI Agency with Zero Coding Skills",
        "The Economics of No-Code AI Development",
        "The AI Gold Rush: Why Non-Technical Founders are Winning"
    ],
    "Monetization": [
        "How to Make Money Selling Custom AI Apps",
        "Top 10 AI Micro-SaaS Ideas You Can Build Today",
        "Passive Income Strategies Using AI Software",
        "Case Study: Earning with Simple AI Tools",
        "Licensing Your AI Apps: A Beginner's Guide",
        "How to Package and Sell AI Prompts as Software"
    ],
    "Industry": [
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
    "Marketing": [
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

nav_blog = '<ul class="nav-menu">\n'
nav_index = '<ul class="nav-menu">\n'

for cat, titles in CATEGORIES.items():
    nav_blog += f'    <li class="dropdown">\n        <a href="#" class="dropbtn">{cat} ▼</a>\n        <div class="dropdown-content">\n'
    nav_index += f'    <li class="dropdown">\n        <a href="#" class="dropbtn">{cat} ▼</a>\n        <div class="dropdown-content">\n'
    
    for title in titles:
        slug = slugify(title)
        nav_blog += f'            <a href="{slug}">{title}</a>\n'
        nav_index += f'            <a href="articles/{slug}">{title}</a>\n'
        
    nav_blog += '        </div>\n    </li>\n'
    nav_index += '        </div>\n    </li>\n'

nav_blog += '</ul>'
nav_index += '</ul>'

# Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()
if '{{NAV_MENU}}' in content:
    content = content.replace('{{NAV_MENU}}', nav_index)
else:
    # Use regex to replace the ul.nav-menu block if it exists
    content = re.sub(r'<ul class="nav-menu">.*?</ul>', nav_index, content, flags=re.DOTALL)
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

# Update blog-template.html
with open('blog-template.html', 'r', encoding='utf-8') as f:
    content = f.read()
if '{{NAV_MENU}}' in content:
    content = content.replace('{{NAV_MENU}}', nav_blog)
else:
    content = re.sub(r'<ul class="nav-menu">.*?</ul>', nav_blog, content, flags=re.DOTALL)
with open('blog-template.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Menu generated and injected into templates.")
