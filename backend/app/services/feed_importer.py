import re
from datetime import UTC, datetime
from email.utils import parsedate_to_datetime
from html import unescape
from xml.etree import ElementTree

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import IOC, Source, Threat, ThreatIOC

CISA_KEV_PRIMARY_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
CISA_KEV_MIRROR_URL = (
    "https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json"
)
CISA_KEV_URLS = [CISA_KEV_PRIMARY_URL, CISA_KEV_MIRROR_URL]
RSS_FEEDS = [
    {
        "name": "CISA Advisories",
        "url": "https://www.cisa.gov/cybersecurity-advisories/all.xml",
        "trust_score": 95,
        "tags": ["cisa", "advisory", "official"],
    },
    {
        "name": "CISA News",
        "url": "https://www.cisa.gov/news.xml",
        "trust_score": 92,
        "tags": ["cisa", "news", "official"],
    },
    {
        "name": "BleepingComputer",
        "url": "https://www.bleepingcomputer.com/feed/",
        "trust_score": 82,
        "tags": ["news", "security-news"],
    },
    {
        "name": "SecurityWeek",
        "url": "https://www.securityweek.com/feed/",
        "trust_score": 82,
        "tags": ["news", "security-news"],
    },
    {
        "name": "The Hacker News",
        "url": "https://feeds.feedburner.com/TheHackersNews",
        "trust_score": 80,
        "tags": ["news", "security-news"],
    },
    {
        "name": "PortSwigger Research",
        "url": "https://portswigger.net/research/rss",
        "trust_score": 82,
        "tags": ["research", "web-security"],
    },
    {
        "name": "PortSwigger Blog",
        "url": "https://portswigger.net/blog/rss",
        "trust_score": 78,
        "tags": ["blog", "web-security"],
    },
    {
        "name": "Ars Technica Security",
        "url": "https://arstechnica.com/security/feed/",
        "trust_score": 76,
        "tags": ["news", "security-news"],
    },
    {
        "name": "Check Point Research",
        "url": "https://research.checkpoint.com/feed/",
        "trust_score": 82,
        "tags": ["research", "threat-research"],
    },
    {
        "name": "Microsoft Security Blog",
        "url": "https://www.microsoft.com/en-us/security/blog/feed/",
        "trust_score": 86,
        "tags": ["microsoft", "threat-intelligence", "security-blog"],
    },
    {
        "name": "Google Threat Intelligence",
        "url": "https://feeds.feedburner.com/threatintelligence/pvexyqv7v0v",
        "trust_score": 88,
        "tags": ["google", "mandiant", "threat-intelligence"],
    },
    {
        "name": "AWS Security Bulletins",
        "url": "https://aws.amazon.com/security/security-bulletins/rss/feed/",
        "trust_score": 86,
        "tags": ["aws", "cloud-security", "security-bulletin"],
    },
    {
        "name": "SentinelLABS",
        "url": "https://www.sentinelone.com/labs/feed/",
        "trust_score": 82,
        "tags": ["sentinelone", "research", "malware"],
    },
    {
        "name": "Cisco Talos",
        "url": "https://blog.talosintelligence.com/rss/",
        "trust_score": 84,
        "tags": ["cisco-talos", "threat-research", "ioc"],
    },
]
CVE_PATTERN = re.compile(r"CVE-\d{4}-\d{4,19}", re.IGNORECASE)
TAG_SPLIT_PATTERN = re.compile(r"[^a-z0-9]+")
HTML_TAG_PATTERN = re.compile(r"<[^>]+>")


DEMO_FEED_ITEMS = [
    {
        "external_id": "demo-feed-credential-phishing-001",
        "title": "Credential phishing kit targets finance portals",
        "summary": "A phishing kit is impersonating finance portals to collect corporate passwords.",
        "description": "The campaign uses lookalike domains and fake invoice workflows to steal credentials from finance teams.",
        "severity": "high",
        "confidence_score": 86,
        "industry": "finance",
        "region": "global",
        "tags": ["phishing", "credential-theft", "finance"],
        "published_at": "2026-07-14T08:30:00+00:00",
        "iocs": [
            {
                "type": "domain",
                "value": "secure-invoice-portal.example",
                "risk_score": 88,
                "confidence_score": 82,
            },
            {
                "type": "url",
                "value": "https://secure-invoice-portal.example/login",
                "risk_score": 90,
                "confidence_score": 80,
            },
        ],
    },
    {
        "external_id": "demo-feed-malware-loader-002",
        "title": "Malware loader infrastructure observed in email campaign",
        "summary": "A malware loader is being distributed through attachment-based email lures.",
        "description": "Observed infrastructure delivers a downloader that may lead to ransomware deployment if execution succeeds.",
        "severity": "critical",
        "confidence_score": 91,
        "industry": "multiple",
        "region": "global",
        "tags": ["malware", "loader", "email"],
        "published_at": "2026-07-14T09:15:00+00:00",
        "iocs": [
            {
                "type": "ip",
                "value": "198.51.100.77",
                "risk_score": 86,
                "confidence_score": 78,
            },
            {
                "type": "hash",
                "value": "44d88612fea8a8f36de82e1278abb02f",
                "risk_score": 94,
                "confidence_score": 88,
            },
        ],
    },
]


