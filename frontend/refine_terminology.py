import os
import re

def update_ui_text():
    dir_path = "/home/user/freelance-marketplace-platform-copy/frontend/src"
    
    # We want to replace "job" and "jobs" only when they are UI text.
    # A good heuristic for UI text in React/JS is:
    # 1. Inside quotes: 'job', "job", `job`
    # 2. Inside JSX tags: >job<
    # 3. In templates: job... (if capitalized it was handled)
    
    # Let's try to target lowercase "job" and "jobs" but exclude code patterns.
    # Exclude: job., job?, jobs., setJob, _job, job_id, .job
    
    def replacer(match):
        text = match.group(0)
        # Check surrounding context if possible, but regex boundary \b handles most.
        # We need to specifically avoid things like job.title
        # So we check if the next char is a dot or bracket or ?.
        
        # However, it's safer to just target strings and JSX.
        return text.replace('jobs', 'gigs').replace('job', 'gig')

    files_to_check = [
        "pages/FreelancersPage.jsx",
        "pages/ProjectDashboard.jsx",
        "pages/EscrowPaymentPage.jsx",
        "pages/HomePage.jsx",
        "pages/JobDetailsPage.jsx",
        "pages/NewJobPage.jsx",
        "pages/JobListPage.jsx",
        "pages/Dashboard.jsx",
        "pages/InboxPage.jsx",
        "pages/ReviewPage.jsx",
        "pages/SubmitWorkPage.jsx"
    ]

    for rel_path in files_to_check:
        filepath = os.path.join(dir_path, rel_path)
        if not os.path.exists(filepath):
            continue
            
        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
        new_lines = []
        for line in lines:
            # Skip lines that look like imports or API paths
            if "import" in line or "api." in line or "const [" in line:
                new_lines.append(line)
                continue
                
            # Replace lowercase standalone words "job" and "jobs"
            # But ONLY if they are NOT followed by . or [ or ? or _
            # And NOT preceded by . or set or [a-z]
            
            # Simple heuristic: if it contains "job" and also "{" or "<" or "'" or '"'
            # it's likely UI or content.
            
            line = re.sub(r'\bjobs\b(?![._?\[])', 'gigs', line)
            line = re.sub(r'\bjob\b(?![._?\[])', 'gig', line)
            
            new_lines.append(line)
            
        with open(filepath, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
        print(f"Refined update: {rel_path}")

if __name__ == "__main__":
    update_ui_text()
