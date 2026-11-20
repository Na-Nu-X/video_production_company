import django_filters

from .models import PortfolioFilm, ProductionService


class PortfolioFilmFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    featured = django_filters.BooleanFilter(field_name="is_featured")
    year = django_filters.NumberFilter(field_name="production_year")

    class Meta:
        model = PortfolioFilm
        fields = ["category", "featured", "year"]


class ProductionServiceFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    featured = django_filters.BooleanFilter(field_name="is_featured")

    class Meta:
        model = ProductionService
        fields = ["category", "featured"]