def import_demo_feed(db: Session, *, imported_by: str) -> dict:
    source = get_or_create_feed_source(db)
    created_threats = 0
    reused_threats = 0
    created_iocs = 0
    reused_iocs = 0
    created_links = 0

    for item in DEMO_FEED_ITEMS:
        threat, threat_created = get_or_create_feed_threat(
            db,
            item=item,
            source=source,
            imported_by=imported_by,
        )
        if threat_created:
            created_threats += 1
        else:
            reused_threats += 1

        for ioc_item in item["iocs"]:
            ioc, ioc_created = get_or_create_ioc(db, ioc_item=ioc_item)
            if ioc_created:
                created_iocs += 1
            else:
                reused_iocs += 1

            if link_threat_ioc(db, threat=threat, ioc=ioc):
                created_links += 1

    db.commit()

    return {
        "source": {"id": str(source.id), "name": source.name},
        "created_threats": created_threats,
        "reused_threats": reused_threats,
        "created_iocs": created_iocs,
        "reused_iocs": reused_iocs,
        "created_links": created_links,
        "feed_item_count": len(DEMO_FEED_ITEMS),
    }


def import_cisa_kev_feed(db: Session, *, imported_by: str, limit: int = 25) -> dict:
    source = get_or_create_cisa_kev_source(db)
    feed = fetch_cisa_kev_feed()
    vulnerabilities = feed.get("vulnerabilities", [])
    selected_items = vulnerabilities[: max(1, min(limit, 100))]

    created_threats = 0
    reused_threats = 0
    created_iocs = 0
    reused_iocs = 0
    created_links = 0

    for item in selected_items:
        normalized_item = normalize_cisa_kev_item(item)
        threat, threat_created = get_or_create_feed_threat(
            db,
            item=normalized_item,
            source=source,
            imported_by=imported_by,
        )
        if threat_created:
            created_threats += 1
        else:
            reused_threats += 1

        cve_ioc = {
            "type": "cve",
            "value": item["cveID"],
            "risk_score": 92 if normalized_item["severity"] == "critical" else 82,
            "confidence_score": normalized_item["confidence_score"],
            "feed": "cisa_kev",
        }
        ioc, ioc_created = get_or_create_ioc(db, ioc_item=cve_ioc)
        if ioc_created:
            created_iocs += 1
        else:
            reused_iocs += 1

        if link_threat_ioc(db, threat=threat, ioc=ioc):
            created_links += 1

    db.commit()

    return {
        "source": {"id": str(source.id), "name": source.name},
        "created_threats": created_threats,
        "reused_threats": reused_threats,
        "created_iocs": created_iocs,
        "reused_iocs": reused_iocs,
        "created_links": created_links,
        "feed_item_count": len(selected_items),
        "available_feed_item_count": len(vulnerabilities),
        "catalog_version": feed.get("catalogVersion"),
        "date_released": feed.get("dateReleased"),
        "fetched_from": feed.get("_cti_mobile_source_url"),
    }


