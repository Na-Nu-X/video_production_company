from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


def unique_slug(instance: models.Model, value: str, max_length: int = 220) -> str:
    """Generate a slug unique within the instance's model."""
    base = slugify(value)[:max_length] or "polozka"
    slug = base
    model = type(instance)
    counter = 2
    while model.objects.filter(slug=slug).exclude(pk=instance.pk).exists():
        suffix = f"-{counter}"
        slug = f"{base[: max_length - len(suffix)]}{suffix}"
        counter += 1
    return slug


def validate_string_list(value) -> None:
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise ValidationError("Hodnota musí byť zoznam textových položiek, napr. [\"4K Master\", \"Color Grading\"].")


class ProductionCategory(models.Model):
    name = models.CharField("Názov", max_length=120, unique=True)
    slug = models.SlugField("Slug (URL)", max_length=140, unique=True, blank=True)
    short_summary = models.CharField("Krátky popis", max_length=300, blank=True)
    icon_name = models.CharField(
        "Názov ikony",
        max_length=60,
        blank=True,
        help_text="Identifikátor ikony vo frontende, napr. „megaphone“, „building“, „drone“.",
    )
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name = "Kategória produkcie"
        verbose_name_plural = "Kategórie produkcie"

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(self, self.name, 140)
        super().save(*args, **kwargs)


class PortfolioFilm(models.Model):
    title = models.CharField("Názov projektu", max_length=200)
    client_name = models.CharField("Klient", max_length=150)
    client_sector = models.CharField("Odvetvie klienta", max_length=120, blank=True)
    category = models.ForeignKey(
        ProductionCategory,
        verbose_name="Kategória",
        on_delete=models.PROTECT,
        related_name="films",
    )
    slug = models.SlugField("Slug (URL)", max_length=220, unique=True, blank=True)
    production_year = models.PositiveIntegerField(
        "Rok výroby",
        validators=[MinValueValidator(1990), MaxValueValidator(2100)],
    )
    duration_timecode = models.CharField(
        "Dĺžka videa (timecode)",
        max_length=8,
        help_text="Formát MM:SS, napr. 01:30.",
    )
    camera_gear = models.CharField(
        "Kamera a technika",
        max_length=200,
        blank=True,
        help_text="Napr. RED Komodo 6K • Anamorphic Lenses • DJI Inspire 3",
    )
    filming_days = models.PositiveIntegerField("Počet natáčacích dní", default=1)
    video_embed_url = models.URLField(
        "URL na vloženie videa",
        help_text="Embed URL z YouTube (https://www.youtube.com/embed/…) alebo Vimeo (https://player.vimeo.com/video/…).",
    )
    thumbnail_url = models.URLField("URL náhľadového obrázka", max_length=500)
    creative_brief = models.TextField("Zadanie klienta")
    execution_summary = models.TextField("Kreatívne riešenie a realizácia")
    deliverables_tags = models.JSONField(
        "Dodané formáty",
        default=list,
        blank=True,
        validators=[validate_string_list],
        help_text="Zoznam, napr. [\"4K Master 16:9\", \"9:16 Reels verzie\", \"Color Grading\"].",
    )
    is_featured = models.BooleanField("Zvýraznený na úvodnej stránke", default=False)
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)
    created_at = models.DateTimeField("Vytvorené", auto_now_add=True)
    updated_at = models.DateTimeField("Upravené", auto_now=True)

    class Meta:
        ordering = ["display_order", "-production_year", "title"]
        verbose_name = "Film v portfóliu"
        verbose_name_plural = "Portfólio – filmy"

    def __str__(self) -> str:
        return f"{self.title} ({self.client_name})"

    def clean(self) -> None:
        super().clean()
        url = self.video_embed_url or ""
        if url and not any(
            host in url for host in ("youtube.com/embed/", "youtube-nocookie.com/embed/", "player.vimeo.com/video/")
        ):
            raise ValidationError(
                {"video_embed_url": "Zadajte embed URL z YouTube alebo Vimeo (nie bežný odkaz na stránku videa)."}
            )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(self, self.title)
        super().save(*args, **kwargs)


