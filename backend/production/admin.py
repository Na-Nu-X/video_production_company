from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html

from .models import (
    CrewMember,
    PortfolioFilm,
    ProductionBriefRequest,
    ProductionCategory,
    ProductionService,
)


def thumbnail_preview(url: str, width: int = 120):
    if not url:
        return "—"
    return format_html(
        '<img src="{}" alt="" style="width:{}px;aspect-ratio:16/9;object-fit:cover;border-radius:4px;" />',
        url,
        width,
    )


@admin.register(ProductionCategory)
class ProductionCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "icon_name", "film_total", "service_total", "display_order")
    list_editable = ("display_order",)
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _films=Count("films", distinct=True), _services=Count("services", distinct=True)
        )

    @admin.display(description="Filmy", ordering="_films")
    def film_total(self, obj):
        return obj._films

    @admin.display(description="Služby", ordering="_services")
    def service_total(self, obj):
        return obj._services


@admin.register(PortfolioFilm)
class PortfolioFilmAdmin(admin.ModelAdmin):
    list_display = (
        "thumb",
        "title",
        "client_name",
        "category",
        "production_year",
        "duration_timecode",
        "is_featured",
        "display_order",
    )
    list_display_links = ("thumb", "title")
    list_editable = ("is_featured", "display_order")
    list_filter = ("category", "is_featured", "production_year")
    search_fields = ("title", "client_name", "client_sector", "camera_gear")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("thumb_large", "created_at", "updated_at")
    list_select_related = ("category",)
    fieldsets = (
        ("Projekt", {"fields": ("title", "slug", "category", "client_name", "client_sector")}),
        (
            "Video a vizuál",
            {"fields": ("video_embed_url", "thumbnail_url", "thumb_large")},
        ),
        (
            "Technické parametre",
            {"fields": ("production_year", "duration_timecode", "filming_days", "camera_gear", "deliverables_tags")},
        ),
        ("Prípadová štúdia", {"fields": ("creative_brief", "execution_summary")}),
        ("Zobrazenie", {"fields": ("is_featured", "display_order", "created_at", "updated_at")}),
    )

    @admin.display(description="Náhľad")
    def thumb(self, obj):
        return thumbnail_preview(obj.thumbnail_url, 96)

    @admin.display(description="Náhľad obrázka")
    def thumb_large(self, obj):
        return thumbnail_preview(obj.thumbnail_url, 360)


@admin.register(ProductionService)
class ProductionServiceAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "typical_delivery_time", "starting_price_eur", "is_featured", "display_order")
    list_editable = ("is_featured", "display_order")
    list_filter = ("category", "is_featured")
    search_fields = ("title", "short_description")
    prepopulated_fields = {"slug": ("title",)}
    list_select_related = ("category",)
    fieldsets = (
        (None, {"fields": ("title", "slug", "category", "short_description", "detailed_description")}),
        ("Rozsah a cena", {"fields": ("included_phases", "typical_delivery_time", "starting_price_eur")}),
        ("Zobrazenie", {"fields": ("is_featured", "display_order")}),
    )


@admin.register(CrewMember)
class CrewMemberAdmin(admin.ModelAdmin):
    list_display = ("photo", "full_name", "role_title", "display_order")
    list_display_links = ("photo", "full_name")
    list_editable = ("display_order",)
    search_fields = ("full_name", "role_title")

    @admin.display(description="Foto")
    def photo(self, obj):
        if not obj.photo_url:
            return "—"
        return format_html(
            '<img src="{}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:50%;" />',
            obj.photo_url,
        )


@admin.register(ProductionBriefRequest)
class ProductionBriefRequestAdmin(admin.ModelAdmin):
    list_display = (
        "created_at",
        "company_name",
        "contact_name",
        "email",
        "video_type",
        "production_tier",
        "filming_days",
        "is_processed",
    )
    list_display_links = ("created_at", "company_name", "contact_name")
    list_editable = ("is_processed",)
    list_filter = ("is_processed", "video_type", "production_tier", "created_at")
    search_fields = ("company_name", "contact_name", "email", "phone", "project_description")
    date_hierarchy = "created_at"
    readonly_fields = ("created_at", "gdpr_consent", "estimate_summary")
    actions = ("mark_processed", "mark_unprocessed")
    fieldsets = (
        ("Kontakt", {"fields": ("company_name", "contact_name", "email", "phone")}),
        (
            "Zadanie",
            {
                "fields": (
                    "video_type",
                    "production_tier",
                    "filming_days",
                    "target_platforms",
                    "desired_deadline",
                    "project_description",
                    "estimate_summary",
                )
            },
        ),
        ("Spracovanie", {"fields": ("is_processed", "internal_note", "gdpr_consent", "created_at")}),
    )

    @admin.action(description="Označiť ako vybavené")
    def mark_processed(self, request, queryset):
        updated = queryset.update(is_processed=True)
        self.message_user(request, f"Označené ako vybavené: {updated}")

    @admin.action(description="Označiť ako nevybavené")
    def mark_unprocessed(self, request, queryset):
        updated = queryset.update(is_processed=False)
        self.message_user(request, f"Označené ako nevybavené: {updated}")
