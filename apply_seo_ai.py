import os
import glob
import re

html_files = glob.glob("*.html")
# also process articles if any
articles = glob.glob("articles/*.html")
html_files.extend(articles)

for file_path in html_files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    modified = False

    # Check for meta description
    if '<meta name="description"' not in content:
        # Generate description based on title
        title_match = re.search(r'<title>(.*?)</title>', content)
        if title_match:
            title = title_match.group(1).replace(" | AI App Alchemy", "")
            description = f"Learn more about {title} at AI App Alchemy. Build a working AI app in 10 minutes without coding."
            meta_tag = f'\n    <meta name="description" content="{description}">'
            
            # insert after viewport or head
            if '<meta name="viewport"' in content:
                content = content.replace('<meta name="viewport" content="width=device-width, initial-scale=1.0">', 
                                          '<meta name="viewport" content="width=device-width, initial-scale=1.0">' + meta_tag)
            elif '<head>' in content:
                content = content.replace('<head>', '<head>' + meta_tag)
            modified = True

    # Check for image alt tags (simple regex)
    # This just warns or we can try to add empty alt tags if completely missing
    # But for a quick SEO fix, just adding description is the main thing the PDF emphasizes if missing

    if modified:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Added SEO to {file_path}")

print("SEO tags check and update complete.")
