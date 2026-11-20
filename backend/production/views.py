from django.db.models import Count
from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from .filters import PortfolioFilmFilter, ProductionServiceFilter
from .models import (
    CrewMember,
    PortfolioFilm,
    ProductionBriefRequest,
    ProductionCategory,
    ProductionService,
)
from .serializers import (
    CrewMemberSerializer,
    PortfolioFilmDetailSerializer,
    PortfolioFilmListSerializer,
    ProductionBriefRequestSerializer,
    ProductionCategorySerializer,
    ProductionServiceSerializer,
)


class ProductionCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductionCategorySerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"
    pagination_class = None
    filter_backends: list = []

    def get_queryset(self):
        return ProductionCategory.objects.annotate(
            film_count=Count("films", distinct=True),
            service_count=Count("services", distinct=True),
        ).order_by("display_order", "name")


class PortfolioFilmViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PortfolioFilm.objects.select_related("category")
    permission_classes = [AllowAny]
    lookup_field = "slug"
    pagination_class = None
    filterset_class = PortfolioFilmFilter
    search_fields = ["title", "client_name", "client_sector", "camera_gear"]
    ordering_fields = ["production_year", "display_order", "title", "filming_days"]
    ordering = ["display_order", "-production_year"]

    def get_serializer_class(self):
        return PortfolioFilmDetailSerializer if self.action == "retrieve" else PortfolioFilmListSerializer


class ProductionServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProductionService.objects.select_related("category")
    serializer_class = ProductionServiceSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"
    pagination_class = None
    filterset_class = ProductionServiceFilter
    search_fields = ["title", "short_description"]
    ordering_fields = ["display_order", "starting_price_eur", "title"]
    ordering = ["display_order"]


class CrewMemberViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CrewMember.objects.all()
    serializer_class = CrewMemberSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends: list = []


class ProductionBriefRequestViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Public, write-only endpoint for incoming production briefs."""

    queryset = ProductionBriefRequest.objects.none()
    serializer_class = ProductionBriefRequestSerializer
    permission_classes = [AllowAny]
    authentication_classes: list = []  # no session auth -> no CSRF requirement for the SPA
    throttle_scope = "briefs"
    filter_backends: list = []
