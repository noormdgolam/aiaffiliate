import os
import glob
from datetime import datetime

DOMAIN = "https://aiappalchemy.com" # Adjust if the live domain is different
# Wait, the folder name is httpsaiappalchemy.comnow, so maybe the domain is https://aiappalchemy.com/now
DOMAIN = "https://ai.bongshai.com"

def generate_sitemap():
    html_files = []
    
    # Root HTML files
    for f in glob.glob("*.html"):
        html_files.append(f)
        
    # Article HTML files
    for f in glob.glob("articles/*.html"):
        html_files.append(f.replace("\\", "/"))
        
    # Start building XML
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    for file_path in html_files:
        # Determine priority based on file depth or type
        priority = "0.8"
        if file_path == "index.html":
            priority = "1.0"
            url = DOMAIN + "/"
        elif file_path.startswith("articles/index"):
            priority = "0.9"
            url = DOMAIN + "/articles/"
        else:
            url = f"{DOMAIN}/{file_path}"
            
        xml += '  <url>\n'
        xml += f'    <loc>{url}</loc>\n'
        xml += f'    <lastmod>{today}</lastmod>\n'
        xml += f'    <priority>{priority}</priority>\n'
        xml += '  </url>\n'
        
    xml += '</urlset>'
    
    with open("sitemap.xml", "w", encoding="utf-8") as f:
        f.write(xml)
        
    print(f"Generated sitemap.xml with {len(html_files)} URLs.")
    
    # Generate robots.txt
    robots_txt = f"User-agent: *\nAllow: /\n\nSitemap: {DOMAIN}/sitemap.xml\n"
    with open("robots.txt", "w", encoding="utf-8") as f:
        f.write(robots_txt)
    print("Generated robots.txt")

if __name__ == "__main__":
    generate_sitemap()