def import_free_news_feeds(db: Session, *, imported_by: str, limit_per_source: int = 5) -> dict:
    created_threats = 0
    reused_threats = 0
    created_iocs = 0
    reused_iocs = 0
    created_links = 0
    imported_sources = []
    failed_sources = []

    for feed_config in RSS_FEEDS:
        try:
            source = get_or_create_rss_source(db, feed_config)
            feed_items = fetch_rss_items(feed_config["url"])
            selected_items = feed_items[: max(1, min(limit_per_source, 25))]
            source_created_threats = 0
            source_reused_threats = 0

            for rss_item in selected_items:
                normalized_item = normalize_rss_item(rss_item, feed_config)
                threat, threat_created = get_or_create_feed_threat(
                    db,
                    item=normalized_item,
                    source=source,
                    imported_by=imported_by,
                )
                if threat_created:
                    created_threats += 1
                    source_created_threats += 1
                else:
                    reused_threats += 1
                    source_reused_threats += 1

                for cve in extract_cves(f"{normalized_item['title']} {normalized_item['description']}"):
                    ioc, ioc_created = get_or_create_ioc(
                        db,
                        ioc_item={
                            "type": "cve",
                            "value": cve,
                            "risk_score": 78,
                            "confidence_score": normalized_item["confidence_score"],
                            "feed": normalized_item["feed"],
                        },
                    )
                    if ioc_created:
                        created_iocs += 1
                    else:
                        reused_iocs += 1
                    if link_threat_ioc(db, threat=threat, ioc=ioc):
                        created_links += 1

            imported_sources.append(
                {
                    "name": source.name,
                    "url": feed_config["url"],
                    "fetched_items": len(selected_items),
                    "created_threats": source_created_threats,
                    "reused_threats": source_reused_threats,
                }
            )
        except (httpx.HTTPError, ElementTree.ParseError, ValueError) as error:
            failed_sources.append(
                {
                    "name": feed_config["name"],
                    "url": feed_config["url"],
                    "error": str(error),
                }
            )

    db.commit()

    return {
        "source": {"id": None, "name": "Free RSS Feed Bundle"},
        "created_threats": created_threats,
        "reused_threats": reused_threats,
        "created_iocs": created_iocs,
        "reused_iocs": reused_iocs,
        "created_links": created_links,
        "feed_item_count": sum(source["fetched_items"] for source in imported_sources),
        "source_count": len(imported_sources),
        "failed_source_count": len(failed_sources),
        "sources": imported_sources,
        "failed_sources": failed_sources,
    }


