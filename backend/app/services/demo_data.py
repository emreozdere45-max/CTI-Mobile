DEMO_THREATS = [
    {
        "id": "threat-001",
        "title": "Yeni fidye yazilimi kampanyasi finans sektorunu hedefliyor",
        "summary": "Finans kurumlarini hedefleyen yuksek riskli kampanya tespit edildi.",
        "severity": "critical",
        "confidence_score": 85,
        "source": {"id": "source-001", "name": "Internal CTI"},
        "tags": ["ransomware", "finance", "phishing"],
        "published_at": "2026-07-07T10:00:00Z",
        "is_favorite": False,
    },
    {
        "id": "threat-002",
        "title": "Sahte oturum acma sayfalariyla kimlik avi denemeleri",
        "summary": "Kurumsal e-posta hesaplarini hedefleyen domainler gozlemlendi.",
        "severity": "high",
        "confidence_score": 78,
        "source": {"id": "source-001", "name": "Internal CTI"},
        "tags": ["phishing", "credential-theft"],
        "published_at": "2026-07-07T08:30:00Z",
        "is_favorite": False,
    },
]

DEMO_IOCS = [
    {
        "id": "ioc-001",
        "type": "domain",
        "value": "malicious-example.com",
        "risk_score": 92,
        "confidence_score": 80,
        "related_threat_count": 1,
    },
    {
        "id": "ioc-002",
        "type": "ip",
        "value": "203.0.113.10",
        "risk_score": 84,
        "confidence_score": 75,
        "related_threat_count": 1,
    },
]
