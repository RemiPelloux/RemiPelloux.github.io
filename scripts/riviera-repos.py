#!/usr/bin/env python3
"""Build assets/riviera/repos.json: every public repository on the account, with a category.

Reads the GitHub API through the gh CLI (GH_TOKEN in CI), so the page never calls the API itself
and never meets a rate limit. Private repositories are never listed: the API call asks for
public ones only. Run: python3 scripts/riviera-repos.py
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "riviera" / "repos.json"
OWNER = "RemiPelloux"
# Left out on the owner's request, plus the profile README repository.
SKIP = {"piou-autoloader", "steamio", "marine-courtois", "RemiPelloux"}
FEATURED = ["OpenVision", "OpenPlod", "Modelly", "Containust", "HackoogleMini", "pelloux-guidelines", "SmarttyTest", "OpenSw"]
CATEGORY = {
    "ai": ["agent-mangaka-forge", "Concerto", "kill-my-idea", "OpenAgents", "molt-official", "InsideGPT", "JarvisCodeGPT"],
    "devtools": ["OpenVision", "openterm", "SmarttyTest", "pelloux-guidelines", "unslop", "rjs", "RouteMaster", "gitverse", "openpro-connector-sdk", "openwhistle-sdks"],
    "native": ["OpenPlod", "lumasync", "ThisNote", "android-hid-kb", "delonghi-coffee-api"],
    "infrastructure": ["Containust", "lbc-api", "modelly-hub", "RemiPelloux.github.io"],
    "security": ["HackoogleMini", "GalaxyCrash", "php-upload-rce", "BurpHunterTK", "Sniper", "ssrf-payload.github.io"],
    "gaming": ["OpenSw", "templateCardGame", "TextRPG", "Pokya", "BlackJackAI", "BlackJackAI_v2", "wildlands-ubisoft-connect-launch-fix", "dungeonia-manga-pages-assets"],
    "web": ["EatIt", "gallerie-ajax", "jstp", "createScrollToTopButton", "VoiceApp-MisterPizza", "alotaxi", "ObserverGeoIPRedirect", "auto-amazon-item-finder", "AirFranceFilterScript", "NEON"],
    "experiments": ["Modelly", "DrosoSimBetter", "Multi-Threaded-Prime-Number-Calculation"],
}
BY_NAME = {name: category for category, names in CATEGORY.items() for name in names}
KEYWORDS = [("security", ("exploit", "cve", "pentest", "security")), ("ai", ("ai", "llm", "gpt", "agent", "mcp")), ("gaming", ("game", "emulat")), ("web", ("javascript", "php", "css", "html"))]


def fetch():
    out = subprocess.run(["gh", "api", "--paginate", f"users/{OWNER}/repos?per_page=100&type=owner"], capture_output=True, text=True, check=True).stdout
    return json.loads(out.replace("][", ","))


def category(repo):
    if repo["name"] in BY_NAME:
        return BY_NAME[repo["name"]]
    text = " ".join([repo.get("description") or "", " ".join(repo.get("topics") or []), repo.get("language") or ""]).lower()
    for name, words in KEYWORDS:
        if any(word in text for word in words):
            return name
    return "experiments"


def entry(repo):
    return {
        "name": repo["name"],
        "description": (repo.get("description") or "").strip(),
        "language": repo.get("language"),
        "stars": repo["stargazers_count"],
        "pushed": repo["pushed_at"][:10],
        "created": repo["created_at"][:10],
        "topics": repo.get("topics") or [],
        "homepage": repo.get("homepage") or "",
        "size": repo.get("size", 0),
        "fork": repo["fork"],
        "archived": repo["archived"],
        "category": category(repo),
        "featured": repo["name"] in FEATURED,
        "url": repo["html_url"],
    }


def main():
    repos = [entry(r) for r in fetch() if not r["private"] and r["name"] not in SKIP]
    repos.sort(key=lambda r: r["pushed"], reverse=True)
    OUT.write_text(json.dumps({"owner": OWNER, "featured": FEATURED, "repos": repos}, ensure_ascii=False, separators=(",", ":")))
    print(f"wrote {len(repos)} repositories, {sum(not r['fork'] for r in repos)} of them not forks")


if __name__ == "__main__":
    main()
