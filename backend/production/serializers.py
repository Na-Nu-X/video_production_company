from rest_framework import serializers

from .models import (
    CrewMember,
    PortfolioFilm,
    ProductionBriefRequest,
    ProductionCategory,
    ProductionService,
)


class ProductionCategorySerializer(serializers.ModelSerializer):
    film_count = serializers.IntegerField(read_only=True)
    service_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ProductionCategory
        fields = [
            "id",
            "name",
            "slug",
            "short_summary",
            "icon_name",
            "display_order",
            "film_count",
            "service_count",
        ]


class CategoryRefSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionCategory
        fields = ["id", "name", "slug", "icon_name"]


class PortfolioFilmListSerializer(serializers.ModelSerializer):
    category = CategoryRefSerializer(read_only=True)

    class Meta:
        model = PortfolioFilm
        fields = [
            "id",
            "title",
            "slug",
            "client_name",
            "client_sector",
            "category",
            "production_year",
            "duration_timecode",
            "camera_gear",
            "filming_days",
            "video_embed_url",
            "thumbnail_url",
            "deliverables_tags",
            "is_featured",
        ]


class PortfolioFilmDetailSerializer(PortfolioFilmListSerializer):
    related_films = serializers.SerializerMethodField()

    class Meta(PortfolioFilmListSerializer.Meta):
        fields = PortfolioFilmListSerializer.Meta.fields + [
            "creative_brief",
            "execution_summary",
            "related_films",
        ]

    def get_related_films(self, obj: PortfolioFilm):
        related = (
            PortfolioFilm.objects.select_related("category")
            .exclude(pk=obj.pk)
            .order_by("-is_featured", "display_order")
        )
        same_category = list(related.filter(category=obj.category)[:3])
        if len(same_category) < 3:
            ids = [f.pk for f in same_category]
            same_category += list(related.exclude(pk__in=ids)[: 3 - len(same_category)])
        return PortfolioFilmListSerializer(same_category, many=True, context=self.context).data


class ProductionServiceSerializer(serializers.ModelSerializer):
    category = CategoryRefSerializer(read_only=True)

    class Meta:
        model = ProductionService
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "short_description",
            "detailed_description",
            "included_phases",
            "typical_delivery_time",
            "starting_price_eur",
            "is_featured",
        ]


class CrewMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrewMember
        fields = ["id", "full_name", "role_title", "bio", "specialty_gear", "photo_url"]


class ProductionBriefRequestSerializer(serializers.ModelSerializer):
    gdpr_consent = serializers.BooleanField(required=True)

    class Meta:
        model = ProductionBriefRequest
        fields = [
            "id",
            "video_type",
            "production_tier",
            "filming_days",
            "target_platforms",
            "desired_deadline",
            "company_name",
            "contact_name",
            "email",
            "phone",
            "project_description",
            "estimate_summary",
            "gdpr_consent",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "video_type": {"error_messages": {"invalid_choice": "Vyberte platný typ videa."}},
            "production_tier": {"error_messages": {"invalid_choice": "Vyberte platný rozsah produkcie."}},
            "contact_name": {"error_messages": {"blank": "Zadajte, prosím, vaše meno."}},
            "email": {"error_messages": {"blank": "Zadajte, prosím, e-mail.", "invalid": "Zadajte platnú e-mailovú adresu."}},
            "project_description": {"error_messages": {"blank": "Popíšte, prosím, stručne váš projekt."}},
        }

    def validate_target_platforms(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Platformy musia byť zoznam.")
        allowed = set(ProductionBriefRequest.PLATFORM_CHOICES)
        invalid = [p for p in value if p not in allowed]
        if invalid:
            raise serializers.ValidationError(f"Neplatné platformy: {', '.join(map(str, invalid))}.")
        # Preserve order, drop duplicates.
        return list(dict.fromkeys(value))

    def validate_project_description(self, value: str) -> str:
        value = value.strip()
        if len(value) < 20:
            raise serializers.ValidationError("Popis projektu by mal mať aspoň 20 znakov, aby sme vám vedeli pripraviť presnú ponuku.")
        return value

    def validate_contact_name(self, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Zadajte, prosím, vaše meno.")
        return value

    def validate_phone(self, value: str) -> str:
        value = value.strip()
        digits = [c for c in value if c.isdigit()]
        if value and (len(digits) < 9 or any(c not in "+0123456789 ()-/" for c in value)):
            raise serializers.ValidationError("Zadajte platné telefónne číslo, napr. +421 900 123 456.")
        return value

    def validate_gdpr_consent(self, value: bool) -> bool:
        if not value:
            raise serializers.ValidationError("Na odoslanie dopytu je potrebný súhlas so spracovaním osobných údajov.")
        return value