def fetch_cisa_kev_feed() -> dict:
    last_error: Exception | None = None

    for url in CISA_KEV_URLS:
        try:
            response = httpx.get(
                url,
                follow_redirects=True,
                headers={
                    "Accept": "application/json",
                    "User-Agent": "CTI-Mobile/0.1 local development feed importer",
                },
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()
            data["_cti_mobile_source_url"] = url
            return data
        except (httpx.HTTPError, ValueError) as error:
            last_error = error

    raise httpx.HTTPError(f"All CISA KEV sources failed. Last error: {last_error}")


def normalize_cisa_kev_item(item: dict) -> dict:
    cve_id = item["cveID"]
    vendor = item.get("vendorProject", "Unknown vendor")
    product = item.get("product", "Unknown product")
    vulnerability_name = item.get("vulnerabilityName") or f"{cve_id} exploited vulnerability"
    short_description = item.get("shortDescription") or vulnerability_name
    required_action = item.get("requiredAction") or "Review vendor guidance and apply mitigations."
    ransomware_use = item.get("knownRansomwareCampaignUse", "Unknown")
    severity = "critical" if ransomware_use == "Known" else "high"
    date_added = parse_cisa_date(item.get("dateAdded"))

    return {
        "external_id": cve_id,
        "title": f"{cve_id}: {vulnerability_name}",
        "summary": f"{vendor} {product} vulnerability is listed in CISA KEV.",
        "description": (
            f"{short_description}\n\n"
            f"Required action: {required_action}\n"
            f"Known ransomware campaign use: {ransomware_use}."
        ),
        "severity": severity,
        "confidence_score": 95,
        "industry": "multiple",
        "region": "global",
        "tags": build_cisa_tags(item),
        "published_at": date_added.isoformat(),
        "raw": item,
        "feed": "cisa_kev",
    }


def parse_cisa_date(value: str | None) -> datetime:
    if not value:
        return datetime.now(UTC)
    return datetime.fromisoformat(value).replace(tzinfo=UTC)


def build_cisa_tags(item: dict) -> list[str]:
    tags = ["cisa-kev", "exploited-vulnerability", item["cveID"].lower()]
    vendor = item.get("vendorProject")
    product = item.get("product")
    if vendor:
        tags.append(vendor.lower().replace(" ", "-"))
    if product:
        tags.append(product.lower().replace(" ", "-"))
    if item.get("knownRansomwareCampaignUse") == "Known":
        tags.append("ransomware")
    return tags[:10]


def fetch_rss_items(url: str) -> list[dict]:
    response = httpx.get(
        url,
        follow_redirects=True,
        headers={
            "Accept": "application/rss+xml, application/xml, text/xml, */*",
            "User-Agent": "CTI-Mobile/0.1 local development feed importer",
        },
        timeout=30.0,
    )
    response.raise_for_status()
    root = ElementTree.fromstring(response.content)

    channel_items = root.findall("./channel/item")
    if channel_items:
        return [parse_rss_item(item) for item in channel_items]

    atom_items = root.findall("{http://www.w3.org/2005/Atom}entry")
    return [parse_atom_item(item) for item in atom_items]


def parse_rss_item(item: ElementTree.Element) -> dict:
    return {
        "title": get_child_text(item, "title"),
        "link": get_child_text(item, "link") or get_child_text(item, "guid"),
        "description": get_child_text(item, "description"),
        "published_at": parse_feed_datetime(get_child_text(item, "pubDate")),
        "guid": get_child_text(item, "guid") or get_child_text(item, "link") or get_child_text(item, "title"),
    }


def parse_atom_item(item: ElementTree.Element) -> dict:
    namespace = "{http://www.w3.org/2005/Atom}"
    link = ""
    for link_item in item.findall(f"{namespace}link"):
        link = link_item.attrib.get("href", "")
        if link:
            break

    return {
        "title": get_child_text(item, f"{namespace}title"),
        "link": link,
        "description": get_child_text(item, f"{namespace}summary") or get_child_text(item, f"{namespace}content"),
        "published_at": parse_feed_datetime(
            get_child_text(item, f"{namespace}published") or get_child_text(item, f"{namespace}updated")
        ),
        "guid": get_child_text(item, f"{namespace}id") or link or get_child_text(item, f"{namespace}title"),
    }


def get_child_text(item: ElementTree.Element, name: str) -> str:
    child = item.find(name)
    if child is None or child.text is None:
        return ""
    return clean_text(child.text)


def parse_feed_datetime(value: str) -> datetime:
    if not value:
        return datetime.now(UTC)
    try:
        return parsedate_to_datetime(value).astimezone(UTC)
    except (TypeError, ValueError):
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(UTC)


def normalize_rss_item(item: dict, feed_config: dict) -> dict:
    title = item["title"] or "Untitled security update"
    description = item["description"] or title
    link = item["link"]
    feed_id = slugify(feed_config["name"])
    severity = infer_news_severity(title, description)

    return {
        "external_id": item["guid"] or link or f"{feed_id}:{title}",
        "title": title[:500],
        "summary": build_summary(description),
        "description": description,
        "severity": severity,
        "confidence_score": infer_news_confidence(feed_config, severity),
        "industry": "multiple",
        "region": "global",
        "tags": build_news_tags(feed_config, title, description),
        "published_at": item["published_at"].isoformat(),
        "raw": {
            "title": title,
            "link": link,
            "description": description,
            "guid": item["guid"],
            "source_name": feed_config["name"],
        },
        "feed": f"rss_{feed_id}",
    }


def infer_news_severity(title: str, description: str) -> str:
    text = f"{title} {description}".lower()
    if any(word in text for word in ["ransomware", "actively exploited", "zero-day", "0-day", "critical"]):
        return "critical"
    if any(word in text for word in ["breach", "malware", "exploit", "vulnerability", "phishing", "backdoor"]):
        return "high"
    if any(word in text for word in ["patch", "advisory", "warning", "attack"]):
        return "medium"
    return "info"


def infer_news_confidence(feed_config: dict, severity: str) -> int:
    base_score = min(95, max(60, int(feed_config.get("trust_score", 75))))
    if severity == "critical":
        return min(95, base_score + 5)
    if severity == "info":
        return max(55, base_score - 10)
    return base_score


def build_news_tags(feed_config: dict, title: str, description: str) -> list[str]:
    tags = list(feed_config.get("tags", []))
    text = f"{title} {description}".lower()
    keyword_tags = {
        "ransomware": "ransomware",
        "malware": "malware",
        "phishing": "phishing",
        "vulnerability": "vulnerability",
        "zero-day": "zero-day",
        "0-day": "zero-day",
        "breach": "breach",
        "patch": "patching",
        "exploit": "exploit",
        "cloud": "cloud",
        "android": "android",
        "windows": "windows",
    }
    for keyword, tag in keyword_tags.items():
        if keyword in text and tag not in tags:
            tags.append(tag)
    return tags[:10]


def build_summary(description: str) -> str:
    summary = clean_text(description)
    if len(summary) <= 240:
        return summary
    return f"{summary[:237].rstrip()}..."


def clean_text(value: str) -> str:
    return " ".join(unescape(HTML_TAG_PATTERN.sub(" ", value)).split())


def slugify(value: str) -> str:
    slug = TAG_SPLIT_PATTERN.sub("-", value.lower()).strip("-")
    return slug or "rss-feed"


def extract_cves(value: str) -> list[str]:
    return sorted({match.group(0).upper() for match in CVE_PATTERN.finditer(value)})


def get_or_create_feed_source(db: Session) -> Source:
    source = db.scalar(select(Source).where(Source.name == "Demo External Feed"))
    if source is not None:
        return source

    source = Source(
        name="Demo External Feed",
        source_type="demo_feed",
        trust_score=75,
        is_active=True,
        source_metadata={
            "description": "Local mock external feed for development",
            "provider": "CTI-Mobile demo",
        },
    )
    db.add(source)
    db.flush()
    return source


def get_or_create_cisa_kev_source(db: Session) -> Source:
    source = db.scalar(select(Source).where(Source.name == "CISA KEV"))
    if source is not None:
        return source

    source = Source(
        name="CISA KEV",
        source_type="official_feed",
        trust_score=95,
        is_active=True,
        source_metadata={
            "description": "CISA Known Exploited Vulnerabilities Catalog",
            "provider": "CISA",
            "primary_url": CISA_KEV_PRIMARY_URL,
            "mirror_url": CISA_KEV_MIRROR_URL,
            "requires_api_key": False,
        },
    )
    db.add(source)
    db.flush()
    return source


def get_or_create_rss_source(db: Session, feed_config: dict) -> Source:
    source = db.scalar(select(Source).where(Source.name == feed_config["name"]))
    if source is not None:
        return source

    source = Source(
        name=feed_config["name"],
        source_type="rss_feed",
        trust_score=feed_config.get("trust_score", 75),
        is_active=True,
        source_metadata={
            "description": f"Free RSS feed import for {feed_config['name']}",
            "url": feed_config["url"],
            "requires_api_key": False,
        },
    )
    db.add(source)
    db.flush()
    return source


def get_or_create_feed_threat(
    db: Session,
    *,
    imported_by: str,
    item: dict,
    source: Source,
) -> tuple[Threat, bool]:
    threat = db.scalar(
        select(Threat).where(
            Threat.raw_data.contains(
                {
                    "external_id": item["external_id"],
                    "feed": item.get("feed", "demo_external_feed"),
                }
            )
        )
    )
    if threat is not None:
        return threat, False

    threat = Threat(
        source_id=source.id,
        title=item["title"],
        summary=item["summary"],
        description=item["description"],
        severity=item["severity"],
        confidence_score=item["confidence_score"],
        industry=item["industry"],
        region=item["region"],
        tags=item["tags"],
        published_at=datetime.fromisoformat(item["published_at"]).astimezone(UTC),
        raw_data={
            "external_id": item["external_id"],
            "feed": item.get("feed", "demo_external_feed"),
            "imported_by": imported_by,
            "source_payload": item.get("raw"),
            "presentation_version": "default_v1",
        },
    )
    db.add(threat)
    db.flush()
    return threat, True


def get_or_create_ioc(db: Session, *, ioc_item: dict) -> tuple[IOC, bool]:
    normalized_value = ioc_item["value"].lower().strip()
    ioc = db.scalar(
        select(IOC).where(
            IOC.type == ioc_item["type"],
            IOC.normalized_value == normalized_value,
        )
    )
    if ioc is not None:
        return ioc, False

    ioc = IOC(
        type=ioc_item["type"],
        value=ioc_item["value"],
        normalized_value=normalized_value,
        risk_score=ioc_item["risk_score"],
        confidence_score=ioc_item["confidence_score"],
        ioc_metadata={"feed": ioc_item.get("feed", "demo_external_feed")},
    )
    db.add(ioc)
    db.flush()
    return ioc, True


def link_threat_ioc(db: Session, *, threat: Threat, ioc: IOC) -> bool:
    existing = db.scalar(
        select(ThreatIOC).where(
            ThreatIOC.threat_id == threat.id,
            ThreatIOC.ioc_id == ioc.id,
        )
    )
    if existing is not None:
        return False

    db.add(ThreatIOC(threat_id=threat.id, ioc_id=ioc.id, relationship_type="feed_observed"))
    db.flush()
    return True
