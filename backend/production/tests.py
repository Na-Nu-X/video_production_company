from io import StringIO

from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from .models import PortfolioFilm, ProductionBriefRequest


class ApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_data", stdout=StringIO())

    def setUp(self):
        self.client = APIClient()

    def test_seed_is_idempotent(self):
        call_command("seed_data", stdout=StringIO())
        self.assertEqual(PortfolioFilm.objects.count(), 8)

    def test_categories_have_counts(self):
        data = self.client.get("/api/categories/").json()
        self.assertEqual(len(data), 6)
        self.assertIn("film_count", data[0])
        self.assertEqual(sum(c["film_count"] for c in data), 8)

    def test_portfolio_filters(self):
        self.assertEqual(len(self.client.get("/api/portfolio/").json()), 8)
        featured = self.client.get("/api/portfolio/", {"featured": "true"}).json()
        self.assertTrue(all(f["is_featured"] for f in featured))
        events = self.client.get("/api/portfolio/", {"category": "event-aftermovies"}).json()
        self.assertEqual(len(events), 2)
        search = self.client.get("/api/portfolio/", {"search": "Inspire"}).json()
        self.assertTrue(search)

    def test_portfolio_detail(self):
        film = PortfolioFilm.objects.first()
        data = self.client.get(f"/api/portfolio/{film.slug}/").json()
        self.assertEqual(data["slug"], film.slug)
        self.assertIn("creative_brief", data)
        self.assertEqual(len(data["related_films"]), 3)

    def test_services_and_crew(self):
        self.assertEqual(len(self.client.get("/api/services/").json()), 6)
        self.assertEqual(len(self.client.get("/api/crew/").json()), 4)

    def test_brief_create_valid(self):
        payload = {
            "video_type": "reklamny_spot",
            "production_tier": "premium",
            "filming_days": "2.0",
            "target_platforms": ["YouTube / Web", "TV vysielanie"],
            "contact_name": "Jana Testovacia",
            "email": "jana@example.com",
            "phone": "+421 900 123 456",
            "project_description": "Potrebujeme TV spot na uvedenie nového produktu na trh.",
            "gdpr_consent": True,
        }
        res = self.client.post("/api/briefs/", payload, format="json")
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual(ProductionBriefRequest.objects.count(), 1)

    def test_brief_create_invalid(self):
        res = self.client.post(
            "/api/briefs/",
            {"video_type": "xxx", "email": "nope", "gdpr_consent": False, "target_platforms": ["Mars TV"]},
            format="json",
        )
        self.assertEqual(res.status_code, 400)
        for field in ("video_type", "production_tier", "email", "contact_name", "gdpr_consent", "target_platforms"):
            self.assertIn(field, res.json())

    def test_briefs_not_listable(self):
        self.assertEqual(self.client.get("/api/briefs/").status_code, 405)