class ProductionService(models.Model):
    category = models.ForeignKey(
        ProductionCategory,
        verbose_name="Kategória",
        on_delete=models.PROTECT,
        related_name="services",
    )
    title = models.CharField("Názov služby", max_length=200)
    slug = models.SlugField("Slug (URL)", max_length=220, unique=True, blank=True)
    short_description = models.CharField("Krátky popis", max_length=300)
    detailed_description = models.TextField("Podrobný popis")
    included_phases = models.JSONField(
        "Zahrnuté fázy produkcie",
        default=list,
        blank=True,
        validators=[validate_string_list],
    )
    typical_delivery_time = models.CharField("Bežný čas dodania", max_length=60, blank=True)
    starting_price_eur = models.DecimalField(
        "Cena od (EUR)",
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )
    is_featured = models.BooleanField("Zvýraznená služba", default=False)
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)

    class Meta:
        ordering = ["display_order", "title"]
        verbose_name = "Produkčná služba"
        verbose_name_plural = "Produkčné služby"

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(self, self.title)
        super().save(*args, **kwargs)


class CrewMember(models.Model):
    full_name = models.CharField("Meno a titul", max_length=150)
    role_title = models.CharField("Pozícia", max_length=150)
    bio = models.TextField("Bio")
    specialty_gear = models.CharField("Špecializácia / technika", max_length=200, blank=True)
    photo_url = models.URLField("URL fotografie", max_length=500, blank=True)
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)

    class Meta:
        ordering = ["display_order", "full_name"]
        verbose_name = "Člen štábu"
        verbose_name_plural = "Štáb a tím"

    def __str__(self) -> str:
        return f"{self.full_name} – {self.role_title}"


class ProductionBriefRequest(models.Model):
    class VideoType(models.TextChoices):
        REKLAMNY_SPOT = "reklamny_spot", "Reklamný spot (TV / Online)"
        FIREMNE_VIDEO = "firemne_video", "Firemné / Náborové video"
        EVENT_AFTERMOVIE = "event_aftermovie", "Event aftermovie"
        SOCIAL_MEDIA_REELS = "social_media_reels", "Séria Reels / TikTok videí"
        PRODUKTOVE_VIDEO = "produktove_video", "Produktové video"
        DRONOVE_ZABERY = "dronove_zabery", "Letecké zábery dronom"

    class ProductionTier(models.TextChoices):
        KOMPAKT = "kompakt", "Kompaktná produkcia (1 kameraman, 4K)"
        STANDARD = "standard", "Štandardná štúdiová produkcia (štáb, svetlá, dron)"
        PREMIUM = "premium", "Prémiová reklamná produkcia (cinema kamera, herci, lokácie)"

    PLATFORM_CHOICES = (
        "YouTube / Web",
        "Instagram / TikTok (9:16)",
        "TV vysielanie",
        "LinkedIn",
        "Facebook",
        "Interné použitie / prezentácie",
    )

    video_type = models.CharField("Typ videa", max_length=30, choices=VideoType.choices)
    production_tier = models.CharField(
        "Rozsah produkcie", max_length=20, choices=ProductionTier.choices
    )
    filming_days = models.DecimalField(
        "Počet natáčacích dní",
        max_digits=4,
        decimal_places=1,
        default=1,
        validators=[MinValueValidator(Decimal("0.5")), MaxValueValidator(Decimal("60"))],
    )
    target_platforms = models.JSONField(
        "Cieľové platformy", default=list, blank=True, validators=[validate_string_list]
    )
    desired_deadline = models.CharField("Požadovaný termín", max_length=120, blank=True)
    company_name = models.CharField("Spoločnosť", max_length=150, blank=True)
    contact_name = models.CharField("Kontaktná osoba", max_length=150)
    email = models.EmailField("E-mail")
    phone = models.CharField("Telefón", max_length=40, blank=True)
    project_description = models.TextField("Popis projektu")
    estimate_summary = models.CharField(
        "Orientačná kalkulácia",
        max_length=300,
        blank=True,
        help_text="Súhrn z kalkulačky na webe (ak ju klient použil).",
    )
    gdpr_consent = models.BooleanField("Súhlas so spracovaním osobných údajov", default=False)
    is_processed = models.BooleanField("Vybavené", default=False)
    internal_note = models.TextField("Interná poznámka", blank=True)
    created_at = models.DateTimeField("Prijaté", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Dopyt na videoprodukciu"
        verbose_name_plural = "Dopyty na videoprodukciu"

    def __str__(self) -> str:
        who = self.company_name or self.contact_name
        return f"{who} – {self.get_video_type_display()} ({self.created_at:%d.%m.%Y})" if self.created_at else who
