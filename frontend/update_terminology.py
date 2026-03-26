import os
import re

def update_ui_text():
    dir_path = "/home/user/freelance-marketplace-platform-copy/frontend/src"
    updated_files = 0
    
    for root, _, files in os.walk(dir_path):
        for file in files:
            if file.endswith((".jsx", ".js")):
                filepath = os.path.join(root, file)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Replace exact standalone words "Jobs" and "Job" with "Gigs" and "Gig"
                # Using \b word boundaries prevents matching things like JobCard, setJob, JobListPage
                new_content = re.sub(r'\bJobs\b', 'Gigs', content)
                new_content = re.sub(r'\bJob\b', 'Gig', new_content)
                
                # Also handle ALL CAPS variants just in case the UI has them like "JOBS"
                new_content = re.sub(r'\bJOBS\b', 'GIGS', new_content)
                new_content = re.sub(r'\bJOB\b', 'GIG', new_content)
                
                if new_content != content:
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"Updated: {os.path.relpath(filepath, dir_path)}")
                    updated_files += 1
                    
    print(f"\nCompleted terminology update across {updated_files} files!")

if __name__ == "__main__":
    update_ui_text()
